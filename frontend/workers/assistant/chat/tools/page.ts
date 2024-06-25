import { v4 } from 'uuid';
import { ChatCompletionTool } from 'openai/resources';
import { WorkerContext } from '~/@types/app';
import { DatabaseServiceAction, ServiceKey, UtilActions } from '~/constants';

export const createPageDefinition = {
    type: 'function',
    function: {
        name: 'create_page',
        description: 'function that creates a page in the vault',
        parameters: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'title of the page',
                },
                content: {
                    type: 'string',
                    description: 'markdown content of the page',
                },
                open: {
                    type: 'boolean',
                    description: 'open the page after creation',
                },
            },
            required: ['title', 'content'],
        },
    },
} as ChatCompletionTool;

export const createPage = (ctx: WorkerContext) => {
    return async (vaultId: string, { title, content, open }: any) => {
        const [HTMLContent] = await ctx.invoke<string[]>(
            ServiceKey.UTILS,
            UtilActions.PARSE_MD_TO_HTML,
            {
                vaultId,
                entity: [
                    {
                        vaultId,
                        content,
                    },
                ],
            },
        );

        const page = {
            id: v4(),
            dailyDoc: null,
            title,
            content: HTMLContent,
            mdContent: content,
            createdAt: new Date(),
            updatedAt: new Date(),
            projectId: null,
        };

        ctx.invoke(ServiceKey.DATABASE, DatabaseServiceAction.SAVE, {
            table: 'documents',
            vaultId,
            payload: {
                vaultId,
                entity: page,
                meta: {
                    clientId: '*',
                },
            },
        }).then(() => {
            if (open) {
                // open the page in new tab
            }
        });

        return { id: page.id, title: page.title };
    };
};
