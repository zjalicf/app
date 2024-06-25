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
            maxWidth: '400px',
            width: '100%',
        }"
        :overlay-style="{
            backgroundColor:
                $store.getters['appSettings/theme'] === 'DARK' ||
                $router.currentRoute.name === 'auth-index-integrations'
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
                    Add Calendar from URL
                </div>
                <div class="calendar-from-url-modal__header__subtitle">
                    acreom supports .ICS format URLs. Learn more about how to
                    get .ICS URL from different calendar providers in
                    <a
                        href="https://acreom.com/sharing/88148b4c-5fec-48b8-b0db-4b4d62e05c82"
                        target="_blank"
                        rel="noreferrer"
                        >user guide</a
                    >.
                </div>
            </div>
            <div class="calendar-from-url-modal__body">
                <div class="calendar-from-url-modal__body__input">
                    <input
                        ref="input"
                        v-model="icsUrl"
                        type="text"
                        placeholder="https:// or webcal:// .ICS URL"
                    />
                </div>
            </div>
            <div class="calendar-from-url-modal__actions">
                <CButton type="secondary" tabindex="0" @click="close"
                    >Cancel
                </CButton>
                <CButton
                    type="primary"
                    tabindex="0"
                    :disabled="!isValidUrl"
                    @click="saveIcsIntegration(close)"
                >
                    Add
                </CButton>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IcsIntegration } from '~/workers/integrations/index';
import { IVault } from '~/workers/database/indexeddb/types';
import CButton from '~/components/CButton.vue';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingActionSourceMeta,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'CalendarFromURLModal',
    components: { CButton },
})
export default class CalendarFromURLModal extends Vue {
    icsUrl: string = '';

    $refs!: {
        input: HTMLInputElement;
    };

    @Prop()
    vault!: IVault;

    @Prop({
        default: false,
    })
    redirect!: boolean;

    get isValidUrl() {
        return IcsIntegration.isValidURI(this.icsUrl);
    }

    async saveIcsIntegration(close: () => void) {
        const config = this.$store.getters['onboarding/config'];
        const url = this.icsUrl;

        if (config.name === '') {
            await this.$entities.icsIntegration.createFromUrl(url);
            this.$tracking.trackEventV2(TrackingType.CALENDAR, {
                action: TrackingAction.ADD_CALENDAR,
                sourceMeta: TrackingActionSourceMeta.ICS_CALENDAR,
            });
        } else {
            this.$utils.onboarding.setNewVaultICSUrl(url);
            this.$tracking.trackEventV2(TrackingType.ONBOARDING, {
                action: TrackingAction.SAVE_INTEGRATION,
                source: TrackingActionSource.ICS_CALENDAR,
            });
        }

        close();
        if (this.redirect) {
            this.$router.push('/');
        }
    }

    mounted() {
        // TODO: single focus does not work. Some issue with $vfm having some focus logic of its own
        this.$nextTick(() => {
            this.$nextTick(() => {
                this.$refs.input?.focus({
                    preventScroll: true,
                });
            });
        });
    }
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
