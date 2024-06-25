<template>
    <div class="jira-activity">
        <div class="jira-activity--content">
            <div
                v-if="data.notification"
                class="jira-activity--content--notification"
            ></div>
            <UserIcon class="jira-activity--icon" :user="data.author" />
            <span class="jira-activity--text">
                {{ data.author && data.author.displayName }}</span
            >
            updated
            <span class="jira-activity--text">{{ data.items[0].field }}</span
            ><span class="jira-activity--date">
                {{ format(data.created) }}
            </span>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { localizedRelativeFormat } from '~/helpers/date';
import UserIcon from '~/components/integrations/jira/UserIcon.vue';

@Component({
    name: 'Activity',
    components: { UserIcon },
})
export default class Activity extends Vue {
    @Prop({ required: true })
    data!: any;

    @Prop({ default: true })
    showNotification!: any;

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
.jira-activity {
    &--content {
        @include font12-500;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 4px;
        flex-wrap: wrap;
        color: var(--jira-activity-text-color);

        &--notification {
            flex-shrink: 0;
            background: var(--orange-color);
            border-radius: 50%;
            width: 6px;
            height: 6px;
        }
    }

    &--icon {
        margin-right: 4px;
    }

    &--text {
        color: var(--jira-activity-text-color__highlight);
    }

    &--date {
        color: var(--jira-activity-date-color);
    }
}
</style>
