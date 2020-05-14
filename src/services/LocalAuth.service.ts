import connectMongo from 'connect-mongo';
import { Express } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { MongoEntityManager } from 'typeorm';
import UserModel from '../models/User.model';

// TODO: maybe rewrite this class to be singleton?
export default class LocalAuthService {
  manager: MongoEntityManager;

  request: Express.Request;

  constructor(mongoManager: MongoEntityManager, request: Express.Request) {
    this.manager = mongoManager;
    this.request = request;
  }

  public async logIn(email: string, password: string): Promise<UserModel> {
    return new Promise((resolve, reject) => {
      passport.authenticate('local', (err, user) => {
        if (err || !user) {
          reject(new Error('Failed to login'));
        }

        this.request.logIn(user, (loginErr) => {
          if (loginErr) {
            reject(loginErr);
          }

          resolve(user);
        });
      })({ body: { email, password } });
    });
  }

  public async signUp(email: string, password: string): Promise<UserModel> {
    const user = new UserModel();
    user.email = email;
    user.password = password;

    await user.validate();
    await this.manager.save(user);
    await this.logIn(email, password);

    return user;
  }

  public logOut(): void {
    this.request.logOut();
  }

  public static setupLocalStrategy(
    server: Express,
    manager: MongoEntityManager,
  ): void {
    const MongoStore = connectMongo(session);

    server.use(
      session({
        secret: `${process.env.APP_SECRET}`,
        saveUninitialized: false,
        resave: false,
        store: new MongoStore({
          url: process.env.MONGODB_URI,
        }),
        cookie: {
          maxAge: 30000,
        },
      }),
    );

    passport.serializeUser((user: UserModel, done) => {
      done(null, user.email);
    });

    passport.deserializeUser(async (email: string, done) => {
      try {
        const user = await manager.findOne(UserModel, {
          where: { email },
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    });

    passport.use(
      new LocalStrategy(
        { usernameField: 'email' },
        async (email, password, done) => {
          try {
            const user = await manager.findOne(UserModel, {
              where: { email },
            });

            if (!user) {
              return done(null, false, { message: 'Incorrect username.' });
            }

            if (!(await user.validatePassword(password))) {
              return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
          } catch (err) {
            return done(err);
          }
        },
      ),
    );

    server.use(passport.initialize());
    server.use(passport.session());
  }
}
