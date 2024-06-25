<template>
    <div class="jira-notification-banner">
        <div class="jira-notification-banner--wrapper">
            <div class="jira-notification-banner--notification"></div>
            {{ count }} new update{{ count > 1 ? 's' : '' }}
        </div>
        <button @click="$emit('dismiss')">ok</button>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'JiraNotificationBanner',
    components: {},
})
export default class JiraNotificationBanner extends Vue {
    @Prop({ default: 0 })
    count!: number;
}
</script>
<style lang="scss" scoped>
.jira-notification-banner {
    background: var(--jira-notification-bg-color);
    border-radius: 6px;
    padding: 4px 4px 4px 14px;

    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;

    &--wrapper {
        @include font14-600;
        color: var(--jira-notification-text-color);
        display: flex;
        align-items: center;
        gap: 10px;
    }

    &--notification {
        flex-shrink: 0;
        background: var(--orange-color);
        border-radius: 50%;
        width: 8px;
        height: 8px;
    }

    button {
        @include font14-600;
        text-transform: uppercase;
        background: var(--jira-notification-button-bg-color);
        color: var(--jira-notification-button-text-color);
        padding: 1px 2px;
        border-radius: 4px;

        &:hover {
            color: var(--jira-notification-button-text-color__hover);
            background: var(--jira-notification-button-bg-color__hover);
        }
    }
}
</style>
