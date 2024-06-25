<template>
    <div></div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    layout: 'localAuth',
    transition: 'fade',
})
export default class NoVault extends Vue {
    tab: string = 'home';

    async mounted() {
        await this.$store.dispatch(
            'vault/deleteLastVault',
            this.$route.query.id,
        );
        this.$router.push('/auth/login');
    }
}
</script>
