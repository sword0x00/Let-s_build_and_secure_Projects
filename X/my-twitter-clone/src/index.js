// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import './index.css';
// import App from './components/App.jsx';
// import {
//   ApolloClient,
//   InMemoryCache,
//   ApolloProvider,
// } from '@apollo/client';

// // Create Apollo Client instance
// const client = new ApolloClient({
//   uri: 'http://localhost:4000/', // Corrected URI for local GraphQL server
//   cache: new InMemoryCache(),
// });

// // Get the root container
// const container = document.getElementById('root');
// const root = createRoot(container);

// // Render the React app wrapped in ApolloProvider
// root.render(
//   <ApolloProvider client={client}>
//     <App />
//   </ApolloProvider>
// );
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './components/App.jsx';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client';

// Create Apollo Client instance
// NOTE: For a real application, replace 'http://localhost:4000/' with your actual GraphQL server URI.
const client = new ApolloClient({
  uri: 'http://localhost:4000/', // Corrected URI for local GraphQL server
  cache: new InMemoryCache(),
});

// Get the root container element from the DOM
const container = document.getElementById('root');

// Create a React root for concurrent mode rendering
const root = createRoot(container);

// Render the main App component, wrapped in ApolloProvider to make the client available
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
