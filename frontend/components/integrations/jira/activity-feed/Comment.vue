<template>
    <div class="jira-comment">
        <div v-if="data.empty" class="jira-comment--empty">
            No comments yet.
        </div>
        <div v-else>
            <div class="jira-comment--title">
                <UserIcon class="jira-comment--icon" :user="data.author" />
                <span class="jira-comment--text">{{
                    data.author && data.author.displayName
                }}</span>
                commented
                <span class="jira-comment--date">
                    {{ format(data.created) }}
                </span>
            </div>
            <div
                ref="commentBody"
                class="jira-comment__content"
                v-html="data.renderedBody"
            ></div>
            <a class="jira-comment__link" :href="data.link" target="_blank"
                >Reply in Jira</a
            >
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { localizedRelativeFormat } from '~/helpers/date';
import UserIcon from '~/components/integrations/jira/UserIcon.vue';

@Component({
    name: 'Comment',
    components: { UserIcon },
})
export default class Comment extends Vue {
    @Prop({ required: true })
    data!: any;

    $refs!: {
        commentBody: HTMLDivElement;
    };

    format(date: string) {
        return localizedRelativeFormat(
            new Date(date),
            new Date(),
            this.$store.getters['appSettings/dateTimeOptions'].timeFormat,
        );
    }

    mounted() {
        if (this.data.empty) return;
        this.$refs.commentBody.querySelectorAll('img').forEach(image => {
            image.addEventListener('click', e => {
                e.preventDefault();

                const src = image.getAttribute('src') as string;
                const parsedUri = src.replace('&thumbnail=true', '');
                const attachmentType = image.getAttribute(
                    'data-attachment-type',
                );
                if (attachmentType === 'file') {
                    this.$utils.navigation.openExternalLink(parsedUri);
                    return;
                }

                this.$vfm.show({
                    component: () =>
                        import('@/components/modal/ImageModal.vue'),
                    bind: {
                        src: parsedUri,
                    },
                });
            });
        });
    }
}
</script>
<style lang="scss">
.jira-comment__content {
    @include editorStyling;
    user-select: text;

    .code.panel {
        border-radius: 6px;
        border: 0px;
    }

    font-size: 13px;
    margin-bottom: 8px;
}
</style>

<style lang="scss" scoped>
.jira-comment {
    &--title {
        @include font12-500;
        color: var(--jira-comment-title-color);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 4px;
        margin-bottom: 8px;
        flex-wrap: wrap;
    }

    &--icon {
        margin-right: 4px;
    }

    &--date {
        @include font12-500;
        color: var(--jira-comment-date-color);
    }

    &--empty {
        @include font12-500;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &__link {
        @include font12-500;
        color: var(--jira-comment-link-color);

        &:hover {
            opacity: 1;
        }
    }
}
</style>
