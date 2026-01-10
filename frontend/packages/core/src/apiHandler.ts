import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface User {
  id: string;
  name?: string;
  email?: string;
  token?: string;
}

export interface ApiHandlerConfig {
  baseURL: string;
  timeout?: number;
}

class ApiHandler {
  private axiosInstance: AxiosInstance;
  private user: User | null = null;

  constructor(config: ApiHandlerConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use((requestConfig) => {
      if (this.user?.token) {
        requestConfig.headers.Authorization = `Bearer ${this.user.token}`;
      }
      if (this.user?.id) {
        requestConfig.headers['X-User-Id'] = this.user.id;
      }
      return requestConfig;
    });
  }

  setUser(user: User | null): void {
    this.user = user;
  }

  getUser(): User | null {
    return this.user;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(
      url,
      config
    );
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(
      url,
      data,
      config
    );
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(
      url,
      data,
      config
    );
    return response.data;
  }
}

export const createApiHandler = (config: ApiHandlerConfig): ApiHandler => {
  return new ApiHandler(config);
};

export { ApiHandler };
