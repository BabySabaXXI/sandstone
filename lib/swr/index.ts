/**
 * SWR Library Exports for Sandstone App
 */

// Configuration
export {
  globalSWRConfig,
  userSWRConfig,
  documentSWRConfig,
  realtimeSWRConfig,
  staticSWRConfig,
  cacheKeys,
  cacheMutations,
  fetcher,
  authenticatedFetcher,
  postFetcher,
  retryWithBackoff,
  getRetryDelay,
} from './config';

// Provider
export { SWRProvider, PersistentSWRProvider } from './provider';

// Types
export type { SWRProviderProps } from './provider';
