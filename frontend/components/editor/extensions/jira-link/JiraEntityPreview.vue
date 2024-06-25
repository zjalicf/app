<template>
    <div
        class="jira-entity-preview"
        @mouseover="handleMouseOver"
        @mouseleave="handleMouseLeave"
        @click="$emit('click')"
    >
        <div class="jira-entity-preview__header">
            <span v-if="sprint" class="jira-entity-preview__sprint"
                ><span
                    v-if="sprint.active"
                    class="jira-entity-preview__sprint__state"
                    :class="{ active: sprint.active }"
                ></span
                ><span v-if="sprint">{{ sprint.name }}</span></span
            >
            <span>{{ date }}</span>
        </div>
        <div class="jira-entity-preview__title">
            {{ entity.text }}
        </div>
        <div class="jira-entity-preview__footer">
            <div class="jira-entity-preview__footer__item">
                <component
                    :is="statusProperties.icon"
                    v-if="statusProperties"
                    :style="{ color: statusProperties.color }"
                /><span class="status-name">{{ status.name }}</span>
            </div>
            <img
                v-if="hasAssignee"
                :src="assigneeAvatar"
                class="assignee-avatar"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { formatDistance } from 'date-fns';

@Component({
    name: 'JiraEntityPreview',
    components: {},
})
export default class JiraEntityPreview extends Vue {
    @Prop({ required: true })
    id!: string;

    get entity() {
        return this.$entities.jira.getById(this.id);
    }

    get properties() {
        return this.entity.properties;
    }

    get assignee() {
        return this.$entities.jira.getById(this.properties.assignee);
    }

    get hasAssignee() {
        return !!this.assignee;
    }

    get assigneeAvatar() {
        return this.assignee?.user?.avatarUrls['24x24'];
    }

    get status() {
        const status = this.$entities.jira.getStatusById(
            this.properties?.status,
        );

        if (!status) {
            return {
                name: 'Unknown',
                iconUrl: '',
                statusCategory: 'UNKNOWN',
            };
        }

        return status.status;
    }

    get statusProperties() {
        return this.$entities.jira.getStatusProperties(this.status);
    }

    get sprint() {
        if (!this.properties?.sprints?.length) return null;
        const activeSprint = this.properties.sprints.find(
            (sprint: any) => sprint.state === 'active',
        );
        if (activeSprint) {
            return {
                name: activeSprint.name,
                active: true,
            };
        }
        return {
            name: this.properties.sprints[0].name,
            active: false,
        };
    }

    get date() {
        return formatDistance(new Date(this.properties.updated), new Date(), {
            addSuffix: true,
        });
    }

    handleMouseOver() {
        this.$emit('enter');
    }

    handleMouseLeave() {
        this.$emit('leave');
    }
}
</script>
<style lang="scss" scoped>
.jira-entity-preview {
    @include frostedGlassBackground;
    border-radius: 8px;
    padding: 10px 15px;
    min-width: 230px;
    max-width: 500px;
    cursor: default;
    position: relative;

    &__header {
        display: flex;
        justify-content: space-between;
        @include font12-400;
        color: var(--github-view-header-number-color);
    }

    &__sprint {
        display: flex;
        align-items: center;
        gap: 6px;
        @include font12-400;
        color: var(--github-view-header-number-color);

        &__state {
            width: 7px;
            height: 7px;
            border-radius: 50%;

            margin-left: 1px;

            &:not(.active) {
                background: $blueGrey500;
            }

            &.active {
                background: #2c9552;
                animation: blink 3s infinite ease-in-out;
            }

            @keyframes blink {
                0%,
                100% {
                    box-shadow: 0 0 10px #2c9552;
                }
                50% {
                    box-shadow: 0 0 4px #2c9552;
                }
            }
        }
    }

    &__title {
        @include font14-600;
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        color: var(--jira-view-title-color);
        margin-bottom: 6px;
    }

    &__footer {
        padding-top: 2px;
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: space-between;

        &__item {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            @include font12-600;
        }

        .assignee-avatar {
            max-width: 20px;
            max-height: 20px;
            border-radius: 50%;
        }
    }

    &__labels {
        margin-top: 6px;
    }
}
</style>
