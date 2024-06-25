<template>
    <div class="issue-priority">
        <button
            ref="priority"
            class="issue-priority--priority"
            @click.prevent.stop="onPriorityDropdown"
        >
            <img
                v-if="entityPriority && entityPriority.img"
                :src="entityPriority.img"
                :alt="entityPriority.alt"
            />
            <PriorityNone v-else class="icon" size="14" />
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
    name: 'IssuePriority',
    components: {
        PriorityNone,
        InterfaceRemove1,
        InterfaceUserCircle,
    },
})
export default class IssuePriority extends JiraEntityMixin {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Prop({ required: true })
    entity!: any;

    @Prop({ required: true })
    selected!: any;

    $refs!: {
        priority: HTMLElement;
    };

    get assignee() {
        return this.entity.properties?.assignee;
    }

    get entityPriority() {
        return (
            this.prioritiesByEntity.find(
                (priority: any) => priority.id === this.priority,
            ) ?? null
        );
    }

    handlePriorityChange(newPriority: any) {
        this.$dropdown.hide('jira-priority');
        this.changePriority({ id: newPriority }, TrackingActionSource.JIRA_TAB);
    }

    onPriorityDropdown() {
        this.$dropdown.show({
            name: 'jira-priority',
            parent: this.$refs.priority,
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
                items: this.prioritiesByEntity,
                value: this.priority ?? null,
                search: false,
                clear: false,
                multi: false,
                checkPlacement: 'end',
            },
            on: {
                change: (value: any) => {
                    this.handlePriorityChange(value);
                },
            },
            onClose: () => {},
        });
    }
}
</script>
<style lang="scss" scoped>
.issue-priority {
    flex-shrink: 0;

    &--priority {
        border-radius: 4px;
        padding: 4px;

        &:hover {
            background: var(--issue-priority-bg-color__hover);
            filter: brightness(120%);
        }

        img {
            display: block;
            width: 14px;
            height: 14px;
        }

        .icon {
            color: var(--issue-priority-icon-color);
        }
    }
}
</style>
