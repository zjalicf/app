import { Context } from '@nuxt/types';
import { AxiosError, AxiosRequestConfig } from 'axios';
import axiosRetry, {
    exponentialDelay,
    isNetworkOrIdempotentRequestError,
} from 'axios-retry';
import createAuthRefreshInterceptor from 'axios-auth-refresh';

export default function ({ store, $axios }: Context) {
    const refreshAuthLogic = async (failedRequest: AxiosError) => {
        await store.dispatch('auth/refresh');
        failedRequest.response!.config.headers.Authorization = `Bearer ${store.getters['auth/credentials'].accessToken}`;
        return Promise.resolve();
    };

    $axios.interceptors.request.use((config: AxiosRequestConfig) => {
        if (!store.getters['auth/credentials']) return config;

        config.headers.Authorization = `Bearer ${store.getters['auth/credentials'].accessToken}`;
        return config;
    });
    createAuthRefreshInterceptor($axios, refreshAuthLogic);
    axiosRetry($axios, {
        retries: 4,
        retryDelay: exponentialDelay,
        retryCondition: (error: AxiosError) => {
            const isFailedRefresh = (error: AxiosError) => {
                return (
                    error.response &&
                    error.response.status === 403 &&
                    error.config.url?.includes('refresh')
                );
            };
            const isTooManyRequests = (error: AxiosError) => {
                return error.response && error.response.status === 429;
            };
            if (isFailedRefresh(error)) {
                store.dispatch('auth/logout');
                return false;
            }
            return (
                isTooManyRequests(error) ||
                isNetworkOrIdempotentRequestError(error)
            );
        },
    });
}
