<template>
    <node-view-wrapper
        ref="viewWrapper"
        as="pre"
        class="mermaid-wrapper"
        :class="{
            'is-gap-active': gapCursorActive,
        }"
    >
        <div
            class="mermaid-wrapper--renderer"
            contenteditable="false"
            @click="onClick"
        >
            <div
                v-if="errorMessage.length"
                ref="error"
                class="mermaid-wrapper--renderer--error"
                :class="{ 'is-rendered': isRendered }"
                contenteditable="false"
            >
                <div
                    v-for="(message, index) of errorMessage"
                    :key="index"
                    contenteditable="false"
                >
                    {{ message }}
                </div>
            </div>
            <div class="mermaid-wrapper--renderer--render">
                <div
                    id="mermaid"
                    ref="mermaidDiv"
                    class="mermaid-wrapper--renderer--render--content"
                    contenteditable="false"
                    v-html="code"
                ></div>
            </div>
        </div>
    </node-view-wrapper>
</template>

<script lang="ts">
import { Component, Inject, Vue, Watch } from 'vue-property-decorator';
import {
    Editor,
    NodeViewContent,
    nodeViewProps,
    NodeViewWrapper,
} from '@tiptap/vue-2';
import { Node } from '@tiptap/pm/model';
import { v4 } from 'uuid';
import MermaidModal from '~/components/modal/MermaidModal.vue';
import { ThemeOptions } from '~/helpers/date';
import {
    TrackingAction,
    TrackingActionSource,
    TrackingType,
} from '~/@types/tracking';
import { TrackEvent } from '~/helpers/decorators';
import { TabSymbols } from '~/constants/symbols';

@Component({
    name: 'CodeBlockComponent',
    components: {
        NodeViewWrapper,
        NodeViewContent,
    },
    props: nodeViewProps,
})
export default class CodeBlockComponent extends Vue {
    @Inject({ from: TabSymbols.TAB_ID, default: null })
    tabId!: string | null;

    node!: Node;
    extension!: any;
    editor!: Editor;
    selected!: boolean;
    mermaidId: string = `mermaid-${Buffer.from(v4()).toString('base64')}`;
    errorMessage: string[] = [];
    isRendered: boolean = false;
    errorTimeout!: any;
    updateAttributes!: Function;
    gapCursorActive: boolean = false;
    code: string = '';

    $refs!: {
        mermaidDiv: HTMLDivElement;
        viewWrapper: Vue;
        error: HTMLDivElement;
    };

    get tabType() {
        const id = this.tabId as string;
        const tab = this.$entities.tab.byId(id);

        if (tab) {
            return tab.type;
        }

        return null;
    }

    @Watch('node.attrs.expression')
    handleExpressionChange() {
        this.renderMermaid();
    }

    @Watch('editor.state.selection.jsonID', { immediate: true })
    handleSelected() {
        this.gapCursorActive =
            // @ts-ignore
            this.editor?.state.selection.jsonID === 'gapcursor';
    }

    async renderMermaid() {
        try {
            const expression =
                this.node?.attrs?.expression?.replace(/\\n/g, '\n') || '';

            const { default: mermaid } = await import('mermaid');
            await mermaid.mermaidAPI.parse(expression);

            const { svg } = (await mermaid.mermaidAPI.render(
                this.mermaidId,
                expression,
            )) as any;

            if (!this.$refs.mermaidDiv) return;
            this.isRendered = true;
            this.errorMessage = [];
            this.code = svg;
            this.recalculateHeight();
        } catch (error: any) {
            this.errorMessage = error.message.split('\n') || [];
            this.code = '';
            this.recalculateHeight();
        }
    }

    _openMermaidModal() {
        if (this.$utils.isMobile || !this.editor.isEditable) return;
        this.$vfm!.show({
            component: MermaidModal,
            bind: {
                content:
                    this.node?.attrs?.expression?.replace(/\\n/g, '\n') || '',
            },
            on: {
                onComplete: (expression: string) => {
                    this.updateAttributes({
                        expression: expression.replace(/\n/g, '\\n'),
                    });
                    this.$tracking.trackEventV2(TrackingType.MERMAID, {
                        action: TrackingAction.SAVE,
                    });
                },
                closed: () => {
                    this.$tracking.trackEventV2(TrackingType.MERMAID, {
                        action: TrackingAction.CLOSE,
                    });
                },
            },
        });
    }

    @TrackEvent(TrackingType.MERMAID, {
        action: TrackingAction.OPEN,
        source: TrackingActionSource.SHORTCUT,
    })
    openWithShortcut() {
        this._openMermaidModal();
    }

    @TrackEvent(TrackingType.MERMAID, {
        action: TrackingAction.OPEN,
        source: TrackingActionSource.AUTOCOMPLETE,
    })
    openWithAutocomplete() {
        this._openMermaidModal();
    }

    @TrackEvent(TrackingType.MERMAID, {
        action: TrackingAction.OPEN,
        source: TrackingActionSource.CLICK,
    })
    onClick() {
        this._openMermaidModal();
    }

    recalculateHeight() {
        this.$nextTick(() => {
            const errorHeight = this.$refs.error?.offsetHeight!;
            const mermaidHeight = this.$refs.mermaidDiv?.offsetHeight!;
            if (!this.$refs.mermaidDiv) return;
            if (
                errorHeight &&
                this.isRendered &&
                errorHeight >= mermaidHeight
            ) {
                this.$refs.mermaidDiv.style.height = `${errorHeight}px`;
            } else {
                this.$refs.mermaidDiv.style.height = '';
            }
        });
    }

    async mounted() {
        const { default: mermaid } = await import('mermaid');
        if (this.node.attrs.new) {
            this.updateAttributes({ new: undefined });
            this.openWithAutocomplete();
        }

        this.$nuxt.$on('mermaid:enter', () => {
            if (
                this.editor.isActive('mermaid-component') &&
                this.selected &&
                this.$refs?.viewWrapper?.$el?.classList?.contains('has-focus')
            ) {
                return this.openWithShortcut();
            }
        });
        const theme =
            this.$store.getters['appSettings/theme'] === ThemeOptions.DARK
                ? 'dark'
                : 'default';

        mermaid.mermaidAPI.initialize({
            theme,
            // @ts-ignore
            themeVariables: {
                fontSize: '14px',
            },
        });
        this.renderMermaid();
    }
}
</script>

<style lang="scss" scoped>
.mermaid-wrapper {
    &:not(.has-focus) {
        padding: 4px;
    }

    &.has-focus {
        padding: 4px;

        &:not(.is-gap-active) {
            user-select: none;
            border: 2px solid var(--accent-color);
            padding: 2px;
        }
    }

    &--renderer {
        width: 100%;
        position: relative;

        &--error {
            width: 100%;
            border-radius: 6px;
            padding: 6px;
            font-size: 12px;
            color: var(--danger-color);

            &.is-rendered {
                position: absolute;
            }
        }

        &--render {
            width: 100%;

            &--content {
                display: flex;
                justify-content: center;
            }
        }
    }
}
</style>
