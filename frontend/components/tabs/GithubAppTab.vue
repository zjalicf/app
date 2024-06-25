<template>
    <div class="github-tab" @mousedown="$emit('focus-tab')">
        <div v-if="$accessControl.hasProAccess" class="github-tab--content">
            <div class="github-tab--content--issues">
                <GithubView />
            </div>
        </div>
        <div v-else class="github-tab__access-denied">
            <h2>Github Integration is a PRO feature.</h2>
            <button class="github-tab__access-denied__button" @click="upgrade">
                <div class="github-tab__access-denied__button__icon">
                    <ShoppingBusinessStartup size="16" class="icon" />
                </div>
                <div class="github-tab__access-denied__button__text pro">
                    Upgrade to
                    <p class="pro-badge">PRO</p>
                </div>
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component } from 'vue-property-decorator';
import GithubView from '~/components/github/GithubView.vue';
import TabMixin from '~/components/tabs/TabMixin.vue';
import ShoppingBusinessStartup from '~/components/streamline/ShoppingBusinessStartup.vue';

@Component({
    name: 'GithubAppTab',
    components: { ShoppingBusinessStartup, GithubView },
})
export default class GithubAppTab extends TabMixin<any> {
    upgrade() {
        this.$accessControl.showProModal();
    }
}
</script>
<style lang="scss" scoped>
.github-tab {
    height: $desktopContentHeight;

    &--content {
        position: relative;
        height: 100%;

        &--issues {
            @include scrollbar;
            position: relative;
            z-index: 1;
            overflow-y: overlay;
            height: 100%;
            width: 100%;
        }
    }

    .pro-badge {
        @include proBadge;
    }

    .pro {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    &__access-denied {
        user-select: none;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 8px;

        h2 {
            @include font-title;
        }

        &__button {
            outline: none;
            display: flex;
            border-radius: 6px;
            align-items: center;
            text-align: left;
            padding: 8px 13px;
            color: var(--workspace-selector-dropdown-text-color);

            &__icon {
                margin-left: 2px;
                margin-right: 8px;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .icon {
                flex-shrink: 0;
            }

            &__text {
                font-style: normal;
                font-weight: 600;
                font-size: 13px;
                line-height: 1;
            }

            &:hover {
                @include frostedGlassButton;
                color: var(--workspace-selector-dropdown-text-color__hover);
            }
        }
    }
}
</style>
