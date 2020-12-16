import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { IStorageKey } from '../../types';

export type IErrorHandler = (err: AxiosError) => void;
@Injectable({ providedIn: 'root' })
export class AxiosHttpService {
  constructor(private errorHandler: IErrorHandler = () => null, private useApiProxy = true) {
    this._addRequestInterceptor();
    this._addResponseInterceptor();
  }
  /**
   * Base rest methods using axios
   */
  get<T = any>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
    return axios.get(endpoint, { ...config });
  }

  post<T = any>(endpoint: string, data: any, headers = {}): Promise<T> {
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
  put<T = any>(endpoint: string, data: any, headers = {}): Promise<T> {
    return axios.put(endpoint, data, {
      headers: { ...headers, 'X-OpenDataKit-Version': '2.0' },
      // set max limits for posting size
      maxContentLength: 100000000,
    });
  }
  del<T = any>(endpoint: string): Promise<T> {
    return axios.delete(endpoint);
  }

  /**
   * Use interceptor to append correct url prefix and auth headers
   */
  private _addRequestInterceptor() {
    axios.interceptors.request.use(
      (config) => {
        const odkserverurl = getStorage('odkServerUrl');
        // Make sure requests target the /odktables api endpoint
        if (!config.url.includes('/odktables')) {
          config.url = `/odktables/${config.url}`;
        }
        // If using the api service as a proxy, append the target odk server url to headers
        if (environment.useApiProxy) {
          config.headers = { ...config.headers, odkserverurl };
        } else {
          // Otherwise target the server api endpoint
          config.url = `${location.origin}/${config.url}`;
        }
        // Add authorization header
        const Authorization = `basic ${getStorage('odkToken')}`;
        config.headers = { ...config.headers, Authorization };
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  /**
   * Use interceptor to return nested data object on successful response
   * and handle errors
   */
  private _addResponseInterceptor() {
    axios.interceptors.response.use(
      (response) => {
        // data can be nested, or in the case of 304 no-change just the response object
        const data = response?.data?.data || response.data || response;
        return data;
      },
      (err) => {
        if (err.isAxiosError) {
          console.error(err);
          const { request, response } = err;
          console.error(response.data);
        }
        this.errorHandler(err);
        return Promise.reject(`Request failed, see logs in developer console for more information`);
      }
    );
  }
}

// Depending on whether data is persisted, may use local storage or session storage
function getStorage(key: IStorageKey): string | undefined {
  return localStorage.getItem(key) ? localStorage.getItem(key) : sessionStorage.getItem(key);
}
