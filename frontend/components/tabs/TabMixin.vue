<template></template>
<script lang="ts">
import {
    Component,
    Prop,
    Vue,
    Watch,
    Provide,
    ProvideReactive,
} from 'vue-property-decorator';
import { validate } from 'uuid';
import debounce from 'lodash/debounce';
import { TabSymbols } from '~/constants/symbols';
import { ComponentType } from '~/plugins/components-repository/repository';
import { IDocument } from '~/components/document/model';
import { GithubIntegrationDataType } from '~/components/github/github';
import { isGithubEntity } from '~/plugins/entities/github';
import { Tab } from '~/@types/app';

@Component({
    name: '',
    components: {},
})
export default class TabMixin<T> extends Vue {
    @Prop({
        required: true,
    })
    @Provide(TabSymbols.TAB_ID)
    id!: string;

    @Prop({
        default: null,
    })
    @Provide(TabSymbols.ENTITY_ID)
    entityId!: string;

    @Prop({
        required: true,
    })
    @Provide(TabSymbols.TAB_GROUP_ID)
    groupId!: string;

    @Prop({
        required: true,
    })
    width!: number;

    @Prop({
        required: true,
    })
    type!: Tab['type'];

    @ProvideReactive(TabSymbols.IS_ACTIVE)
    public isActive: boolean = false;

    isNarrow: boolean = false;
    hasEditor: boolean = false;
    clip: string | null = null;
    scrollPositions: Record<string, number> = {};

    @ProvideReactive(TabSymbols.ENTITY_TYPE)
    get entityType(): ComponentType {
        const isDocument = validate(this.entityId);
        const clip = this.clip;

        if (isDocument) {
            if (clip && isGithubEntity(clip)) {
                return GithubIntegrationDataType.PR;
            }
        }

        const clipEntity = this.$store.getters['integrationData/byId'](clip);

        if (isDocument && !clip) {
            return 'document';
        }

        if (!clipEntity) {
            if (clip && this.$entities.page.isValidUrl(clip)) {
                return 'url';
            }
            return 'document';
        }
        const type = clip ? clip.split('/', 1) : this.entityId.split('/', 1);

        if (Array.isArray(type) && type.length > 0) {
            return type[0];
        }

        return type as any;
    }

    @ProvideReactive(TabSymbols.TAB_WIDTH)
    get tabWidth() {
        return this.width;
    }

    @ProvideReactive(TabSymbols.TAB_DATA)
    get tabData() {
        return this.$store.getters['tabs/byId'](this.id)?.data;
    }

    get document() {
        const isDocument = validate(this.entityId);
        return (
            (isDocument &&
                this.$store.getters['document/byId'](this.entityId)) ||
            null
        );
    }

    get scrollPositionLabel() {
        return `${this.entityType}:${this.entityId}`;
    }

    get activeTabId() {
        return this.$utils.navigation.activeTabId;
    }

    get activeTab() {
        return this.$store.getters['tabs/byId'](this.activeTabId);
    }

    @Watch('tabWidth')
    handleWidthChange(next: number, prev: number) {
        if (next > 768 && prev < 768) {
            this.isNarrow = false;
            return;
        }
        if (next < 768 && prev > 768) {
            this.isNarrow = true;
        }
    }

    @Watch('document', { immediate: true })
    handleDocumentChange(doc: IDocument) {
        if (!doc) return;
        if (doc.clip !== this.clip) {
            this.clip = doc.clip!;
        }
    }

    @Provide(TabSymbols.SET_SCROLL_POSITION)
    setScrollPositions(position: number, label?: string) {
        if (label) {
            this.updateTabData({
                scrollPositions: {
                    ...(this.tabData?.scrollPositions ?? {}),
                    [label ?? this.scrollPositionLabel]: position,
                },
            } as any);
            return;
        }
        this._setScrollPositions(position, label);
    }

    @Provide(TabSymbols.UPDATE_TAB_DATA)
    updateTabData(data: Partial<T>) {
        this.$store.dispatch('tabs/updateTabData', {
            tabId: this.id,
            data,
        });
        this.updateGroupData(data);
    }

    @Provide(TabSymbols.GET_SCROLL_POSITION)
    getScrollPosition(label?: string) {
        if (this.$utils.isMobile) return null;
        return (
            this.tabData?.scrollPositions?.[
                label ?? this.scrollPositionLabel
            ] ?? 0
        );
    }

    handleGlobalActiveTab(activeTabId: string) {
        const isActiveValue = activeTabId === this.id;
        if (isActiveValue === this.isActive) return;
        this.$tabs.handleGlobalActiveTab(activeTabId);

        if (!isActiveValue) {
            this.disableShortcutNamespaces();
            this.removeShortcuts();
        } else {
            this.enableShortcutNamespaces();
            this.registerShortcuts();
            this.handleBlur();
        }
        this.isActive = isActiveValue;
    }

    handleBlur() {
        if (this.hasEditor) return;
        this.$nuxt.$emit('editor:tab-group-blur');
    }

    updateGroupData(_data: Partial<T>) {}

    registerShortcuts() {}

    removeShortcuts() {}

    enableShortcutNamespaces() {}

    disableShortcutNamespaces() {}

    beforeDestroy() {
        this.$nuxt.$off('activeTab', this.handleGlobalActiveTab);
    }

    _setScrollPositions(position: number, label?: string) {
        this.updateTabData({
            scrollPositions: {
                ...(this.tabData?.scrollPositions ?? {}),
                [label ?? this.scrollPositionLabel]: position,
            },
        } as any);
    }

    mounted() {
        this.$nuxt.$on('activeTab', this.handleGlobalActiveTab);
        this.isActive = false;
        this.handleGlobalActiveTab(this.$utils.navigation.activeTabId);
        this.isNarrow = this.tabWidth! < 768;
        this._setScrollPositions = debounce(this._setScrollPositions, 500, {
            leading: false,
            trailing: true,
        });
    }
}
</script>
