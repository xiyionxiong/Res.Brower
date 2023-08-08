import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import NProgress from "nprogress";
import "nprogress/nprogress.css";

import localforage from "localforage";
import { v4 } from "uuid";
import storage from "../storage";

// const baseURL = import.meta.env.PROD ? '' : '/proxy';
class HttpClient {
  private service: AxiosInstance;

  private baseURL = import.meta.env.PROD ? "https://open.feishu.cn" : "/proxy";
  // private baseURL = import.meta.env.PROD ? "" : "/proxy";

  constructor() {
    this.service = axios.create({
      baseURL: this.baseURL,
      timeout: 5000,
    });
    // 请求拦截器
    this.service.interceptors.request.use(
      async (config) => {
        NProgress.start();
        config.headers.Authorization = await storage.getItem(
          "app_access_token"
        );
        config.headers.nonce = v4();
        config.headers.timestamp = new Date().getTime();
        return config;
      },
      (error) => {
        console.log(error);
        return Promise.reject(error);
      }
    );

    //响应拦截器
    this.service.interceptors.response.use(
      (response) => {
        NProgress.done();
        const res = response.data;
        if (response.status >= 200 && response.status < 300) {
          console.log(">>", response.data);
          const { code, app_access_token, tenant_access_token } = response.data;

          if (code === 0) {
            storage.setItem("app_access_token", "Bearer " + app_access_token);
            storage.setItem(
              "tenant_access_token",
              "Bearer " + tenant_access_token
            );
          }

          return res;
        }
        return Promise.reject(new Error(res.message || "Error"));
      },
      (error) => {
        NProgress.done();
        console.log("err" + error);
        // Message({
        //   message: error.message,
        //   type: 'error',
        //   duration: 5 * 1000,
        // });
        return Promise.reject(error);
      }
    );
  }

  async post<T = any>(
    url: string,
    params: D,
    config?: AxiosRequestConfig<D>
  ): Promise<Response<T>> {
    return await this.service
      .post<T, Response<T>, D>(url, params, config)
      .catch((error) => {
        console.log("error=>", error);
        return { code: -1, data: null, message: error } as Response<T>;
      });
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig<D>
  ): Promise<Response<T>> {
    return await this.service
      .get<T, Response<T>, D>(url, config)
      .catch((error) => {
        console.log("error=>", error);
        return { code: -1, data: null, message: error } as Response<T>;
      });
  }
}

type D = Record<string, any> | FormData;

export interface Response<T> {
  code: number;
  data: T;
  message: string;
}

const httpClient = new HttpClient();

export default httpClient;
