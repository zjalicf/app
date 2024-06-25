<template>
    <div class="github-suggestion" :class="{ active }">
        <LinearStateIcon class="icon" :state="entity.state" />
        <p>
            <span>{{ entity.identifier }} {{ entity.title }}</span>
        </p>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';

@Component({
    name: 'LinearSuggestion',
    components: { LinearStateIcon },
})
export default class LinearSuggestion extends Vue {
    @Prop({ required: true })
    entity!: any;

    @Prop({ default: false })
    active!: boolean;
}
</script>
<style lang="scss" scoped>
.github-suggestion {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    //color: var(--editor-extension-jira-suggestion-text-color);

    &.active {
        padding: 4px 8px;
        border: 2px solid var(--accent-color);
        background: var(--editor-extension-jira-suggestion-bg-color__active);
        color: var(--editor-extension-jira-suggestion-text-color__active);
        margin: 0;

        p,
        span {
            color: var(--editor-extension-jira-suggestion-text-color__active);
        }
    }

    .icon {
        flex-shrink: 0;
    }

    p {
        @include ellipsis;
        @include font12-500;
        color: var(--editor-extension-jira-suggestion-title-text-color);

        span {
            color: var(--editor-extension-jira-suggestion-text-color);
        }
    }
}
</style>
