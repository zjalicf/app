<template>
    <node-view-wrapper
        as="span"
        style="white-space: nowrap"
        @mousedown.native="handleMouseDown"
    >
        <img class="ProseMirror-separator" />
        <span
            class="inline-document-link"
            style="white-space: nowrap"
            :class="{ 'has-focus': selected }"
            @click="handleClick"
            ><CalendarIcon size="20" class="icon" /><span
                class="inline-document-link--name"
                style="white-space: normal"
                >{{
                    event
                        ? event.name || event.summary || 'Untitled'
                        : 'Event deleted'
                }}<span class="time" style="white-space: normal">{{
                    event && ` ${formattedDateText}`
                }}</span></span
            ></span
        ><img class="ProseMirror-separator" />
    </node-view-wrapper>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2';
import { Node } from '@tiptap/pm/model';
import { CalendarIcon } from '@vue-hero-icons/solid';
import {
    createRecurrentEvent,
    formatRelativeToDate,
    parseRecurringSuffix,
} from '~/helpers/date';
import { TabSymbols } from '~/constants/symbols';

@Component({
    name: 'InlineEvent',
    components: {
        NodeViewWrapper,
        CalendarIcon,
    },
    props: nodeViewProps,
})
export default class InlineEvent extends Vue {
    node!: Node;
    getPos!: any;
    editor!: any;
    extension: any;
    updateAttributes!: any;

    @Inject(TabSymbols.ENTITY_ID)
    pageId!: string;

    handleMouseDown(e: MouseEvent) {
        if (this.$utils.isMobile) {
            e.preventDefault();
        }
    }

    get event() {
        const { id } = this.node.attrs;
        if (id.includes('apple_calendar')) {
            return this.$store.getters['integrationData/byId'](id);
        }
        return this.$store.getters[`event/byId`](id);
    }

    get formattedDateText() {
        if (!this.event) return;
        const now = new Date();
        return formatRelativeToDate(
            this.event,
            now,
            true,
            this.$store.getters['appSettings/dateTimeOptions'],
        );
    }

    handleClick() {
        if (!this.event || this.$utils.isMobile) return;

        this.$vfm.show({
            component: () => import('~/components/event/modal/EventModal.vue'),
            bind: {
                event: {
                    ...this.event,
                    startObject: this.event.start,
                    endObject: this.event.end,
                },
            },
        });
    }

    mounted() {
        const { id } = this.node.attrs;

        if (id.includes('google_calendar')) {
            const dateSuffix = id.split('_').slice(-1).join('');
            if (!dateSuffix) return;
            const parentId = id.split('_').slice(0, -1).join('_');
            const parentEvent = this.$store.getters['event/byId'](parentId);
            if (!parentEvent) return;
            const recurringEvent = createRecurrentEvent(
                parentId,
                parentEvent,
                // @ts-ignore
                parseRecurringSuffix(dateSuffix),
            );
            this.$store.commit('event/update', {
                ...recurringEvent,
                linkedDocumentId: this.pageId,
            });
        }
    }
}
</script>

<style lang="scss" scoped>
.has-focus[data-node-view-wrapper] .ProseMirror-separator,
.has-focus[data-node-view-wrapper] {
    user-select: none;
}

.inline-document-link {
    position: relative;
    background: var(--editor-extension-document-link-bg-color);
    border-radius: 6px;
    padding: 2px 4px 2px 2px;
    cursor: default;
    -webkit-box-decoration-break: clone;
    -o-box-decoration-break: clone;
    box-decoration-break: clone;
    font-size: 16px;
    line-height: 24px;

    .time {
        color: var(--accent-color);
    }

    &--wrapper {
        display: inline-flex;
    }

    &:hover:not(.open),
    &.has-focus {
        background: var(--editor-extension-document-link-bg-color__hover);
        user-select: none;
        border: 2px solid var(--accent-color);
        padding: 1px 2px 1px 0px;

        .icon {
            color: var(--editor-extension-document-link-icon-color__hover);
        }
    }

    > .icon {
        color: var(--editor-extension-document-link-icon-color);
        position: relative;
        top: -2px;
        display: inline;
        width: 20px;
        height: 20px;
        margin-right: 2px;
    }
}
</style>
