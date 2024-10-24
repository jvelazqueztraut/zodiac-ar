export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  NOT_FOUND: '/404',
} as const;

export enum Pages {
  index = 'index',
  about = 'about',
  notFound = 'notFound',
}
