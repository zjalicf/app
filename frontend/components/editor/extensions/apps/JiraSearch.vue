<template>
    <div
        ref="issues"
        class="jira-search-component"
        :class="{
            selected: selected,
        }"
        draggable="true"
        data-drag-handle
        contenteditable="false"
    >
        <div class="jira-search-component__wrapper">
            <div class="jira-search-component__icon">
                <JiraIcon size="18" class="icon" />
            </div>
            <div class="jira-search-component__input">
                <span ref="shadow" class="jira-search-component__input__shadow">
                    <span style="visibility: hidden">{{
                        text || shadowValue || placeholder
                    }}</span>
                </span>
                <input
                    ref="input"
                    type="text"
                    autocomplete="off"
                    autocapitalize="off"
                    spellcheck="false"
                    :value="text"
                    :placeholder="placeholder"
                    @input="handleInput"
                    @keydown.esc="$emit('close')"
                    @keydown.backspace="handleBackspace"
                    @keydown.down.prevent.stop="handleKeyDown"
                    @keydown.up.prevent.stop="handleKeyUp"
                    @keydown.enter.prevent.stop="handleEnter"
                    @blur="handleBlur"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { CalendarIcon } from '@vue-hero-icons/solid';
import { Node } from '@tiptap/pm/model';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import { SearchServiceAction, ServiceKey } from '~/constants';
import { AcreomJiraIssue } from '~/components/task/model';
import { JiraIntegrationDataType } from '~/constants/jira';
import JiraSuggestions from '~/components/editor/extensions/apps/JiraSuggestions.vue';

@Component({
    name: 'JiraIssueComponent',
    components: {
        JiraIcon,
        CalendarIcon,
    },
})
export default class JiraIssueComponent extends Vue {
    open: boolean = true;
    text: string = '';
    placeholder: string = 'Search Jira Issues';
    shadowValue: string = '';

    selectedIndex: number = 0;
    node!: Node;
    editor!: any;
    canBlur: boolean = true;
    results: AcreomJiraIssue[] = [];

    @Prop({ default: false })
    selected!: boolean;

    $refs!: {
        input: HTMLInputElement;
        shadow: HTMLSpanElement;
        issues: HTMLElement;
    };

    recalculateWidth() {
        this.$nextTick(() => {
            const width = this.$refs.shadow.offsetWidth! + 2;
            this.$refs.input.style.width = `${Math.min(width, 473)}px`;
        });
    }

    handleInputSpecific() {
        this.shadowValue =
            this.text.length === 0 ? this.placeholder : this.text;
        this.recalculateWidth();
    }

    handleInput(e: InputEvent): void | Promise<void> {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        this.$emit('input', target.value);
        this.text = target.value;

        this.handleInputSpecific();

        if (this.text.trim().length <= 0) {
            this.selectedIndex = 0;
            this.results = [];

            // this.suggestions = [];
        }

        this.setResults();
        // this.debouncedSetSuggestion();
    }

    handleBlur() {
        if (!this.canBlur) return;
        this.$dropdown.hideAll();
        this.$emit('close');
    }

    handleEnter(event?: KeyboardEvent) {
        if (event && event.isComposing && !this.$utils.isMobile) return;
        if (this.results.length === 0) return;
        if (!this.text.trim().length) {
            this.canBlur = true;
            return;
        }
        this.canBlur = false;

        this.handleIssueSelect(
            this.results[this.selectedIndex],
            event?.shiftKey,
        );
    }

    handleClick() {
        this.canBlur = false;
        this.handleIssueSelect(this.results[this.selectedIndex], false);
    }

