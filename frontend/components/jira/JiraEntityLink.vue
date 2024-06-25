<template>
    <div class="jira-entity-link" @click="open">
        <div class="jira-entity-link__icon">
            <img :src="entity.properties?.issuetype?.iconUrl" />
        </div>
        <div class="jira-entity-link__title">
            <span class="jira-entity-link__repository">
                {{ entity.key }}
            </span>
            {{ entity.properties?.summary }}
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import GithubEntityIcon from '~/components/github/GithubEntityIcon.vue';
import { TrackingActionSource } from '~/@types/tracking';

@Component({
    name: 'JiraEntityLink',
    components: { GithubEntityIcon },
})
export default class JiraEntityLink extends Vue {
    @Prop({ required: true })
    id!: string;

    get entity() {
        return this.$entities.jira.getById(this.id);
    }

    open() {
        this.$dropdown.hideAll();
        this.$vfm.hideAll();
        this.$entities.jira.openModal(
            this.entity,
            TrackingActionSource.BACKLINK_DROPDOWN,
        );
    }
}
</script>
<style lang="scss" scoped>
.jira-entity-link {
    @include font12-500;
    display: flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 6px;
    color: var(--document-link-text-color);
    gap: 6px;

    &__title {
        @include ellipsis;
    }

    &__icon {
        flex-shrink: 0;
        img {
            width: 14px;
            height: 14px;
        }
    }

    &:hover {
        color: var(--document-link-text-color_hover);
        background: var(--document-link-bg-color_hover);
    }

    &__repository {
        color: $blueGrey400;
    }

    &__number {
        color: $blueGrey400;
    }
}
</style>
