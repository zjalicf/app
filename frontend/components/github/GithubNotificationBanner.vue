<template>
    <div class="github-notification-banner">
        <div class="github-notification-banner__wrapper">
            <div class="github-notification-banner__wrapper__dot"></div>
            {{ count }} new update{{ count > 1 ? 's' : '' }}
        </div>
        <div class="github-notification-banner__wrapper__actions">
            <tippy
                :content="`<div class='tooltip'>Clear notifications</div>`"
                :delay="[100, 20]"
                :touch="false"
                boundary="window"
                placement="top"
                theme="tooltip"
                to="dismiss"
            />
            <button
                class="show"
                @click="
                    $emit('updateOptions', {
                        filterBy: filterBy === 'all' ? 'notification' : 'all',
                    })
                "
            >
                {{ filterBy === 'all' ? 'Show Updates' : 'Show All' }}
            </button>
            <button name="dismiss" class="clear" @click="$emit('dismiss')">
                <InterfaceDelete1 size="12" />
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';

@Component({
    name: 'GithubNotificationBanner',
    components: { InterfaceDelete1 },
})
export default class GithubNotificationBanner extends Vue {
    @Prop({ default: 0 })
    count!: number;

    @Prop({ default: 'all' })
    filterBy!: string;
}
</script>
<style lang="scss" scoped>
.github-notification-banner {
    background: var(--jira-notification-bg-color);
    border-radius: 6px;
    padding: 2px 4px 2px 14px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;

    &__wrapper {
        @include font14-600;
        color: var(--jira-notification-text-color);
        display: flex;
        align-items: center;
        gap: 10px;

        &__dot {
            flex-shrink: 0;
            background: var(--orange-color);
            border-radius: 50%;
            width: 8px;
            height: 8px;
        }

        &__actions {
            display: flex;
            align-items: center;
            gap: 4px;

            .clear {
                color: var(--jira-notification-button-text-color);
                padding: 8px;

                &:hover {
                    color: var(--jira-notification-button-text-color__hover);
                }
            }

            .show {
                @include font12-500;
                background: var(--jira-notification-button-bg-color);
                color: var(--jira-notification-button-text-color);
                padding: 2px 6px;
                border-radius: 4px;
                width: 120px;

                &:hover {
                    color: var(--jira-notification-button-text-color__hover);
                    background: var(--jira-notification-button-bg-color__hover);
                }
            }
        }
    }
}
</style>
