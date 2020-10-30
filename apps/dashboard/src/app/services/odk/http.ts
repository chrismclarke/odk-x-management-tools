import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Use interceptor to append correct url prefix and auth headers
 */
axios.interceptors.request.use(
  (config) => {
    const { url } = config;
    config.url = `/api/odktables/${url}`;
    const odkserverurl = localStorage.getItem('odkServerUrl');
    const Authorization = `basic ${localStorage.getItem('odkToken')}`;
    config.headers = { ...config.headers, Authorization, odkserverurl };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Base rest methods using axios
 */
async function get<T = any>(endpoint: string, config: AxiosRequestConfig = {}) {
  return axios
    .get(endpoint, { ...config })
    .then((res) => handleRes<T>(res))
    .catch((err) => handleErr(err));
}

async function post<T = any>(endpoint: string, data: any, headers = {}) {
  return axios
    .post(endpoint, data, {
      headers: {
        ...headers,
        'X-OpenDataKit-Version': '2.0',
        // set max limits for posting size
        maxContentLength: 100000000,
        maxBodyLength: 1000000000,
      },
    })
    .then((res) => handleRes<T>(res))
    .catch((err) => handleErr(err));
}
async function put<T = any>(endpoint: string, data: any, headers = {}) {
  return axios
    .put(endpoint, data, {
      headers: { ...headers, 'X-OpenDataKit-Version': '2.0' },
      // set max limits for posting size
      maxContentLength: 100000000,
    })
    .then((res) => handleRes<T>(res))
    .catch((err) => handleErr(err));
}
async function del<T = any>(endpoint: string) {
  return axios
    .delete(endpoint)
    .then((res) => handleRes<T>(res))
    .catch((err) => handleErr(err));
}

function handleRes<T>(res: AxiosResponse) {
  console.log(`[${res.status}][${res.request.method}]`, res.request.path);
  if (res.data.hasMoreResults) {
    throw new Error(
      'Batch requests not currently supported, res has more results'
    );
  }
  return res.data as T;
}
function handleErr<T = any>(err: AxiosError): T {
  if (err.toJSON) {
    const { message } = err.toJSON() as Error;
    console.log(message);
  }
  if (err.message) {
    console.log(err.message);
  }
  if (err.code) {
    const e = err as any; // possible network error instead of axios
    console.log(`[${e.code}][${e.hostname}]`);
  } else if (err.response) {
    console.log(
      `[${err.response.status}][${err.request.method}]`,
      err.request.path
    );
    console.log(err.response.data);
  } else {
    console.log('err', Object.keys(err));
  }

  throw new Error('request failed, see logs for details');
}

export default { get, post, del, put };
