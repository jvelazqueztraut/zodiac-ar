import { kebabCase } from 'lodash';

import { Pages } from 'utils/routes';

import { CopyStoreType } from './copy.types';
import demoAboutPageEN from './translations/en/demoAboutPage.json';
import globalEN from './translations/en/global.json';
import headEN from './translations/en/head.json';
import landingPageEN from './translations/en/landingPage.json';

const TRANSLATIONS_PATH = './translations';

const tryRequire = (path: string) => {
  try {
    return require(`${path}`);
  } catch (error) {
    if (process.env.IS_DEBUG)
      console.log('copy.data -- tryRequire -- error:', error);

    return null;
  }
};

export const getCopy = (page: Pages, locale = process.env.DEFAULT_LOCALE) => {
  const path = `${TRANSLATIONS_PATH}/${kebabCase(locale)}`;
  const head: Record<typeof page, CopyStoreType['copy']['head']> =
    tryRequire(`${path}/head.json`) ||
    (headEN as Record<
      typeof page,
      Pick<CopyStoreType['copy']['head'], 'title' | 'description' | 'ogImage'>
    >);

  return {
    head: {
      ...head[page],
      ogType: 'website',
    },
    global:
      tryRequire(`${path}/global.json`) ||
      (globalEN as CopyStoreType['copy']['global']),
    landing:
      tryRequire(`${path}/landingPage.json`) ||
      (landingPageEN as CopyStoreType['copy']['landing']),
    about:
      tryRequire(`${path}/demoAboutPage.json`) ||
      (demoAboutPageEN as CopyStoreType['copy']['about']),
  } as CopyStoreType['copy'];
};
