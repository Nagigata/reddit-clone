import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface AxiosServiceConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

class AxiosService {
    private instance: AxiosInstance;
    private bearerToken: string | null = null;

    constructor(config: AxiosServiceConfig = {}) {
        this.instance = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout || 10000,
            headers: {
                "ngrok-skip-browser-warning": "true",
                // 'Content-Type': 'application/json',
                ...config.headers,
            },
        });

        this.instance.interceptors.request.use(
            (config) => {
                if (this.bearerToken) {
                    config.headers['Authorization'] = `Bearer ${this.bearerToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.instance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: AxiosError) => this.handleError(error)
        );
    }

    public setBearerToken(token: string | null) {
        this.bearerToken = token;
        if (token === null) {
            delete this.instance.defaults.headers['Authorization'];
        } else {
            this.instance.defaults.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    public get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.instance.get(url, config);
    }

    public post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.instance.post(url, data, config);
    }

    public put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.instance.put(url, data, config);
    }

    public patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return this.instance.patch(url, data, config);
    }

    public delete(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
        return this.instance.delete(url, {
            ...config,
            data,
        });
    }

    public postFormData(
        url: string,
        formData: FormData,
        config: AxiosRequestConfig = {}
    ): Promise<AxiosResponse> {
        const formConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                "ngrok-skip-browser-warning": "true",
                ...config.headers
            },
        };
        return this.instance.post(url, formData, formConfig);
    }

    public putFormData(
        url: string,
        formData: FormData,
        config: AxiosRequestConfig = {}
    ): Promise<AxiosResponse> {
        const formConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                "ngrok-skip-browser-warning": "true",
                ...config.headers
            },
        };
        return this.instance.put(url, formData, formConfig);
    }

    private handleError(error: AxiosError): Promise<never> {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                console.log('Network Error!');
                return Promise.reject({ status: 'Network Error', data: null });
            }

            const { status, data } = error.response as { status: number; data: any };
            const message = data?.message || 'Lỗi không xác định';

            switch (status) {
                case 400:
                    console.log('Bad Request:', message);
                    return Promise.reject({ status: 400, data, message });
                case 401:
                    console.log('Unauthorized:', message);
                    return Promise.reject({ status: 401, data, message });
                case 500:
                    console.log('Server Error:', message);
                    return Promise.reject({ status: 500, data, message });
                default:
                    console.log(`Unhandled error status: ${status}`, message);
                    return Promise.reject({ status, data, message });
            }
        }
        return Promise.reject(error);
    }
}

const axiosService = new AxiosService({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 15000,
});

export default axiosService;