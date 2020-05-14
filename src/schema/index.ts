import path from 'path';
import {
  makeSchema,
  queryType,
  mutationType,
  fieldAuthorizePlugin,
} from '@nexus/schema';
import * as UserTypes from './User.schema';

const Query = queryType({
  definition(t) {
    t.field('dummyQuery', {
      type: 'String',
      resolve() {
        return 'dummyQuery';
      },
    });
  },
});

const Mutation = mutationType({
  definition(t) {
    t.field('dummyMutation', {
      type: 'String',
      resolve() {
        return 'dummyMutation';
      },
    });
  },
});

export default makeSchema({
  types: [Query, Mutation, UserTypes],
  prettierConfig: path.join(__dirname, '../../.prettierrc.json'),
  plugins: [fieldAuthorizePlugin()],
  outputs: {
    schema: path.join(__dirname, '../generated/schema.graphql'),
    typegen: path.join(__dirname, '../generated/graphql-types.d.ts'),
  },
  typegenAutoConfig: {
    sources: [
      {
        alias: 'server',
        source: path.join(__dirname, '../server.ts'),
      },
    ],
    contextType: 'server.AppContext',
  },
});