    // @Watch('text')
    async setResults() {
        if (!this.text.length) return [];
        const activeVault = this.$store.getters['vault/active'];
        const [results] = await Promise.all([
            this.$serviceRegistry
                .invoke<{ documents: AcreomJiraIssue[] }>(
                    ServiceKey.SEARCH,
                    SearchServiceAction.QUERY,
                    {
                        query: this.text,
                        options: {
                            fields: ['title'],
                            activeVault,
                            thisVaultOnly: true,
                            entity: JiraIntegrationDataType.ISSUE,
                            skipCreateDailyDocIfNeeded: true,
                        },
                    },
                )
                .then(data => data?.documents)
                .catch(() => this.results),
        ]);
        const thisVaultDocs =
            results?.filter(({ vaultId }: any) => vaultId === activeVault.id) ??
            [];

        this.results = [...thisVaultDocs.slice(0, 5)];
    }

    createPopper() {
        this.$dropdown.hideAll();
        if (
            this.text.trim().length === 0 ||
            !this.open ||
            this.results.length === 0
        )
            return;
        this.$dropdown.show({
            parent: this.$refs.issues,
            component: JiraSuggestions,
            retainFocus: true,
            backdrop: false,
            // placement: 'bottom-start',
            popperOptions: {
                modifiers: [
                    {
                        name: 'flip',
                        options: {
                            fallbackPlacements: ['top-start'],
                            boundary: document.getElementById('editor-wrapper'),
                        },
                    },
                ],
            },
            bind: {
                'selected-index': this.selectedIndex,
                results: this.results,
            },
            on: {
                select: () => {
                    this.handleClick();
                },
                'select:index': (index: number) => {
                    this.selectedIndex = index;
                },
            },
        });
    }

    handleIssueSelect(issue: AcreomJiraIssue, redirect: boolean = false) {
        this.$emit('issue:select', issue, redirect);
        this.$dropdown.hideAll();

        this.$nextTick(() => {
            this.open = false;
        });
    }

    @Watch('value')
    @Watch('selectedIndex')
    handleSelectedIndexChange() {
        this.createPopper();
    }

    @Watch('results')
    handleResultsChange(curr: any[]) {
        this.createPopper();
        if (this.selectedIndex >= curr.length && curr.length > 0) {
            this.selectedIndex = curr.length - 1;
        }
    }

    handleKeyDown() {
        if (this.results.length === 0) return;
        if (this.selectedIndex === this.results.length - 1) {
            this.selectedIndex = 0;
        } else {
            this.selectedIndex++;
        }
    }

    handleKeyUp() {
        if (this.results.length === 0) return;
        if (this.selectedIndex === 0) {
            this.selectedIndex = this.results.length - 1;
        } else {
            this.selectedIndex--;
        }
    }

    handleBackspace() {
        if (this.text === '') {
            this.$emit('close');
        }
    }

    mounted() {
        this.recalculateWidth();
        this.$nextTick(() => {
            this.$refs.input.focus({
                preventScroll: true,
            });
        });
        this.shadowValue = this.placeholder;
    }
}
</script>

<style lang="scss" scoped>
.jira-search-component {
    display: flex;
    position: relative;

    &__wrapper {
        display: flex;
        border-radius: 8px;
        background: var(--editor-extension-document-link-bg-color);
        margin-top: 2px;
        cursor: default;
        -webkit-box-decoration-break: clone;
        -o-box-decoration-break: clone;
        box-decoration-break: clone;
        align-items: center;
    }

    &__icon {
        margin-right: 4px;
        margin-left: 6px;
        padding: 3px;
        flex-shrink: 0;
    }

    &__input {
        padding-right: 4px;

        &__shadow {
            position: absolute;
            visibility: hidden;
            overflow: hidden;
            font-weight: 400;
            font-size: 16px;
            line-height: 24px;
            max-width: 473px;
            white-space: pre;
        }

        input {
            position: relative;
            outline: none;
            font-weight: 400;
            font-size: 16px;
            line-height: 24px;
            padding: 1px 0px;
            width: 0;
            max-width: 473px;

            &::placeholder {
                color: var(--editor-extension-placeholder-color);
            }
        }
    }
}
</style>
