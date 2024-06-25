<template>
    <div class="entity-properties">
        <component :is="extendedProperyComponent" />
    </div>
</template>
<script lang="ts">
import { Component, Inject, InjectReactive, Vue } from 'vue-property-decorator';
import { TabSymbols } from '~/constants/symbols';

@Component({
    name: 'EntityExtendedProperties',
    components: {},
})
export default class EntityExtendedProperties extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    @Inject(TabSymbols.TAB_GROUP_ID)
    groupId!: string;

    @InjectReactive(TabSymbols.ENTITY_TYPE)
    entityType!: string;

    get document() {
        return (
            this.$store.getters['document/byId'](this.entityId) ??
            this.$store.getters['document/byClip'](this.entityId) ??
            null
        );
    }

    get extendedProperyComponent() {
        return this.$componentsRepository.getExtendedProperties(
            this.entityType,
            this.tabId,
        );
    }
}
</script>
