<template>
    <div class="issue-assignee">
        <button
            ref="assignee"
            class="issue-assignee--user"
            @click.prevent.stop="onAssigneeDropdown"
        >
            <InterfaceUserCircle
                v-if="!assignee"
                class="no-user-icon"
                size="16"
            />
            <UserIcon v-else-if="assignee && assigneeImgUrl" :user="assignee" />
            <div v-else class="issue-assignee--user--letter">
                {{ assignee.displayName[0] }}
            </div>
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop } from 'vue-property-decorator';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import ADropDown from '~/components/ADropDown.vue';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';
import UserIcon from '~/components/integrations/jira/UserIcon.vue';
import { TabSymbols } from '~/constants/symbols';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'IssueAssignee',
    components: { UserIcon, InterfaceUserCircle },
})
export default class IssueAssignee extends JiraEntityMixin {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop({ required: true })
    entity!: any;

    @Prop({ required: true })
    selected!: any;

    $refs!: {
        assignee: HTMLElement;
    };

    get assignee() {
        return this.entity.properties?.assignee;
    }

    get assigneeImgUrl() {
        return this.assignee.avatarUrls['48x48'];
    }

    handleAssigneeChange(newAssignee: any) {
        this.$dropdown.hide('jira-assignee');
        this.changeAssignee({ id: newAssignee }, TrackingActionSource.JIRA_TAB);
    }

    onAssigneeDropdown() {
        this.$dropdown.show({
            name: 'jira-assignee',
            parent: this.$refs.assignee,
            component: ADropDown,
            animate: false,
            retainFocus: true,
            backdrop: true,
            popperOptions: {
                placement: 'left-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 0],
                        },
                    },
                ],
            },
            bind: {
                items: this.assigneesByEntity,
                value: this.assignee?.accountId ?? null,
                search: true,
                searchPlaceholder: 'Change assignee',
                clear: false,
                multi: false,
                checkPlacement: 'end',
            },
            on: {
                change: (value: any) => {
                    this.handleAssigneeChange(value);
                },
            },
            onClose: () => {},
        });
    }
}
</script>
<style lang="scss" scoped>
.issue-assignee {
    flex-shrink: 0;
    display: flex;
    align-items: center;

    &--user {
        border-radius: 50%;
        padding: 3px;

        &:hover {
            background: var(--issue-assignee-user-bg__hover);
            filter: brightness(120%);
        }

        img {
            border-radius: 50%;
            width: 16px;
            height: 16px;
            display: block;
        }
    }
}
</style>
