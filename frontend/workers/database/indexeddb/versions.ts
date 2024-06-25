import { Table } from 'dexie';
import { IDatabaseChange, IUpdateChange } from 'dexie-observable/api';
import { v4 } from 'uuid';
import { IndexedDBBase } from './base';
import { acreomVaultIndexedDB } from '~/workers/database/indexeddb/connector';
import { WorkerContext, IVersion } from '~/@types/app';
import { EntityEncryption } from '~/workers/database/encryption/entity';
import { EncryptionDatagramType } from '~/workers/encryption/constants';
import { versionEncryptedProperties } from '~/workers/encryption/datagrams';
import { IDocument } from '~/components/document/model';

const VersionLimit = 30;
const VersionInterval = 30 * 60 * 1000; // 30 minutes
export class VersionsIndexedDB extends IndexedDBBase<IVersion> {
    shouldStoreLocally = false;
    entity = 'version';

    constructor(ctx: WorkerContext) {
        super(ctx);
        this.encryption = new EntityEncryption<any>(
            ctx,
            EncryptionDatagramType.VERSION,
            versionEncryptedProperties,
        );
    }

    table(vaultId: string): Table<IVersion, string> {
        return acreomVaultIndexedDB(vaultId)?.Versions;
    }

    initialize(_vaultId: string) {}

    createVersionFromChange(vaultId: string, change: IDatabaseChange) {
        if (change.type !== 2) return;

        const mods = (change as IUpdateChange).mods;
        const modKeys = Object.keys(mods);
        const versionUpdateKeys = ['content', 'title', 'pageStatus', 'icon'];
        if (!modKeys.some(key => versionUpdateKeys.includes(key))) return;

        const newVersion = this.createVersion(
            vaultId,
            (change as IUpdateChange).oldObj || (change as IUpdateChange).obj,
        );
        return this.addVersion(vaultId, newVersion);
    }

    async addVersion(vaultId: string, version: IVersion) {
        const entityVersions = await this.listByQuery(vaultId, {
            entityId: { eq: version.entityId },
            clientId: { eq: this.clientId },
        });
        const sortedVersions = entityVersions.sort((a, b) => {
            const bDate = new Date(b.createdAt).getTime();
            const aDate = new Date(a.createdAt).getTime();

            return bDate > aDate ? 1 : -1;
        });

        const latestVersion = sortedVersions?.[0] ?? null;
        if (!latestVersion) {
            return this.save(vaultId, version, {
                clientId: this.clientId,
                postprocess: false,
                writeToDevice: false,
            });
        }
        const lastVersionDate = new Date(latestVersion.createdAt);
        if (
            lastVersionDate.getTime() + VersionInterval >=
            version.createdAt.getTime()
        ) {
            return;
        }
        await this.save(vaultId, version, {
            clientId: this.clientId,
            postprocess: false,
            writeToDevice: false,
        });
        sortedVersions.unshift(version);
        if (sortedVersions.length <= VersionLimit) {
            return;
        }
        await this.delete(vaultId, sortedVersions[VersionLimit], {
            clientId: this.clientId,
            writeToDevice: false,
        });
    }

    createVersion(vaultId: string, page: IDocument) {
        return {
            id: v4(),
            entityId: page.id,
            entityType: 'document',
            clientId: this.clientId,
            vaultId,
            content: {
                content: page.content,
                title: page.title,
                pageStatus: page.pageStatus,
                icon: page.icon,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        } as IVersion;
    }
}
