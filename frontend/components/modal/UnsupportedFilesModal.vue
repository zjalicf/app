<template>
    <vue-final-modal
        v-slot="{ close }"
        v-bind="$attrs"
        classes="modal-container"
        content-class="modal-content"
        :esc-to-close="true"
        :click-to-close="true"
        overlay-transition="fade"
        :focus-retain="false"
        :content-style="{
            maxWidth: '300px',
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
        <div class="calendar-from-url-modal">
            <div class="calendar-from-url-modal__header">
                <div class="calendar-from-url-modal__header__title">
                    Import Completed
                </div>
            </div>
            <div class="calendar-from-url-modal__body">
                <p>
                    Successfully imported {{ total }} file{{
                        total > 1 ? 's' : null
                    }}. Skipped {{ unsupported }} file{{
                        unsupported > 1 ? 's' : null
                    }}
                    because of unsupported file format.<br /><a
                        href="https://acreom.com/docs/import"
                        target="_blank"
                        >Show supported formats</a
                    >
                </p>
            </div>
            <div class="calendar-from-url-modal__actions">
                <CButton
                    type="secondary"
                    tabindex="0"
                    @click="openImportLog(close)"
                >
                    Show Log
                </CButton>
                <CButton type="primary" tabindex="0" @click="close">
                    OK
                </CButton>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CButton from '~/components/CButton.vue';
import { ListDirent } from '~/@types';

@Component({
    name: 'AppleCalendarPermissionsModal',
    components: { CButton },
})
export default class UnsupportedFilesModal extends Vue {
    @Prop({ required: true })
    data!: ListDirent[];

    @Prop({ required: true })
    total!: number;

    @Prop({ required: true })
    unsupported!: number;

    openImportLog(close: any) {
        close();
        this.$vfm.show({
            component: () => import('~/components/modal/ImportLogModal.vue'),
            bind: {
                data: this.data,
            },
        });
    }
}
</script>

<style scoped lang="scss">
.calendar-from-url-modal {
    @include modal;
    user-select: none;

    &__header {
        padding: 16px 16px 4px;
        justify-content: space-between;

        &__title {
            @include font14-600;
            user-select: none;
            color: var(--modal-title-text-color);
        }

        &__subtitle {
            @include font12-500;
            user-select: none;
            color: var(--modal-body-text-color);
            margin-bottom: 12px;

            a {
                color: var(--accent-color);
                text-decoration: underline;
            }
        }
    }

    &__body {
        padding: 0 16px;
        &__input {
            input {
                @include inputMetaStyles;
                @include font12-500;
                padding: 5px 11px;
                background: var(--vault-settings-input-bg-color);
                width: 100%;
                color: var(--vault-settings-input-text-color);
                border-radius: 6px;
                outline: none;

                &::placeholder {
                    color: var(--vault-settings-input-placeholder-color);
                }
            }
        }

        p {
            @include font12-500;
            color: var(--modal-body-text-color);

            .path {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
                    Consolas, 'Liberation Mono', 'Courier New', monospace;
            }
        }

        a {
            @include font12-500;
            color: var(--accent-color);
            text-decoration: underline;
        }
    }

    &__actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 12px 16px 16px;
        gap: 8px;
    }
}
</style>
