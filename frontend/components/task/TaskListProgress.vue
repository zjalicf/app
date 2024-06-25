<template>
    <div class="task-list-progress">
        <div
            class="task-list-progress--inner-circle"
            :style="{
                background: `conic-gradient(var(--sync-status-icon-color) ${animatedPercentage}%, 0, var(--app-bg-color))`,
            }"
        ></div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component({
    name: 'TaskListProgress',
})
export default class TaskListProgress extends Vue {
    gsap: any = null;
    tweenedNumber: { value: number } = {
        value: 0,
    };

    @Prop({
        required: true,
    })
    completed!: number;

    @Prop({
        required: true,
    })
    total!: number;

    get percentage() {
        return Math.round((this.completed / this.total) * 100);
    }

    get animatedPercentage() {
        return this.tweenedNumber.value;
    }

    async mounted() {
        const { default: gsap } = await import('gsap');
        this.gsap = gsap;
        this.tweenedNumber.value = this.percentage;
    }

    @Watch('percentage')
    handlePercentageChange(newValue: number) {
        if (!this.gsap) return;
        this.gsap.to(this.tweenedNumber, { duration: 0.5, value: newValue });
    }
}
</script>

<style lang="scss" scoped>
.task-list-progress {
    padding: 1px;
    border-radius: 50%;
    border: 1px solid var(--sync-status-icon-color);
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;

    &--inner-circle {
        @include animateBackgroundColor;

        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: conic-gradient(
            var(--sync-status-icon-color) 0%,
            0,
            var(--app-bg-color)
        );
    }
}
</style>
