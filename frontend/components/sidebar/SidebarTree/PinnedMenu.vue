<template>
    <div v-if="localDocs.length" class="pinned-menu" :style="{ '--depth': 1 }">
        <div class="pinned-menu__title">
            <button tabindex="-1" @click="expanded = !expanded">Pinned</button>
        </div>
        <div v-if="expanded" class="pinned-menu__list">
            <PinTree class="root" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import isEqual from 'lodash/isEqual';
import TreeItem from './TreeItem.vue';
import { IDocument } from '~/components/document/model';
import PinTree from '~/components/sidebar/SidebarTree/PinTree.vue';

@Component({
    name: 'PinnedMenu',
    components: {
        PinTree,
        TreeItem,
    },
})
export default class PinnedMenu extends Vue {
    expanded: boolean = true;
    localDocs: IDocument[] = [];

    @Watch('pinnedDocuments')
    handlePinnedDocumentsChange(newValue: any, oldValue: any) {
        if (isEqual(newValue, oldValue)) return;

        this.localDocs = newValue;
    }

    get pinnedDocuments() {
        return this.$store.getters['document/pinned'];
    }

    get activeProject() {
        if (this.$route.name === 'documents-id') {
            return this.$route.params.id;
        }

        return null;
    }

    isSelected(id: string) {
        return id === this.activeProject;
    }

    mounted() {
        this.localDocs = this.pinnedDocuments;
    }
}
</script>
<style lang="scss" scoped>
.pinned-menu {
    &__title {
        padding: 10px 16px 2px 14px;
        user-select: none;

        button {
            @include animateBackgroundColor;
            display: block;
            outline: none;
            font-style: normal;
            font-weight: 600;
            font-size: 12px;
            line-height: 17px;
            color: var(--sidebar-group-button-text-color);
            padding: 1px 8px 2px;
            border-radius: 6px;

            &:hover {
                color: var(--sidebar-group-button-text-color__hover);
                background: var(--sidebar-group-button-bg-color__hover);
            }
        }
    }

    &__list {
        padding: 0 10px;
    }
}
</style>
