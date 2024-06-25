<template>
    <div class="my-day-panel-entity">
        <div class="my-day-panel-entity__title">
            <slot name="title"></slot>
        </div>
        <div class="my-day-panel-entity__time">
            <slot name="time"></slot>
            <div class="my-day-panel-entity__upcoming">
                <slot name="upcoming"></slot>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'MyDayPanelEntity',
})
export default class MyDayPanelEntity extends Vue {}
</script>
<style lang="scss" scoped>
.my-day-panel-entity {
    height: 100%;
    cursor: default;
    user-select: none;

    &.overdue {
        opacity: 0.4;
    }

    .hover-icon {
        display: none;
        transform: scaleX(-1);
    }

    &__title {
        @include font14-500;
        display: grid;
        grid-template-columns: 14px 1fr 14px;
        gap: 4px;
        align-items: center;
        justify-items: start;
        overflow-x: hidden;

        &__text {
            @include ellipsis;
            width: 100%;
            text-align: left;
        }

        .icon {
            color: var(--my-day-panel-entity-icon-color);
        }
    }

    &__time {
        @include font12-500;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    &__upcoming {
        @include font10-700;
        color: var(--my-day-panel-entity-icon-color);
    }
}
</style>
