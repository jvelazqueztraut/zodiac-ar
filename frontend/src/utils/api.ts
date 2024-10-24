import axios from 'axios';
import getNextConfig from 'next/config';

import { isStorybook } from 'template/utils/platform';

const env = isStorybook() ? process.env : getNextConfig().publicRuntimeConfig;
const baseURL = `${env.API_URL}/api`;

const client = axios.create({ baseURL });
client.defaults.withCredentials = true;
client.defaults.headers.common = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const login = (email: string, password: string) =>
  client.post('/login', { email, password });
