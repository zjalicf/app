<template>
    <div class="overview page">
        <TabsContent />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Context } from '@nuxt/types';
import { format } from 'date-fns';
import TabsContent from '~/components/tabs/TabsContent.vue';
import { TabType } from '~/constants';

@Component({
    name: 'Overview',
    components: { TabsContent },
    layout(context: Context) {
        if (context.$utils.isMobile) {
            return 'mobile';
        }
        return 'default';
    },
    asyncData(ctx: Context) {
        if (ctx.$utils.isMobile) {
            return ctx.redirect(301, '/mobile', {
                level: '0',
            });
        }
    },
    head() {
        return {
            // @ts-ignore
            title: `${this.title} | acreom`,
        };
    },
})
export default class Overview extends Vue {
    get document() {
        return (
            (this.activeTab.type === TabType.DOCUMENT &&
                this.$store.getters['document/byId'](
                    this.activeTab.entityId,
                )) ??
            this.$store.getters['document/byClip'](this.activeTab.entityId)
        );
    }

    get activeGroup() {
        return this.$store.getters['tabs/activeGroup'];
    }

    get activeTabId() {
        return this.activeGroup?.activeTab;
    }

    get activeTab() {
        return this.$store.getters['tabs/byId'](this.activeTabId);
    }

    get clipData() {
        return this.$store.getters['integrationData/byId'](
            this.activeTab?.entityId,
        );
    }

    get title() {
        switch (this.activeTab?.type) {
            case TabType.DOCUMENT:
                return this.document?.title?.length > 0
                    ? this.document.title
                    : this.clipData
                    ? this.clipData.text
                    : 'Untitled';
            case TabType.VIEW:
                return this.$entities.view.getViewName(this.activeTab.entityId);
            case TabType.MY_DAY:
                return `My Day - ${format(
                    this.activeTab.data.date,
                    'EEEE, LLL d, yyyy',
                )}`;
            case TabType.JIRA_APP:
                return 'Jira';
            case TabType.GITHUB_APP:
                return 'GitHub';
            case TabType.LINEAR_APP:
                return 'Linear';
            default:
                return 'New Tab';
        }
    }
}
</script>
<style lang="scss" scoped>
.overview {
    height: $pageHeight;
}
</style>
