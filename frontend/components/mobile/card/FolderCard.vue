<template>
    <NuxtLink
        v-longpress.prevent.hapticend="openContextMenu"
        tag="div"
        :title="folder.name || 'New Folder'"
        :to="{
            path: `/mobile/folder/${folder.id}`,
            query: {
                level: level,
            },
        }"
    >
        <div class="folder-card">
            <div class="folder-card__title">
                <div v-if="folder.icon" class="custom-icon icon">
                    <span>{{ folder.icon }}</span>
                </div>
                <FolderIcon
                    v-else-if="folder.type === 'folder'"
                    class="icon"
                    size="20"
                />
                {{ folder.name || 'New Folder' }}
            </div>
        </div>
    </NuxtLink>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FolderIcon } from '@vue-hero-icons/solid';
import FolderDropdown from '~/components/mobile/common/dropdown/FolderDropdown.vue';

@Component({
    name: 'FolderCard',
    components: {
        FolderIcon,
    },
})
export default class FolderCard extends Vue {
    @Prop()
    folder!: any;

    @Prop({
        default: null,
    })
    level!: number | null;

    openContextMenu() {
        this.$pane.show({
            component: FolderDropdown,
            bind: {
                folder: this.folder,
            },
            type: 'dropdown',
        });
    }
}
</script>
<style lang="scss" scoped>
.folder-card {
    @include animateBackgroundColor;
    user-select: none;
    cursor: default;
    padding: 12px 15px;
    border: 1px solid var(--document-card-border-color);
    border-radius: 8px;

    &:hover,
    &.highlight {
        background: var(--document-card-bg-color_hover);
        box-shadow: var(--document-card-box-shadow__hover);
        text-decoration: none !important;
    }

    &__title {
        @include ellipsis;
        display: flex;
        align-items: center;
        color: var(--folder-card-title-color);
        font-weight: 500;
        font-size: 15px;
        line-height: 155.2%;

        .icon {
            flex-shrink: 0;
            color: var(--folder-card-title-color__hover);
            margin-right: 12px;
        }
    }
}
</style>
