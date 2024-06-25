<template>
    <div class="mobile-search">
        <button class="mobile-search--button" @click="openSearch">
            <SearchIcon class="icon" size="16" />
            Search acreom
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { SearchIcon } from '@vue-hero-icons/solid';
import { SafeArea } from 'capacitor-plugin-safe-area';
import SearchPane from '~/components/mobile/common/Search/SearchPane.vue';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'MobileSearch',
    components: { SearchIcon },
})
export default class MobileSearch extends Vue {
    query: string = '';

    get results() {
        return '';
    }

    async openSearch() {
        const offsets = await SafeArea.getSafeAreaInsets();

        let offsetTop = offsets.insets.top;
        if (this.$config.os === 'android') {
            offsetTop = 0;
        }

        this.$pane.show({
            component: SearchPane,
            bind: {
                results: this.results,
            },
            type: 'picker',
            options: {
                initialBreak: 'top',
                topperOverflow: false,
                dragBy: ['.draggable'],
                handleKeyboard: true,
                breaks: {
                    top: {
                        enabled: true,
                        height: window.innerHeight - offsetTop - 50,
                    },
                    middle: { enabled: false, offset: 430 },
                    bottom: { enabled: false },
                },
            },
            on: {
                queryUpdate: (newQuery: string) => {
                    this.query = newQuery;
                },
            },
        });

        this.$tracking.trackEventV2(TrackingType.NAVIGATION, {
            action: TrackingAction.OPEN,
            source: TrackingActionSource.MOBILE,
        });
    }
}
</script>
<style lang="scss" scoped>
.mobile-search {
    padding: 18px;
    width: 100%;

    &--button {
        user-select: none;
        @include animateBackgroundColor;
        outline: none;
        width: 100%;
        background: var(--mobile-pane-option-bg-color);
        color: #ffffff;
        opacity: 0.5;
        border-radius: 9px;
        display: flex;
        align-items: center;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        letter-spacing: -0.24px;
        padding: 14px 13px;

        .icon {
            margin-right: 10px;
            flex-shrink: 0;
            color: $blueGrey400;
        }

        &:active {
            background: #464e65;
        }
    }
}
</style>
