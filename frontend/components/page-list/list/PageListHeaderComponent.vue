<template>
    <div class="page-list-header">
        <div class="page-list-header__count">
            <p>
                {{ count }} Page{{ count === 1 ? '' : 's' }}
                <span
                    v-if="sortByMessage"
                    class="page-list-header__count__dot"
                ></span>
                {{ sortByMessage }}
            </p>
        </div>
        <div class="page-list-header__heading">
            <slot name="title" />
            <slot name="controls" />
        </div>
        <div class="page-list-header__banners">
            <slot name="banners" />
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceContentFile from '~/components/streamline/InterfaceContentFile.vue';
import InterfaceFileDouble from '~/components/streamline/InterfaceFileDouble.vue';

@Component({
    name: 'PageListHeaderComponent',
    components: {
        InterfaceFileDouble,
        InterfaceContentFile,
    },
})
export default class PageListHeaderComponent extends Vue {
    @Prop({ default: 0 })
    count!: number;

    @Prop({ default: '' })
    sortByMessage!: string;
}
</script>
<style lang="scss" scoped>
.page-list-header {
    margin: 0 auto;

    p {
        color: var(--tab-meta-text-color);
        font-weight: 500;
        font-size: 14px;
        line-height: 22px;
        user-select: none;
    }

    &__count {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 7px;
        margin-top: 14px;

        p {
            display: flex;
            align-items: center;
            gap: 8px;

            .page-list-header__count__dot {
                width: 4px;
                height: 4px;
                background: var(--tab-meta-text-color);
                border-radius: 50%;
            }
        }
    }

    &__heading {
        margin-bottom: 16px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    &__banners {
        margin-bottom: 16px;
    }

    .empty {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        margin-top: 250px;

        .icon {
            color: var(--header-all-pages-empty-icon-color);
            margin-bottom: 42px;
        }

        p {
            font-size: 15px;
            color: var(--header-all-pages-empty-text-color);
            line-height: 20px;
            user-select: none;
            font-weight: 500;
            margin-bottom: 15px;
        }
    }
}
</style>
