<template>
    <div class="project-editor">
        <div class="project-editor--edit" :class="{ header }">
            <div class="project-editor--edit--icon-picker">
                <button
                    ref="projectEditorEmojiPicker"
                    :class="{ emoji: !!icon, active: emojiDropdownOpen }"
                    @click="openEmojiDropdown"
                >
                    <span v-if="icon">
                        {{ icon }}
                    </span>
                    <InterfaceContentFileAlternate
                        v-else-if="isDocument"
                        class="icon"
                        size="14"
                    />
                    <InterfaceFolder
                        v-else-if="isFolder"
                        class="icon"
                        size="14"
                    />
                    <InterfaceDashboardLayoutSquare
                        v-else-if="isProject"
                        class="icon"
                        size="14"
                    />
                    <InterfaceSearchCircle
                        v-else-if="isSearch"
                        class="icon"
                        size="14"
                    />
                </button>
            </div>
            <div class="project-editor--edit--input">
                <CInput
                    ref="input"
                    size="medium"
                    :value="projectName"
                    :placeholder="isFolder ? 'New Folder' : 'Untitled'"
                    :font-size="15"
                    :background="true"
                    @input="handleNameChange"
                    @keydown.enter="handleEnter"
                    @keydown.esc="editMode = false"
                    @ready="isReady"
                />
            </div>
            <div class="project-editor--edit--confirm">
                <button @click="handleEnter">
                    <InterfaceValidationCheckCircle size="16" />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import EmojiPicker from 'vue-emoji-picker';
import CInput from '~/components/CInput.vue';
import { isDocument, isFolder, isProject, isSearch } from '~/helpers/util';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceFolder from '~/components/streamline/InterfaceFolder.vue';
import InterfaceSearchCircle from '~/components/streamline/InterfaceSearchCircle.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';
import InterfaceDashboardLayoutSquare from '~/components/streamline/InterfaceDashboardLayoutSquare.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';

@Component({
    name: 'ProjectEditor',
    components: {
        InterfaceValidationCheckCircle,
        InterfaceDashboardLayoutSquare,
        CInput,
        EmojiPicker,
        InterfaceContentFileAlternate,
        InterfaceFolder,
        InterfaceSearchCircle,
    },
})
export default class ProjectEditor extends Vue {
    @Prop({
        required: true,
    })
    project!: any;

    @Prop({ default: false })
    renaming!: boolean;

    @Prop({ default: false })
    header!: boolean;

    $refs!: {
        input: CInput;
        projectEditorEmojiPicker: any;
    };

    projectName: string = '';
    search: string = '';
    icon: string | null = '';
    editMode: boolean = false;
    emojiDropdownOpen: boolean = false;

    get name() {
        return this.isFolder
            ? this.project.name || 'New Folder'
            : this.isProject
            ? this.project.name || 'New Project'
            : this.project.title || 'Untitled';
    }

    get isDocument() {
        return isDocument(this.project);
    }

    get isFolder() {
        return isFolder(this.project);
    }

    get isProject() {
        return isProject(this.project);
    }

    get isSearch() {
        return isSearch(this.project);
    }

    @Watch('project')
    handleProjectChange() {
        this.projectName = this.project.name || this.project.title;
        this.icon = this.project.icon;
    }

    openEmojiDropdown() {
        this.emojiDropdownOpen = true;
        this.$dropdown.show({
            parent: this.$refs.projectEditorEmojiPicker,
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
                    this.insert(emoji.data);
                },
            },
            onClose: () => {
                this.emojiDropdownOpen = false;
                this.focus();
            },
        });
    }

    insert(emoji: string) {
        this.icon = emoji;
        if (this.isDocument) {
            this.$entities.page.updateIcon(this.project.id, emoji);
            return;
        }
        this.$entities.folder.updateIcon(this.project.id, emoji);
    }

    handleNameChange(name: string) {
        this.projectName = name;
    }

    handleEnter(event?: KeyboardEvent | MouseEvent) {
        if (
            event &&
            event instanceof KeyboardEvent &&
            event.isComposing &&
            !this.$utils.isMobile
        )
            return;
        this.$emit('close');
        this.editMode = false;
        if (this.isDocument) {
            this.$entities.page.update({
                id: this.project.id,
                title: this.projectName,
            });
            return;
        }
        const type = this.isFolder ? TrackingType.FOLDER : TrackingType.PROJECT;
        this.$tracking.trackEventV2(type, {
            action: TrackingAction.RENAME,
        });
        this.$entities.folder.update({
            id: this.project.id,
            name: this.projectName,
        });
    }

    focus() {
        if (this.isSearch) return;

        this.editMode = true;
        if (this.$refs.input) {
            setTimeout(() => {
                this.$refs.input?.setFocus();
            }, 80);
        }
    }

    isReady() {
        this.editMode = true;
        setTimeout(() => {
            this.$refs.input.setFocus();
        }, 80);
    }

    mounted() {
        this.projectName = this.project.name || this.project.title;
        this.icon = this.project.icon;

        if (this.renaming) {
            this.focus();
        }
    }
}
</script>

<style lang="scss" scoped>
.project-editor {
    display: flex;
    align-items: center;
    overflow: hidden;

    &--heading {
        display: flex;
        align-items: center;
        padding-left: 6px;
        cursor: default;
        user-select: none;
        overflow: hidden;

        .icon {
            margin-right: 6px;
            flex-shrink: 0;
        }
    }

    &--edit {
        border-radius: 8px;
        max-width: 305px;
        display: grid;
        gap: 4px;
        grid-template-columns: 28px 213px 28px;

        &.header {
            top: 45px;
            left: 0;
        }

        .icon {
            margin-right: 12px;
        }

        .custom-icon {
            width: 14px;
            height: 14px;
            font-size: 20px;
            border-radius: 4px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 6px;

            span {
                overflow: visible;
                font-size: 14px;
                font-family: 'Apple Color Emoji', 'Segoe UI Emoji',
                    NotoColorEmoji, 'Noto Color Emoji', 'Segoe UI Symbol',
                    'Android Emoji', EmojiSymbols, serif;
            }
        }

        &--confirm {
            display: flex;
            align-items: center;
            justify-content: center;

            button {
                outline: none;
                padding: 4px;

                border-radius: 6px;

                &:hover {
                    @include frostedGlassButton;
                }
            }
        }

        &--icon-picker {
            display: flex;
            align-items: center;
            justify-content: center;

            button {
                @include animateBackgroundColor;
                outline: none;
                padding: 7px;
                border-radius: 6px;

                &:hover,
                &.active {
                    @include frostedGlassButton;
                    color: var(--project-editor-button-icon-color__hover);
                }

                &.emoji {
                    width: 28px;
                    height: 28px;
                    font-size: 14px;
                    border-radius: 4px;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    span {
                        font-size: 14px;
                        line-height: 14px;
                        font-family: 'Apple Color Emoji', 'Segoe UI Emoji',
                            NotoColorEmoji, 'Noto Color Emoji',
                            'Segoe UI Symbol', 'Android Emoji', EmojiSymbols,
                            serif;
                    }
                }
            }

            .icon {
                margin-right: 0px;
            }
        }
    }

    input {
        width: 100%;
    }
}
</style>
