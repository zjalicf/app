<template>
    <div class="project-selector">
        <div class="project-selector-menu">
            <input
                ref="input"
                v-model="query"
                type="text"
                class="project-selector-menu-search"
                placeholder="Move to"
                @keydown.esc.prevent="handleEscKey"
                @keydown.enter.prevent="handleEnterKey"
                @keydown.up.prevent="handleUpKey"
                @keydown.down.prevent="handleDownKey"
            />
        </div>
        <div class="project-selector-menu-project-list">
            <button
                v-for="(project, index) in searchResults"
                :key="project.id"
                :class="{ selected: index === selectedIndex }"
                class="project-selector-menu-project-list--item"
                @mouseenter="selectedIndex = index"
                @click="handleEnterKey"
            >
                <div v-if="project.icon" class="custom-icon icon">
                    <span>{{ project.icon }}</span>
                </div>
                <InterfaceFolderAdd
                    v-else-if="project.new"
                    size="14"
                    class="icon"
                />
                <ProjectIcon
                    v-else-if="project.type === 'project'"
                    :id="project.id"
                    class="icon"
                />
                <InterfaceFolder
                    v-else-if="project.type === 'folder'"
                    class="icon"
                    size="14"
                />
                <InterfaceContentFileAlternate v-else size="14" class="icon" />
                <p>{{ project.name ? project.name : 'New Folder' }}</p>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { v4 } from 'uuid';
import InterfaceFolderAdd from '~/components/streamline/InterfaceFolderAdd.vue';
import InterfaceFolder from '~/components/streamline/InterfaceFolder.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';
import ProjectIcon from '~/components/project/ProjectIcon.vue';
import { FolderType } from '~/constants';

@Component({
    name: 'ProjectSelector',
    components: {
        ProjectIcon,
        InterfaceContentFileAlternate,
        InterfaceFolder,
        InterfaceFolderAdd,
    },
})
export default class ProjectSelector extends Vue {
    @Prop()
    document: any;

    @Prop({ default: undefined })
    source!: TrackingActionSource | undefined;

    $refs!: {
        input: HTMLInputElement;
    };

    selectedIndex: number = 0;
    query: string = '';

    get searchResults() {
        const results = [
            ...this.projects,
            { id: null, name: 'All Pages' },
            ...this.folders,
        ]
            .filter(({ name }: { name: string }) =>
                name?.toLowerCase().startsWith(this.query.toLowerCase()),
            )
            .slice(0, 20);
        if (results.length === 0) {
            results.push({
                id: null,
                name: `${this.query}`,
                new: true,
            });
        }

        return results;
    }

    get project() {
        return this.$entities.project.byId(this.document.projectId);
    }

    get projects() {
        return this.$entities.project.getProjects();
    }

    get folders() {
        return this.$entities.folder.getFolders();
    }

    @Watch('searchResults')
    handleResultsChange(curr: any[], prev: any[]) {
        if (this.selectedIndex >= curr.length && curr.length > 0) {
            this.selectedIndex = curr.length - 1;
        }
    }

    upHandler() {
        this.selectedIndex =
            (this.selectedIndex + this.searchResults.length - 1) %
            this.searchResults.length;
    }

    downHandler() {
        this.selectedIndex =
            (this.selectedIndex + 1) % this.searchResults.length;
    }

    handleEscKey() {
        this.$emit('close');
        this.query = '';
    }

    async handleEnterKey(event?: KeyboardEvent | MouseEvent) {
        if (
            event &&
            event instanceof KeyboardEvent &&
            event.isComposing &&
            !this.$utils.isMobile
        )
            return;
        if (!this.searchResults.length) return;
        const target = this.searchResults[this.selectedIndex];
        if (!target.new) {
            await this.$entities.page.update({
                id: this.document.id,
                projectId: this.searchResults[this.selectedIndex].id,
                archived: false,
            });
        } else {
            const id = await this.$entities.folder.newFolder({
                name: this.query,
            });
            await this.$entities.page.update({
                id: this.document.id,
                projectId: id,
                archived: false,
            });
            this.$tracking.trackEventV2(TrackingType.FOLDER, {
                action: TrackingAction.CREATE,
                source: TrackingActionSource.MOVE_TO,
                entityId: id,
            });
        }

        const sourceMeta = target.id
            ? target.type === FolderType.FOLDER
                ? TrackingActionSourceMeta.FOLDER
                : TrackingActionSourceMeta.PROJECT
            : target.new
            ? TrackingActionSourceMeta.FOLDER
            : TrackingActionSourceMeta.ALL_PAGES;

        this.$tracking.trackEventV2(TrackingType.PAGE, {
            action: TrackingAction.MOVE_TO,
            source: this.source,
            entityId: this.document.id,
            sourceMeta,
        });

        this.$emit('close');
    }

    handleUpKey() {
        this.upHandler();
    }

    handleDownKey() {
        this.downHandler();
    }

    mounted() {
        this.$nextTick(() => {
            this.$refs.input?.focus({
                preventScroll: true,
            });
        });
    }
}
</script>

<style lang="scss" scoped>
.project-selector {
    &-menu {
        &-search {
            @include inputMetaStyles;
            display: block;
            padding: 3px 10px 5px;
            background: var(--project-selector-input-bg-color);
            color: var(--project-selector-input-text-color);
            font-size: 13px;
            font-weight: 500;
            border-radius: 6px;
            outline: none;
            width: 100%;
            margin-bottom: 6px;

            &::placeholder {
                color: var(--project-selector-placeholder-color);
            }
        }

        &-project-list {
            &--item {
                width: 100%;
                transition: none;
                padding: 5px 8px;
                display: flex;
                align-items: center;
                font-size: 13px;
                font-weight: 500;
                color: var(--project-selector-item-text-color);
                border-radius: 6px;
                outline: none;

                p {
                    @include ellipsis;
                }

                &.selected,
                &:hover {
                    background: var(--project-selector-item-bg-color__hover);
                    border: 2px solid var(--accent-color);
                    padding: 3px 6px;
                    color: var(--project-selector-item-text-color__hover);
                }

                .custom-icon {
                    width: 14px;
                    height: 14px;
                    font-size: 16px;
                    border-radius: 4px;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 8px;

                    span {
                        overflow: visible;
                        font-size: 16px;
                        line-height: 14px;
                        font-family: 'Apple Color Emoji', 'Segoe UI Emoji',
                            NotoColorEmoji, 'Noto Color Emoji',
                            'Segoe UI Symbol', 'Android Emoji', EmojiSymbols,
                            serif;
                    }
                }

                .icon {
                    margin-right: 8px;
                }
            }
        }
    }
}
</style>
