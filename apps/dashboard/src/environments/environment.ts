import DASHBOARD_SETTINGS from '../assets/dashboardSettings.json';

export const environment = {
  production: false,
  appVersion: require('../../../../package.json').version,
  /** Proxy all requests to /api to be intercepted by local proxy (to avoid cors issues) */
  useApiProxy: true,
  ...DASHBOARD_SETTINGS,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
