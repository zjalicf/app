<template>
    <component
        :is="iconComponent.component"
        :size="size"
        :style="{ color: iconComponent.color }"
    ></component>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubCommitCheck } from '~/components/github/github';
import GithubStatusPendingIcon from '~/components/icons/GithubStatusPendingIcon.vue';
import GithubStatusSuccessIcon from '~/components/icons/GithubStatusSuccessIcon.vue';
import GithubStatusFailureIcon from '~/components/icons/GithubStatusFailureIcon.vue';
import GithubStatusNeutralIcon from '~/components/icons/GithubStatusNeutralIcon.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';

@Component({
    name: 'GithubCommitStatusIcon',
})
export default class GithubCommitStatusIcon extends Vue {
    @Prop({ required: true })
    entity!: GithubCommitCheck;

    @Prop({ required: false, default: '14' })
    size: any;

    get iconComponent() {
        switch (this.entity.status) {
            case 'queued':
                return {
                    component: GithubStatusPendingIcon,
                    color: 'var(--github-status-pending-color)',
                };
            case 'in_progress':
                return {
                    component: LoadingIcon,
                    color: null,
                };
            case 'completed':
                switch (this.entity.conclusion) {
                    case 'stale':
                    case 'skipped':
                    case 'neutral':
                        return {
                            component: GithubStatusNeutralIcon,
                            color: 'var(--github-pr-draft-color)',
                        };
                    case 'success':
                        return {
                            component: GithubStatusSuccessIcon,
                            color: 'var(--github-pr-open-color)',
                        };
                    case 'failure':
                    case 'timed_out':
                    case 'action_required':
                    case 'cancelled':
                        return {
                            component: GithubStatusFailureIcon,
                            color: 'var(--github-pr-rejected-color)',
                        };
                }

                return {
                    component: GithubStatusSuccessIcon,
                    color: 'var(--github-pr-open-color)',
                };
        }

        return {
            component: GithubStatusPendingIcon,
            color: 'var(--github-status-pending-color)',
        };
    }
}
</script>
