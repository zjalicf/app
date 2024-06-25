<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator';
import { TabSymbols } from '~/constants/symbols';

@Component({
    components: {},
    name: 'TitleMixin',
})
export default class TitleMixin extends Vue {
    @Inject(TabSymbols.TAB_ID)
    tabId!: string;

    @Inject(TabSymbols.ENTITY_ID)
    entityId!: string;

    get document() {
        const output =
            this.$store.getters['document/byId'](this.entityId) ??
            this.$store.getters['document/byClip'](this.entityId) ??
            {};
        return output;
    }
}
</script>
