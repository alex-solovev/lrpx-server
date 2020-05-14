import {
  objectType,
  stringArg,
  queryField,
  mutationField,
} from '@nexus/schema';
import UserModel from '../models/User.model';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.string('id');
    t.string('email');
    t.string('password');
  },
});

export const UserQuery = queryField('user', {
  type: User,
  args: {
    id: stringArg({ required: true }),
  },
  nullable: true,
  // eslint-disable-next-line
  // @ts-ignore
  async resolve(root, args, ctx) {
    const user = await ctx.mongoManager.findOne(UserModel, args.id);
    return user;
  },
});

export const UsersQuery = queryField('users', {
  type: User,
  list: true,
  authorize: (root, args, ctx) => {
    if (ctx.req.user) {
      return true;
    }

    return false;
  },
  // eslint-disable-next-line
  // @ts-ignore
  async resolve(_root, _args, ctx) {
    const users = await ctx.mongoManager.find(UserModel);
    return users;
  },
});

export const SignUp = mutationField('signUp', {
  type: User,
  nullable: true,
  args: {
    email: stringArg({ required: true }),
    password: stringArg({ required: true }),
  },
  // eslint-disable-next-line
  // @ts-ignore
  async resolve(root, args, ctx) {
    return ctx.authService.signUp(args.email, args.password);
  },
});

export const LogIn = mutationField('logIn', {
  type: User,
  nullable: true,
  args: {
    email: stringArg({ required: true }),
    password: stringArg({ required: true }),
  },
  // eslint-disable-next-line
  // @ts-ignore
  async resolve(_root, args, ctx) {
    return ctx.authService.logIn(args.email, args.password);
  },
});

export const LogOut = mutationField('logOut', {
  type: User,
  nullable: true,
  // eslint-disable-next-line
  // @ts-ignore
  resolve(_root, _args, { authService, req: { user } }) {
    authService.logOut();
    return user;
  },
});

export const CurrentUser = queryField('currentUser', {
  type: User,
  nullable: true,
  // eslint-disable-next-line
  // @ts-ignore
  resolve(_root, _args, { req: { user } }) {
    return user;
  },
});
