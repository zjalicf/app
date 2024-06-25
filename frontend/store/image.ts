import { Context, NuxtConfig } from '@nuxt/types';
import isArray from 'lodash/isArray';
import { v4 } from 'uuid';
import { Vue } from 'vue-property-decorator';
import { ImageObject, IVault } from '~/@types';
import { ServiceRegistryType } from '~/plugins/service-registry';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import { isDatabaseService } from '~/plugins/workers/database';

import {
    base64ImageToDataUrl,
    blobToBuffer,
    serializeImage,
} from '~/helpers/image';

type AppState = {
    list: ImageObject['id'][];
    images: Record<ImageObject['id'], ImageObject>;
};

export const state: () => AppState = () => ({
    list: [],
    images: {},
});

export const getters = {
    images: (state: AppState) => {
        return state.list.map(id => state.images[id]);
    },
    byId: (state: AppState) => {
        return (id: string) => state.images[id] ?? null;
    },
    bySrc: (state: AppState) => {
        return (src: string) => {
            return state.list
                .map(id => state.images[id])
                .find(image => image?.filepath?.endsWith(src));
        };
    },
};

export const mutations = {
    addImages: (state: AppState, images: ImageObject[]) => {
        state.images = {
            ...state.images,
            ...images.reduce((acc, image) => {
                acc[image.id] = image;
                return acc;
            }, {} as Record<ImageObject['id'], ImageObject>),
        };
        state.list = [...state.list, ...images.map(({ id }) => id)];
    },
    clear: (state: AppState) => {
        state.list = [];
        state.images = {};
    },
    update: (state: AppState, image: ImageObject) => {
        const id = image.id;
        const index = state.list.indexOf(id);
        if (index === -1) {
            Vue.set(state.images, id, image);
            Vue.set(state.list, state.list.length, id);
        }
        Vue.set(state.images, id, image);
        Vue.set(state.list, index, id);
    },
    delete: (state: AppState, id: string) => {
        const index = state.list.indexOf(id);
        if (index === -1) return;
        Vue.delete(state.images, id);
        Vue.delete(state.list, index);
    },
};

export const actions = {
    async update(
        this: Context,
        { commit, rootGetters }: any,
        {
            id,
            entityType,
            entityId,
            data,
            name,
            ext,
            folderId,
        }: Partial<ImageObject> & { id: string },
    ): Promise<ImageObject | void> {
        const vault = rootGetters['vault/active'];
        if (!vault) return;
        const service = new ImageService(this.$serviceRegistry, this.$config);

        const imageObject = await service.save(
            id,
            vault.id,
            entityType!,
            entityId!,
            data,
            name,
            ext,
            folderId,
        );
        if (!imageObject) return;
        commit('update', imageObject);
        return { ...imageObject };
    },
    clear(this: Context, { commit }: any) {
        commit('clear');
    },
    delete(this: Context, { commit }: any, id: string) {},
    indexedDBUpdate(
        this: Context,
        { commit }: any,
        images: ImageObject | ImageObject[],
    ) {
        images = isArray(images) ? images : [images];
        // first update content
        for (const image of images) {
            commit('update', image);
        }
    },
    indexedDBDelete(this: Context, { commit }: any, ids: string | string[]) {
        ids = isArray(ids) ? ids : [ids];
        // first update content
        for (const id of ids) {
            commit('delete', id);
        }
    },
    async list(this: Context, { commit, dispatch, getters, rootGetters }: any) {
        if (!rootGetters['vault/active']) return;
        if (!this.$workers.database) return;

        const data = await this.$workers.database.list<ImageObject[]>(
            rootGetters['vault/active'].id,
            'images',
        );
        commit('addImages', data);
    },
    async refresh(this: Context, { dispatch, commit }: any) {
        commit('clear');
        await dispatch('list');
    },
};

export class _ImageService {
    serviceRegistry: ServiceRegistryType;
    config: NuxtConfig;

    constructor(serviceRegistry: ServiceRegistryType, config: NuxtConfig) {
        this.serviceRegistry = serviceRegistry;
        this.config = config;
    }

    async save(
        vaultId: string,
        entityType: string,
        entityId: string,
        image: Blob,
        name: string = 'unknown',
        type: string = 'png',
        folderId?: string,
    ): Promise<ImageObject | void> {
        const databaseService = this.serviceRegistry.service(
            ServiceKey.DATABASE,
        );
        if (!isDatabaseService(databaseService)) return;
        const entity = await databaseService.retrieve<{ filepath: string }>(
            vaultId,
            entityId,
            entityType,
        );
        const sep = this.config.os === 'windows' ? '\\' : '/';
        const parts = entity?.filepath?.split(sep) ?? [];
        parts.pop();
        if (!parts.length) {
            const vault = await databaseService.Vaults.retrieve<IVault>(
                '',
                vaultId,
            );
            parts.push(vault!.filepath!);
        }
        const imagePathBase = [
            ...parts,
            name?.endsWith(type)
                ? name.slice(0, name?.length - (type.length + 1))
                : `${name || 'unknown'}`,
        ].join(sep);

        const imagePath = await this.serviceRegistry.invoke<string>(
            ServiceKey.DATABASE,
            DatabaseServiceAction.GET_IMAGE_AVAILABLE_PATH,
            {
                payload: {
                    filepathBase: imagePathBase,
                    ext: `.${type}`,
                },
                callerContext: 'store/image.ts save 1',
            },
        );

        const imageObject: ImageObject = {
            id: v4(),
            entityType,
            entityId,
            vaultId,
            filepath: imagePath!,
            isOnDisk: true,
            name,
            folderId,
            ext: type,
        };
        const data = new Uint8Array(await image.arrayBuffer());
        await this.serviceRegistry.invoke(
            ServiceKey.DEVICE,
            'attachment:create',
            {
                vaultId,
                filepath: imagePath,
                content: data,
                callerContext: 'store/image.ts save 2',
            },
        );
        await databaseService.Images.save(vaultId, imageObject);

        return imageObject;
    }
}

export class ImageService {
    serviceRegistry: ServiceRegistryType;
    config: NuxtConfig;

    constructor(serviceRegistry: ServiceRegistryType, config: NuxtConfig) {
        this.serviceRegistry = serviceRegistry;
        this.config = config;
    }

    async save(
        id: string,
        vaultId: string,
        entityType: string,
        entityId: string,
        image: Blob,
        name: string = 'unknown',
        type: string = 'png',
        folderId?: string,
    ): Promise<ImageObject> {
        const imageBuffer = await blobToBuffer(image);
        const serializedImage = await serializeImage(imageBuffer);
        const imageObject = {
            id,
            vaultId,
            entityType,
            entityId,
            name,
            ext: type,
            folderId,
        } as ImageObject;

        const service = this.serviceRegistry.service(ServiceKey.DATABASE);
        if (!isDatabaseService(service)) return imageObject;

        imageObject.data = serializedImage;
        await service.Images.save(vaultId, imageObject, undefined, {
            writeToDevice: true,
        });
        return {
            ...imageObject,
            data: base64ImageToDataUrl(serializedImage, type),
        };
    }
}
