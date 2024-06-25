<template>
    <div class="side-bar">
        <NavigationGroup
            v-if="pinned.length"
            title="Pinned"
            :items="pinned"
            :collapsible="true"
            type="documents"
        />
        <NavigationGroup title="Pages" :items="pages" :collapsible="true" />
        <div v-if="!pinned.length && !pages.length" class="side-bar__empty">
            <span>Tap + to add your first page</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavigationGroup from '~/components/mobile/common/SideBar/NavigationGroup.vue';
import InterfaceFileDouble from '~/components/streamline/InterfaceFileDouble.vue';

@Component({
    name: 'MobileSidebar',
    components: { NavigationGroup },
})
export default class MobileSidebar extends Vue {
    get pinned() {
        return this.$store.getters['document/pinned'].map((page: any) => {
            return {
                title: page.name,
                type: 'document',
                parentId: null,
                id: page.id,
                status: page.status,
                order: page.pinOrder,
                icon: page.icon ?? null,
                expanded: false,
            };
        });
    }

    get pages() {
        const vault = this.$store.getters['vault/active'];
        return [
            {
                name: `All ${vault.name}`,
                type: 'folder',
                id: 'all_documents',
                icon: InterfaceFileDouble,
            },
            ...this.$store.getters['sidebar/layerByParentId'](null),
        ];
    }
}
</script>
<style lang="scss" scoped>
.side-bar {
    padding-bottom: 25px;
    height: 100%;

    &__empty {
        padding-top: 250px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: $blueGrey200;
    }
}
</style>
