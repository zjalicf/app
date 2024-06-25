<template>
    <div class="mobile-documents-header">
        <div class="mobile-documents-header__back">
            <button @click="back">
                <ChevronLeftIcon class="icon" size="24" />
            </button>
        </div>
        <div class="mobile-documents-header__title">
            <div v-if="folder.icon">
                <component
                    :is="folder.icon"
                    v-if="folder.icon.name"
                    class="icon"
                    size="20"
                />
                <div v-else class="custom-icon icon">
                    <span>{{ folder.icon }}</span>
                </div>
            </div>
            <FolderIcon
                v-else-if="folder.type !== 'search'"
                class="icon"
                size="20"
            />
            <InterfaceSearch v-else class="icon" size="16" />
            {{
                folder.name ||
                (folder.type === 'search' ? 'New Saved Search' : 'New Folder')
            }}
        </div>
        <div class="mobile-documents-header__options">
            <button @click="openDropdown">
                <DotsHorizontalIcon class="icon" size="24" />
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { ChevronLeftIcon } from '@vue-hero-icons/outline';
import { FolderIcon, DotsHorizontalIcon } from '@vue-hero-icons/solid';
import FolderDropdown from '~/components/mobile/common/dropdown/FolderDropdown.vue';
import InterfaceSearch from '~/components/streamline/InterfaceSearch.vue';

@Component({
    name: 'MobileFolderHeader',
    components: {
        ChevronLeftIcon,
        FolderIcon,
        DotsHorizontalIcon,
        InterfaceSearch,
    },
})
export default class MobileFolderHeader extends Vue {
    @Prop({
        required: true,
    })
    folder!: any;

    back() {
        this.$router.back();
    }

    openDropdown() {
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
.mobile-documents-header {
    border-bottom: 1px solid var(--tab-divider-color);
    padding: 10px 16px 10px;
    display: grid;
    align-items: center;
    grid-template-columns: 32px 1fr 32px;

    &__back {
        button {
            outline: none;
            display: block;
            padding: 4px;

            @include animateBackgroundColor;
            color: var(--mobile-app-back-color);

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }

    &__title {
        @include ellipsis;
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: var(--mobile-app-title-color);
        justify-content: center;

        .icon {
            margin-right: 8px;
        }
    }

    &__options {
        button {
            outline: none;
            display: block;
            padding: 4px;

            @include animateBackgroundColor;
            color: var(--mobile-app-back-color);

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }
}
</style>
