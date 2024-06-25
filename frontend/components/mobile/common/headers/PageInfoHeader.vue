<template>
    <div class="mobile-documents-header">
        <div class="mobile-documents-header__back">
            <button @click="back">
                <ChevronLeftIcon class="icon" size="24" />
            </button>
        </div>
        <div class="mobile-documents-header__title">{{ title }}</div>
        <div></div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ChevronLeftIcon } from '@vue-hero-icons/outline';
import { TrackEvent } from '~/helpers/decorators';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'PageInfoHeader',
    components: {
        ChevronLeftIcon,
    },
})
export default class PageInfoHeader extends Vue {
    @Prop({ default: 'Untitled' })
    title!: string;

    @TrackEvent(TrackingType.INFO_PANEL, {
        action: TrackingAction.CLOSE,
        source: TrackingActionSource.MOBILE,
    })
    back() {
        this.$router.back();
    }
}
</script>
<style lang="scss" scoped>
.mobile-documents-header {
    padding: 10px 16px 11px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__back {
        button {
            outline: none;
            display: block;
            padding: 4px;
            @include animateBackgroundColor;
            color: var(--mobile-app-back-color);

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }

    &__title {
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: var(--mobile-app-title-color);
    }
}
</style>
