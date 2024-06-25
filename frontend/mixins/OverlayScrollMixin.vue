<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({
    name: 'OverlayScrollMixin',
})
export default class OverlayScrollMixin extends Vue {
    async mounted() {
        const { OverlayScrollbars } = await import('overlayscrollbars');
        OverlayScrollbars(this.$el as HTMLElement, {});
    }
}
</script>
