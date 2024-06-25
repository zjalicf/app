<template>
    <div class="x-ray-structure">
        <div v-if="!isMobile">
            <div
                v-for="heading in headings"
                :key="heading.id"
                class="heading not-mobile"
                :class="[`level-${heading.level}`]"
                @click="onClick(heading)"
            >
                <div>{{ heading.textContent }}</div>
            </div>
        </div>
        <div v-else>
            <div
                v-for="heading in headings"
                :key="heading.id"
                class="heading"
                :class="[`level-${heading.level}`]"
            >
                <div>{{ heading.textContent }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { TrackingAction, TrackingType } from '~/@types/tracking';
import { TrackEvent } from '@/helpers/decorators';

@Component({
    name: 'XRayStructure',
})
export default class XRayStructure extends Vue {
    @Prop({
        default: () => [],
    })
    headings!: { id: string; level: number; textContent: string }[];

    @Prop({ default: false })
    isMobile!: boolean;

    @TrackEvent(TrackingType.INFO_PANEL, {
        action: TrackingAction.CLICK_OUTLINE_ITEM,
    })
    onClick(heading: { id: string; level: number; textContent: string }) {
        this.$nuxt.$emit('heading:click', heading);
        this.$emit('heading:click', heading);
    }
}
</script>

<style lang="scss" scoped>
.x-ray-structure {
    padding-left: 6px;

    .heading {
        &.not-mobile {
            @include animateBackgroundColor;
        }

        font-weight: 500;
        font-size: 15px;
        line-height: 190.2%;
        color: var(--x-ray-structure-text-color);
        cursor: default;

        div {
            @include ellipsis;
        }

        &:hover {
            color: var(--x-ray-structure-text-color__hover);
        }

        &.level-title {
            font-size: 16px;
            font-weight: bold;
        }

        &.level-1 {
        }

        &.level-2 {
            border-left: 1px solid var(--x-ray-structure-heading-color);
            padding-left: 15px;
        }

        &.level-3,
        &.level-4,
        &.level-5,
        &.level-6 {
            border-left: 1px solid var(--x-ray-structure-heading-color);
            padding-left: 15px;

            > div {
                border-left: 1px solid var(--x-ray-structure-heading-color);
                padding-left: 15px;
            }
        }
    }
}
</style>
