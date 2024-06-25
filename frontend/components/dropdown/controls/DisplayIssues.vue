<template>
    <div>
        <label class="display-all">
            <p>Filter by assignee</p>
            <DisplayByAssigneeDropdown
                :tab-id="tabId"
                @update="$emit('update', $event)"
            />
        </label>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DisplayByAssigneeDropdown from '~/components/jira/DisplayByAssigneeDropdown.vue';

@Component({
    name: 'DisplayIssues',
    components: { DisplayByAssigneeDropdown },
})
export default class DisplayIssues extends Vue {
    @Prop({ required: true })
    tabId!: string;
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
