<template>
    <div class="github-account" :class="{ unauthorized: !isAuthorized }">
        <!--        <tippy-->
        <!--            :content="`<div class='tooltip'>Remove integration</div>`"-->
        <!--            :delay="[300, 20]"-->
        <!--            :touch="false"-->
        <!--            boundary="window"-->
        <!--            placement="top"-->
        <!--            theme="tooltip"-->
        <!--            to="removeIntegration"-->
        <!--        />-->
        <div
            v-if="!isAuthorized"
            class="github-account__auth-icon has-tippy"
            :data-tippy-content="`<div class='tooltip'>Github authorization failed.<br> Reconnect your GitHub account.</div>`"
        >
            <InterfaceAlertWarningTriangle size="14" />
        </div>
        <div class="github-account__avatar">
            <img
                :src="integration.data.account?.avatar_url"
                :alt="integration.data.account?.login"
            />
        </div>
        <div class="github-account__name">
            {{ integration.data.account?.login }}
            <span
                >{{ integration.data.repositories.length }} synced
                repositories</span
            >
        </div>
        <div class="github-account__actions">
            <button
                class="github-account__action"
                name="removeIntegration"
                @click="openSettings"
            >
                <InterfaceSettingCog class="icon" />
            </button>
            <button
                class="github-account__action"
                name="removeIntegration"
                @click="deleteIntegration"
            >
                <InterfaceDelete1 class="icon" />
            </button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GithubIntegration } from '~/components/github/github';
import InterfaceDelete1 from '~/components/streamline/InterfaceDelete1.vue';
import InterfaceSettingCog from '~/components/streamline/InterfaceSettingCog.vue';
import InterfaceAlertWarningTriangle from '~/components/streamline/InterfaceAlertWarningTriangle.vue';

@Component({
    name: 'GitHubAccount',
    components: {
        InterfaceAlertWarningTriangle,
        InterfaceSettingCog,
        InterfaceDelete1,
    },
})
export default class GitHubAccount extends Vue {
    @Prop({ required: true })
    integration!: GithubIntegration;

    deleteIntegration() {
        this.$entities.github.delete();
    }

    get isAuthorized(): boolean {
        return this.$entities.github.isAuthorized();
    }

    openSettings() {
        this.$entities.github.openRepositorySelector();
    }
}
</script>
<style lang="scss" scoped>
.github-account {
    display: grid;
    grid-template-columns: 20px 1fr 40px;
    align-items: center;
    gap: 10px;

    &.unauthorized {
        grid-template-columns: 20px 20px 1fr 40px;
    }

    &__avatar {
        img {
            border-radius: 4px;
            display: block;
        }
    }

    &__name {
        @include font12-500;

        span {
            margin-left: 8px;
            color: $blueGrey400;
        }
    }

    &__action {
        color: var(--settings-modal-calendar-remove-button-color);

        &:hover {
            color: var(--settings-modal-calendar-remove-button-color__hover);
        }
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 12px;
        justify-content: flex-start;
    }
}
</style>
