<template>
    <vue-final-modal
        ref="modal"
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '370px',
            width: '100%',
        }"
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
        <div
            v-shortkey="['shift', 'enter']"
            class="delete-folder"
            @shortkey="modalAccept(close)"
        >
            <div class="delete-folder__header">
                <div class="delete-folder__header__title">
                    Delete {{ type }}
                </div>
            </div>
            <div class="delete-folder__body">
                <div class="delete-folder__body__title">
                    Are you sure you want to delete
                    <span>{{ name }}</span
                    >? All pages from this {{ type }}
                    {{ type === FolderType.FOLDER ? 'and sub-folders' : '' }}
                    will be deleted.
                </div>
            </div>
            <div class="delete-folder__footer">
                <div class="delete-folder__footer__info"></div>
                <div class="delete-folder__footer__actions">
                    <div>
                        <tippy
                            :content="`<div class='tooltip'>Delete <span class='tooltip-divider'>•</span><span class='tooltip-button'>Shift</span>+<span class='tooltip-button'>Enter</span></span></div>`"
                            placement="bottom-start"
                            :delay="[400, 20]"
                            theme="tooltip"
                            :touch="false"
                        >
                            <CButton
                                type="danger"
                                tabindex="0"
                                @click="modalAccept(close)"
                                >Delete
                            </CButton>
                        </tippy>
                    </div>
                    <CButton
                        type="secondary"
                        tabindex="0"
                        @click="modalCancel(close)"
                        >Cancel
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FolderIcon, TrashIcon } from '@vue-hero-icons/solid';
import CButton from '@/components/CButton.vue';
import { TrackingAction, TrackingType } from '~/@types/tracking';
import { FolderType, TabType, ViewType } from '~/constants';

@Component({
    name: 'ProjectDeleteModal',
    computed: {
        FolderType() {
            return FolderType;
        },
    },
    components: {
        CButton,
        TrashIcon,
        FolderIcon,
    },
})
export default class ProjectDeleteModal extends Vue {
    @Prop({ required: true })
    id!: string;

    @Prop({ required: true })
    type!: string;

    get name() {
        return this.$entities.folder.getName(this.id);
    }

    async modalAccept(close: any) {
        await this.$entities.folder.delete(this.id);
        await this.$tabs.closeTabsByEntityId(this.id);
        await close();
        const type =
            this.type === FolderType.FOLDER
                ? TrackingType.FOLDER
                : TrackingType.PROJECT;
        this.$tracking.trackEventV2(type, {
            action: TrackingAction.DELETE,
            entityId: this.id,
        });
        this.$notification.show({
            component: () =>
                import('@/components/notifications/MiscNotification.vue'),
            bind: {
                displayText: 'Pages deleted',
            },
        });
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style lang="scss" scoped>
.delete-folder {
    @include modal;
    cursor: default;
    padding: 16px;
    margin: 0 auto;
    user-select: none;
    &__header {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 4px;

        &__title {
            @include font14-600;
            color: var(--modal-title-text-color);
            text-transform: capitalize;
        }
    }

    &__body {
        &__title {
            @include font12-500;
            margin-bottom: 12px;
            color: var(--modal-body-text-color);

            span {
                font-weight: 600;
            }
        }
    }

    &__footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;

        &__actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            gap: 8px;
        }
    }
}
</style>
