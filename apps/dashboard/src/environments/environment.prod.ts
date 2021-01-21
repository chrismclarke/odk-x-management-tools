import DASHBOARD_SETTINGS from '../assets/dashboardSettings.json';
import {version} from '../../../../package.json'

export const environment = {
  production: true,
  appVersion: version,
  useApiProxy: true,
  ...DASHBOARD_SETTINGS,
};
