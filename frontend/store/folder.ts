import { Context } from '@nuxt/types';
import isArray from 'lodash/isArray';
import { IFolder, SidebarItem } from '~/@types';
import { IDocument } from '~/components/document/model';
import { DatabaseServiceAction, FolderType, ServiceKey } from '~/constants';
import { IView } from '~/components/view/model';

interface AppState {
    projects: IFolder[];
    isLoaded: boolean;
}

export const state = (): AppState => ({
    projects: [],
    isLoaded: false,
});

export const getters = {
    isLoaded: (state: AppState) => {
        return state.isLoaded;
    },
    byId: (state: AppState) => (_id: string) => {
        return (
            state.projects.find(({ id }: { id: string }) => id === _id) || null
        );
    },
    byParentId: (state: AppState) => (_parentId: string | null) => {
        return state.projects.filter(({ parentId }) => parentId === _parentId);
    },
    byType: (state: AppState) => (_type: string) => {
        return state.projects.filter(({ type }) => type === _type);
    },
    folders: (state: AppState) => {
        return state.projects.filter(({ type }) => type === FolderType.FOLDER);
    },
    folderChildren:
        (state: AppState) =>
        (id: string): IFolder[] => {
            const projects = getters.folders(state);

            function findChildren(
                arr: IFolder[],
                id: string | null,
            ): IFolder[] {
                const children: IFolder[] = [];

                for (const obj of arr) {
                    if (obj.parentId === id) {
                        children.push(obj);
                        const grandChildren = findChildren(arr, obj.id);
                        children.push(...grandChildren);
                    }
                }

                return children;
            }

            return findChildren(projects, id);
        },
    folderChildrenIds:
        (state: AppState) =>
        (id: string): string[] => {
            const projects = getters.folders(state);

            function findChildren(arr: IFolder[], id: string | null): string[] {
                const children: string[] = [];

                for (const obj of arr) {
                    if (obj.parentId === id) {
                        children.push(obj.id);
                        const grandChildren = findChildren(arr, obj.id);
                        children.push(...grandChildren);
                    }
                }

                return children;
            }

            return findChildren(projects, id);
        },
    folderParents:
        (state: AppState) =>
        (id: string): IFolder[] => {
            const projectMap = getters.folders(state).reduce((acc, project) => {
                acc[project.id] = project;
                return acc;
            }, {} as Record<string, IFolder>);

            const project = getters.byId(state)(id);
            const output = [];
            let parent = project;
            while (parent) {
                output.unshift(parent);
                if (parent.parentId) {
                    parent = projectMap[parent.parentId];
                } else {
                    parent = null;
                }
            }
            return output;
        },
    list: (state: AppState) => {
        return [...state.projects];
    },
    tree: (state: AppState, _: any, __: any, rootGetters: any) => {
        const projectMap = getters.list(state).reduce(
            (acc, project) => {
                if (!project.parentId) {
                    acc.root.push(project);
                    return acc;
                }
                if (!acc[project.parentId]) {
                    acc[project.parentId] = [];
                }
                acc[project.parentId].push(project);
                return acc;
            },
            { root: [] } as Record<string, IFolder[]>,
        );
        const documentMap = rootGetters['document/list']
            .filter(
                (doc: any) => !doc.dailyDoc && !doc.archived && !doc.template,
            )
            .map((doc: IDocument) => ({
                ...doc,
                content: null,
                updatedAt: null,
            }))
            .reduce(
                (acc: any, document: IDocument) => {
                    if (!document.projectId) {
                        acc.root.push(document);
                        return acc;
                    }
                    if (!acc[document.projectId]) {
                        acc[document.projectId] = [];
                    }
                    acc[document.projectId].push(document);
                    return acc;
                },
                { root: [] } as Record<string, IDocument[]>,
            );

        const createDocNode = (document: IDocument): any => {
            // @ts-ignore
            return {
                title: document.title,
                isDraggable: true,
                isSelectable: true,
                data: document,
            };
        };
        const createProjectArray = (project: IFolder): any => {
            return {
                title: project.name,
                isDraggable: true,
                isSelectable: true,
                data: project,
                children: (projectMap[project.id] || [])
                    .map(_project => {
                        return createProjectArray(_project);
                    })
                    .concat(
                        (documentMap[project.id] || []).map(
                            (_document: any) => {
                                return createDocNode(_document);
                            },
                        ),
                    )
                    .sort((a, b) => a.data!.order - b.data!.order),
            };
        };

        return projectMap.root
            .map(project => {
                return createProjectArray(project);
            })
            .concat(
                documentMap.root.map((_document: any) => {
                    return createDocNode(_document);
                }),
            )
            .sort((a, b) => a.data!.order - b.data!.order);
    },
    flatTree: (_state: AppState, getters: any) => {
        const getSubTree = (node: any) => {
            if (node.children) {
                return node.children.reduce(
                    (acc: any, child: any) => {
                        return acc.concat(getSubTree(child));
                    },
                    [node],
                );
            }
            return [node];
        };
        return getters.tree.reduce((acc: any, node: any) => {
            return acc.concat(getSubTree(node));
        }, []);
    },
    projectPages: (state: AppState, _: any, __: any, rootGetters: any) => {
        return (projectId: string) => {
            const childFolderIds = getters.folderChildrenIds(state)(projectId);
            return [projectId, ...childFolderIds].reduce(
                (acc: IDocument[], id: string) => {
                    const documents = rootGetters['document/byFolderId'](
                        id,
                    ) as IDocument[];
                    return [...acc, ...documents];
                },
                [] as IDocument[],
            );
        };
    },
    breadcrumbsById:
        (_: AppState, getters: any, _rootState: any, rootGetters: any) =>
        (id: string) => {
            const folder = getters.byId(id);
            if (!folder) return null;
            let parentId = folder.parentId;
            if (!parentId) return null;
            const path = [];
            while (parentId) {
                const parentFolder = getters.byId(parentId);
                path.push(parentFolder.name ?? 'New Folder');
                parentId = parentFolder.parentId;
            }
            return path.reverse().join('/');
        },
};

