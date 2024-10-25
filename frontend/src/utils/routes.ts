export const ROUTES = {
  HOME: '/',
  AR: '/ar',
  ABOUT: '/about',
  NOT_FOUND: '/404',
} as const;

export enum Pages {
  landing = 'landing',
  ar = 'ar',
  about = 'about',
  notFound = 'notFound',
}
