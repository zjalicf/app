<template>
    <div
        class="jira-editor-component"
        :class="{
            selected,
            multiselect: isElementSelected,
            'context-highlight': contextMenuOpen,
        }"
        draggable="true"
        data-drag-handle
        contenteditable="false"
    >
        <div class="jira-editor-component__wrapper">
            <div class="jira-editor-component__icon">
                <img
                    v-if="issueType"
                    :src="issueType.iconUrl"
                    :alt="issueType.name"
                />
            </div>
            <span class="jira-editor-component--key">{{ entity.key }}</span>
            <span class="jira-editor-component--text">{{ text }}</span>
            <span class="jira-editor-component--date">
                {{ formattedDateText }}</span
            >
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { CalendarIcon } from '@vue-hero-icons/solid';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import { formatRelativeToDate } from '~/helpers';

@Component({
    name: 'JiraIssueComponent',
    components: {
        JiraIcon,
        CalendarIcon,
    },
})
export default class JiraIssueComponent extends Vue {
    @Prop()
    entityId!: string;

    @Prop({ default: false })
    selected!: boolean;

    @Prop({ default: false })
    isElementSelected!: boolean;

    @Prop({ required: true })
    contextMenuOpen!: boolean;

    get entity() {
        return this.$store.getters['integrationData/byId'](this.entityId) ?? {};
    }

    get issueType() {
        return this.entity.properties?.issuetype;
    }

    get text() {
        return this.entity?.text ?? '';
    }

    get formattedDateText() {
        if (!this.entity) return;
        const now = new Date();
        return formatRelativeToDate(
            this.entity,
            now,
            true,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }
}
</script>

<style lang="scss" scoped>
.has-focus[data-node-view-wrapper] .ProseMirror-separator,
.has-focus[data-node-view-wrapper] {
    user-select: none;
}

.multiselect.jira-editor-component {
    background: var(--editor-extension-highlight-bg-color);
    border-radius: 0px !important;

    &:hover {
        background: var(--editor-extension-highlight-bg-color) !important;
    }
}

.ProseMirror-focused .selected {
    background: var(--editor-extension-selected-bg-color);
    box-shadow: inset 0px 0px 0px 2px
        var(--editor-extension-selected-box-shadow-color);
}

.focused.jira-editor-component {
    background: var(--editor-extension-selected-bg-color);
    box-shadow: inset 0px 0px 0px 2px
        var(--editor-extension-selected-box-shadow-color);
}

.context-highlight.jira-editor-component:active {
    background: var(--editor-extension-active-bg-color);
}

.context-highlight.jira-editor-component {
    background: var(--editor-extension-active-bg-color);
}

.jira-editor-component {
    margin: 1px 0;
    display: flex;
    align-items: center;
    border-radius: 6px;

    &__wrapper {
        width: 100%;
        padding: 1px 5px 1px 0px;
        border-radius: 6px;
        position: relative;
        gap: 4px;
        user-select: none;
        -webkit-user-select: none;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    &__icon {
        padding: 5px 4px 5px 2px;
        margin-left: 3px;
        flex-shrink: 0;

        img {
            display: block;
        }
    }

    &:hover {
        background: var(--editor-extension-selected-bg-color);
    }

    &--key {
        color: var(--editor-extension-jira-key-color);
        font-weight: 500;
        white-space: nowrap;
        font-size: 16px;
        line-height: 20px;
    }

    &--text {
        @include ellipsis;
        font-size: 16px;
        outline: none;
        color: var(--app-text-color);
        cursor: default;
        min-width: 0;
        line-height: 20px;
    }

    &--date {
        white-space: nowrap;
        color: var(--accent-color);
        line-height: 20px;
        font-size: 16px;
        display: flex;
        align-items: center;
    }
}
</style>
