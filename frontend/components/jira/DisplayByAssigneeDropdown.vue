<template>
    <ASelect
        :items="usersForDropdown"
        :value="filterByAssignee"
        :multi="true"
        :width="130"
        :search="true"
        :clear="true"
        search-placeholder="Search assignee"
        check-placement="end"
        placeholder="No Assignee"
        @change="handleFilterByAssignee"
    />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ASelect from '~/components/ASelect.vue';
import { IJiraUser } from '~/plugins/entities/jira';

@Component({
    name: 'DisplayIssues',
    components: { ASelect },
})
export default class DisplayIssues extends Vue {
    @Prop({ required: true })
    tabId!: string;

    get users() {
        const data = this.$entities.tab.getData(this.tabId);
        if (!data || !data.project) return [];
        return this.$entities.jira.getUsers(data.project) ?? [];
    }

    get myself() {
        return this.$entities.jira.getMyself();
    }

    get usersForDropdown() {
        return [
            { id: null, label: 'No Assignee' },
            ...this.users.map(
                ({
                    user: { accountId, displayName, avatarUrls },
                }: IJiraUser) => {
                    return {
                        id: accountId,
                        label:
                            this.myself.accountId === accountId
                                ? `(You) ${displayName}`
                                : displayName,
                        img: avatarUrls['48x48'],
                        alt: displayName,
                    };
                },
            ),
        ];
    }

    get filterByAssignee(): string[] {
        const data = this.$entities.tab.getData(this.tabId);
        if (!data || !data.filterByAssignee) return [];
        return data.filterByAssignee;
    }

    get displayAll() {
        return (
            this.$store.getters['tabs/byId'](this.tabId)?.data.displayAll ??
            false
        );
    }

    handleFilterByAssignee(value: string[]) {
        this.$emit('update', { filterByAssignee: value });
    }
}
</script>
<style lang="scss" scoped>
.display-all {
    @include font12-500;
    outline: none;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--dropdown-controls-text-color);
    margin-bottom: 10px;
}
</style>
