type OnboardingRoutesShape = {
  WELCOME: string;
  SHARE_DATA: string;
  SUCCESS: string;
  SESSION_EXPIRED: string;
  CREATE: {
    ROOT: string;
    PASSWORD: string;
    ECOSYSTEM: string;
    BACKUP: string;
    PROCESSING: string;
    SUCCESS: string;
  };
  IMPORT: {
    ROOT: string;
    TYPE_SELECTOR: string;
    PHRASE: string;
    PRIVATE_KEY: string;
    PASSWORD: string;
    SELECT_WALLETS: string;
    PROCESSING: string;
    SUCCESS: string;
  };
};

export const ONBOARDING_ROUTES = {
  WELCOME: 'welcome',
  SHARE_DATA: 'share-data',
  SUCCESS: 'success',
  SESSION_EXPIRED: 'oops',

  CREATE: {
    ROOT: 'create',
    PASSWORD: 'password',
    ECOSYSTEM: 'ecosystem',
    BACKUP: 'backup',
    PROCESSING: 'processing',
    SUCCESS: 'success',
  },

  IMPORT: {
    ROOT: 'import',
    TYPE_SELECTOR: '', // Index route
    PHRASE: 'phrase',
    PRIVATE_KEY: 'private-key',
    PASSWORD: 'password',
    SELECT_WALLETS: 'select-wallets',
    PROCESSING: 'processing',
    SUCCESS: 'success',
  },
} as const satisfies OnboardingRoutesShape;

export type OnboardingRoutes = typeof ONBOARDING_ROUTES;

export type CreateRoutes = OnboardingRoutes['CREATE'];
export type CreateRouteKeys = keyof CreateRoutes;
export type CreateRouteValues = CreateRoutes[CreateRouteKeys];

export type ImportRoutes = OnboardingRoutes['IMPORT'];
export type ImportRouteKeys = keyof ImportRoutes;
export type ImportRouteValues = ImportRoutes[ImportRouteKeys];

type LeafValues<T> = T extends string
  ? T
  : T extends object
  ? { [K in keyof T]: LeafValues<T[K]> }[keyof T]
  : never;

export type OnboardingRouteValues = LeafValues<OnboardingRoutes>;

export type TopLevelRouteValues = {
  [K in keyof OnboardingRoutes]: OnboardingRoutes[K] extends string
    ? OnboardingRoutes[K]
    : never;
}[keyof OnboardingRoutes];
