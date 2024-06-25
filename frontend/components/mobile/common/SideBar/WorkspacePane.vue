<template>
    <div class="workspace-pane">
        <div class="workspace-pane__title">Vaults</div>
        <div class="workspace-pane__vaults">
            <button
                v-for="vault in vaults"
                :key="vault.id"
                class="workspace-pane__vaults__vault"
                @click="selectVault(vault.id)"
            >
                <div
                    class="workspace-pane__vaults__vault__letter"
                    :style="{
                        backgroundColor: `${$store.getters['vault/color'](
                            vault.id,
                        )}`,
                    }"
                >
                    {{ vault.name[0] }}
                </div>
                <div class="workspace-pane__vaults__vault__text">
                    <div class="workspace-pane__vaults__vault__text__title">
                        {{ vault.name }}
                    </div>
                </div>
                <div
                    v-if="$store.getters['vault/active'].id === vault.id"
                    class="workspace-pane__vaults__vault__check"
                >
                    <InterfaceValidationCheck size="16" class="icon" />
                </div>
            </button>
        </div>
        <div class="workspace-pane__vaults">
            <button class="workspace-pane__vaults__extra" @click="newVault">
                <div class="workspace-pane__vaults__extra__text">Add Vault</div>

                <div class="workspace-pane__vaults__extra__icon">
                    <InterfaceAddSquare size="16" class="icon" />
                </div>
            </button>
            <button class="workspace-pane__vaults__extra" @click="openSettings">
                <div class="workspace-pane__vaults__extra__text">Settings</div>
                <div class="workspace-pane__vaults__extra__icon">
                    <InterfaceSettingCog size="16" class="icon" />
                </div>
            </button>
            <button class="workspace-pane__vaults__extra" @click="logOut">
                <div class="workspace-pane__vaults__extra__text">Log Out</div>
                <div class="workspace-pane__vaults__extra__icon">
                    <InterfaceLogoutSquareAlternate size="16" class="icon" />
                </div>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { XIcon } from '@vue-hero-icons/solid';
import { IVault } from '~/@types';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceAddSquare from '~/components/streamline/InterfaceAddSquare.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import InterfaceLogoutSquareAlternate from '~/components/streamline/InterfaceLogoutSquareAlternate.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'WorkspacePane',
    components: {
        InterfaceLogoutSquareAlternate,
        InterfaceValidationCheck,
        InterfaceAddSquare,
        InterfaceSettingCog,
        XIcon,
    },
})
export default class WorkspacePane extends Vue {
    @Prop({ default: [] })
    vaults!: IVault[];

    selectVault(id: string) {
        this.$emit('selectVault', id);
    }

    newVault() {
        this.$emit('newVault');
    }

    openSettings() {
        this.$tracking.trackEventV2(TrackingType.SETTINGS, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.MOBILE,
        });
        this.$emit('openSettings');
    }

    logOut() {
        this.$emit('logOut');
    }
}
</script>
<style lang="scss" scoped>
.workspace-pane {
    padding: 0 16px 30px;

    &__title {
        margin-top: 7px;
        text-align: center;
        font-weight: 600;
        font-size: 16px;
        line-height: 19px;
        letter-spacing: -0.24px;
        color: $white;
        margin-bottom: 20px;
    }

    &__vaults {
        border-radius: 12px;
        margin-bottom: 16px;

        &__vault {
            @include paneButtons;
            outline: none;
            display: grid;
            grid-template-columns: 30px minmax(0, 1fr) 16px;
            gap: 16px;
            align-items: center;
            text-align: left;
            width: 100%;
            padding: 16px;

            &:first-of-type {
                border-top-right-radius: 12px;
                border-top-left-radius: 12px;
            }

            &:last-of-type {
                border-bottom-right-radius: 12px;
                border-bottom-left-radius: 12px;
            }

            &__letter {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border-radius: 4px;
                font-weight: 500;
                font-size: 16px;
                line-height: 19px;
                letter-spacing: -0.24px;
                color: $white;
            }

            &__text {
                display: flex;
                flex-direction: column;
                justify-content: center;

                &__title {
                    @include ellipsis;
                    font-weight: 500;
                    font-size: 16px;
                    line-height: 19px;
                    color: $white;

                    &.new-vault {
                        padding-bottom: 0;
                    }
                }
            }

            &__check {
                color: white;
            }
        }

        &__extra {
            @include paneButtons;
            outline: none;
            display: grid;
            align-items: center;
            text-align: left;
            width: 100%;
            grid-template-columns: minmax(0, 1fr) 16px;
            padding: 16px;

            &:first-of-type {
                border-top-right-radius: 12px;
                border-top-left-radius: 12px;
            }

            &:last-of-type {
                border-bottom-right-radius: 12px;
                border-bottom-left-radius: 12px;
            }

            .icon {
                color: $blueGrey300;
            }

            &__text {
                font-weight: 400;
                font-size: 16px;
                line-height: 19px;
                letter-spacing: -0.24px;
                color: white;
            }
        }
    }
}
</style>
