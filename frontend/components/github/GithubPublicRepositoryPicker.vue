<template>
    <div class="github-public-repository-picker">
        <input
            v-model="url"
            type="url"
            placeholder="https://github.com/vuejs/core"
            @keydown.enter="$emit('change', url)"
        />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    name: 'GithubRepositoryPicker',
})
export default class GithubRepositoryPicker extends Vue {
    @Prop({ required: true })
    integrationId!: string;

    url: string = '';
}
</script>
<style lang="scss" scoped>
.github-public-repository-picker {
    padding: 0 16px 16px;
    input {
        @include inputMetaStyles;
        @include font12-500;
        background: $blueGrey800;
        width: 100%;
        border-radius: 6px;
        padding: 4px 10px;
        outline: none;

        &::placeholder {
            color: $blueGrey600;
        }
    }
}
</style>
