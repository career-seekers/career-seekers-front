import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
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
    jwt?: string,
    responseType?: AxiosResponse["request"]["responseType"],
  ): Promise<S> {
    const fullUrl = `${apiConf.endpoint}/${this.endpoint}/${url}`;

    const config: RequestConfig<U> = {
      url: fullUrl,
      method,
      data,
      headers: {
        Authorization: jwt ? `Bearer ${jwt}` : undefined,
      },
      responseType: (responseType || "json") as never,
    };

    try {
      const response: AxiosResponse<S> = await axios(config);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {

        return {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
          status: error.response?.status || error.response?.data?.status || 500,

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
          message: error.response?.data?.message?.split?.(':')?.[1]
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            ? error.response.data.message.split(":")[1]

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            : error.response?.data?.message || error.message || "Ошибка сервера",
        } as S;
      } else {
        console.error('Неизвестная ошибка API:', error);
        return {
          status: 500,
          message: "Неизвестная ошибка",
        } as S;
      }
    }
  }

  DTOToFormData(dto: never) {
    const formData = new FormData();
    Object.keys(dto).forEach((key) => {
      formData.append(key, dto[key]);
    });
    return formData;
  }

  DTOToURLSearchParams(dto: never) {
    const params = new URLSearchParams();
    Object.keys(dto).forEach((key) => {
      const value = dto[key] as unknown
      if(value !== null && value !== undefined) {
        params.append(key, dto[key]);
      }
    });
    return params;
  }
}

export default ApiResolverUtil;
