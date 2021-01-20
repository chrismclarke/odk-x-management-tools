import { environment as PROD_ENV } from './environment.prod';

export const environment = {
  ...PROD_ENV,
  // When running in docker container assumes local odk server so no need for cross-origin api proxy
  useApiProxy: false,
};
