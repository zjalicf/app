<template>
    <component
        :is="iconComponent.component"
        :size="size"
        :style="{ color: iconComponent.color }"
    ></component>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubCommitStatusesResponse } from '~/components/github/github';
import GithubStatusPendingIcon from '~/components/icons/GithubStatusPendingIcon.vue';
import GithubStatusSuccessIcon from '~/components/icons/GithubStatusSuccessIcon.vue';
import GithubStatusFailureIcon from '~/components/icons/GithubStatusFailureIcon.vue';

@Component({
    name: 'GithubCommitStatusIcon',
})
export default class GithubCommitStatusIcon extends Vue {
    @Prop({ required: true })
    entity!: GithubCommitStatusesResponse;

    @Prop({ required: false, default: '14' })
    size: any;

    get iconComponent() {
        switch (this.entity.state) {
            case 'pending':
                return {
                    component: GithubStatusPendingIcon,
                    color: 'var(--github-status-pending-color)',
                };
            case 'success':
                return {
                    component: GithubStatusSuccessIcon,
                    color: 'var(--github-pr-open-color)',
                };
            case 'failure':
                return {
                    component: GithubStatusFailureIcon,
                    color: 'var(--github-pr-rejected-color)',
                };
            case 'error':
                return {
                    component: GithubStatusFailureIcon,
                    color: 'var(--github-pr-rejected-color)',
                };
        }

        return {
            component: GithubStatusPendingIcon,
            color: 'var(--github-status-pending-color)',
        };
    }
}
</script>
