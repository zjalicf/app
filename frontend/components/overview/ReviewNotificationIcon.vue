<template>
    <div class="review-notification">
        <div v-if="count > 0" class="review-notification__dot">
            {{ countDisplayString }}
        </div>
        <InterfaceTimeRewindDesktop class="icon" size="14" />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceTimeRewindDesktop from '~/components/icons/InterfaceTimeRewindDesktop.vue';

@Component({
    name: 'ReviewNotificationIcon',
    components: { InterfaceTimeRewindDesktop },
})
export default class ReviewNotificationIcon extends Vue {
    @Prop({ default: 0 })
    count!: number;

    get countDisplayString() {
        return this.count < 100 ? this.count : '99+';
    }
}
</script>
<style lang="scss" scoped>
.review-notification {
    position: relative;

    &__dot {
        @include font10-700;
        padding: 0 2px;
        min-width: 16px;
        border-radius: 50%;
        background: var(--task-review-notification-bg-color);
        color: var(--task-review-notification-color);

        position: absolute;
        top: -14px;
        right: -14px;
    }
}
</style>
