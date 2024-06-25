<template>
    <div class="view-options-dropdown">
        <button class="view-options-dropdown__option" @click="editView">
            <InterfaceEditWrite2 class="icon" />
            Edit View
        </button>
        <button
            class="view-options-dropdown__option danger"
            @click="deleteView"
        >
            <InterfaceDeleteBin1 class="icon" />
            Delete View
        </button>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import InterfaceEditWrite2 from '~/components/streamline/InterfaceEditWrite2.vue';

@Component({
    name: 'ViewOptionsDropdown',
    components: { InterfaceEditWrite2, InterfaceDeleteBin1 },
})
export default class ViewOptionsDropdown extends Vue {
    editView() {
        this.$emit('close');
        this.$emit('edit');
    }

    deleteView() {
        this.$emit('close');
        this.$emit('delete');
    }
}
</script>
<style lang="scss" scoped>
.view-options-dropdown {
    @include frostedGlassBackground;
    @include contextMenu;

    &__option {
        position: relative;
    }
}
</style>
