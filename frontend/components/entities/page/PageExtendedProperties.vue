<template>
    <div class="page-properties">
        <TemplateBanner v-if="document.template" />
    </div>
</template>
<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import { TabSymbols } from '~/constants/symbols';
import TemplateBanner from '~/components/banners/TemplateBanner.vue';

@Component({
    name: 'PageExtendedProperties',
    components: { TemplateBanner },
})
export default class PageExtendedProperties extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    @Inject(TabSymbols.TAB_GROUP_ID)
    groupId!: string;

    get tabData() {
        return this.$tabs.getTabData(this.tabId);
    }

    get document() {
        return (
            this.$store.getters['document/byId'](this.entityId) ??
            this.$store.getters['document/byClip'](this.entityId) ??
            {}
        );
    }
}
</script>
