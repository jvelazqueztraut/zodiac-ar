import getNextConfig from 'next/config';

import { isStorybook } from 'template/utils/platform';

const env = isStorybook() ? process.env : getNextConfig().publicRuntimeConfig;

export const ISR_TIMEOUT = env.ENV === 'production' ? 300 : 10;
