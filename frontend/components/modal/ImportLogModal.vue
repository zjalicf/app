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
            maxWidth: '500px',
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
                    Import Log
                </div>
            </div>
            <div class="calendar-from-url-modal__body">
                <pre>
<div v-for="item in data" :key="item.id">[Skipping](Unsupported file format)
{{ item.filepath }}

</div>
                </pre>
            </div>
            <div class="calendar-from-url-modal__actions">
                <CButton type="primary" tabindex="0" @click="close">
                    Done
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
export default class ImportLogModal extends Vue {
    @Prop({ required: true })
    data!: ListDirent[];

    @Prop({ required: true })
    total!: number;

    @Prop({ required: true })
    unsupported!: number;
}
</script>

<style scoped lang="scss">
.calendar-from-url-modal {
    @include modal;

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

        pre {
            @include font12-500;
            @include scrollbar;
            @include inputMetaStyles;
            overflow: auto;
            background: var(--editor-code-bg-color);
            padding: 10px 0px;
            border-radius: 6px;
            max-height: 400px;

            div {
                @include inputMetaStyles;
                padding: 0 10px;
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
