import { DocumentNode, gql } from '@apollo/client';

export interface QueryBaseProps {
  locale: string | string[];
}

export const demoIndexPageQuery = ({
  locale = process.env.DEFAULT_LOCALE,
}: QueryBaseProps): DocumentNode => gql`
  {
    sharedCopy(locale: "${locale}") {
      global,
    },
    demoIndexPage(locale: "${locale}") {
      ${headFragment},
      copy
    }
  }
`;

export const demoAboutPageQuery = ({
  locale = process.env.DEFAULT_LOCALE,
}: QueryBaseProps): DocumentNode => gql`
  {
    sharedCopy(locale: "${locale}") {
      global,
    },
    demoAboutPage(locale: "${locale}") {
      ${headFragment},
      copy
    }
  }
`;

export const notFoundPageQuery = ({
  locale = process.env.DEFAULT_LOCALE,
}: QueryBaseProps): DocumentNode => gql`
  {
    sharedCopy(locale: "${locale}") {
      global,
    },
    notFoundPage(locale: "${locale}") {
      ${headFragment}
    }
  }
`;

export const headFragment = `
  head {
    title,
    description,
    ogType,
    ogImage {
      url
    }
  }
`;
