// eslint-disable-next-line
/// <reference path="./generated/graphql-types.d.ts" />
import 'reflect-metadata';
import { MongoEntityManager } from 'typeorm';
import express from 'express';
import { config } from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import schema from './schema';
import LocalAuthService from './services/LocalAuth.service';
import getDBConnection from './db';

config();

export interface AppContext {
  mongoManager: MongoEntityManager;
  authService: LocalAuthService;
  req: Express.Request;
}

async function main(): Promise<void> {
  try {
    const { mongoManager } = await getDBConnection();
    const expressServer = express();
    const getContext = ({ req }: ExpressContext): AppContext => {
      const authService = new LocalAuthService(mongoManager, req);

      return {
        req,
        mongoManager,
        authService,
      };
    };

    LocalAuthService.setupLocalStrategy(expressServer, mongoManager);

    const apolloServer = new ApolloServer({
      context: getContext,
      schema,
    });

    apolloServer.applyMiddleware({
      app: expressServer,
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
    });
    expressServer.listen(process.env.PORT || 3000, () => {
      // eslint-disable-next-line
      console.info(`Server is running on port ${process.env.PORT}`);
    });
  } catch (e) {
    console.error(e); // eslint-disable-line
  }
}

main();
