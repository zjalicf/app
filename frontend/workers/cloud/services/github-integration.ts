import { AxiosInstance } from 'axios';
import { Octokit } from '@octokit/rest';
import { ServiceBase } from '~/workers/cloud/services/base';
import { WorkerContext } from '~/@types/app';
import { getAccessToken } from '~/workers/cloud/axios';

export class GithubIntegrationService extends ServiceBase<any> {
    constructor(axios: AxiosInstance, ctx: WorkerContext) {
        super(axios, 'github', ctx);
    }

    async request(
        url: string,
        accessToken: string,
        baseUrl?: string,
        cache: boolean = true,
        body: any = null,
    ) {
        const options: any = {
            auth: accessToken,
        };

        const requestOptions: any = {
            per_page: 100,
            headers: {
                Accept: 'application/vnd.github.html+json',
            },
        };

        if (baseUrl) {
            options.baseUrl = baseUrl;
        }

        if (!cache) {
            requestOptions.headers = {
                ...requestOptions.headers,
                'If-None-Match': '',
            };
        }

        if (body) {
            requestOptions.body = body;
        }

        if (this.context.$config.platform === 'web' && baseUrl) {
            delete options.auth;
            options.baseUrl = this.context.$config.githubProxyUrl;
            let githubUrl = 'api.github.com';
            if (baseUrl) {
                githubUrl = baseUrl.replace('https://', '');
            }
            requestOptions.headers = {
                ...requestOptions.headers,
                'github-url': githubUrl,
                'github-token': `token ${accessToken}`,
                authorization: `Bearer ${getAccessToken()}`,
            };
        }

        const octokit = new Octokit(options);
        const response: any = { data: null, status: null };
        let retries = 0;
        while (retries < 3) {
            try {
                const response = await octokit.request(url, requestOptions);
                if (response.status < 300) return response;
                await new Promise((resolve, reject) => {
                    setTimeout(resolve, 1000);
                });
            } catch (err: any) {
                if (err.response && err.response.data) {
                    response.message = err.response.data.message;
                }
                response.status = err.status;
                retries++;
            }
        }

        return response;
    }
}
