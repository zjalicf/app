<template>
    <div
        ref="dragInfo"
        :style="{ '--depth': draggedItem ? draggedItem.level || 1 : 1 }"
        class="folder-drag-ghost"
    >
        <div
            v-if="draggedItem && (draggedItem.icon || draggedItem.clip)"
            class="custom-icon icon"
        >
            <DocumentIcon :document="item" />
        </div>
        <div v-else class="icon-wrapper">
            <InterfaceFolder v-if="isFolder" class="icon" size="14" />
            <InterfaceFavoriteStar
                v-else-if="draggedType === TabType.MY_DAY"
                class="icon"
            />
            <JiraIcon
                v-else-if="draggedType === TabType.JIRA_APP"
                class="icon"
                size="14"
            />
            <ViewIcon
                v-else-if="draggedType === TabType.VIEW && entityId"
                :id="entityId"
                class="icon"
            />
            <InterfaceContentFileAlternate v-else class="icon" size="14" />
        </div>
        <p>
            {{ name }}
        </p>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import InterfaceFolder from '~/components/streamline/InterfaceFolder.vue';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import InterfaceSearchCircle from '~/components/streamline/InterfaceSearchCircle.vue';
import { TabType } from '~/constants';
import InterfaceFavoriteStar from '~/components/streamline/InterfaceFavoriteStar.vue';
import InterfaceFileDouble from '~/components/streamline/InterfaceFileDouble.vue';
import InterfaceValidationCheckSquare1 from '~/components/streamline/InterfaceValidationCheckSquare1.vue';
import InterfaceCalendar from '~/components/streamline/InterfaceCalendar.vue';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceLogoutCircle from '~/components/streamline/InterfaceLogoutCircle.vue';
import InterfaceContentArchive from '~/components/streamline/InterfaceContentArchive.vue';
import InProgressIcon from '~/components/icons/InProgressIcon.vue';
import ViewIcon from '~/components/view/ViewIcon.vue';

@Component({
    name: 'DraggingInfo',
    computed: {
        TabType() {
            return TabType;
        },
    },
    components: {
        ViewIcon,
        InProgressIcon,
        InterfaceContentArchive,
        InterfaceLogoutCircle,
        DocumentIcon,
        JiraIcon,
        InterfaceCalendar,
        InterfaceValidationCheckSquare1,
        InterfaceFileDouble,
        InterfaceFavoriteStar,
        InterfaceFolder,
        InterfaceContentFileAlternate,
        InterfaceSearchCircle,
    },
})
export default class DraggingInfo extends Vue {
    $refs!: {
        dragInfo: HTMLElement;
    };

    @Prop({ required: true })
    draggedItem!: any;

    @Prop({ default: 0 })
    offsetTop!: number;

    @Prop({ default: 0 })
    offsetLeft!: number;

    @Watch('offsetTop')
    onOffsetTopHandler(newValue: any) {
        const $dragInfo = this.$refs.dragInfo;
        ($dragInfo as any).style.top = `${
            newValue - this.draggedItem?.offsetY || 0
        }px`;
    }

    @Watch('offsetLeft')
    onOffsetLeftHandler(newValue: any) {
        const $dragInfo = this.$refs.dragInfo;
        ($dragInfo as any).style.left = `${
            newValue - this.draggedItem?.offsetX || 0
        }px`;
    }

    get isDocument() {
        return this.draggedItem?.type === 'document';
    }

    get isFolder() {
        return this.draggedItem?.type === 'folder';
    }

    get draggedType() {
        return this.draggedItem?.type ?? null;
    }

    get entityId() {
        return this.draggedItem.data?.viewId ?? null;
    }

    get item() {
        let props = { ...this.draggedItem };
        if (this.draggedItem.clip && this.draggedItem.clip.id) {
            props = { ...props, clip: this.draggedItem.clip.id };
        }
        return props;
    }

    get name() {
        if (this.draggedItem?.name) return this.draggedItem.name;
        if (this.isDocument) return 'Untitled';
        if (this.isFolder) return 'New Folder';
        return 'Unknown';
    }
}
</script>
<style lang="scss" scoped>
.folder-drag-ghost {
    position: absolute;
    z-index: 2;
    pointer-events: none;
    display: flex;
    align-items: center;
    font-size: 13px;
    padding: 4px 6px 4px calc(((var(--depth) - 1) * 26px) + 21px);
    max-width: 360px;
    border-radius: 6px;
    width: calc(var(--sidebar-width) - 20px);
    font-weight: 500;
    line-height: 20px;
    color: var(--dragging-info-text-color);
    background: var(--dragging-info-bg-color);
    opacity: 0.83;

    p {
        @include ellipsis;
        width: 100%;
    }

    .icon-wrapper {
        padding: 1px;
        flex-shrink: 0;
    }

    .icon {
        color: var(--dragging-info-icon-color);
        margin-right: 10px;
    }

    .custom-icon {
        width: 16px;
        height: 16px;
        font-size: 20px;
        border-radius: 4px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        flex-shrink: 0;

        span {
            font-size: 14px;
            font-family: 'Apple Color Emoji', 'Segoe UI Emoji', NotoColorEmoji,
                'Noto Color Emoji', 'Segoe UI Symbol', 'Android Emoji',
                EmojiSymbols, serif;
        }
    }
}
</style>
