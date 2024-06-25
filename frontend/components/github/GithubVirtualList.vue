<template>
    <div ref="githubVirtualList" class="github-virtual-list">
        <VirtualCollection
            :cell-size-and-position-getter="cellSizeAndPositionGetterList"
            :collection="flatListData"
            :width="listWidth"
            :height="retrieveHeight"
            :header-slot-height="0"
            class="github-virtual-list--collection tab-content-gutter"
        >
            <div slot="cell" slot-scope="props">
                <div
                    v-if="props.data.placeholder"
                    class="github-virtual-list--placeholder"
                ></div>
                <GithubNotificationBanner
                    v-else-if="props.data.banner"
                    :count="props.data.count"
                    :filter-by="tabData.filterBy"
                    @dismiss="dismissNotifications"
                    @updateOptions="$emit('updateOptions', $event)"
                />
                <GithubPageHeader
                    v-else-if="props.data.pageHeader"
                    :count="props.data.count"
                    :active-tab="tabData.activeTab"
                    :active-filter="tabData[tabData.activeTab].filterBy"
                    @search="$emit('search', $event)"
                    @updateOptions="$emit('updateOptions', $event)"
                />
                <GithubSectionHeader
                    v-else-if="props.data.isHeader"
                    :group="props.data"
                    @collapse="$emit('collapse', $event)"
                />
                <GithubIssue
                    v-else-if="props.data.isIssue"
                    :issue="props.data"
                />
                <GithubPullRequest
                    v-else-if="props.data.isPullRequest"
                    :pull-request="props.data"
                />
            </div>
        </VirtualCollection>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import GithubNotificationBanner from '~/components/github/GithubNotificationBanner.vue';
import GithubPageHeader from '~/components/github/GithubPageHeader.vue';
import GithubSectionHeader from '~/components/github/GithubSectionHeader.vue';
import GithubIssue from '~/components/github/GithubIssue.vue';
import GithubPullRequest from '~/components/github/GithubPullRequest.vue';
import { VirtualJiraHeight } from '~/components/integrations/jira/constants';
import JiraPageHeader from '~/components/integrations/jira/JiraPageHeader.vue';
import JiraIssue from '~/components/integrations/jira/issue/JiraIssue.vue';
import { throttle } from '~/helpers';
import { TrackingAction, TrackingType } from '~/@types/tracking';

const throttledByFps = throttle(requestAnimationFrame);
let resizeObserver: ResizeObserver | null = null;
@Component({
    name: 'GithubVirtualList',
    components: {
        GithubPullRequest,
        GithubIssue,
        GithubSectionHeader,
        GithubPageHeader,
        GithubNotificationBanner,
    },
})
export default class GithubVirtualList extends Vue {
    @Prop({ default: () => [] })
    flatList!: any[];

    @Prop({ required: true })
    tabData!: {
        activeTab: 'issues' | 'pulls';
        issues: {
            open: boolean;
            closed: boolean;
            filterBy: string;
        };
        pulls: {
            open: boolean;
            closed: boolean;
            filterBy: string;
        };
    };

    $refs!: {
        githubVirtualList: HTMLElement;
        virtualCollection: HTMLElement;
        pageHeader: JiraPageHeader;
    } & Record<string, HTMLElement> & { [key: string]: JiraIssue };

    width: number = 0;
    height: number = 0;
    listWidth: number = 0;

    async dismissNotifications() {
        this.$tracking.trackEventV2(TrackingType.GITHUB, {
            action: TrackingAction.DISMISS_NOTIFICATIONS,
        });
        await this.$entities.github.clearNotifications();
        this.$emit('updateOptions', { filterBy: 'all' });
    }

    get flatListData() {
        const data = this.flatList;

        return data.map((data: any, index: number) => {
            data.index = index;
            return { data };
        });
    }

    get retrieveHeight() {
        return Math.max(this.height, 0);
    }

    cellSizeAndPositionGetterList(item: any, index: number) {
        const itemHeight =
            this.$config.platform === 'mobile'
                ? VirtualJiraHeight.ITEM_MOBILE
                : VirtualJiraHeight.ITEM_DESKTOP;
        const width = this.width;
        const gutter = this.$config.platform === 'mobile' ? 0 : 40;
        return {
            width: width - gutter,
            height: item.data.height ?? itemHeight,
            x: 0,
            y: item.data.y ?? index * itemHeight,
            style: {
                'z-index': item.data.pageHeader
                    ? this.flatList.length - index
                    : 0,
            },
        };
    }

    resizeListener() {
        if (!this.$refs.githubVirtualList) return;
        throttledByFps(() => {
            this.width = this.$refs.githubVirtualList.offsetWidth;
            this.listWidth = this.$refs.githubVirtualList.offsetWidth;
            this.height = this.$refs.githubVirtualList.offsetHeight;
        });
    }

    mounted() {
        this.resizeListener();

        resizeObserver = new ResizeObserver(this.resizeListener);
        if (this.$refs.githubVirtualList) {
            resizeObserver.observe(this.$refs.githubVirtualList);
        }
    }

    beforeDestroy() {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    }
}
</script>
<style lang="scss" scoped>
.github-virtual-list {
    height: 100%;
    width: 100%;
    overflow: hidden;

    &--collection {
        @include scrollbar;
        overflow-x: hidden;
        position: relative;
        padding: 0 20px;
    }
}
</style>
