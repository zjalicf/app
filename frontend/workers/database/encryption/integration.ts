import {
    generateSymmetricKey,
    stringEncryptAsymmetric,
} from '@skiff-org/skiff-crypto';
import { IntegrationType, ServiceKey } from '~/constants';
import {
    EncryptionDatagramType,
    EncryptionWorkerActions,
} from '~/workers/encryption/constants';
import { acreomVaultIndexedDB } from '~/workers/database/indexeddb/connector';
import { EntityEncryption } from '~/workers/database/encryption/entity';
import { IntegrationConfig } from '~/workers/integrations/base';
import { WorkerContext } from '~/@types/app';

export class IntegrationEncryption extends EntityEncryption<
    IntegrationConfig<any>
> {
    constructor(context: WorkerContext) {
        super(context, EncryptionDatagramType.INTEGRATION, []);
    }

    get encryptableIntegrations(): IntegrationType[] {
        return [
            IntegrationType.GITHUB,
            IntegrationType.AI_ASSISTANT,
            IntegrationType.JIRA,
            IntegrationType.ICS_CALENDAR,
            IntegrationType.LINEAR,
        ];
    }

    isIntegrationEncryptable(type: IntegrationType) {
        return this.encryptableIntegrations.includes(type);
    }

    async decryptData(vaultId: string, data: IntegrationConfig<any>[]) {
        if (!this.shouldEncrypt(vaultId)) return data;

        const toDecrypt = data.filter(
            entity =>
                this.isIntegrationEncryptable(
                    entity.type! as IntegrationType,
                ) && !!entity.data?.encryptedData,
        );
        const rest = data.filter(entity => !entity.data?.encryptedData);

        const decryptedData = await this.context.invoke<
            Partial<IntegrationConfig<any>>[]
        >(
            ServiceKey.ENCRYPTION,
            EncryptionWorkerActions.DECRYPT_SYMMETRIC_BULK,
            {
                type: this.encryptionDatagramType,
                keys: this.context.$deviceService.encryptionKeys,
                data:
                    toDecrypt.map(entity => ({
                        id: entity.id,
                        encryptedData: entity?.data?.encryptedData,
                        encryptionKey: entity?.data?.encryptionKey,
                    })) ?? [],
                callerContext: 'encryption/integration.ts/decryptData',
            },
        );
        const result = toDecrypt.map((entity, index) => {
            return {
                ...entity,
                data: {
                    ...decryptedData[index],
                    encryptionKey: entity?.data?.encryptionKey,
                },
            };
        });

        let restIndex = 0;
        let decryptedIndex = 0;

        return data.map(entity => {
            if (!entity.data?.encryptedData) {
                return rest[restIndex++];
            }
            return result[decryptedIndex++];
        });
    }

    async encryptContentBulk(
        vaultId: string,
        entities: (Partial<IntegrationConfig<any>> & {
            encryptionKey?: string;
        })[],
    ): Promise<(IntegrationConfig<any> & { encryptedData: string })[]> {
        if (!this.shouldEncrypt(vaultId)) return entities as any[];

        const toEncrypt = entities.map(entity => {
            if (
                entity.data &&
                !entity.data?.encryptionKey &&
                this.isIntegrationEncryptable(entity.type! as IntegrationType)
            ) {
                entity.data.encryptionKey = this.createEncryptionKey();
            }
            return entity;
        });

        const encryptedData = await this.context.invoke<
            Partial<IntegrationConfig<any>>[]
        >(
            ServiceKey.ENCRYPTION,
            EncryptionWorkerActions.ENCRYPT_SYMMETRIC_BULK,
            {
                type: this.encryptionDatagramType,
                data: toEncrypt.map(entity => entity.data ?? {}),
                keys: this.context.$deviceService.encryptionKeys,
                callerContext: 'encryption/integration.ts/encryptContentBulk',
            },
        );

        return entities.map((entity, index) => {
            return {
                ...entity,
                data: {
                    ...this.clearEncryptedProperties({
                        ...entity.data,
                    } as any),
                    id: entity.data.id,
                    encryptedData: encryptedData[index],
                    vaultId,
                },
            };
        }) as any[];
    }

    async encryptContent(
        vaultId: string,
        mods: Partial<IntegrationConfig<any>> & { encryptionKey?: string },
        originalEntity: IntegrationConfig<any> | null,
    ): Promise<(IntegrationConfig<any> & { encryptedData: string }) | null> {
        if (!this.shouldEncrypt(vaultId)) return null;
        if (
            (originalEntity &&
                !this.isIntegrationEncryptable(
                    originalEntity.type! as IntegrationType,
                )) ||
            !this.isIntegrationEncryptable(mods.type! as IntegrationType)
        ) {
            return null;
        }
        if (
            !originalEntity ||
            (mods.data &&
                !mods.data?.encryptionKey &&
                this.isIntegrationEncryptable(mods.type! as IntegrationType))
        ) {
            mods.data.encryptionKey =
                mods.data?.encryptionKey ??
                originalEntity?.data?.encryptionKey ??
                this.createEncryptionKey();
        }

        if (!this.hasEncryptableProperties(mods.data)) {
            return null;
        }

        const toEncrypt = {
            ...originalEntity,
            ...mods,
            data: {
                ...(originalEntity?.data ?? {}),
                ...(mods.data ?? {}),
            },
        };
        if (
            !this.isIntegrationEncryptable(toEncrypt.type! as IntegrationType)
        ) {
            return null;
        }
        const encryptedData = await this.context.invoke(
            ServiceKey.ENCRYPTION,
            EncryptionWorkerActions.ENCRYPT_SYMMETRIC,
            {
                type: this.encryptionDatagramType,
                data: toEncrypt.data,
                keys: this.context.$deviceService.encryptionKeys,
                callerContext: 'encryption/integration.ts/encryptContent',
            },
        );
        return {
            ...toEncrypt,
            data: {
                id: toEncrypt.data.id,
                encryptedData,
                encryptionKey: toEncrypt?.data?.encryptionKey,
                vaultId,
            },
        } as any;
    }

    shouldEncrypt(vaultId: string) {
        if (this.encryptionDatagramType === EncryptionDatagramType.NONE)
            return false;
        const vaultDb = acreomVaultIndexedDB(vaultId);
        const isRemote = vaultDb?.type === 'remote';
        return (
            !!this.encryptionDatagramType &&
            isRemote &&
            !!this.context.$deviceService.encryptionKeys
        );
    }

    createEncryptionKey(): string | undefined {
        if (!this.context.$deviceService.encryptionKeys?.privateKey)
            return undefined;
        const encryptionKey = generateSymmetricKey();
        return stringEncryptAsymmetric(
            this.context.$deviceService.encryptionKeys!.privateKey,
            { key: this.context.$deviceService.encryptionKeys!.publicKey },
            encryptionKey,
        );
    }

    protected hasEncryptableProperties(mods: Partial<IntegrationConfig<any>>) {
        return true;
    }

    protected clearEncryptedProperties(entity: IntegrationConfig<any>['data']) {
        return {
            ...Object.keys(entity).reduce((acc, key) => {
                acc[key] = null;
                return acc;
            }, {} as Record<string, any>),
            vaultId: entity.vaultId,
            id: entity.id,
            encryptionKey: entity.encryptionKey,
        };
    }
}
