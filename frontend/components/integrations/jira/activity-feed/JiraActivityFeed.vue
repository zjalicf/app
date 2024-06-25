<template>
    <div class="jira-activity-feed">
        <div class="jira-activity-feed--tabs">
            <button
                class="jira-activity-feed--tabs--tab"
                :class="{ active: activeTab === 'comments' }"
                @click="setActiveTab('comments')"
            >
                comments
            </button>
            <button
                class="jira-activity-feed--tabs--tab"
                :class="{ active: activeTab === 'activity' }"
                @click="setActiveTab('activity')"
            >
                history
            </button>
            <button
                class="jira-activity-feed--tabs--tab"
                :class="{ active: activeTab === 'all' }"
                @click="setActiveTab('all')"
            >
                all
            </button>
        </div>
        <div class="jira-activity-feed--activities">
            <div v-for="(log, index) in displayEntities" :key="log.id">
                <Activity
                    v-if="log.type === 'activity'"
                    :data="log"
                    :show-notification="entity.notification"
                />
                <Comment v-if="log.type === 'comment'" :data="log" />
                <div
                    v-if="index < displayEntities.length - 1"
                    class="jira-activity-feed--divider"
                ></div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import { localizedRelativeFormat } from '~/helpers/date';
import Activity from '~/components/integrations/jira/activity-feed/Activity.vue';
import Comment from '~/components/integrations/jira/activity-feed/Comment.vue';

@Component({
    name: 'JiraActivityFeed',
    components: { Comment, Activity },
})
export default class JiraActivityFeed extends JiraEntityMixin {
    @Prop({ required: true })
    entity!: any;

    @Prop({ required: true })
    entityComments!: any[];

    activeTab: 'activity' | 'comments' | 'all' = 'comments';

    get displayEntities() {
        switch (this.activeTab) {
            case 'comments':
                return this.comments;
            case 'all':
                return this.all;
            default:
                return this.activity;
        }
    }

    get activity() {
        return this.entity.properties.changelog.map((data: any) => ({
            ...data,
            type: 'activity',
        }));
    }

    get comments() {
        return this.entityComments.length
            ? this.entityComments.map((data: any) => ({
                  ...data,
                  type: 'comment',
              }))
            : this.activeTab === 'comments'
            ? [{ type: 'comment', empty: true }]
            : [];
    }

    get all() {
        return [...this.activity, ...this.comments].sort(
            (a: any, b: any) =>
                Math.abs(new Date(b.created).getTime()) -
                Math.abs(new Date(a.created).getTime()),
        );
    }

    setActiveTab(tab: 'activity' | 'comments' | 'all') {
        this.activeTab = tab;
    }

    format(date: string) {
        return localizedRelativeFormat(
            new Date(date),
            new Date(),
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        );
    }
}
</script>
<style lang="scss" scoped>
.jira-activity-feed {
    &--tabs {
        display: flex;
        width: 100%;
        align-items: flex-start;
        margin-bottom: 16px;

        button {
            @include font12-500;
            text-transform: capitalize;
            padding: 2px 4px;
            color: var(--jira-activity-button-text-color);
            background: var(--jira-activity-button-bg-color);
            border-radius: 4px;

            &:hover,
            &.active {
                color: var(--jira-activity-button-text-color__hover);
                background: var(--jira-activity-button-bg-color__hover);
            }

            &:not(:last-of-type) {
                margin-right: 8px;
            }
        }
    }

    &--divider {
        height: 1px;
        margin: 10px 0;
        background: var(--jira-activity-divider-color);
    }
}
</style>