export const mutations = {
    clear: (state: AppState) => {
        state.projects = [];
    },
    initialize: (state: AppState, projects: IFolder[]) => {
        state.projects = projects;
    },
    update: (state: AppState, project: IFolder) => {
        const _id = project.id;
        const exists = state.projects.some(({ id }) => id === _id);
        if (!exists) {
            state.projects = [...state.projects, project];
            return;
        }

        state.projects = state.projects.map(proj => {
            if (_id === proj.id) {
                return {
                    ...proj,
                    ...project,
                    updatedAt: new Date(),
                };
            }

            return proj;
        });
    },
    updateBatch: (state: AppState, projects: IFolder[]) => {
        const newProjects = [...state.projects];
        const projectIndices = newProjects.map(({ id }) => id);
        for (const project of projects) {
            const exists = newProjects.some(({ id }) => id === project.id);
            if (!exists) {
                newProjects.push(project);
            }
            newProjects[projectIndices.indexOf(project.id)] = {
                ...newProjects[projectIndices.indexOf(project.id)],
                ...project,
                updatedAt: new Date(),
            };
        }
        state.projects = newProjects;
    },
    delete: (state: AppState, _id: string) => {
        state.projects = state.projects.filter(({ id }) => {
            return id !== _id;
        });
    },
    isLoaded: (state: AppState, isLoaded: boolean) => {
        state.isLoaded = isLoaded;
    },
};

