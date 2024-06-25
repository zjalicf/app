import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import axiosRetry, {
    exponentialDelay,
    isNetworkOrIdempotentRequestError,
} from 'axios-retry';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import { WorkerContext } from '~/@types/app';
import { DatabaseServiceAction, ServiceKey } from '~/constants';

let cachedCredentials: {
    accessToken: string;
    refreshToken: string;
} | null = null;

export const clearCachedCredentials = () => {
    cachedCredentials = null;
};

export const getAccessToken = () => {
    return cachedCredentials?.accessToken;
};

export const createAxiosInstance = (
    ctx: WorkerContext,
    handleRefreshLogic = true,
) => {
    const instance = axios.create({
        baseURL: ctx.$config.baseUrl,
        headers: {
            'x-acr-os': ctx.$config.os,
            'x-acr-platform': ctx.$config.platform,
            'x-acr-client-id': ctx.$config.clientId,
            'x-acr-version': ctx.$config.version,
        },
        timeout: ctx.$config.axiosTimeout ?? 5000,
    });

    // credentials
    instance.interceptors.request.use(async (config: AxiosRequestConfig) => {
        if (config.params?.token) return config;

        if (!cachedCredentials) {
            const users = await ctx.invoke<any>(
                ServiceKey.DATABASE,
                DatabaseServiceAction.LIST,
                { table: 'users' },
            );
            if (!users.length) return config;
            const user = users.shift();

            if (!user.credentials) {
                return config;
            }
            cachedCredentials = user.credentials;
        }
        config.headers.Authorization = `Bearer ${cachedCredentials?.accessToken}`;

        return config;
    });

    if (!handleRefreshLogic) return instance;

    instance.interceptors.response.use(data => {
        ctx.emit(ServiceKey.DATABASE, DatabaseServiceAction.EMIT, {
            event: 'network:online',
        });
        return data;
    });

    const refreshCredentials = async () => {
        const users = await ctx.invoke<any[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST,
            {
                table: 'users',
            },
        );
        if (!users?.length) return null;

        const user = users.shift()!;
        if (!user.credentials) return null;

        const refreshedCredentials = await ctx.$cloudService.refreshCredentials(
            user.id,
            user.credentials,
        );
        return refreshedCredentials;
    };

    const refreshAuthLogic = async (failedRequest: AxiosError) => {
        const credentials = await refreshCredentials();
        cachedCredentials = credentials;

        if (!cachedCredentials) {
            await ctx.invoke(ServiceKey.STORE, 'dispatch:auth/logout', null);
            if (failedRequest?.request?.headers) {
                failedRequest.request.headers['x-failed-refresh'] = true;
            }
            return failedRequest;
        }
        failedRequest.response!.config.headers.Authorization = `Bearer ${cachedCredentials?.accessToken}`;
        return Promise.resolve();
    };

    createAuthRefreshInterceptor(instance, refreshAuthLogic);
    axiosRetry(instance, {
        retries: 4,
        retryDelay: exponentialDelay,
        retryCondition: async (error: AxiosError) => {
            if (error.message === 'Network Error') {
                ctx.emit(ServiceKey.DATABASE, DatabaseServiceAction.EMIT, {
                    event: 'network:offline',
                });
                return false;
            }
            const isFailedRefresh = (error: AxiosError) => {
                return (
                    (error.response &&
                        error.response.status === 403 &&
                        error.config.url?.includes('/auth/refresh')) ||
                    (error.request?.headers &&
                        error.request?.headers['x-failed-refresh'])
                );
            };
            const isTooManyRequests = (error: AxiosError) => {
                return error.response && error.response.status === 429;
            };
            if (isFailedRefresh(error)) {
                await ctx.invoke(
                    ServiceKey.STORE,
                    'dispatch:auth/logout',
                    null,
                );
                return false;
            }
            return (
                isTooManyRequests(error) ||
                !isNetworkOrIdempotentRequestError(error)
            );
        },
    });

    return instance;
};
