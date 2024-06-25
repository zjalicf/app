<template>
    <div class="navigation-group">
        <div class="navigation-group--title">{{ title }}</div>
        <div class="navigation-group--rows">
            <NavigationRows :items="items" :type="type" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ChevronUpIcon, ChevronDownIcon } from '@vue-hero-icons/solid';
import NavigationRows from '~/components/mobile/common/SideBar/NavigationRows.vue';

@Component({
    name: 'NavigationGroup',
    components: {
        NavigationRows,
        ChevronUpIcon,
        ChevronDownIcon,
    },
})
export default class NavigationGroup extends Vue {
    @Prop({ default: '' })
    title!: string;

    @Prop({ default: 'folders' })
    type!: string;

    @Prop({ default: [] })
    items!: any[];

    @Prop({ default: false })
    collapsible!: boolean;
}
</script>
<style lang="scss" scoped>
.navigation-group {
    margin-bottom: 18px;

    &--title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
        font-size: 14px;
        line-height: 17px;
        letter-spacing: -0.24px;
        color: $blueGrey400;
        margin-bottom: 12px;
        user-select: none;
    }

    &--rows {
        background: $blueGrey900;
        border-radius: 12px;

        :deep(.navigation-row) {
            &.first {
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }

            &.last {
                border-bottom-left-radius: 12px;
                border-bottom-right-radius: 12px;

                &:not(.expanded),
                &:not(expandable) {
                    .navigation-row--item--link--name {
                        border-bottom: 0;
                        padding-bottom: 16px;
                    }

                    .navigation-row--item--button {
                        border-bottom: 0;
                        padding-bottom: 13px;
                    }
                }

                &.first {
                    .navigation-row--item--link--name {
                        border-bottom: 0;
                        padding-bottom: 16px;
                    }

                    .navigation-row--item--button {
                        border-bottom: 0;
                        padding-bottom: 13px;
                    }
                }
            }
        }
    }
}
</style>
