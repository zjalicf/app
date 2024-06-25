<template>
    <div class="mobile-documents-header">
        <div class="mobile-documents-header__back">
            <button @click="back">
                <ChevronLeftIcon class="icon" size="24" />
            </button>
        </div>
        <div class="mobile-documents-header__title">
            <InterfaceFileDouble class="icon" size="16" />
            All {{ name }}
        </div>
        <div class="mobile-documents-header__options"></div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ChevronLeftIcon } from '@vue-hero-icons/outline';
import InterfaceFileDouble from '~/components/streamline/InterfaceFileDouble.vue';

@Component({
    name: 'MobileDocumentsHeader',
    components: {
        InterfaceFileDouble,
        ChevronLeftIcon,
    },
})
export default class MobileDocumentsHeader extends Vue {
    get name() {
        const vault = this.$store.getters['vault/active'];
        return vault.name;
    }

    back() {
        this.$router.back();
    }

    get currentLevel() {
        return +this.$route.query.level!;
    }
}
</script>
<style lang="scss" scoped>
.mobile-documents-header {
    border-bottom: 1px solid var(--tab-divider-color);
    padding: 10px 16px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &__back {
        button {
            outline: none;
            display: block;
            padding: 4px;

            @include animateBackgroundColor;
            color: var(--mobile-app-back-color);

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }

    &__title {
        display: flex;
        align-items: center;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: var(--mobile-app-title-color);

        .icon {
            margin-right: 8px;
        }
    }

    &__options {
        padding: 16px;
    }
}
</style>
