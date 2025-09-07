import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import apiConf from "../api/api.conf";


interface RequestConfig<T> extends AxiosRequestConfig {
    data?: T;
}

class ApiResolverUtil {
    private readonly endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async request<U, S>(
        url: string,
        method: string,
        data?: U,
        jwt?: string
    ): Promise<S> {
        const fullUrl = `${apiConf.endpoint}/${this.endpoint}/${url}`;

        const config: RequestConfig<U> = {
            url: fullUrl,
            method,
            data,
            headers: {
                "Authorization": jwt ? `Bearer ${jwt}` : undefined,
            },
        };

        try {
            const response: AxiosResponse<S> = await axios(config);
            return response.data
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.log(error)
                return {
                    status: error.response?.data.status,
                    message: error.response.data.message.split(':')[1],
                }
            } else {
                return {
                    status: "???",
                    message: "Неизвестная ошибка",
                }
            }
        }
    }
}

export default ApiResolverUtil;