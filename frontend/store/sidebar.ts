import { IDocument } from '~/components/document/model';
import { IFolder } from '~/@types';
import { SidebarTypes } from '~/constants';

type AppState = {
    draggedItem: any | null;
    draggedPinItem: any | null;
    draggedMenuItem: any | null;
    activeDocumentId: string | null;
};
export const state: () => AppState = () => ({
    draggedItem: null,
    draggedPinItem: null,
    draggedMenuItem: null,
    activeDocumentId: null,
});

export const getters = {
    lastByParentId:
        (_state: AppState, _getters: any) => (parentId: string | null) => {
            const values = _getters.layerByParentId(parentId);
            if (values.length === 0) return null;
            return values[values.length - 1];
        },
    layerByParentId:
        (_state: AppState, _getters: any, _rootState: any, rootGetters: any) =>
        (parentId: string | null) => {
            const filters =
                rootGetters['vaultSettings/sidebarOptions']?.hideTypes ?? [];
            const documents = rootGetters['document/byFolderId'](parentId)
                .filter((doc: IDocument) => {
                    if (
                        filters.includes(SidebarTypes.STATUS) &&
                        doc.pageStatus
                    ) {
                        return false;
                    }
                    if (filters.includes(SidebarTypes.DATE) && doc.start) {
                        return false;
                    }
                    if (filters.includes(SidebarTypes.CLIP) && doc.clip) {
                        return false;
                    }
                    return true;
                })
                .reduce((acc: any[], doc: IDocument) => {
                    if (doc.template || doc.dailyDoc || doc.archived)
                        return acc;
                    acc.push({
                        id: doc.id,
                        parentId: doc.projectId,
                        name: doc.title,
                        type: 'document',
                        status: doc.status,
                        icon: doc.icon,
                        order: doc.order,
                        clip: doc.clip && {
                            id: doc.clip,
                            type: doc.clip.split('/', 1)[0],
                        },
                    });
                    return acc;
                }, []);
            const projects = rootGetters['folder/byParentId'](parentId).reduce(
                (acc: any[], folder: IFolder) => {
                    if (folder.type !== 'folder') return acc;
                    acc.push({
                        id: folder.id,
                        parentId: folder.parentId,
                        name: folder.name,
                        type: 'folder',
                        status: folder.status,
                        icon: folder.icon,
                        order: folder.order,
                        expanded: folder.expanded ?? false,
                    });
                    return acc;
                },
                [],
            );

            return [...documents, ...projects]
                .map((e, index) => {
                    if (e.order) return e;
                    return {
                        ...e,
                        order: index * 500,
                    };
                })
                .sort((a, b) => a.order - b.order);
        },
    draggedItem: (state: AppState) => {
        return state.draggedItem;
    },
    draggedPinItem: (state: AppState) => {
        return state.draggedPinItem;
    },
    draggedMenuItem: (state: AppState) => {
        return state.draggedMenuItem;
    },
};

export const mutations = {
    draggedItem: (state: AppState, item: any) => {
        state.draggedItem = item;
    },
    draggedPinItem: (state: AppState, item: any) => {
        state.draggedPinItem = item;
    },
    draggedMenuItem: (state: AppState, item: any) => {
        state.draggedMenuItem = item;
    },
    clearDraggedItems: (state: AppState) => {
        state.draggedItem = null;
        state.draggedPinItem = null;
        state.draggedMenuItem = null;
    },
};

export const actions = {};
