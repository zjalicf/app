<template>
    <div class="cm-pages-dropdown">
        <button class="cm-pages-dropdown--button" @click="changePage(null)">
            <div class="cm-pages-dropdown--left">
                <p class="cm-pages-dropdown--text">No Page</p>
            </div>
            <CheckIcon v-if="!selectedPage" class="right-icon" size="16" />
        </button>
        <button
            v-for="page in pages"
            :key="page.id"
            class="cm-pages-dropdown--button"
            @click="changePage(page.id)"
        >
            <div class="cm-pages-dropdown--left">
                <DocumentIcon
                    :document="page"
                    :size="14"
                    :font-size="12"
                    class="doc-icon"
                />
                <p class="cm-pages-dropdown--text">
                    {{ page.label || 'Untitled' }}
                </p>
            </div>
            <CheckIcon
                v-if="selectedPage && selectedPage.id === page.id"
                class="right-icon"
                size="16"
            />
        </button>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { CheckIcon } from '@vue-hero-icons/solid';
import { ITask } from '~/components/task/model';
import InterfaceContentFileAlternate from '~/components/streamline/InterfaceContentFileAlternate.vue';
import DocumentIcon from '~/components/document/DocumentIcon.vue';
import InterfaceFileRemoveAlternate from '~/components/streamline/InterfaceFileRemoveAlternate.vue';

@Component({
    name: 'PagesOptionsDropdown',
    components: {
        InterfaceFileRemoveAlternate,
        DocumentIcon,
        InterfaceContentFileAlternate,
        CheckIcon,
    },
})
export default class PagesOptionsDropdown extends Vue {
    @Prop()
    task!: ITask;

    @Prop({ default: () => [] })
    pages!: any;

    get selectedPage() {
        return this.$store.getters['document/documentByTaskId'](this.task.id);
    }

    changePage(newPage: string | null) {
        if (this.selectedPage?.id === newPage) {
            return;
        }
        if (newPage === null && !this.selectedPage?.id) {
            return;
        }

        this.$emit('close');
        this.$emit(`page:set`, newPage);
    }
}
</script>
<style lang="scss" scoped>
.cm-pages-dropdown {
    @include frostedGlassBackground;
    @include scrollbar;
    @include font12-500;
    width: 190px;
    color: var(--dropdown-context-labels-text-color);
    border-radius: 8px;
    outline: none;
    max-height: 250px;
    overflow-y: overlay;
    padding: 5px 4px;

    &--left {
        @include ellipsis;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;

        .doc-icon {
            margin-right: 8px;
            color: var(--dropdown-context-labels-icon-color);
        }
    }

    &--text {
        @include ellipsis;
        width: 100%;
        text-align: left;
    }

    .right-icon {
        color: var(--dropdown-context-labels-icon-color);
        flex-shrink: 0;
    }

    &--button {
        padding: 5px 10px;
        color: var(--dropdown-context-labels-button-color);
        width: 100%;
        justify-content: space-between;
        display: flex;
        align-items: center;
        border-radius: 6px;

        &:hover {
            @include frostedGlassButton;
            color: var(--dropdown-context-labels-button-color__hover);
        }
    }
}
</style>
