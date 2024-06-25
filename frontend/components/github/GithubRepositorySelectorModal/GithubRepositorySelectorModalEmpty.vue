<template>
    <div class="github-repository-selector-empty">
        Could not load any organizations. <br />
        Try again and make sure to allow correct permissions.
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
    name: 'GithubRepositorySelectorModalEmpty',
})
export default class GithubRepositorySelectorModalEmpty extends Vue {}
</script>
<style lang="scss" scoped>
.github-repository-selector-empty {
    @include font12-500;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    text-align: center;
}
</style>
