import { Issues } from 'jira.js/out/version3';
import { Callback } from 'jira.js';
import * as Parameters from 'jira.js/src/version3/parameters';
import { RequestConfig } from 'jira.js/src/requestConfig';

export class IssuesAPI extends Issues {
    async editIssue<T = void>(
        parameters: Parameters.EditIssue & {
            returnIssue?: boolean;
            expand?: string;
        },
        callback?: Callback<T>,
    ): Promise<void | T> {
        if (
            parameters.fields?.description &&
            typeof parameters.fields.description === 'string'
        ) {
            const {
                fields: { description },
            } = await this.getIssue({ issueIdOrKey: parameters.issueIdOrKey });

            parameters.fields.description = {
                type: 'doc',
                version: description?.version ?? 1,
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                text: parameters.fields.description,
                                type: 'text',
                            },
                        ],
                    },
                ],
            };
        }

        const config: RequestConfig = {
            url: `/rest/api/3/issue/${parameters.issueIdOrKey}`,
            method: 'PUT',
            params: {
                notifyUsers: parameters.notifyUsers,
                overrideScreenSecurity: parameters.overrideScreenSecurity,
                overrideEditableFlag: parameters.overrideEditableFlag,
                expand: parameters.expand,
                returnIssue: parameters.returnIssue,
            },
            data: {
                transition: parameters.transition,
                fields: parameters.fields,
                update: parameters.update,
                historyMetadata: parameters.historyMetadata,
                properties: parameters.properties,
            },
        };

        // @ts-ignore
        return this.client.sendRequest(config, callback);
    }
}
