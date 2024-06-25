<template>
    <div ref="slotRef">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
    name: 'OverlayScrollbar',
})
export default class extends Vue {
    $refs!: {
        slotRef: any;
    };

    async mounted() {
        const { OverlayScrollbars } = await import('overlayscrollbars');
        OverlayScrollbars(
            this.$refs.slotRef,
            {
                scrollbars: {
                    theme: 'os-theme-light',
                    autoHide: 'move',
                    autoHideDelay: 750,
                },
            },
            {
                scroll: (_instance: any, evt: any) => {
                    this.$emit('scroll', evt.target.scrollTop);
                },
            },
        );
    }
}
</script>
