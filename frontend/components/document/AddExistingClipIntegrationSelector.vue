<template>
    <div class="existing-integration-selector">
        <DropdownButton
            ref="integrations"
            class="existing-integration-selector__button"
            @mouseenter="showIntegrationsDropdown"
        >
            <div class="existing-integration-selector__left">
                <InterfaceLink class="icon" />
                Add Clip
            </div>
            <TriangleRight class="small-icon" size="8" />
        </DropdownButton>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TriangleRight } from '~/components/icons';
import JiraIcon from '~/components/icons/JiraIcon.vue';
import ADropDown from '~/components/ADropDown.vue';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import { IDocument } from '~/components/document/model';
import { IntegrationType } from '~/constants';
import InProgressIcon from '~/components/icons/InProgressIcon.vue';
import InterfaceEditSelectAreaCircleDash from '~/components/streamline/InterfaceEditSelectAreaCircleDash.vue';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import GithubIcon from '~/components/icons/GithubIcon.vue';
import { TrackingActionSource } from '~/@types/tracking';
import LinearIcon from '~/components/linear/icons/LinearIcon.vue';

@Component({
    name: 'AddExistingClipIntegrationSelector',
    components: {
        InterfaceLink,
        InterfaceEditSelectAreaCircleDash,
        InProgressIcon,
        DropdownButton,
        JiraIcon,
        TriangleRight,
    },
})
export default class AddExistingClipIntegrationSelector extends Vue {
    @Prop({ required: true })
    page!: IDocument;

    @Prop({ default: undefined })
    source!: TrackingActionSource | undefined;

    $refs!: {
        integrations: any;
    };

    get integrations() {
        const integrations: {
            id: string;
            label: string;
            icon: { icon: any; color?: string };
        }[] = [
            {
                id: 'url',
                label: 'URL',
                icon: { icon: InterfaceLink, color: '#677589' },
            },
        ];

        const isLocal = this.$entities.vault.isLocal;
        if (isLocal) return integrations;

        integrations.push(
            {
                id: IntegrationType.GITHUB,
                label: 'Github',
                icon: { icon: GithubIcon, color: '#fff' },
            },
            {
                id: IntegrationType.JIRA,
                label: 'Jira',
                icon: { icon: JiraIcon },
            },
            {
                id: IntegrationType.LINEAR,
                label: 'Linear',
                icon: { icon: LinearIcon },
            },
        );

        return integrations;
    }

    async showIntegrationsDropdown() {
        await this.$nextTick();
        this.$dropdown.show({
            name: 'integration-select',
            parent: this.$refs.integrations.$el,
            component: ADropDown,
            animate: false,
            retainFocus: true,
            backdrop: false,
            popperOptions: {
                placement: 'right-start',
                modifiers: [
                    {
                        name: 'preventOverflow',
                        options: {
                            mainAxis: false,
                        },
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 7],
                        },
                    },
                ],
            },
            bind: {
                items: this.integrations,
                value: null,
                search: false,
                clear: false,
                multi: false,
                checkPlacement: 'end',
                width: 150,
                parentWidth: 150,
            },
            on: {
                change: (value: any) => {
                    this.$dropdown.hideAll();
                    this.$emit('close');
                    this.handleIntegrationSelected(value);
                },
            },
            onClose: () => {},
        });
    }

    handleIntegrationSelected(type: any) {
        const integrations = this.$store.getters['integration/list'];
        if (
            !['url'].includes(type) &&
            !integrations.find((i: any) => i.type === type)
        ) {
            const settingsTab =
                type === IntegrationType.JIRA
                    ? 'jira-integration'
                    : 'github-integration';
            this.$utils.navigation.openSettings(
                settingsTab,
                TrackingActionSource.PAGE_CLIP,
            );
            return;
        }
        this.$vfm.show({
            component: () =>
                import(
                    '~/components/integrations/clip/modal/EntityClipModal.vue'
                ),
            bind: {
                page: this.page,
                type,
                source: this.source,
            },
        });
    }

    hideOptions() {
        this.$dropdown.hide('integration-select');
    }

    beforeDestroy() {
        this.$nuxt.$off('dropdown-button-hover');
    }

    mounted() {
        this.$nuxt.$on('dropdown-button-hover', () => {
            this.hideOptions();
        });
    }
}
</script>

<style lang="scss" scoped>
.existing-integration-selector {
    @include contextMenu;
    padding: 0;

    &__title {
        @include font10-700;
        padding: 3px 8px 0;
        color: var(--context-menu-section-title);
        text-transform: uppercase;
    }

    &__left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }

    &__button {
        justify-content: space-between;
    }
}
</style>
