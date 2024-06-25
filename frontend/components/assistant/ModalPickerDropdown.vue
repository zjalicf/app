<template>
    <div class="auth-dropdown no-drag">
        <!--        <DropdownButton v-if="$utils.isElectron()" @click="select('local')"-->
        <!--            >Download Llama 2 (5.1 GB)</DropdownButton-->
        <!--        >-->
        <DropdownButton @click="select('default')"
            >Add ChatGPT (PRO)</DropdownButton
        >
        <DropdownButton @click="select('custom')"
            >Add OpenAI API key</DropdownButton
        >
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';

@Component({
    name: 'ModalPickerDropdown',
    components: { DropdownButton },
})
export default class ModalPickerDropdown extends Vue {
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
