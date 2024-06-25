<template>
    <svg
        :width="size"
        :height="size"
        viewBox="0 0 16 16"
        fill="#fc7840"
        aria-label="Urgent Priority"
    >
        <path
            d="M3 1.346a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-10a2 2 0 0 0-2-2H3Zm3.914 3h1.738L8.5 9.948H7.07l-.156-5.602Zm1.809 7.164a.95.95 0 0 1-.938.938.934.934 0 1 1 0-1.867c.5 0 .934.417.938.929Z"
        ></path>
    </svg>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({})
export default class UrgentPriorityIcon extends Vue {
    @Prop({ required: false, default: '16' })
    size!: string;
}
</script>
<style scoped lang="scss">
.linear-icon {
    flex-shrink: 0;

    .icon {
        fill: black;
    }
}
</style>
