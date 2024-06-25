<template>
    <div class="linear-issue__project" :class="{ disabled }">
        <InterfaceDashboardLayoutSquare :size="`${12}`" />
        <div class="linear-issue__project--name">{{ project.name }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceDashboardLayoutSquare from '~/components/streamline/InterfaceDashboardLayoutSquare.vue';

@Component({
    name: 'LinearProject',
    components: { InterfaceDashboardLayoutSquare },
})
export default class LinearProject extends Vue {
    @Prop({ required: true, default: null })
    project: any;

    @Prop({ default: false })
    disabled!: boolean;
}
</script>
<style lang="scss" scoped>
.linear-issue__project {
    @include font12-400;
    @include ellipsis;
    padding: 2px 8px;
    border-radius: 14px;
    border: 1px solid $blueGrey500-16;
    color: $blueGrey400;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    &--name {
        color: $blueGrey400;
    }
    &:not(.disabled):hover,
    &.active {
        background: $blueGrey500-16;
    }
}
</style>
