<template>
    <div class="url-clip">
        <button class="url-clip__wrapper" @click="openUrl">
            <InterfaceLink class="icon" />
            <div class="url-clip__wrapper__key">
                {{ domain }}
            </div>
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import { TabSymbols } from '~/constants/symbols';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';

@Component({
    name: 'URLClip',
    components: {
        InterfaceLink,
    },
})
export default class URLClip extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    get page() {
        return this.$store.getters['document/byId'](this.entityId);
    }

    get domain() {
        return new URL(this.page.clip).hostname;
    }

    openUrl() {
        this.$entities.page.openClippedUrl(this.page.clip);
    }
}
</script>
<style lang="scss" scoped>
.url-clip {
    user-select: none;
    &__wrapper {
        display: grid;
        grid-template-columns: minmax(16px, 1fr) auto;
        align-items: center;
        padding: 5px 8px;
        border-radius: 6px;
        gap: 6px;
        background: var(--jira-clip-bg-color);
        max-width: 150px;
        overflow: hidden;

        &:hover,
        &.active {
            background: var(--a-select-button-highlight-bg);

            .jira-clip--key {
                color: var(--jira-clip-key-text-color__hover);
            }
        }

        &__key {
            @include ellipsis;
            @include font12-500;
            color: var(--jira-clip-key-text-color);
            white-space: nowrap;
        }
    }
}
</style>
