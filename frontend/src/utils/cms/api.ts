import {
  ApolloClient,
  createHttpLink,
  DefaultOptions,
  InMemoryCache,
} from '@apollo/client';
import fetch from 'isomorphic-unfetch';

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
  mutate: {
    errorPolicy: 'all',
  },
};

const uri = process.env.CMS_GRAPHQL_URL;

const httpLink = createHttpLink({
  uri,
  fetch,
});

export const cmsApiClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions,
  credentials: 'include',
});

export const getLocales = async () =>
  await fetch(uri.replace('/graphql', '/i18n/locales')).then(data =>
    data.json()
  );
