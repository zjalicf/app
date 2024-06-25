import { Context } from '@nuxt/types';
import { v4 } from 'uuid';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { IVersion } from '~/@types/app';

export class VersionsController {
    context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    async byId(id: string) {
        const vaultId = this.context.$entities.vault.activeVaultId;

        const version = await this.context.$serviceRegistry.invoke<IVersion[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST_BY_IDS,
            {
                table: 'versions',
                payload: {
                    vaultId,
                    ids: [id],
                },
                callerContext: 'entities/version.ts byId',
            },
        );

        return version?.shift() ?? null;
    }

    async createVersionFromPage(pageId: string) {
        const page = this.context.$entities.page.byId(pageId);
        if (!page) return;

        const version: IVersion = {
            id: v4(),
            entityId: pageId,
            entityType: 'document',
            clientId: v4(),
            vaultId: page.vaultId,
            content: {
                content: page.content,
                title: page.title,
                icon: page.icon,
                pageStatus: page.pageStatus,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.context.$serviceRegistry.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.SAVE,
            {
                table: 'versions',
                vaultId: page.vaultId,
                entity: version,
                payload: {
                    vaultId: page.vaultId,
                    entity: version,
                },
                callerContext: 'entities/version.ts createVersionFromPage',
            },
        );
    }

    async getVersions(pageId: string): Promise<any[]> {
        const vaultId = this.context.store.getters['vault/activeVaultId'];
        const versions = await this.context.$serviceRegistry.invoke<IVersion[]>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.LIST_BY_QUERY,
            {
                table: 'versions',
                vaultId,
                payload: {
                    vaultId,
                    query: {
                        entityId: { eq: pageId },
                    },
                },
                callerContext: 'entities/version.ts getVersions',
            },
        );
        return (
            versions?.sort?.((a, b) =>
                new Date(b.updatedAt) > new Date(a.updatedAt) ? 1 : -1,
            ) ?? []
        );
    }
}
