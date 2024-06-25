<template>
    <div class="linear-issue-history">
        <div class="linear-issue-history__icon">
            <LinearUserIcon size="16" font-size="9" :user="actor" />
        </div>
        <div class="linear-issue-history__actor">{{ actorName }}</div>
        <div class="linear-issue-history__text" v-html="changeText"></div>
        <div class="linear-issue-history__dot">·</div>
        <div class="linear-issue-history__date">{{ formattedDateTime }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formatDistanceToNowStrict } from 'date-fns';
import LinearStateIcon from '~/components/linear/icons/LinearStateIcon.vue';
import LinearLabelIcon from '~/components/linear/icons/LinearLabelIcon.vue';
import { LinearIntegrationDataType } from '~/constants/linear';
import LinearUserIcon from '~/components/linear/icons/LinearUserIcon.vue';

@Component({
    name: 'LinearViewHistoryComments',
    components: {
        LinearUserIcon,
        LinearLabelIcon,
        LinearStateIcon,
    },
})
export default class LinearViewLabels extends Vue {
    @Prop({ required: true })
    issueId!: string;

    @Prop({ required: true })
    item!: any;

    get actor() {
        if (this.item.botActor) {
            return this.item.botActor;
        }
        return this.$entities.linear.getById(this.item.actorId);
    }

    get actorName() {
        return this.actor.displayName ?? this.actor.name ?? '';
    }

    get formattedDateTime() {
        const date = new Date(this.item.createdAt);
        return formatDistanceToNowStrict(date, {
            addSuffix: true,
            includeSeconds: true,
        });
    }

    createId(type: string, id: string, team = true) {
        const idParts = this.$entities.linear.parseId(this.issueId);
        const parts = [type, idParts.organizationId];
        if (team) {
            parts.push(idParts.teamId!);
        }
        parts.push(id);
        return parts.join('/');
    }

