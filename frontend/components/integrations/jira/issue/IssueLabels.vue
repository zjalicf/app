<template>
    <div v-if="labels.length" class="issue-labels">
        <button
            ref="labels"
            class="issue-labels--label"
            :class="{ active: dropdownOpen }"
            @click.prevent.stop="onLabelsDropdown"
        >
            {{ displayText }}
        </button>
    </div>
    <div v-else ref="ghostLabels"></div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Watch } from 'vue-property-decorator';
import JiraEntityMixin from '~/components/integrations/jira/JiraEntityMixin.vue';
import ADropDown from '~/components/ADropDown.vue';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';
import InterfaceRemove1 from '~/components/streamline/InterfaceRemove1.vue';
import PriorityNone from '~/components/icons/PriorityNone.vue';
import { TabSymbols } from '~/constants/symbols';
import { JiraActions } from '~/constants';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'IssueLabels',
    components: {
        PriorityNone,
        InterfaceRemove1,
        InterfaceUserCircle,
    },
})
export default class IssueLabels extends JiraEntityMixin {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop({ required: true })
    entity!: any;

    @Prop({ required: true })
    selected!: any;

    $refs!: {
        labels: HTMLElement;
        ghostLabels: HTMLElement;
    };

    dropdownOpen: boolean = false;
    labelsUpdated: boolean = false;

    @Watch('labels')
    onLabelsChanged(newValue: string[]) {
        this.labelsState = newValue;
    }

    get displayText() {
        if (this.labels.length === 1) {
            return this.labels[0];
        }
        return `${this.labels.length} labels`;
    }

    handleLabelsChange(value: any) {
        const existingSet = new Set(this.labels);
        const modified =
            value.length !== this.labels.length ||
            value.some((label: string) => !existingSet.has(label));
        if (!modified) {
            return;
        }

        this.changeLabels({ labels: value }, TrackingActionSource.JIRA_TAB);
        this.labelsUpdated = true;
    }

    labelsState: any[] = [];

    showLabelsNotification() {
        if (this.labelsUpdated) {
            this.labelsUpdated = false;
            this.$notification.show({
                component: () =>
                    import(
                        '~/components/integrations/jira/JiraNotification.vue'
                    ),
                bind: {
                    entityId: this.entity.id,
                    action: JiraActions.UPDATE,
                    property: 'Labels',
                },
            });
        }
    }

    onLabelsDropdown() {
        this.dropdownOpen = true;
        this.$dropdown.show({
            name: 'jira-labels',
            parent: this.$refs.labels ?? this.$refs.ghostLabels,
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
                items: this.labelsByEntity,
                value: this.labels ?? null,
                search: true,
                clear: false,
                multi: true,
                searchPlaceholder: 'Search Labels',
            },
            on: {
                change: (value: any) => {
                    this.labelsState = value;
                },
            },
            onClose: () => {
                this.handleLabelsChange(this.labelsState);
                this.dropdownOpen = false;
                this.showLabelsNotification();
            },
        });
    }

    mounted() {
        this.labelsState = this.labels;
    }
}
</script>
<style lang="scss" scoped>
.issue-labels {
    flex-shrink: 0;

    &--label {
        font-weight: 400;
        font-size: 12px;
        line-height: 15px;
        color: var(--issue-labels-text-color);
        padding: 2px 10px;
        border: 1px solid var(--issue-labels-border-color);
        border-radius: 16px;

        &:hover,
        &.active {
            background: var(--issue-labels-bg-color__hover);
        }
    }
}
</style>
