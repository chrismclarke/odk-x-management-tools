export const environment = {
  production: true,
  appVersion: require('../../../../package.json').version,
  // When running in docker container assumes local odk server so no need for cross-origin api proxy
  useApiProxy: false,
};
