<template>
    <div class="entity-header">
        <div class="entity-header__meta">
            <slot name="meta"></slot>
        </div>
        <div class="entity-header__actions">
            <slot name="backlinks"></slot>
            <button
                class="quick-action-item has-tippy"
                :data-tippy-content="`<div tabindex='-1' class='tooltip'>${copyLinkText}</div>`"
                @click="onCopyUrl"
            >
                <InterfaceLink v-if="!success" />
                <InterfaceValidationCheck v-else class="icon" />
            </button>
            <button
                class="quick-action-item has-tippy"
                :data-tippy-content="`<div tabindex='-1' class='tooltip'>${externalOpenText}</div>`"
                @click="$emit('open-in-browser')"
            >
                <InterfaceLinkSquare />
            </button>
            <EntityClipButton
                v-if="viewContext === 'modal'"
                :clip="clip"
                @click="$emit('clip-click')"
            />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator';
import { GithubSymbols } from '~/components/github/github';
import InterfaceLinkSquare from '~/components/streamline/InterfaceLinkSquare.vue';
import InterfaceValidationCheck from '~/components/streamline/InterfaceValidationCheck.vue';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import EntityClipButton from '~/components/integrations/EntityClipButton.vue';

@Component({
    name: 'GithubViewHeader',
    components: {
        EntityClipButton,
        InterfaceLink,
        InterfaceValidationCheck,
        InterfaceLinkSquare,
    },
})
export default class GithubViewHeader extends Vue {
    @Prop({ default: null })
    clip!: any;

    @Prop({ default: 'Copy link' })
    copyLinkText!: string;

    @Prop({ default: 'Open in browser' })
    externalOpenText!: string;

    @Inject(GithubSymbols.VIEW_CONTEXT)
    viewContext!: string;

    success: boolean = false;

    onCopyUrl() {
        if (this.success) return;

        this.$emit('copy-to-clipboard');

        this.success = true;

        setTimeout(() => {
            this.success = false;
        }, 4000);
    }
}
</script>
<style lang="scss" scoped>
.entity-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: var(--jira-panel-header-bg-color);
    -webkit-backdrop-filter: blur(12px); /* Safari 9+ */
    backdrop-filter: blur(12px); /* Chrome and Opera */
    border-bottom: 1px solid var(--tab-divider-color);
    padding: 24px 30px 16px 30px;
    z-index: 1;

    .panel & {
        background: var(--panel-header-background);
        padding: 14px 15px 14px;
    }

    &__meta {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;

        @include font12-500;

        .icon {
            border-radius: 4px;
        }
    }

    &__number {
        @include font12-500;
        color: var(--github-view-header-number-color);
    }

    &__actions {
        display: flex;
        align-items: center;
        gap: 8px;

        .quick-action-item {
            color: var(--jira-panel-header-icon-color);
            padding: 7px;
            flex-shrink: 0;
            border-radius: 4px;

            &:hover {
                color: var(--jira-panel-header-icon-color__hover);
            }
        }
    }
}
</style>
