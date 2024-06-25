<template>
    <span class="inline-document-link">
        <CalendarIcon size="20" class="icon" />
        <span v-if="event" class="inline-document-link--name"
            >{{ event.summary || 'Untitled' }}
            <span class="time" style="white-space: normal">{{
                ` ${formattedDate}`
            }}</span></span
        ><span v-else class="inline-document-link--name"> Event deleted </span>
    </span>
</template>

<script>
import { CalendarIcon } from '@vue-hero-icons/solid';
import { formatRelativeToDate } from '~/helpers';

export default {
    name: 'InlineEvent',
    components: {
        CalendarIcon,
    },
    data() {
        return {
            event: null,
            private: false,
        };
    },
    computed: {
        formattedDate() {
            return formatRelativeToDate(
                this.event,
                new Date(),
                true,
                this.$store.getters['appSettings/dateTimeOptions'],
            );
        },
    },
    beforeMount() {
        const { id } = this.$attrs;
        this.private = this.$route.name === 'sharing-id';

        if (this.private) {
            this.event = this.$store.getters['anonymousEvent/byId'](id);
            return;
        }

        this.event = this.$store.getters['event/byId'](id);
    },
};
</script>

<style lang="scss" scoped>
.inline-document-link {
    position: relative;
    background: var(--editor-extension-document-link-bg-color);
    border-radius: 6px;
    padding: 3px 4px 3px 2px;
    cursor: default;
    white-space: nowrap;

    &--name {
        .time {
            color: var(--accent-color);
        }
    }

    .icon {
        color: var(--editor-extension-document-link-icon-color);
        position: relative;
        top: -2px;
        display: inline;
        width: 20px;
        height: 20px;
        margin-right: 2px;
    }
}
</style>
