<template>
    <div class="mobile-project-header">
        <div class="mobile-project-header__back">
            <button @click="back">
                <ChevronLeftIcon class="icon" size="24" />
            </button>
        </div>
        <div class="mobile-project-header__title">
            <div class="mobile-project-header__title__icon">
                <ProjectIcon :id="project.id" />
            </div>
            {{ $entities.project.getName(project.id) }}
        </div>
        <div class="mobile-documents-header__options"></div>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { ChevronLeftIcon } from '@vue-hero-icons/outline';
import { DotsHorizontalIcon } from '@vue-hero-icons/solid';
import ViewIcon from '~/components/view/ViewIcon.vue';
import ProjectIcon from '~/components/project/ProjectIcon.vue';

@Component({
    name: 'MobileProjectHeader',
    components: {
        ProjectIcon,
        ViewIcon,
        ChevronLeftIcon,
        DotsHorizontalIcon,
    },
})
export default class MobileProjectHeader extends Vue {
    @Prop({
        required: true,
    })
    project!: any;

    back() {
        this.$router.back();
    }
}
</script>
<style lang="scss" scoped>
.mobile-project-header {
    border-bottom: 1px solid var(--tab-divider-color);
    padding: 10px 16px 10px;
    display: grid;
    align-items: center;
    grid-template-columns: 32px 1fr 32px;

    &__back {
        button {
            @include animateBackgroundColor;
            color: var(--mobile-app-back-color);
            outline: none;
            display: block;
            padding: 4px;

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }

    &__title {
        @include ellipsis;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        font-size: 16px;
        line-height: 19px;
        color: var(--mobile-app-title-color);
        justify-content: center;

        .icon {
            margin-right: 8px;
        }
    }

    &__options {
        button {
            @include animateBackgroundColor;
            outline: none;
            display: block;
            padding: 4px;
            color: var(--mobile-app-back-color);

            &:active {
                color: var(--mobile-app-back-color__active);
            }
        }
    }
}
</style>
