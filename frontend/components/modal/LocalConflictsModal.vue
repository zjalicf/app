<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="false"
        :click-to-close="false"
        overlay-transition="fade"
        :content-style="{}"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK'
                    ? '#000000'
                    : '#EAECEF',
            opacity: '0.8',
        }"
        transition="slide-fade"
        v-on="$listeners"
    >
        <div class="conflicts-modal">
            <div class="conflicts-modal--header">
                <div class="conflicts-modal--title">Before you continue</div>
                <div class="conflicts-modal--subtitle">
                    {{ conflictsLength }} files have been deleted from
                    <button
                        class="conflicts-modal--subtitle--button"
                        :title="vault.filepath"
                        @click="openVaultFolder"
                    >
                        {{ vault.filepath }}
                    </button>
                    . Do you wish to delete them from cloud or restore locally?
                </div>
            </div>
            <div v-if="expanded" class="divider divider__top"></div>
            <div class="conflicts-modal--body">
                <div
                    v-for="groupName of Object.keys(conflictGroups)
                        .sort()
                        .reverse()"
                    :key="groupName"
                >
                    <div v-if="groupName === 'folder'">
                        <div
                            v-for="conflict of conflictGroups[groupName]"
                            :key="conflict.id"
                            class="conflicts-modal--conflict"
                        >
                            <FolderIcon class="icon" size="18" />
                            <p
                                class="
                                    conflicts-modal--conflict--name
                                    conflicts-modal--conflict--name__folder
                                "
                            >
                                {{ getFolderName(conflict) }}
                            </p>
                        </div>
                    </div>
                    <div v-if="groupName === 'document'">
                        <div
                            v-for="conflict of conflictGroups[groupName]"
                            :key="conflict.id"
                            class="conflicts-modal--conflict"
                        >
                            <interfaceContentFileAlternate
                                class="icon"
                                size="14"
                            />
                            <p
                                class="
                                    conflicts-modal--conflict--name
                                    conflicts-modal--conflict--name__document
                                "
                            >
                                {{ $entities.page.displayTitle(conflict.id) }}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    v-if="conflictsLength > 3 && !expanded"
                    class="conflicts-modal--expand-button"
                    @click="expanded = true"
                >
                    Show all
                </button>
            </div>
            <div v-if="expanded" class="divider divider__bottom"></div>

            <div class="conflicts-modal--footer">
                <div class="conflicts-modal--footer--info"></div>
                <div class="conflicts-modal--footer--actions">
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="acceptRemote(close)"
                        >Restore
                    </CButton>
                    <CButton
                        type="danger"
                        tabindex="0"
                        @click="acceptLocal(close)"
                        >Delete Permanently
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
    CalendarIcon,
    CheckIcon,
    DocumentIcon,
    ExternalLinkIcon,
    FolderIcon,
} from '@vue-hero-icons/solid';

import CButton from '@/components/CButton.vue';
import { IFolder, IVault, SafeElectronWindow, WEntity } from '~/@types';
import DocumentLink from '~/components/document/DocumentLink.vue';
import { isElectron } from '~/helpers/is-electron';
import interfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';

@Component({
    name: 'LocalConflictsModal',
    components: {
        CButton,
        FolderIcon,
        DocumentLink,
        DocumentIcon,
        CalendarIcon,
        CheckIcon,
        ExternalLinkIcon,
        interfaceContentFileAlternate,
    },
})
export default class LocalConflictsModal extends Vue {
    @Prop()
    vault!: IVault;

    expanded: boolean = false;

    getFolderName(conflict: IFolder) {
        return conflict.name.trim() || 'New Folder';
    }

    get conflictsLength(): number {
        return this.$store.getters['localConflicts/localConflicts'].length;
    }

    get conflicts(): WEntity[] {
        if (this.expanded) {
            return this.$store.getters['localConflicts/localConflicts'];
        }
        return this.$store.getters['localConflicts/localConflicts'].slice(0, 3);
    }

    task(id: string) {
        return this.$store.getters['tasks/byId'](id);
    }

    event(id: string) {
        return this.$store.getters['event/byId'](id);
    }

    openVaultFolder() {
        if (!isElectron() || !this.vault.filepath) return;

        (window as SafeElectronWindow).electron.showItemInFolder(
            this.vault.filepath,
        );
    }

    get conflictGroups() {
        const output = this.conflicts.reduce((acc, conflict) => {
            if (!acc[conflict.kind!]) {
                acc[conflict.kind!] = [];
            }
            acc[conflict.kind!].push(conflict);
            return acc;
        }, {} as Record<string, any[]>);
        return output;
    }

    async acceptLocal(close: any) {
        await close();
        this.$emit('acceptLocal');
    }

    acceptRemote(close: any) {
        close();
        this.$emit('acceptRemote');
    }
}
</script>

<style lang="scss" scoped>
.divider {
    height: 1px;
    background: var(--tab-divider-color);

    &__top {
        margin: 8px 0 0px;
    }

    &__bottom {
        margin-bottom: 12px;
    }
}

.conflicts-modal {
    @include modal;
    width: 450px;
    padding: 0;
    margin: 0 auto;
    cursor: default;
    user-select: none;

    &--header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 20px 18px 0;
    }

    &--title {
        @include font14-600;
        color: var(--modal-title-text-color);
        margin-bottom: 4px;
    }

    &--subtitle {
        @include font12-500;
        color: var(--modal-body-text-color);
        margin-bottom: 8px;

        &--button {
            color: var(--local-conflicts-button-color);

            &:hover {
                color: var(--modal-body-text-color);
            }
        }
    }

    &--expand-button {
        @include font12-600;
        color: var(--local-conflicts-button-color);
        margin-bottom: 12px;

        &:hover {
            color: var(--local-conflicts-button-color__hover);
        }
    }

    &--conflict {
        display: flex;
        align-items: center;
        margin-bottom: 4px;

        &--name {
            @include ellipsis;
            @include font14-600;
            color: var(--modal-title-text-color);

            &__folder {
                margin-left: 4px;
            }

            &__document {
                margin-left: 8px;
            }
        }

        .icon {
            flex-shrink: 0;
            color: var(--local-conflicts-icon-color);
        }
    }

    &--body {
        @include scrollbar;
        max-height: 300px;
        overflow: auto;
        padding: 15px 18px 0px;
    }

    &--footer {
        padding: 4px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &--actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;

            .c-button:not(:last-of-type) {
                margin-left: 8px;
            }
        }
    }
}
</style>
