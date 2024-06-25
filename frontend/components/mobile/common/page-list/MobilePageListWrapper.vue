<template>
    <div class="mobile-page-list-wrapper">
        <MobilePageList
            v-if="pages.length"
            :pages="pages"
            :view-options="displayOptions"
            :page-list-type="pageListType"
            :level="level"
            :tracking-type="trackingType"
        />
        <div v-else class="mobile-page-list-wrapper__empty">
            <span>{{ emptyText }}</span>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import MobilePageList from '~/components/mobile/common/page-list/MobilePageList.vue';
import { IDocument } from '~/components/document/model';
import { FolderType, ViewType } from '~/constants';

@Component({
    name: 'MobilePageListWrapper',
    components: { MobilePageList },
})
export default class MobilePageListWrapper extends Vue {
    @Prop({ required: true })
    pages!: IDocument[];

    @Prop({ required: true })
    displayOptions!: any;

    @Prop({ required: true })
    pageListType!: ViewType | FolderType;

    @Prop({ default: 'No Pages found.' })
    emptyText!: any;

    @Prop({ required: true })
    level!: number;

    @Prop({ required: true })
    trackingType!: any;
}
</script>
<style lang="scss" scoped>
.mobile-page-list-wrapper {
    width: 100%;
    height: 100%;

    &__empty {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: $blueGrey200;
    }
}
</style>
