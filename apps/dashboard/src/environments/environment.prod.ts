import DASHBOARD_CONFIG from './config.json';

export const environment = {
  production: true,
  appVersion: require('../../../../package.json').version,
  DASHBOARD_CONFIG,
};
