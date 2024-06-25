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
            maxWidth: '474px',
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
        <div class="upgrade-modal">
            <div class="upgrade-modal__content">
                <div class="upgrade-modal__content__left">
                    <h1 class="upgrade-modal__content__left__title">
                        Become
                        <p class="pro-badge">PRO</p>
                    </h1>
                    <p>for ${{ billedAmount }} / month</p>
                    <p v-if="selectedBillingOption" class="fine-print">
                        billed at $81 / year
                    </p>
                </div>
                <div class="upgrade-modal__content__right">
                    <div
                        v-for="option in options"
                        :key="option.id"
                        class="upgrade-modal__content__right__option"
                    >
                        <component
                            :is="option.icon"
                            class="icon"
                            size="20"
                        ></component>
                        <p>{{ option.text }}</p>
                    </div>
                    <a
                        href="https://acreom.com/pricing/"
                        target="_blank"
                        class="fine-print"
                        >see all PRO features</a
                    >
                </div>
            </div>
            <div class="upgrade-modal__footer">
                <label class="upgrade-modal__footer__billing">
                    <div class="upgrade-modal__footer__billing__toggle">
                        <CSwitch
                            id="billing"
                            :value="selectedBillingOption"
                            @input="updateBillingOption"
                        />
                    </div>
                    <div class="upgrade-modal__footer__billing__title">
                        Billed yearly
                    </div>
                </label>
                <div class="upgrade-modal__footer__actions">
                    <CButton
                        type="primary"
                        tabindex="-1"
                        @click="modalAccept(close)"
                    >
                        Get PRO
                    </CButton>
                    <CButton type="secondary" @click="modalCancel(close)">
                        Cancel
                    </CButton>
                </div>
            </div>
        </div>
    </vue-final-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { CalendarIcon, GlobeIcon, SparklesIcon } from '@vue-hero-icons/solid';
import { RobotIcon } from '~/components/icons';
import CSwitch from '@/components/CSwitch.vue';
import { isElectron } from '~/helpers/is-electron';
import CButton from '~/components/CButton.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';

@Component({
    name: 'UpgradeModal',
    components: {
        CButton,
        CalendarIcon,
        GlobeIcon,
        CSwitch,
        SparklesIcon,
        GithubIcon,
        RobotIcon,
        JiraIcon,
    },
})
export default class UpgradeModal extends Vue {
    options: any[] = [
        {
            id: 5,
            icon: 'GithubIcon',
            text: 'Github Integration',
        },
        {
            id: 4,
            icon: 'JiraIcon',
            text: 'Jira Integration',
        },
        {
            id: 0,
            icon: 'CalendarIcon',
            text: 'Google Calendar Integration',
        },
        {
            id: 1,
            icon: 'GlobeIcon',
            text: 'Publish Documents',
        },
        {
            id: 2,
            icon: 'RobotIcon',
            text: 'Acreom Assistant',
        },
    ];

    get selectedBillingOption() {
        return this.$store.getters['misc/billingOption'] === 'yearly';
    }

    updateBillingOption(value: boolean) {
        this.$store.dispatch(
            'misc/billingOptionChanged',
            value === true ? 'yearly' : 'monthly',
        );
    }

    get billedAmount() {
        return this.selectedBillingOption ? '6.75' : '8.50';
    }

    get billingPeriod() {
        return this.selectedBillingOption ? 'Year' : 'Month';
    }

    get user() {
        return this.$store.getters['auth/user'];
    }

    get loggedIn() {
        return this.$store.getters['auth/loggedIn'];
    }

    get appIsElectron() {
        return isElectron();
    }

    modalAccept(close: Function) {
        close();
        if (!this.loggedIn) {
            this.$vfm.show({
                component: () => import('./LogInModal.vue'),
                bind: {
                    pricingLogin: true,
                },
            });

            return;
        }
        this.$utils.navigation.openExternalLink(
            this.$accessControl.subscribeLink,
        );
    }

    modalCancel(close: any) {
        close();
    }
}
</script>

<style scoped lang="scss">
.pro-badge {
    @include proBadge;
}

.fine-print {
    margin-top: 2px;
    font-size: 11px;
    color: var(--upgrade-modal-fine-print-text-color);
}

.upgrade-modal {
    @include modal;
    user-select: none;

    &__content {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 20px 12px 11px 18px;
        gap: 100px;
        color: var(--modal-title-text-color);

        &__left {
            font-weight: 500;
            font-size: 14px;

            &__title {
                margin-left: -1px;
                margin-right: 1px;
                display: flex;
                align-items: center;
                gap: 4px;
                font-weight: 700;
                font-size: 24px;
            }
        }

        &__right {
            &__option {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;

                .icon {
                    flex-shrink: 0;
                    color: var(--upgrade-modal-icon-color);
                }

                p {
                    font-size: 12px;
                }
            }
        }
    }

    &__footer {
        border-top: 1px solid var(--tab-divider-color);
        padding: 16px 0px 16px;
        margin: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__billing {
            display: flex;
            align-items: center;
            gap: 9px;

            &__title {
                font-size: 11px;
            }
        }

        &__actions {
            display: flex;
            align-items: center;
            flex-direction: row-reverse;
            gap: 13px;
        }
    }
}
</style>
