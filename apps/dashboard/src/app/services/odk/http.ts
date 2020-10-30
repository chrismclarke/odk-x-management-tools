import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { IStorageKey } from '../../types';

/**
 * Use interceptor to append correct url prefix and auth headers
 */
axios.interceptors.request.use(
  (config) => {
    const { url } = config;
    config.url = `/api/odktables/${url}`;
    const odkserverurl = getStorage('odkServerUrl');
    const Authorization = `basic ${getStorage('odkToken')}`;
    config.headers = { ...config.headers, Authorization, odkserverurl };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
/**
 * Use interceptor to return nested data object on successful response
 * and handle errors
 */
axios.interceptors.response.use(
  function (response) {
    const { data } = response;
    return data.data || data;
  },
  function (err) {
    return handleError(err);
  }
);

// Depending on whether data is persisted, may use local storage or session storage
function getStorage(key: IStorageKey): string | undefined {
  return localStorage.getItem(key)
    ? localStorage.getItem(key)
    : sessionStorage.getItem(key);
}

/**
 * Base rest methods using axios
 */
async function get<T = any>(
  endpoint: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  return axios.get(endpoint, { ...config });
}

async function post<T = any>(
  endpoint: string,
  data: any,
  headers = {}
): Promise<T> {
  return axios.post(endpoint, data, {
    headers: {
      ...headers,
      'X-OpenDataKit-Version': '2.0',
      // set max limits for posting size
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
    },
  });
}
async function put<T = any>(
  endpoint: string,
  data: any,
  headers = {}
): Promise<T> {
  return axios.put(endpoint, data, {
    headers: { ...headers, 'X-OpenDataKit-Version': '2.0' },
    // set max limits for posting size
    maxContentLength: 100000000,
  });
}
async function del<T = any>(endpoint: string): Promise<T> {
  return axios.delete(endpoint);
}

/**
 * Axios returns full request and response objects. Log what is likely to be most relevant
 */
function handleError(err: AxiosError) {
  if (err.isAxiosError) {
    const { request, response } = err;
    console.error(response.data);
  }
  return Promise.reject(
    `Request failed, see logs in developer console for more information`
  );
}

export default { get, post, del, put };
