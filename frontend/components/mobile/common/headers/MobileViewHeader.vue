<template>
    <div class="mobile-view-header">
        <div class="mobile-view-header__back">
            <button @click="back">
                <ChevronLeftIcon class="icon" size="24" />
            </button>
        </div>
        <div class="mobile-view-header__title">
            <div
                class="mobile-view-header__title__icon"
                :style="{
                    '--view-color': $entities.view.getViewColor(view.id),
                }"
            >
                <ViewIcon :id="view.id" />
            </div>
            {{ $entities.view.getViewName(view.id) }}
        </div>
        <div class="mobile-documents-header__options"></div>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { ChevronLeftIcon } from '@vue-hero-icons/outline';
import { DotsHorizontalIcon } from '@vue-hero-icons/solid';
import ViewIcon from '~/components/view/ViewIcon.vue';

@Component({
    name: 'MobileViewHeader',
    components: {
        ViewIcon,
        ChevronLeftIcon,
        DotsHorizontalIcon,
    },
})
export default class MobileViewHeader extends Vue {
    @Prop({
        required: true,
    })
    view!: any;

    back() {
        this.$router.back();
    }
}
</script>
<style lang="scss" scoped>
.mobile-view-header {
    border-bottom: 1px solid var(--tab-divider-color);
    padding: 10px 16px 10px;
    display: grid;
    align-items: center;
    grid-template-columns: 32px 1fr 32px;

    &__back {
        button {
            @include animateBackgroundColor;
            color: var(--mobile-app-back-color);
            outline: none;
            display: block;
            padding: 4px;

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }

    &__title {
        @include ellipsis;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: var(--mobile-app-title-color);
        justify-content: center;

        &__icon {
            padding: 4px;
            background: var(--view-color);
            border-radius: 50%;
        }

        .icon {
            margin-right: 8px;
        }
    }

    &__options {
        button {
            @include animateBackgroundColor;
            outline: none;
            display: block;
            padding: 4px;
            color: var(--mobile-app-back-color);

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }
}
</style>