    get changeText() {
        if (this.item.creation) {
            return `created the issue`;
        }

        if (this.item.fromStateId) {
            const fromId = this.createId(
                LinearIntegrationDataType.STATE,
                this.item.fromStateId,
            );
            const toId = this.createId(
                LinearIntegrationDataType.STATE,
                this.item.toStateId,
            );
            const fromState = this.$entities.linear.getById(fromId);
            const toState = this.$entities.linear.getById(toId);

            return `changed status from <span class="highlight">${fromState?.name}</span> to <span  class="highlight">${toState?.name}</span>`;
        }

        if (this.item.fromAssigneeId) {
            const fromId = this.createId(
                LinearIntegrationDataType.USER,
                this.item.fromAssigneeId,
            );
            const toId = this.createId(
                LinearIntegrationDataType.USER,
                this.item.toAssigneeId,
            );
            const from = this.$entities.linear.getById(fromId);
            const to = this.$entities.linear.getById(toId);

            if (!this.item.toAssigneeId) {
                return `removed assignee <span class="highlight">${from.displayName}</span>`;
            }

            if (this.item.actorId === toId) {
                return `self-assigned the issue`;
            }

            return `changed assignee from <span class="highlight">${
                from?.displayName ?? 'Unassigned'
            }</span> to <span class="highlight">${
                to?.displayName ?? 'Unassigned'
            }</span>`;
        }
        if (this.item.toAssigneeId) {
            const toId = this.createId(
                LinearIntegrationDataType.USER,
                this.item.toAssigneeId,
            );
            const to = this.$entities.linear.getById(toId);
            return `assigned to <span class="highlight">${to.displayName}</span>`;
        }

        if (this.item.fromCycleId) {
            const fromId = this.createId(
                LinearIntegrationDataType.CYCLE,
                this.item.fromCycleId,
            );
            const from = this.$entities.linear.getById(fromId);

            const fromCycleName = from?.name ?? `Cycle ${from?.number}`;
            if (!this.item.toCycleId) {
                return `removed from cycle <span class="highlight">${fromCycleName}</span>`;
            }
            const toId = this.createId(
                LinearIntegrationDataType.CYCLE,
                this.item.toCycleId,
            );
            const to = this.$entities.linear.getById(toId);
            const toCycleName = to?.name ?? `Cycle ${to?.number}`;

            return `moved from cicle <span class="highlight">${fromCycleName}</span> to <span class="highlight">${toCycleName}</span>`;
        }
        if (this.item.toCycleId) {
            const toId = this.createId(
                LinearIntegrationDataType.CYCLE,
                this.item.toCycleId,
            );
            const to = this.$entities.linear.getById(toId);
            const toCycleName = to?.name ?? `Cycle ${to.number}`;

            return `added to cycle <span class="highlight">${toCycleName}</span>`;
        }

        if (this.item.fromPriority) {
            const fromId = this.createId(
                LinearIntegrationDataType.PRIORITY,
                this.item.fromPriority,
                false,
            );
            const toId = this.createId(
                LinearIntegrationDataType.PRIORITY,
                this.item.toPriority,
                false,
            );
            const from = this.$entities.linear.getById(fromId);
            const to = this.$entities.linear.getById(toId);
            return `changed priority from <span class="highlight">${
                from?.label ?? 'None'
            }</span> to <span class="highlight">${to?.label ?? 'None'}</span>`;
        }

        if (this.item.fromProjectId) {
            const fromId = this.createId(
                LinearIntegrationDataType.PROJECT,
                this.item.fromProjectId,
            );
            const toId = this.createId(
                LinearIntegrationDataType.PROJECT,
                this.item.toProjectId,
            );
            const from = this.$entities.linear.getById(fromId);
            const to = this.$entities.linear.getById(toId);
            if (!this.item.toProjectId) {
                return `removed from project <span class="highlight">${from.name}</span>`;
            }

            return `changed project from <span class="highlight">${
                from?.name ?? 'None'
            }</span> to <span class="highlight">${to?.name ?? 'None'}</span>`;
        }
        if (this.item.toProjectId) {
            const toId = this.createId(
                LinearIntegrationDataType.PROJECT,
                this.item.toProjectId,
            );
            const to = this.$entities.linear.getById(toId);
            return `added to project <span class="highlight">${to.name}</span>`;
        }

        if (this.item.fromTeamId) {
            const fromId = this.createId(
                LinearIntegrationDataType.TEAM,
                this.item.fromTeamId,
                false,
            );
            const toId = this.createId(
                LinearIntegrationDataType.TEAM,
                this.item.toTeamId,
                false,
            );
            const from = this.$entities.linear.getById(fromId);
            const to = this.$entities.linear.getById(toId);
            return `moved from team <span class="highlight">${from.name}</span> to <span class="highlight">${to.name}</span>`;
        }

        if (this.item.fromParentId) {
            const fromId = this.createId(
                LinearIntegrationDataType.ISSUE,
                this.item.fromParentId,
            );
            const toId = this.createId(
                LinearIntegrationDataType.ISSUE,
                this.item.toParentId,
            );
            const from = this.$entities.linear.getById(fromId);
            const to = this.$entities.linear.getById(toId);

            if (!this.item.toParentId) {
                return `removed parent issue <span class="highlight">${
                    from?.identifier ?? ''
                }</span>`;
            }
            if (!from && !to) {
                return `changed parent issue`;
            }
            return `moved from parent issue <span class="highlight">${
                from?.identifier ?? ''
            }</span> to issue <span class="highlight">${
                to?.identifier ?? ''
            }</span>`;
        }
        if (this.item.toParentId) {
            const toId = this.createId(
                LinearIntegrationDataType.ISSUE,
                this.item.toParentId,
            );
            const to = this.$entities.linear.getById(toId);
            return `added parent issue <span class="highlight">${
                to?.identifier ?? ''
            }</span>`;
        }

        if (this.item.fromDueDate) {
            if (!this.item.toDueDate) {
                return `removed due date <span class="highlight">${this.item.fromDueDate}</span>`;
            }
            return `changed due date from <span class="highlight">${this.item.fromDueDate}</span> to <span class="highlight">${this.item.toDueDate}</span>`;
        }
        if (this.item.toDueDate) {
            return `added due date <span class="highlight">${this.item.toDueDate}</span>`;
        }

        if (this.item.fromEstimate) {
            if (!this.item.toEstimate) {
                return `removed estimate <span class="highlight">${this.item.fromEstimate}</span>`;
            }
            return `changed estimate from <span class="highlight">${this.item.fromEstimate}</span> to <span class="highlight">${this.item.toEstimate}</span>`;
        }
        if (this.item.toEstimate) {
            return `added estimate <span class="highlight">${this.item.toEstimate}</span>`;
        }

        if (this.item.addedLabelIds) {
            const fromIds = this.item.addedLabelIds?.map((id: string) => {
                return this.createId(LinearIntegrationDataType.LABEL, id);
            });
            const toIds = this.item.removedLabelIds?.map((id: string) => {
                return this.createId(LinearIntegrationDataType.LABEL, id);
            });

            const from = fromIds?.map((id: string) => {
                return this.$entities.linear.getById(id);
            });
            const to = toIds?.map((id: string) => {
                return this.$entities.linear.getById(id);
            });

            if (!this.item.removedLabelIds) {
                return `added label <span class="highlight">${from
                    .map((label: any) => label?.name)
                    .join(', ')}</span>`;
            }

            return `added labels <span class="highlight">${from
                .map((label: any) => label?.name)
                .join(
                    ', ',
                )}</span> and removed labels <span class="highlight">${to
                .map((label: any) => label?.name)
                .join(', ')}</span>`;
        }
        if (this.item.removedLabelIds) {
            const toIds = this.item.removedLabelIds?.map((id: string) => {
                return this.createId(LinearIntegrationDataType.LABEL, id);
            });
            const to = toIds?.map((id: string) => {
                return this.$entities.linear.getById(id);
            });
            return `removed label <span class="highlight">${to
                .map((label: any) => label.name)
                .join(', ')}</span>`;
        }
        if (this.item.updatedDescription) {
            return `updated description`;
        }
        if (this.item.fromTitle) {
            return `updated title from <span class="highlight">${this.item.fromTitle}</span> to <span class="highlight">${this.item.toTitle}</span>`;
        }
        if (this.item.autoArchived || this.item.archived) {
            return `archived the issue`;
        }
        if (this.item.autoClosed) {
            return `closed the issue`;
        }
    }
}
</script>
<style lang="scss" scoped>
.linear-issue-history {
    @include font12-500;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    flex-wrap: wrap;
    padding-left: 4px;

    &__icon {
        margin-right: 8px;
    }

    &__actor {
        font-weight: 600;
        color: var(--app-text-color);
    }

    &__text {
        color: $blueGrey300;

        :deep(.highlight) {
            color: var(--app-text-color);
            font-weight: 600;
        }
    }

    &__dot {
        color: $blueGrey300;
    }

    &__date {
        color: $blueGrey300;
    }
}
</style>
