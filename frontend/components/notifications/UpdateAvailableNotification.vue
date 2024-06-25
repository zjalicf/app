<template>
    <div class="misc-notification">
        <div class="misc-notification__header">
            <div class="misc-notification__header__title">{{ text }}</div>
            <div class="misc-notification__header__close">
                <button @click="closeNotification">
                    <InterfaceDelete1 class="icon" size="8" />
                </button>
            </div>
        </div>
        <div v-if="downloading" class="misc-notification__footer__progress">
            <div class="misc-notification__footer__progress__wrapper">
                <div
                    class="misc-notification__footer__progress__wrapper__inner"
                    :style="{
                        width: `${progress}%`,
                    }"
                ></div>
            </div>
        </div>
        <div v-else-if="available" class="misc-notification__footer">
            <button v-if="available" @click="callCallback">
                Restart & Update
            </button>
        </div>
        <div v-else class="misc-notification__footer">
            <button @click="downloadFromWeb">Download from web</button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceTimeClockCircleAlternate from '~/components/streamline/InterfaceTimeClockCircleAlternate.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import NotificationMixin from '~/components/notifications/NotificationMixin.vue';
import { NotificationActions } from '~/constants';
import { SafeElectronWindow } from '~/@types';

@Component({
    name: 'MiscNotification',
    computed: {
        NotificationActions() {
            return NotificationActions;
        },
    },
    components: {
        InterfaceDeleteBin1,
        InterfaceTimeClockCircleAlternate,
        DocumentIcon,
        InterfaceDeleteCircle,
        InterfaceDelete1,
        InterfaceValidationCheckCircle,
        InterfaceValidationCheck,
    },
})
export default class MiscNotification extends NotificationMixin {
    get progress() {
        return this.$store.getters['autoUpdater/updateProgress'];
    }

    get downloading() {
        return this.$store.getters['autoUpdater/updateDownloading'];
    }

    get available() {
        return this.$store.getters['autoUpdater/updateAvailable'];
    }

    get text() {
        if (this.downloading) {
            return 'Downloading update';
        }

        if (this.available) {
            return 'Update ready to install';
        }

        return 'Update available';
    }

    downloadFromWeb() {
        this.$utils.navigation.openExternalLink('https://acreom.com/downloads');
    }

    callCallback() {
        this.$entities.autoUpdater.updateAndRestart();
        this.$emit('close');
    }

    closeNotification() {
        this.$emit('close');
    }

    mounted() {
        clearTimeout(this.timeout);
    }
}
</script>
<style lang="scss" scoped>
.misc-notification {
    @include frostedGlassBackground;
    padding: 10px 10px 10px 14px;
    margin-bottom: 10px;
    width: 250px;
    border-radius: 12px;
    cursor: default;
    user-select: none;
    position: relative;

    &__header {
        display: grid;
        grid-template-columns: 1fr 16px;
        align-items: center;

        &__icon {
            padding-top: 4px;

            .danger {
                color: var(--danger-color);
            }
        }

        &__title {
            @include font12-500;
            width: 100%;
            padding-left: 4px;
            color: var(--notification-header-color);
        }

        &__close {
            button {
                position: absolute;
                top: 4px;
                right: 4px;
                padding: 8px;
                color: var(--notification-button-text-color);

                &:hover {
                    color: var(--notification-button-text-color__hover);
                }
            }
        }
    }

    &__footer {
        &__progress {
            padding: 7px 14px 7px 4px;

            &__wrapper {
                width: 100%;
                height: 7px;
                border-radius: 30px;
                background: var(--sidebar-onboarding-progress-bg-color);

                &__inner {
                    transition: width 0.2s ease-in-out;
                    height: 7px;
                    border-radius: 30px;
                    background: var(
                        --sidebar-onboarding-progress-bg-color__complete
                    );
                }
            }
        }

        button {
            @include font12-500;
            color: var(--accent-color);
            padding: 2px 4px;
            border-radius: 6px;
            text-align: start;
            display: flex;
            align-items: center;

            &:hover {
                @include frostedGlassButtonAlternate;
            }

            span {
                margin-left: 4px;
                display: flex;
                align-items: center;

                .doc-icon {
                    margin-right: 4px;
                }
            }
        }
    }
}
</style>
