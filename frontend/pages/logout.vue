<template>
    <div></div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    layout: 'localAuth',
    transition: 'fade',
})
export default class LocalLogIn extends Vue {
    tab: string = 'home';

    mounted() {
        this.$store.dispatch('auth/trueLogout');
    }
}
</script>
