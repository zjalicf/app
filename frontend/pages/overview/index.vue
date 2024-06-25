<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    asyncData({ redirect }) {
        redirect(`/`);
    },
})
export default class App extends Vue {}
</script>
