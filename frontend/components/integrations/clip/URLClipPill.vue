<template>
    <div
        class="url-clip-pill has-tippy"
        :data-tippy-content="`<div class='tooltip'>Open ${domainShort}</div>`"
        @click.stop="$entities.page.openClippedUrl(clip)"
    >
        <div class="url-clip-pill__icon">
            <InterfaceLink class="icon" />
        </div>
        <div class="url-clip-pill__key">{{ domain }}</div>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';

@Component({
    name: 'URLClipPill',
    components: { InterfaceLink },
})
export default class URLClipPill extends Vue {
    @Prop({ required: true })
    clip!: string;

    get domainShort() {
        // if url is longer than 40 characters, return first 40 characters and add '...'
        return this.clip.length > 40
            ? `${this.clip.slice(0, 40)}...`
            : this.clip;
    }

    get domain() {
        // return only hostname from URL
        try {
            return new URL(this.clip).hostname;
        } catch (error) {
            return this.clip;
        }
    }
}
</script>
<style lang="scss" scoped>
.url-clip-pill {
    @include font12-500;
    border: 1px solid $blueGrey500-16;
    border-radius: 31px;
    color: $blueGrey400;
    padding: 2px 8px;
    text-align: center;
    display: flex;
    align-items: center;
    overflow: hidden;
    max-width: 170px;

    &__icon {
        flex-shrink: 0;
        margin-right: 4px;
    }

    &__key {
        @include ellipsis;
    }

    &:hover {
        background: $blueGrey500-16;
    }
}
</style>
