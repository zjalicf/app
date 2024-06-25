<template>
    <div class="github-repository-selector-loading">
        <LoadingIcon />
        Loading organizations...
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';

@Component({
    name: 'GithubRepositorySelectorModalLoading',
    components: { LoadingIcon },
})
export default class GithubRepositorySelectorModalLoading extends Vue {}
</script>
<style lang="scss" scoped>
.github-repository-selector-loading {
    @include font12-500;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    height: 100%;
}
</style>
