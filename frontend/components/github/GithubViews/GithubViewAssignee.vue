<template>
    <div class="github-view-assignee">
        <div class="github-view-assignee__image">
            <img :src="assignee.avatar_url" />
        </div>
        <div class="github-view-assignee__name">
            {{ assignee.login }}
        </div>
        <div
            v-if="!assignee.state"
            style="padding: 2px"
            :data-tippy-content="`<div tabindex='-1' class='tooltip'>Waiting for review</div>`"
            class="has-tippy github-view-assignee__state-icon"
            tabindex="0"
        >
            <GithubStatusPendingIcon
                size="12"
                :style="{ color: 'var(--github-status-pending-color)' }"
            />
        </div>
        <div
            v-if="assignee.state === 'commented'"
            :data-tippy-content="`<div tabindex='-1' class='tooltip'>${assignee.login} left review comments</div>`"
            class="has-tippy github-view-assignee__state-icon"
            style="padding: 2px"
            tabindex="0"
            @click="$utils.navigation.openExternalLink(assignee.review_url)"
        >
            <MailChatBubbleTextSquare size="12" />
        </div>
        <GithubStatusSuccessIcon
            v-if="assignee.state === 'approved'"
            :data-tippy-content="`<div tabindex='-1' class='tooltip'>${assignee.login} approved these changes</div>`"
            class="has-tippy github-view-assignee__state-icon"
            size="16"
            :style="{ color: 'var(--github-pr-open-color)' }"
            tabindex="0"
            @click.native="
                $utils.navigation.openExternalLink(assignee.review_url)
            "
        />
        <GithubStatusFailureIcon
            v-if="assignee.state === 'changes_requested'"
            :data-tippy-content="`<div tabindex='-1' class='tooltip'>${assignee.login} requested changes</div>`"
            class="has-tippy github-view-assignee__state-icon"
            size="16"
            :style="{ color: 'var(--github-pr-rejected-color)' }"
            tabindex="0"
            @click.native="
                $utils.navigation.openExternalLink(assignee.review_url)
            "
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubUser } from '~/components/github/github';
import GithubStatusSuccessIcon from '~/components/icons/GithubStatusSuccessIcon.vue';
import GithubStatusFailureIcon from '~/components/icons/GithubStatusFailureIcon.vue';
import GithubStatusPendingIcon from '~/components/icons/GithubStatusPendingIcon.vue';
import MailChatBubbleTextSquare from '~/components/streamline/MailChatBubbleTextSquare.vue';

@Component({
    name: 'GithubViewAssignee',
    components: {
        MailChatBubbleTextSquare,
        GithubStatusPendingIcon,
        GithubStatusFailureIcon,
        GithubStatusSuccessIcon,
    },
})
export default class GithubViewAssignee extends Vue {
    @Prop({ required: true })
    assignee!: GithubUser & { state?: string; review_url: string };
}
</script>
<style lang="scss" scoped>
.github-view-assignee {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;

    &__state-icon {
        outline: none;
        focus: none;
    }

    &__image {
        img {
            width: 16px;
            height: 16px;
            border-radius: 50%;
        }
    }

    &__name {
        @include font12-500;
        color: var(--github-property-text-color);
    }
}
</style>
