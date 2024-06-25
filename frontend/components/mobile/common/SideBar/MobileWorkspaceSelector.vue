<template>
    <div class="mobile-workspace-selector">
        <button
            class="mobile-workspace-selector__pane__vault selected"
            @click="presentPane"
        >
            <div
                class="mobile-workspace-selector__pane__vault__letter"
                :style="{
                    backgroundColor: $store.getters['vault/color'](vault.id),
                }"
            >
                {{ vaultName[0] }}
            </div>
            <div class="mobile-workspace-selector__pane__vault__text">
                <div
                    class="mobile-workspace-selector__pane__vault__text__title"
                >
                    {{ vaultName }}
                </div>
                <AcreomChevronDown size="12" class="icon" />
            </div>
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ChevronDownIcon } from '@vue-hero-icons/outline';
import WorkspacePane from '~/components/mobile/common/SideBar/WorkspacePane.vue';
import { AcreomChevronDown } from '~/components/icons';
import InterfaceEditWrite2 from '@/components/streamline/InterfaceEditWrite2.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { TrackEvent } from '~/helpers/decorators';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'MobileWorkspaceSelector',
    components: {
        InterfaceAdd1,
        AcreomChevronDown,
        ChevronDownIcon,
        InterfaceEditWrite2,
    },
})
export default class MobileWorkspaceSelector extends Vue {
    $refs!: {
        workspaceSelectorPane: HTMLDivElement;
    };

    pane: any = null;
    backButtonEventListener: any = null;

    get vaults() {
        return this.$store.getters['vault/list'];
    }

    presentPane() {
        this.$pane.show({
            component: WorkspacePane,
            bind: {
                vaults: this.vaults,
            },
            type: 'picker',
            options: {
                fitHeight: false,
            },
            on: {
                selectVault: (id: string) => {
                    this.selectVault(id);
                },
                newVault: () => {
                    this.newVault();
                },
                openSettings: () => {
                    this.openSettings();
                },
                logOut: () => {
                    this.logOut();
                },
            },
        });
    }

    selectVault(id: string) {
        this.$pane.hide();
        this.$store.dispatch('vault/activate', id);
    }

    newVault() {
        this.$pane.hide();
        this.$vfm.show({
            component: () => import('@/components/modal/NewSyncVaultModal.vue'),
        });
    }

    openSettings() {
        this.$pane.hide();
        setTimeout(() => {
            this.$router.push({
                path: '/mobile/preferences',
                query: { level: '1' },
            });
        }, 200);
    }

    get vault() {
        const id = this.$store.getters['vault/active']?.id ?? '';
        return this.$store.getters['vault/byId'](id);
    }

    get vaultName() {
        return this.vault?.name ?? '';
    }

    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOG_OUT,
    })
    async logOut() {
        await this.$pane.hideAll();
        await this.$store.dispatch('auth/logout');
    }
}
</script>
<style lang="scss" scoped>
.mobile-workspace-selector {
    :deep(.move) {
        background: $white;
        opacity: 0.2;
    }
}

.mobile-workspace-selector {
    display: grid;
    grid-template-columns: 1fr 52px;
    padding: 0px 2px 0px 18px;
    border-bottom: 1px solid $blueGrey950;

    &__new {
        display: flex;
        align-items: center;
        justify-content: center;
        outline: none;
        color: $blueGrey300;

        &:active {
            color: $white;
        }
    }

    &__pane {
        padding: 0 18px 30px;

        &__title {
            margin-top: 7px;
            text-align: center;
            font-weight: 500;
            font-size: 16px;
            line-height: 19px;
            color: $white;
            margin-bottom: 20px;
        }

        &__vault {
            @include animateBackgroundColor;
            outline: none;
            display: grid;
            grid-template-columns: 30px minmax(0, 1fr);
            gap: 10px;
            border-radius: 6px;
            align-items: center;
            text-align: left;
            width: 100%;
            color: $blueGrey200;
            margin-bottom: 20px;
            user-select: none;

            &.selected {
                margin-bottom: 0;
                padding: 11px 0 0;

                &.icon {
                    color: $blueGrey500;
                }
            }

            &__wrapper {
                margin-bottom: 10px;
                width: 100%;

                &__list {
                    @include scrollbar;
                    overflow-y: auto;
                    max-height: 250px;
                }
            }

            &__letter {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                color: $white;

                &.new-vault {
                    background-color: $blueGrey700;
                }
            }

            &__text {
                display: flex;
                align-items: center;
                gap: 10px;
                @include ellipsis;

                svg {
                    color: $blueGrey500;
                    flex-shrink: 0;
                }

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
        }

        &__option {
            @include animateBackgroundColor;
            outline: none;
            display: grid;
            border-radius: 6px;
            align-items: center;
            text-align: left;
            width: 100%;
            color: $blueGrey200;
            grid-template-columns: 30px minmax(0, 1fr);
            gap: 10px;

            .icon {
                width: 30px;
                height: 30px;
                padding: 5px;
            }

            &__text {
                font-style: normal;
                font-weight: 500;
                font-size: 16px;
                color: $white;
            }
        }
    }
}
</style>
