<template>
    <div v-if="localState" class="linear-state-icon">
        <InterfaceEditSelectAreaCircleDash
            v-if="localState.type === 'backlog'"
            :color="stateColor"
        />
        <LinearProgressIcon
            v-if="
                localState.type === 'unstarted' || localState.type === 'started'
            "
            :color="stateColor"
            :progress="stateProgress * 100"
        />
        <InterfaceValidationCheckCircle
            v-if="localState.type === 'completed'"
            :color="stateColor"
        />
        <InterfaceDeleteCircle
            v-if="localState.type === 'canceled'"
            :color="stateColor"
        />
        <LinearTriageIcon
            v-if="localState.type === 'triage'"
            :color="stateColor"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import LinearProgressIcon from '~/components/linear/icons/LinearProgressIcon.vue';
import InterfaceDeleteCircle from '~/components/streamline/InterfaceDeleteCircle.vue';
import InterfaceValidationCheckCircle from '~/components/streamline/InterfaceValidationCheckCircle.vue';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import LinearTriageIcon from '~/components/linear/icons/LinearTriageIcon.vue';

@Component({
    name: 'LinearStateIcon',
    components: {
        LinearTriageIcon,
        InterfaceEditSelectAreaCircleDash,
        InterfaceValidationCheckCircle,
        InterfaceDeleteCircle,
        LinearProgressIcon,
    },
})
export default class LinearStateIcon extends Vue {
    @Prop({ required: false })
    state!: any;

    @Prop({ required: false, default: 14 })
    size: any;

    @Prop({ required: false, default: null })
    entityId!: string | null;

    get entity() {
        if (!this.entityId) return null;

        return this.$entities.linear.getIssueById(this.entityId);
    }

    get localState() {
        if (this.entity) {
            return this.entity.state;
        }

        return this.state;
    }

    get stateColor() {
        return this.localState?.color;
    }

    get stateProgress() {
        return this.localState?.progress;
    }
}
</script>
<style lang="scss" scoped>
.linear-state-icon {
    flex-shrink: 0;
}
</style>
