import { Context } from '@nuxt/types';
import { SidebarEntityType, TabType, ViewType } from '~/constants';
import ViewIcon from '~/components/view/ViewIcon.vue';
import ProjectIcon from '~/components/project/ProjectIcon.vue';

export class SidebarUtils {
    private context: Context;

    constructor(ctx: Context) {
        this.context = ctx;
    }

    get sidebarEntities() {
        const views = this.context.$entities.view.getDisplayedViews();
        const projects = this.context.$entities.project.getProjects();
        return [
            ...views.map(view => ({
                ...view,
                name: view.name || 'Untitled View',
                sidebarEntityType: SidebarEntityType.VIEW,
            })),
            ...projects.map((project: any) => ({
                ...project,
                name: project.name || 'Untitled Prject',
                sidebarEntityType: SidebarEntityType.PROJECT,
                order: project.properties?.order ?? 0,
            })),
        ].sort((a: any, b: any) => {
            if (a.order < b.order) return -1;
            if (a.order > b.order) return 1;
            return 0;
        });
    }

    getNewSidebarOrder() {
        const entities = this.sidebarEntities;
        if (entities.length === 0) {
            return 0;
        }
        return Math.max(...entities.map(({ order }) => order)) + 1;
    }

    indexOfEntity(_id: string) {
        return this.sidebarEntities.findIndex(({ id }) => id === _id) + 2;
    }

    getEntityName(entity: any) {
        return entity.sidebarEntityType === SidebarEntityType.VIEW
            ? this.context.$entities.view.getViewName(entity.id)
            : entity.name;
    }

    entityActive(id: string) {
        const activeTabEntityId =
            this.context.$utils.navigation.activeTabEntityId;
        return activeTabEntityId === id;
    }

    getEntityColor(entity: any) {
        if (entity.sidebarEntityType === SidebarEntityType.VIEW) {
            return this.context.$entities.view.getViewColor(entity.id);
        }
        if (entity.sidebarEntityType === SidebarEntityType.PROJECT) {
            return this.context.$entities.project.getProjectColor(entity.id);
        }
        return '#626F83';
    }

    getEntityIcon(entity: any) {
        if (entity.sidebarEntityType === SidebarEntityType.VIEW) {
            return ViewIcon;
        }
        return ProjectIcon;
    }

    showSmallIcon(entity: any) {
        return (
            entity.sidebarEntityType === SidebarEntityType.VIEW &&
            this.context.$entities.view.isCustomView(entity.id) &&
            this.context.$entities.view.getViewById(entity.id)?.emoji
        );
    }

    showData(entity: any) {
        if (entity.sidebarEntityType !== SidebarEntityType.VIEW) {
            return true;
        }
        const view = this.context.$entities.view.getViewById(entity.id);
        return (
            view?.type !== ViewType.ARCHIVE &&
            !this.context.$entities.view.editingView(entity.id)
        );
    }

    sidebarCount(entity: any) {
        if (entity.sidebarEntityType === SidebarEntityType.VIEW) {
            return this.context.$entities.view.getSidebarCount(entity.id);
        }
        return this.context.$entities.project.getSidebarCount(entity.id);
    }

    getEntityTabType(entity: any) {
        return entity.sidebarEntityType === SidebarEntityType.VIEW
            ? TabType.VIEW
            : TabType.PROJECT;
    }

    openEntityContextMenu(entity: any, event: MouseEvent, onClose: Function) {
        const tab = this.context.$tabs.createNewTabObject(
            entity.id,
            entity.sidebarEntityType === SidebarEntityType.VIEW
                ? TabType.VIEW
                : TabType.PROJECT,
        );
        const component =
            entity.sidebarEntityType === SidebarEntityType.VIEW
                ? () => import('@/components/context-menu/ViewContextMenu.vue')
                : () =>
                      import(
                          '@/components/context-menu/ProjectContextMenu.vue'
                      );
        this.context.$contextMenu.show(event, {
            component,
            bind: {
                tab,
                invokeFrom: 'sidebar',
                viewId: entity.id,
                id: entity.id,
            },
            onClose: () => {
                onClose();
            },
        });
    }

    getMobileEntityLink(entity: any) {
        return entity.sidebarEntityType === SidebarEntityType.VIEW
            ? `/mobile/view/${entity.id}`
            : `/mobile/project/${entity.id}`;
    }
}
