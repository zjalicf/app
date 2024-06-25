<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :content-style="{
            maxWidth: '480px',
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
        <div class="import-modal">
            <tippy
                :content="$utils.tooltip.getRefText"
                :delay="[300, 20]"
                :touch="false"
                boundary="window"
                placement="top"
                theme="tooltip"
                target=".has-tippy"
            />
            <div class="import-modal__title">Import</div>
            <div class="import-modal__text">
                Add files and data from other apps into your vault
            </div>
            <div
                class="import-modal--option"
                @click="importMarkdown(close, 'markdown')"
            >
                <div class="import-modal--option__icon">
                    <MarkdownIcon
                        size="30"
                        :style="{
                            color:
                                $store.getters['appSettings/theme'] === 'DARK'
                                    ? '#EAECEF'
                                    : '#000000',
                        }"
                    />
                </div>
                <div class="import-modal--option--content">
                    <div class="import-modal--option--content__title">
                        Markdown
                    </div>
                    <div class="import-modal--option--content__text">
                        Import plain text (.txt) or Markdown file (.md)
                    </div>
                </div>
            </div>
            <div
                class="import-modal--option"
                @click="importMarkdown(close, 'obsidian')"
            >
                <div class="import-modal--option__icon">
                    <ObsidianIcon size="30" />
                </div>
                <div class="import-modal--option--content">
                    <div class="import-modal--option--content__title">
                        Obsidian
                    </div>
                    <div class="import-modal--option--content__text">
                        Import Obsidian vault into acreom.
                    </div>
                </div>
                <InterfaceHelpQuestionCircle
                    class="icon has-tippy"
                    size="14"
                    :data-tippy-content="`<div class='tooltip'>3rd party plugins are currently not supported</div>`"
                />
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { MarkdownIcon, ObsidianIcon } from '~/components/icons';
import { SafeElectronWindow } from '~/@types';
import { DatabaseServiceAction, ServiceKey } from '~/constants';
import InterfaceHelpQuestionCircle from '~/components/streamline/InterfaceHelpQuestionCircle.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'ImportModal',
    components: {
        InterfaceHelpQuestionCircle,
        MarkdownIcon,
        ObsidianIcon,
    },
})
export default class ImportModal extends Vue {
    async importMarkdown(close: any, source: 'markdown' | 'obsidian') {
        try {
            this.$tracking.trackEventV2(TrackingType.IMPORT, {
                action: TrackingAction.OPEN_DIALOG,
                source:
                    source === 'markdown'
                        ? TrackingActionSource.MARKDOWN
                        : TrackingActionSource.OBSIDIAN,
            });
            const filepath = await this.openDialog({
                canCreate: true,
                openFile: true,
            });
            if (!filepath) {
                this.$tracking.trackEventV2(TrackingType.IMPORT, {
                    action: TrackingAction.CLOSE_DIALOG,
                    source:
                        source === 'markdown'
                            ? TrackingActionSource.MARKDOWN
                            : TrackingActionSource.OBSIDIAN,
                });

                return;
            }
            this.$serviceRegistry.emit(
                ServiceKey.DATABASE,
                DatabaseServiceAction.IMPORT_MARKDOWN,
                {
                    payload: {
                        vaultId: this.$store.getters['vault/activeVaultId'],
                        filepaths: Array.isArray(filepath)
                            ? filepath
                            : [filepath],
                    },
                },
            );
            this.$tracking.trackEventV2(TrackingType.IMPORT, {
                action: TrackingAction.COMPLETE,
                source:
                    source === 'markdown'
                        ? TrackingActionSource.MARKDOWN
                        : TrackingActionSource.OBSIDIAN,
            });
        } catch (e) {
            return;
        }

        close();
    }

    async openDialog(
        meta: { canCreate: boolean; openFile: boolean } = {
            canCreate: false,
            openFile: false,
        },
    ): Promise<string | null> {
        return await (window as SafeElectronWindow).electron.selectDirectory(
            meta,
        );
    }
}
</script>

<style scoped lang="scss">
.import-modal {
    @include modal(20px);
    padding: 32px;
    user-select: none;

    &__title {
        text-align: center;
        font-weight: 600;
        font-size: 24px;
        line-height: 155.2%;
        color: var(--modal-title-text-color);
        margin-bottom: 10px;
    }

    &__text {
        @include font14-500;
        text-align: center;
        color: var(--modal-body-text-color);
        margin-bottom: 20px;
    }

    &--title {
        text-align: center;
        font-weight: 600;
        font-size: 24px;
        line-height: 155.2%;
        color: var(--modal-title-text-color);
        margin-bottom: 32px;
    }

    &--option {
        background: var(--new-vault-button-bg-color);
        padding: 24px 26px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        width: 100%;

        .icon {
            flex-shrink: 0;
            align-items: flex-end;
        }

        &:hover {
            background: var(--new-vault-button-bg-color__hover);
        }

        &:not(:last-of-type) {
            margin-bottom: 8px;
        }

        &__icon {
            padding: 4px;
            border-radius: 6px;
            background: var(--new-vault-button-bg-color__hover);
            margin-right: 8px;
        }

        &--content {
            width: 100%;

            &__title {
                @include font14-600;
                color: var(--modal-title-text-color);
            }

            &__text {
                width: 100%;
                @include font12-500;
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: var(--modal-body-text-color);
            }
        }
    }
}
</style>
