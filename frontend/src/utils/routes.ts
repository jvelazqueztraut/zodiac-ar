export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  NOT_FOUND: '/404',
} as const;

export enum Pages {
  landing = 'landing',
  about = 'about',
  notFound = 'notFound',
}
