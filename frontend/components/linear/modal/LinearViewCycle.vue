<template>
    <div class="linear-view-cycle">
        <EntertainmentControlButtonPlayCircleAlternate :cycle="cycle" />
        <div>{{ cycleName }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import LinearPriorityIcon from '~/components/linear/icons/LinearPriorityIcon.vue';
import EntertainmentControlButtonPlayCircleAlternate from '~/components/streamline/EntertainmentControlButtonPlayCircleAlternate.vue';

@Component({
    name: 'LinearViewCycle',
    components: {
        EntertainmentControlButtonPlayCircleAlternate,
        LinearPriorityIcon,
        LinearStateIcon,
    },
})
export default class LinearViewCycle extends Vue {
    @Prop({ required: true })
    cycle!: any;

    active: boolean = false;

    get cycleName() {
        return this.cycle.name ?? `Cycle ${this.cycle.number}`;
    }
}
</script>
<style lang="scss" scoped>
.linear-view-cycle {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: fit-content;
    padding: 2px 8px;
    border-radius: 6px;
}
</style>
