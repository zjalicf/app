<template>
    <div class="auth-dropdown no-drag">
        <DropdownButton @click="select('github')"
            >Github.com account</DropdownButton
        >
        <DropdownButton @click="select('github-access-token')"
            >Github.com access token</DropdownButton
        >
        <DropdownButton @click="select('enterprise')"
            >Github enterprise account</DropdownButton
        >
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';

@Component({
    name: 'GithubConnectDropdown',
    components: { DropdownButton },
})
export default class GithubConnectDropdown extends Vue {
    select(type: string) {
        this.$emit('select', type);
    }
}
</script>
<style lang="scss" scoped>
.auth-dropdown {
    @include frostedGlassBackground;
    @include contextMenu;

    min-width: 190px;

    :deep(button) {
        min-width: auto;
    }
}
</style>
