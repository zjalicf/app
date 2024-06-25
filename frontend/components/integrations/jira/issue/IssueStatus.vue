<template>
    <div class="issue-status">
        <button
            ref="status"
            class="issue-status--status"
            @click.prevent.stop="onStatusDropdown"
        >
            <component
                :is="statusProperties.icon"
                :style="{ color: statusProperties.color }"
            />
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop } from 'vue-property-decorator';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import ADropDown from '~/components/ADropDown.vue';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';
import InterfaceRemove1 from '~/components/streamline/InterfaceRemove1.vue';
import PriorityNone from '~/components/icons/PriorityNone.vue';
import { TabSymbols } from '~/constants/symbols';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'IssueStatus',
    components: {
        PriorityNone,
        InterfaceRemove1,
        InterfaceUserCircle,
    },
})
export default class IssueStatus extends JiraEntityMixin {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop({ required: true })
    entity!: any;

    @Prop({ required: true })
    selected!: any;

    $refs!: {
        status: HTMLElement;
    };

    handleStatusChange(newStatus: any) {
        this.$dropdown.hide('jira-status');
        this.changeStatus(
            { transitionId: newStatus },
            TrackingActionSource.JIRA_TAB,
        );
    }

    onStatusDropdown() {
        this.$dropdown.show({
            name: 'jira-status',
            parent: this.$refs.status,
            component: ADropDown,
            animate: false,
            retainFocus: true,
            backdrop: true,
            popperOptions: {
                placement: 'right-start',
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
                items: this.statusesByEntity,
                value: this.status?.id,
                search: true,
                searchPlaceholder: 'Search status',
                clear: false,
                multi: false,
                checkPlacement: 'end',
            },
            on: {
                change: (value: any) => {
                    this.handleStatusChange(value);
                },
            },
            onClose: () => {},
        });
    }
}
</script>
<style lang="scss" scoped>
.issue-status {
    flex-shrink: 0;

    &--status {
        @include font10-700;
        text-transform: uppercase;
        border-radius: 4px;
        padding: 4px;

        &:hover {
            background: var(--issue-status-bg-color__hover);
            filter: brightness(120%);
        }
    }
}
</style>
