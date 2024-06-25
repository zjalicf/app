<template>
    <div class="task-banner">
        <div class="task-banner--wrapper">
            <PageDefinitionControl
                class="view-filter-controls__item"
                :name="definition.name"
                :items="definition.items"
                :selected-items="definition.selectedItems"
                :multiselect="definition.multiselect"
                :search-placeholder="definition.searchPlaceholder"
                :placeholder="definition.placeholder"
                @update="definition.update"
                @close="definition.close"
            />
            <!--            <span v-if="type === 'source'">Source: My Day</span>-->
            <!--            <span v-if="type === 'tasks'">Page Has Tasks</span>-->
            <div class="task-banner--wrapper--buttons">
                <button @click="$emit('reset')">
                    <XIcon size="16" class="icon" />
                </button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { XIcon } from '@vue-hero-icons/solid';
import CButton from '~/components/CButton.vue';
import { TabSymbols } from '~/constants/symbols';
import PageFilterByFolder from '~/components/view/controls/filter/PageFilterByFolder.vue';
import PageFilterByLabel from '~/components/view/controls/filter/PageFilterByLabel.vue';
import PageDefinitionControl from '~/components/view/controls/filter/PageDefinitionControl.vue';

@Component({
    name: 'PageDefinitionControlBanner',
    components: {
        PageDefinitionControl,
        PageFilterByLabel,
        PageFilterByFolder,
        CButton,
        XIcon,
    },
})
export default class PageDefinitionControlBanner extends Vue {
    @Prop({ required: true })
    definition!: any;
}
</script>

<style lang="scss" scoped>
.task-banner {
    &--wrapper {
        background: var(--banner-task-filter-bg-color);
        padding: 4px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 7px;
        user-select: none;
        border-radius: 6px;

        span {
            @include font12-500;
            padding: 2px 0;
        }

        :deep {
            .filter {
                display: grid;
                grid-template-columns: max-content min-content;
                gap: 8px;
            }

            .a-select {
                &__button {
                    padding: 2px 4px;
                }
            }
        }

        &--text {
            @include font12-500;
            color: var(--banner-task-filter-text-color);
        }

        &--buttons {
            line-height: 14px;
            color: var(--banner-task-filter-button-color);

            button {
                outline: none;

                .icon {
                    flex-shrink: 0;
                }
            }

            &:hover {
                color: var(--banner-task-filter-button-color__hover);
            }
        }
    }
}
</style>
