<template>
    <div class="redirect"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'Redirect',
    components: {},
    asyncData(route) {
        const { settingsTab } = route.query;
        return { settingsTab };
    },
})
export default class Redirect extends Vue {
    settingsTab!: string;

    get appRedirect() {
        return `/`;
    }

    async mounted() {
        this.$store.dispatch('user/checkForUpdate');
        this.$vfm.hideAll();
        this.$utils.navigation.openSettings(this.settingsTab);
        await this.$router.push(this.appRedirect);
    }
}
</script>
