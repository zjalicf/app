<template>
    <div
        class="progress-circle"
        :style="{
            '--linear-state-color': color,
            '--linear-state-progress': `${progress}%`,
        }"
    >
        <div class="progress-circle--fill"></div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class LinearProgressIcon extends Vue {
    @Prop({ required: false, default: '#00000' })
    color!: string;

    @Prop({ required: false, default: 0 })
    progress!: number;
}
</script>
<style scoped lang="scss">
.progress-circle {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid;
    border-color: var(--linear-state-color);

    &--fill {
        margin: 1px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: radial-gradient(transparent, transparent),
            conic-gradient(
                var(--linear-state-color) var(--linear-state-progress),
                transparent 0
            );
    }
}
</style>
