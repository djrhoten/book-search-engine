import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  ApolloLink,
  from
} from "@apollo/client";
import { onError } from '@apollo/client/link/error';

const httpLink = new HttpLink({
  uri: '/graphql'
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const tokenLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('id_token');
  operation.setContext({
      headers: {
      authorization: token ? `Bearer ${token}` : 'No token found in App.js'
      }
  });
  return forward(operation);
 });

const client = new ApolloClient({
  // The `from` function combines an array of individual links
  // into a link chain
  link: from([errorLink, tokenLink, httpLink]),
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <>
          <Navbar />
          <Switch>
            <Route exact path='/' component={SearchBooks} />
            <Route exact path='/saved' component={SavedBooks} />
            <Route render={() => <h1 className='display-2'>Wrong page!</h1>} />
          </Switch>
        </>
      </Router>
    </ApolloProvider>
  );
}

export default App;
