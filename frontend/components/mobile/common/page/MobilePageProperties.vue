<template>
    <div v-if="properties.length" class="mobile-page-properties">
        <MobilePageProperty
            v-for="property in properties"
            :key="property.property"
            :property="property"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IDocument } from '~/components/document/model';
import { IntegrationType, PageStatus } from '~/constants';
import MobilePageProperty from '~/components/mobile/common/page/MobilePageProperty.vue';
import { extractDate, formatRelativeToDate } from '~/helpers';
import DateTimePane from '~/components/mobile/common/dropdown/page/DateTimePane.vue';
import { TaskDateObject } from '~/@types';
import MobilePageStatusDropdown from '~/components/mobile/common/dropdown/page/MobilePageStatusDropdown.vue';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import BacklinksPane from '~/components/mobile/common/dropdown/page/BacklinksPane.vue';
import InterfaceArrowsCornerUpRight from '~/components/streamline/InterfaceArrowsCornerUpRight.vue';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import ClipPane from '~/components/mobile/common/dropdown/page/ClipPane.vue';
import { JiraIntegrationDataType } from '~/constants/jira';
import { GithubIntegrationDataType } from '~/components/github/github';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';

@Component({
    name: 'MobilePageProperties',
    components: { MobilePageProperty },
})
export default class MobilePageProperties extends Vue {
    @Prop({ required: true })
    page!: IDocument;

    get pageBacklinks() {
        if (!this.page?.id) return [];
        const links = this.$store.getters['document/links'](this.page.id) ?? [];
        const backlinks =
            this.$store.getters['document/backlinks'](this.page.id) ?? [];
        return [...links, ...backlinks];
    }

    get clip() {
        return this.page?.clip ?? null;
    }

    get hasActiveIntegration() {
        return (
            this.$store.getters['integration/byType'](IntegrationType.JIRA)
                .length ||
            this.$store.getters['integration/byType'](IntegrationType.GITHUB)
                .length
        );
    }

    get properties() {
        const capitalize = (label: string) => {
            const arr = label.split(' ');
            for (let i = 0; i < arr.length; i++) {
                arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
            }
            return arr.join(' ');
        };
        const pageHasBacklinks =
            this.pageBacklinks.length > 0 && !this.page.archived;
        const properties = [];
        if (this.page.start) {
            properties.push({
                property: 'Date',
                icon: InterfaceCalendar,
                value: {
                    icon: null,
                    value:
                        capitalize(
                            formatRelativeToDate(
                                this.page,
                                new Date(),
                                false,
                                this.$store.getters[
                                    'appSettings/dateTimeOptions'
                                ],
                            ),
                        ) || 'Set date',
                },
                callback: async () => {
                    await this.$pane.hide();
                    await this.$utils.mobile.closeKeyboard();
                    await this.$pane.show({
                        component: DateTimePane,
                        type: 'dropdown',
                        bind: {
                            data: this.page,
                        },
                        on: {
                            done: (start: TaskDateObject) => {
                                this.$utils.page.schedulePage(
                                    this.page,
                                    extractDate(start),
                                );
                                this.$pane.hide();
                                this.$tracking.trackEventV2(TrackingType.PAGE, {
                                    action: TrackingAction.SET_DATE,
                                    source: TrackingActionSource.MOBILE_PAGE_DETAIL,
                                });
                            },
                            clear: () => {
                                this.$utils.page.clearDate(this.page);
                                this.$pane.hide();
                                this.$tracking.trackEventV2(TrackingType.PAGE, {
                                    action: TrackingAction.REMOVE_DATE,
                                    source: TrackingActionSource.MOBILE_PAGE_DETAIL,
                                });
                            },
                        },
                    });
                },
            });
        }
        if (this.page.pageStatus) {
            properties.push({
                property: 'Status',
                icon: InterfaceEditSelectAreaCircleDash,
                value: {
                    icon: this.$utils.page.getWorkflowIcon(
                        this.page.pageStatus,
                    ),
                    value: capitalize(this.page.pageStatus),
                },
                callback: async () => {
                    await this.$pane.hide();
                    await this.$utils.mobile.closeKeyboard();
                    await this.$pane.show({
                        component: MobilePageStatusDropdown,
                        bind: {
                            statuses: Object.values(PageStatus).map(status => ({
                                id: status,
                                icon: this.$utils.page.getWorkflowIcon(status),
                                label: capitalize(status),
                            })),
                            selectedStatus: this.page.pageStatus,
                        },
                        type: 'dropdown',
                        on: {
                            select: (status: PageStatus) => {
                                this.$entities.page.changeStatus(
                                    this.page,
                                    status,
                                );
                                this.$pane.hide();
                                this.$tracking.trackEventV2(TrackingType.PAGE, {
                                    action: TrackingAction.SET_STATUS,
                                    source: TrackingActionSource.MOBILE_PAGE_DETAIL,
                                });
                            },
                        },
                    });
                },
            });
        }
        if (pageHasBacklinks) {
            properties.push({
                property: 'Links',
                icon: InterfaceArrowsCornerUpRight,
                value: {
                    icon: null,
                    value: this.pageBacklinks.length,
                },
                callback: async () => {
                    await this.$pane.hide();
                    await this.$utils.mobile.closeKeyboard();
                    await this.$pane.show({
                        component: BacklinksPane,
                        bind: {
                            page: this.page,
                        },
                        type: 'dropdown',
                    });
                },
            });
        }
        if (this.hasActiveIntegration && this.clip) {
            const entity = this.$store.getters['integrationData/byId'](
                this.clip,
            );
            if (!entity) return properties;
            const isJira = entity?.type === JiraIntegrationDataType.ISSUE;
            const isPullRequest = entity?.type === GithubIntegrationDataType.PR;
            const isIssue = entity?.type === GithubIntegrationDataType.ISSUE;

            let key = 'Unknown';
            if (isJira) {
                key = entity?.key ?? 'Unknown';
            }
            if (isPullRequest || isIssue) {
                key = `#${entity?.number}` ?? 'Unknown';
            }

            properties.push({
                property: 'Clip',
                icon: InterfaceLink,
                value: {
                    icon: null,
                    value: key,
                },
                callback: async () => {
                    await this.$pane.hide();
                    await this.$utils.mobile.closeKeyboard();
                    await this.$pane.show({
                        component: ClipPane,
                        bind: {
                            clip: this.clip,
                        },
                        type: 'dropdown',
                    });
                },
            });
        }
        return properties;
    }
}
</script>
<style lang="scss" scoped>
.mobile-page-properties {
    padding: 8px 6px;
    margin-bottom: 16px;
    position: relative;

    &:before {
        content: '';
        width: calc(100% - 40px);
        height: 1px;
        background: $blueGrey800;
        position: absolute;
        top: 0;
        left: 20px;
    }
    &:after {
        content: '';
        width: calc(100% - 40px);
        height: 1px;
        background: $blueGrey800;
        position: absolute;
        bottom: 0;
        left: 20px;
    }
}
</style>
