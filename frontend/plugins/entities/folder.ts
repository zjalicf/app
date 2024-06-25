import { v4 } from 'uuid';
import { defaultsDeep } from 'lodash';
import { EntityController } from '~/plugins/entities/controller';
import { IFolder } from '~/@types';
import { FolderType, TabType } from '~/constants';
import { TrackingAction, TrackingType } from '~/@types/tracking';
import { IDocument } from '~/components/document/model';

export class FolderController extends EntityController<IFolder> {
    protected storeEntity: string = 'folder';
    protected dbTable: string = 'projects';

    getFolders() {
        return this.context.store.getters['folder/folders'];
    }

    getFlatTree() {
        return this.context.store.getters['folder/flatTree'];
    }

    getActiveFolder() {
        const activeTab = this.context.$tabs.activeTab();
        if (!activeTab) return null;
        if (activeTab.type === TabType.DOCUMENT) {
            const page = this.context.$entities.page.byId(activeTab.entityId);
            if (!page || !page.projectId) return null;
            return this.byId(page.projectId);
        }
        if (activeTab.type === TabType.VIEW) {
            const view = this.context.$entities.view.byId(activeTab.entityId);
            if (!view) return null;
            const definition = activeTab.data.filterDefinition.length
                ? activeTab.data.filterDefinition
                : null;
            if (!definition) return null;
            const projectFilter: any = definition.find((def: any) => {
                return def.property === 'projectId';
            });

            if (
                projectFilter?.value &&
                projectFilter.operation === 'overlap' &&
                projectFilter.value.length === 1
            ) {
                return this.byId(projectFilter.value[0]);
            }
        }
        if (activeTab?.type === TabType.PROJECT) {
            const project = this.byId(activeTab.entityId);
            if (!project) return null;
            return this.byId(project.id);
        }
        return null;
    }

    byParentId(parentId: string) {
        return this.context.store.getters['folder/byParentId'](parentId);
    }

    getChildren(id: string) {
        return this.context.store.getters['folder/folderChildren'](id);
    }

    getParents(id: string) {
        return this.context.store.getters['folder/folderParents'](id);
    }

    async newFolder(folder: Partial<IFolder> = {}) {
        const id = v4();
        await this.context.store.dispatch('folder/update', {
            id,
            name: '',
            status: 'new',
            type: FolderType.FOLDER,
            view: 'cards',
            sharingUuid: null,
            parentId: null,
            ...folder,
        });
        return id;
    }

    update(payload: Partial<IFolder>) {
        return this.context.store.dispatch('folder/update', payload);
    }

    updateBatch(payload: Partial<IFolder>[]) {
        return this.context.store.dispatch('folder/updateBatch', payload);
    }

    delete(id: string) {
        return this.context.store.dispatch('folder/delete', id);
    }

    archive(id: string) {
        return this.context.store.dispatch('folder/archive', id);
    }

    async archiveFolder(id: string) {
        if (!id) return;
        const folder = this.byId(id);
        if (!folder) return;
        const folders = this.byParentId(id);
        const pages = this.context.$entities.page.byFolderId(id);

        if (!folders.length && !pages.length) {
            await this.archive(id);
            this.context.$tracking.trackEventV2(TrackingType.FOLDER, {
                action: TrackingAction.ARCHIVE,
                entityId: id,
            });
            return;
        }

        return this.context.$vfm.show({
            component: () =>
                import('@/components/modal/ProjectArchiveModal.vue'),
            bind: {
                id,
                type: FolderType.FOLDER,
            },
        });
    }

    async deleteFolder(id: string) {
        if (!id) return;
        const folder = this.byId(id);
        if (!folder) return;
        const folders = this.byParentId(id);
        const pages = this.context.$entities.page.byFolderId(id);

        if (!folders.length && !pages.length) {
            await this.delete(id);
            this.context.$tracking.trackEventV2(TrackingType.FOLDER, {
                action: TrackingAction.DELETE,
                entityId: id,
            });
            return;
        }

        return this.context.$vfm.show({
            component: () =>
                import('@/components/modal/ProjectDeleteModal.vue'),
            bind: {
                id,
                type: FolderType.FOLDER,
            },
        });
    }

    toggleExpanded(id: string, expanded: boolean) {
        return this.update({
            id,
            expanded,
        });
    }

    async toggleSharing(id: string, value: boolean) {
        const projectIdsToShare: string[] = [
            { id },
            ...this.getChildren(id),
        ].map(({ id }: { id: string }) => id);

        const documentIdsToShare: string[] = this.context.$entities.page
            .list()
            .filter((doc: IDocument) => {
                return projectIdsToShare.includes(doc.projectId || '');
            })
            .map(({ id }: { id: string }) => id);

        const updatePromises = [
            ...projectIdsToShare.map(id =>
                this.update({
                    id,
                    sharingUuid: value ? v4() : null,
                }),
            ),
            ...documentIdsToShare.map(id =>
                this.context.$entities.page.update({
                    id,
                    sharingUuid: value ? v4() : null,
                }),
            ),
        ];

        await Promise.all(updatePromises);

        this.context.$tracking.trackEventV2(TrackingType.SHARING, {
            action: value
                ? TrackingAction.SHARE_FOLDER
                : TrackingAction.UNSHARE_FOLDER,
            entityId: id,
        });

        this.context.$tracking.trackEvent('folder', {
            action: value ? 'share' : 'unshare',
            entity_id: id,
        });
    }

    getIcon(id: string) {
        return this.byId(id)?.icon ?? null;
    }

    getName(id: string) {
        const folder = this.byId(id);
        if (!folder) return 'Untitled';
        if (folder.type === FolderType.FOLDER) {
            return folder.name || 'New Folder';
        }
        if (folder.type === FolderType.PROJECT) {
            return folder.name || 'New Project';
        }
        return 'Untitled';
    }

    _clearIcon(id: string, properties: any) {
        this.update({
            id,
            icon: '',
            properties,
        });
    }

    _changeIcon(id: string, icon: string, properties: any) {
        this.update({
            id,
            icon,
            properties,
        });
    }

    updateIcon(id: string, icon: string) {
        const folder = this.byId(id);
        if (!folder) return;
        const properties = folder?.properties ?? {};
        const trackingType =
            folder.type === FolderType.FOLDER
                ? TrackingType.FOLDER
                : TrackingType.PROJECT;
        const mergedProperties = defaultsDeep({ icon }, properties);
        if (icon) {
            this._changeIcon(id, icon, mergedProperties);
            this.context.$tracking.trackEventV2(trackingType, {
                action: TrackingAction.UPDATE_EMOJI,
            });
        } else {
            this._clearIcon(id, mergedProperties);
            this.context.$tracking.trackEventV2(trackingType, {
                action: TrackingAction.CLEAR_EMOJI,
            });
        }
    }

    getBreadcrumbs(id: string) {
        return this.context.store.getters['folder/breadcrumbsById'](id);
    }
}
