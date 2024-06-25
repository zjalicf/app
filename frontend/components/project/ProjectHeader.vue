<template>
    <div class="project-header">
        <button
            ref="emojiPickerAnchor"
            class="project-header__icon"
            :class="{ active: emojiDropdownOpen }"
            @click="openEmojiDropdown"
        >
            <ProjectIcon :id="entityId" />
        </button>
        <div
            v-if="!editing"
            class="project-header__title"
            @dblclick="editProject"
        >
            <h1>{{ name }}</h1>
        </div>
        <div v-else class="project-header__title">
            <input
                ref="name"
                :value="projectName"
                type="text"
                placeholder="New Project"
                @input="handleInput"
                @blur="handleEnterKey"
                @keydown.esc.prevent="onEditClose"
                @keydown.enter.prevent="handleEnterKey"
            />
        </div>
        <PageListOptionsWrapper
            v-if="!editing"
            :dropdown-config="dropdownConfig"
        />
    </div>
</template>
<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import { TabSymbols } from '~/constants/symbols';
import ProjectIcon from '~/components/project/ProjectIcon.vue';
import PageListOptionsWrapper from '~/components/page-list/list/header/PageListOptionsWrapper.vue';
import ProjectEditor from '~/components/context-menu/ProjectEditor.vue';
import { ProjectContextMenu } from '~/components/context-menu';

@Component({
    name: 'ProjectHeader',
    computed: {},
    components: { ProjectEditor, PageListOptionsWrapper, ProjectIcon },
})
export default class ProjectHeader extends Vue {
    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    @Inject(TabSymbols.UPDATE_TAB_DATA)
    updateTabData!: (data: Record<string, any>) => void;

    $refs!: {
        emojiPickerAnchor: HTMLButtonElement;
        name: HTMLInputElement;
    };

    editing: boolean = false;
    emojiDropdownOpen: boolean = false;
    projectName: string = '';

    dropdownConfig = {
        component: ProjectContextMenu,
        bind: {
            id: this.entityId,
        },
        on: {
            edit: () => {
                this.editProject();
                this.$dropdown.hideAll();
            },
        },
    };

    get tabData() {
        if (!this.tabId) return {};
        return this.$tabs.getTabData(this.tabId);
    }

    get name() {
        return this.$entities.folder.getName(this.entityId);
    }

    handleInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.projectName = value;
    }

    handleEnterKey(event?: KeyboardEvent) {
        if (event && event.isComposing) return;
        if (!this.projectName) {
            this.onEditClose();
            return;
        }
        this.$entities.folder.update({
            id: this.entityId,
            name: this.projectName,
        });
        this.onEditClose();
    }

    editProject() {
        this.editing = true;
        this.$nextTick(() => {
            if (this.$refs.name) {
                this.$refs.name.focus();
            }
        });
        this.projectName = this.name;
        this.updateTabData({
            editingProject: true,
        });
    }

    onEditClose() {
        this.projectName = '';
        this.editing = false;
        this.updateTabData({
            editingProject: false,
        });
    }

    openEmojiDropdown() {
        this.emojiDropdownOpen = true;
        this.$dropdown.show({
            parent: this.$refs.emojiPickerAnchor,
            component: () => import('~/components/dropdown/EmojiDropdown.vue'),
            animate: false,
            retainFocus: true,
            backdrop: true,
            popperOptions: {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [-6, 7],
                        },
                    },
                ],
            },
            bind: {},
            on: {
                change: (emoji: any) => {
                    this.$entities.folder.updateIcon(this.entityId, emoji.data);
                },
            },
            onClose: () => {
                this.emojiDropdownOpen = false;
            },
        });
    }

    beforeDestroy() {
        this.onEditClose();
    }

    mounted() {
        if (this.tabData.editingProject) {
            this.editProject();
        }
    }
}
</script>
<style lang="scss" scoped>
.project-header {
    display: flex;
    align-items: center;
    overflow: hidden;

    &__icon {
        outline: none;
        padding: 7px;
        border-radius: 6px;

        &:hover,
        &.active {
            @include frostedGlassButton;
            color: var(--project-editor-button-icon-color__hover);
        }
    }

    &__title {
        overflow: hidden;
        color: var(--tab-title-text-color);
        font-weight: bold;
        font-size: 26px;
        line-height: 40px;
        user-select: none;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-right: 6px;

        h1 {
            @include ellipsis;
            padding: 0 6px;
        }

        input {
            @include inputMetaStyles;
            padding: 0 6px;
            border-radius: 6px;

            &:focus,
            &.active {
                outline: none;
                color: var(--c-input-text-color__active);
                border: 2px solid var(--accent-color);
                padding: 0 4px;
                line-height: 36px;
            }

            &::placeholder {
                color: var(--c-input-placeholder-color);

                &.lighter {
                    color: var(--c-input-placeholder-color__lighter);
                }
            }
        }
    }
}
</style>
