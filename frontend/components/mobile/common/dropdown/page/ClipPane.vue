<template>
    <div class="clip-pane">
        <div v-if="isJira" class="clip-pane__header">
            <IssueType class="issue-avatar" :entity="entity" /> {{ entity.key }}
        </div>
        <div v-if="isGithub" class="clip-pane__header">
            <GithubEntityIcon :entity="entity" /> #{{ entity.number }}
        </div>
        <div class="clip-pane__row">
            <button class="clip-pane__row__column" @click="openExternal">
                <span class="clip-pane__row__column__title"
                    >Open Link in Browser</span
                >
            </button>
        </div>
        <div class="clip-pane__row">
            <button
                class="clip-pane__row__column clear danger"
                @click="clearClip"
            >
                Clear Clip
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import IssueType from '~/components/integrations/jira/issue/IssueType.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import { GithubIntegrationDataType } from '~/components/github/github';
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';

@Component({
    name: 'ClipPane',
    components: {
        GithubEntityIcon,
        IssueType,
    },
})
export default class ClipPane extends Vue {
    @Prop({ required: true })
    clip!: any;

    get entity() {
        return this.$store.getters['integrationData/byId'](this.clip) ?? {};
    }

    get isJira() {
        return this.entity?.type === JiraIntegrationDataType.ISSUE;
    }

    get isGithub() {
        return (
            this.entity?.type === GithubIntegrationDataType.ISSUE ||
            this.entity?.type === GithubIntegrationDataType.PR
        );
    }

    async openExternal() {
        if (!this.entity.url || !this.entity.html_url) return;
        try {
            const { Browser } = await import('@capacitor/browser');
            await Browser.open({
                url: this.entity.url || this.entity.html_url,
            });
        } catch (error) {
            console.log(error);
        }
    }

    async clearClip() {
        await this.$pane.hideAll();
        const id =
            this.$store.getters['document/byClip'](this.clip)?.id ?? null;
        if (!id) return;
        this.$nextTick(() => {
            this.$entities.page.removeClip(id);
        });
    }
}
</script>
<style lang="scss" scoped>
.clip-pane {
    padding: 4px 24px 30px;
    user-select: none;

    &__header {
        display: flex;
        gap: 14px;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        text-align: center;
        letter-spacing: -0.24px;
        color: $blueGrey400;

        .icon {
            color: $blueGrey500;
        }
    }

    &__row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        font-weight: 400;
        font-size: 16px;
        line-height: 19px;
        letter-spacing: -0.24px;
        color: $white;

        &__column {
            @include paneButtons;

            &__value {
                color: $blueGrey400;
            }

            width: 100%;
            background: $blueGrey900;
            border-radius: 12px;
            padding: 16px;

            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
}
</style>
