<template>
    <div
        class="jira-clip-pill has-tippy"
        :data-tippy-content="`<div class='tooltip'>Open ${entity.key} ${entity.text}</div>`"
        @click.stop="open"
    >
        <div class="jira-clip-pill__icon">
            <img :src="entity.properties?.issuetype?.iconUrl" />
        </div>
        <div class="jira-clip-pill__key">
            {{ entity.key }}
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'JiraClipPill',
})
export default class JiraClipPill extends Vue {
    @Prop({ required: true })
    clip!: string;

    get entity() {
        const ent = this.$entities.jira.getById(this.clip);
        return ent;
    }

    open() {
        this.$entities.jira.openModal(
            this.entity,
            TrackingActionSource.PAGE_ROW_CLIP,
        );
    }
}
</script>
<style lang="scss" scoped>
.jira-clip-pill {
    @include font12-500;
    border: 1px solid $blueGrey500-16;
    border-radius: 31px;
    color: $blueGrey400;
    padding: 2px 8px;
    text-align: center;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;

    &__icon {
        flex-shrink: 0;
    }

    &:hover {
        background: $blueGrey500-16;
    }
}
</style>
