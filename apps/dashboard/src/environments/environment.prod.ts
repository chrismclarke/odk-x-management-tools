import DASHBOARD_SETTINGS from '../assets/dashboardSettings.json';

export const environment = {
  production: true,
  appVersion: require('../../../../package.json').version,
  useApiProxy: true,
  ...DASHBOARD_SETTINGS,
};