export const actions = {
    refresh(this: Context, { commit, dispatch }: any) {
        commit('clear');
        return dispatch('initialize');
    },
    clear(this: Context, { commit }: any) {
        commit('clear');
    },
    async initialize(this: Context, { commit, rootGetters }: any) {
        if (!this.$workers.database) return;
        if (!rootGetters['vault/active']) return;
        commit('isLoaded', false);
        const data = await this.$workers.database.Projects.list(
            rootGetters['vault/active'].id,
        );
        commit('initialize', data);
        commit('isLoaded', true);
    },
    socketUpdate(this: Context, { commit }: any, payload: any) {
        const { action, project } = JSON.parse(payload) as {
            action: string;
            project: IFolder;
        };
        if (action === 'delete') {
            commit('delete', project.id);
            return;
        }
        commit('update', project);
    },
    async update(
        this: Context,
        { commit, rootGetters }: any,
        project: IFolder,
    ) {
        if (!this.$workers.database) return;
        const id = project.id;
        commit('update', { ...project });

        if (project.status === 'new') {
            project.parentId = project.parentId ?? null;
            if (project.parentId) {
                commit('update', {
                    id: project.parentId,
                    expanded: true,
                });
            }

            const items = rootGetters['sidebar/layerByParentId'](
                project.parentId,
            ).filter(
                ({ status }: SidebarItem) =>
                    status !== 'new' && status !== 'creating',
            );

            if (items.length) {
                project.order = items[items.length - 1].order + 500;
            } else {
                project.order = 0;
            }

            commit('update', { id, status: 'creating' });
            try {
                await this.$workers.database.Projects.save(
                    rootGetters['vault/active'].id,
                    { ...project },
                );
            } catch (e) {
                console.log(e);
            }

            commit('update', { id, status: 'created', order: project.order });
            this.$tracking.trackEvent('folder', {
                action: 'create',
            });
            return;
        }

        if (project.status === 'creating') {
            return;
        }
        await this.$workers.database.Projects.save(
            rootGetters['vault/active'].id,
            { ...project },
        );
    },
    updateBatch(this: Context, { commit, rootGetters }: any, data: IView[]) {
        if (!this.$workers.database) return;

        const activeVault = rootGetters['vault/active'];
        if (!activeVault) return;

        commit('updateBatch', data);
        const vaultId = activeVault.id;
        this.$workers.database?.Projects.saveBulk(vaultId, data);
    },
    indexedDBUpdate(
        this: Context,
        { commit }: any,
        projects: IFolder | IFolder[],
    ) {
        projects = isArray(projects) ? projects : [projects];
        // first update content
        for (const project of projects) {
            commit('update', project);
        }
    },
    async archive(
        this: Context,
        { commit, getters, rootGetters }: any,
        id: string,
    ) {
        if (!this.$workers.database) return;
        const project = getters.byId(id);
        if (this.app.router?.currentRoute.params.id === project.id) {
            if (this.$utils.isMobile) {
                // @ts-ignore
                await this.$router.push('/mobile/sidebar');
            }
        }

        commit('delete', id);
        this.$serviceRegistry.invoke(
            ServiceKey.DATABASE,
            DatabaseServiceAction.ARCHIVE,
            {
                table: 'projects',
                payload: {
                    vaultId: rootGetters['vault/active'].id,
                    entity: project,
                    meta: {
                        writeToDevice: true,
                    },
                },
            },
        );

        this.$tracking.trackEvent('folder', {
            action: 'delete',
            entity_id: id,
        });
    },
    async delete(
        this: Context,
        { commit, getters, rootGetters }: any,
        id: string,
    ) {
        if (!this.$workers.database) return;
        const project = getters.byId(id);
        if (this.app.router?.currentRoute.params.id === project.id) {
            if (this.$utils.isMobile) {
                // @ts-ignore
                await this.$router.push('/mobile/sidebar');
            }
        }

        commit('delete', id);
        this.$workers.database.Projects.delete(rootGetters['vault/active'].id, {
            id,
        });

        this.$tracking.trackEvent('folder', {
            action: 'delete',
            entity_id: id,
        });
    },
    async indexedDBDelete(
        this: Context,
        { commit }: any,
        ids: string | string[],
    ) {
        ids = isArray(ids) ? ids : [ids];
        // first update content
        for (const id of ids) {
            await this.$tabs.closeTabsByEntityId(id);
            commit('delete', id);
        }
    },
};
