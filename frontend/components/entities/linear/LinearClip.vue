<template>
    <div class="linear-clip">
        <button class="linear-clip--wrapper" @click="openIssueModal">
            <LinearStateIcon :state="entity.state" />
            <div class="linear-clip--key">
                {{ entity.identifier }}
            </div>
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import AcreomChevronRight from '~/components/icons/AcreomChevronRight.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceAdd1 from '~/components/streamline/InterfaceAdd1.vue';
import { TabSymbols } from '~/constants/symbols';
import IssueType from '~/components/integrations/jira/issue/IssueType.vue';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'LinearClip',
    components: {
        LinearStateIcon,
        IssueType,
        InterfaceAdd1,
        DocumentIcon,
        AcreomChevronRight,
    },
})
export default class LinearClip extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    get document() {
        return this.$store.getters['document/byId'](this.entityId);
    }

    get entity() {
        const rawIssue = this.$entities.linear.getById(this.document?.clip);
        if (!rawIssue) return {};
        return this.$entities.linear.deserializeIssue(rawIssue);
    }

    openIssueModal() {
        this.$entities.linear.openModal(
            this.entity.id,
            TrackingActionSource.PAGE_CLIP,
        );
    }
}
</script>
<style lang="scss" scoped>
.linear-clip {
    &--wrapper {
        display: grid;
        grid-template-columns: 16px auto;
        padding: 5px 8px;
        border-radius: 6px;
        gap: 6px;
        background: var(--jira-clip-bg-color);
        align-items: center;

        &:hover,
        &.active {
            background: var(--a-select-button-highlight-bg);

            .jira-clip--key {
                color: var(--jira-clip-key-text-color__hover);
            }
        }
    }

    img {
        display: block;
    }

    &--key {
        @include font12-500;
        color: var(--jira-clip-key-text-color);
        white-space: nowrap;
    }
}
</style>
