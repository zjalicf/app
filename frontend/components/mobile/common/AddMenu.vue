<template>
    <div class="add-menu">
        <div v-if="showAddMenu" class="backdrop" @click="closeAddMenu"></div>
        <button
            id="add-button"
            ref="addButton"
            v-longpress.hapticstart.hapticend="
                allowLongPress ? openAddMenu : null
            "
            class="add-menu--omni-button"
            :class="{ active: showAddMenu }"
            @click="openAddMenu"
        >
            <InterfaceAdd1 class="plus-icon" size="16" />
        </button>
        <div
            v-show="showAddMenu"
            id="add-menu"
            ref="addMenu"
            class="add-menu--menu"
        >
            <button class="add-menu--option" @click="newPage">
                <InterfaceFileAddAlt class="icon" size="14" />
                New Page
            </button>
            <div class="add-menu--divider"></div>
            <button class="add-menu--option" @click="newFolder">
                <InterfaceFolderAdd class="icon" size="14" />
                New Folder
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { animate, timeline } from 'motion';
import {
    AcreomIcon,
    FolderOpenIcon,
    StarIcon,
    SearchIcon,
} from '~/components/icons';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceFileAddAlt from '~/components/streamline/InterfaceFileAddAlt.vue';
import InterfaceFolderAdd from '~/components/streamline/InterfaceFolderAdd.vue';
import { GroupingOptions, PageStatus } from '~/constants';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'AddMenu',
    components: {
        InterfaceFolderAdd,
        InterfaceFileAddAlt,
        InterfaceValidationCheck,
        InterfaceAdd1,
        AcreomIcon,
        StarIcon,
        SearchIcon,
        FolderOpenIcon,
    },
})
export default class AddMenu extends Vue {
    showAddMenu: boolean = false;

    $refs!: {
        addButton: HTMLButtonElement;
        addMenu: HTMLDivElement;
    };

    showFolderMenuPages = ['mobile-folder-id', 'mobile-sidebar'];

    get activeTab() {
        return this.$route.name;
    }

    get allowLongPress() {
        return this.showFolderMenuPages.includes(this.$route.name!);
    }

    openAddMenu() {
        if (!this.allowLongPress) {
            return this.newPage();
        }
        const el = this.$refs.addMenu;
        const sequence = [
            [el, { scale: 0.3, opacity: 0 }, { duration: 0 }],
            [
                el,
                { scale: 1 },
                { duration: 0.1, easing: [0.43, 0.03, 0.52, 1.22], at: 0 },
            ],
            [el, { opacity: 1 }, { duration: 0.06, at: 0 }],
            [
                this.$refs.addButton,
                { opacity: 0 },
                { duration: 0.08, at: 0.05 },
            ],
        ] as any;
        this.showAddMenu = true;
        timeline(sequence);
    }

    async closeAddMenu() {
        animate(this.$refs.addButton, { opacity: 1 }, { duration: 0.08 });
        await animate(this.$refs.addMenu, { opacity: 0 }, { duration: 0.06 })
            .finished;
        this.showAddMenu = false;
    }

    get currentLevel() {
        return +this.$route.query.level!;
    }

    getViewQuery(query: any) {
        const modifiedQuery = { ...query, project: null, pageStatus: null };
        const view = this.$entities.view.getViewById(this.$route.params.id);
        if (!view) return modifiedQuery;

        if (view.viewOptions.groupBy === GroupingOptions.PAGE_STATUS) {
            modifiedQuery.pageStatus = PageStatus.TODO;
        }

        const definition = view.definition.length ? view.definition[0] : null;
        const projectFilter: any = definition?.definition.find((def: any) => {
            return def.property === 'projectId';
        });
        if (!definition?.definition?.length) return modifiedQuery;

        if (
            projectFilter?.value &&
            projectFilter.operation === 'overlap' &&
            projectFilter.value.length === 1
        ) {
            modifiedQuery.project = projectFilter.value[0];
        }

        return modifiedQuery;
    }

    async newPage() {
        await this.closeAddMenu();

        let query = {
            level: `${this.currentLevel + 1}`,
        } as any;

        if (this.$route.name === 'mobile-folder-id' && this.$route.params.id) {
            query = {
                ...query,
                project: this.$route.params.id,
            };
        }

        if (this.$route.name === 'mobile-project-id' && this.$route.params.id) {
            query = {
                ...query,
                project: this.$route.params.id,
            };
        }

        if (this.$route.name === 'mobile-view-id' && this.$route.params.id) {
            query = this.getViewQuery(query);
        }

        if (
            this.$route.name === 'mobile-documents-id' &&
            this.$route.params.id
        ) {
            const currentPage = this.$entities.page.byId(this.$route.params.id);
            query = {
                ...query,
                project: currentPage?.projectId ?? null,
            };
        }

        await this.$router.push({
            path: `/mobile/documents/new`,
            query,
        });
        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.MOBILE_ADD_MENU,
        });
    }

    async newFolder() {
        await this.closeAddMenu();
        let parentId = null;

        if (this.$route.name === 'mobile-folder-id') {
            parentId = this.$route.params.id || null;
        }

        const id = await this.$entities.folder.newFolder({
            name: '',
            parentId,
        });

        await this.$router.push({
            path: `/mobile/folder/${id}`,
            query: { level: `${this.currentLevel + 1}`, rename: 'true' },
        });
        this.$tracking.trackEventV2(TrackingType.FOLDER, {
            action: TrackingAction.CREATE,
            source: TrackingActionSource.MOBILE_ADD_MENU,
        });
    }
}
</script>
<style lang="scss" scoped>
.backdrop {
    overflow: hidden;
    position: fixed;
    width: 100vw;
    height: 100vh;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    z-index: 10;
}

.add-menu {
    margin-top: 2px;
    &--omni-button {
        @include animateBackgroundColor;
        background: var(--mobile-add-menu-button-bg-color);
        box-shadow: var(--mobile-sync-status-box-shadow);
        border-radius: 38px;
        padding: 10px 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        scale: 1;
        opacity: 1;
        transition: scale 0.1s cubic-bezier(0.65, 0, 0.35, 1);

        .plus-icon {
            color: var(--mobile-add-menu-button-icon-color);
            flex-shrink: 0;
        }

        &:active {
            scale: 1.1;
            background: var(--mobile-add-menu-button-bg-color__active);
        }
    }

    &--menu {
        @include frostedGlassBackground;
        width: calc(100% - 20px);
        padding: 10px;
        overflow: hidden;
        position: fixed;
        bottom: calc(var(--ion-safe-area-bottom) + 10px);
        left: 10px;
        z-index: 10;
        border-radius: 24px;
        transform-origin: 50% 50%;
    }

    &--divider {
        height: 1px;
        width: calc(100% - 34px);
        background: $blueGrey500-16;
        transform: translateX(17px);
    }

    &--option {
        @include animateOpacity;
        width: 100%;
        display: flex;
        align-items: center;
        color: var(--mobile-add-menu-option-text-color);
        padding: 14px 17px;
        border-radius: 16px;

        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        letter-spacing: -0.24px;

        .icon {
            color: var(--mobile-add-menu-option-icon-color);
            margin-right: 17px;
        }

        &.active,
        &:active {
            @include frostedGlassButton;
            background: var(--mobile-add-menu-option-bg-color__active);
        }
    }
}
</style>
