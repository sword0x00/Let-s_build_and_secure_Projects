
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import resolvers from './graphql/resolvers.js';
import typeDefs from './graphql/typeDefs.js';
import db from './models/index.js';

const { sequelize } = db;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

try {
  // Start the server
  const { url } = await startStandaloneServer(server);
  console.log(`🚀 Server ready at ${url}`);
  
  // Test database connection
  await sequelize.authenticate();
  console.log('Database connected :D');
  
  // Optionally sync models (be careful in production!)
  // await sequelize.sync({ alter: true });
  
} catch (error) {
  console.error('Failed to start server or connect to database:', error);
}
