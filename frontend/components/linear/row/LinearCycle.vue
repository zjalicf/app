<template>
    <div class="linear-issue__cycle" :class="{ disabled }">
        <EntertainmentControlButtonPlayCircleAlternate :size="'14'" />
        <div class="linear-issue__cycle--name">{{ cycleName }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceDashboardLayoutSquare from '~/components/streamline/InterfaceDashboardLayoutSquare.vue';
import EntertainmentControlButtonPlayCircleAlternate from '~/components/streamline/EntertainmentControlButtonPlayCircleAlternate.vue';

@Component({
    name: 'LinearProject',
    components: {
        EntertainmentControlButtonPlayCircleAlternate,
        InterfaceDashboardLayoutSquare,
    },
})
export default class LinearProject extends Vue {
    @Prop({ required: true, default: null })
    cycle: any;

    @Prop({ default: false })
    disabled!: boolean;

    get cycleName() {
        return this.cycle.name ?? this.cycle.number;
    }
}
</script>
<style lang="scss" scoped>
.linear-issue__cycle {
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
