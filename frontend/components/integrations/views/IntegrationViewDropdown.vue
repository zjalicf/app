<template>
    <div class="integration-view-dropdown">
        <DropdownButton v-if="!isDefault" @click="emit('edit')">
            <InterfaceEditPencil class="icon" size="14" />
            Edit Filter
        </DropdownButton>
        <DropdownButton @click="emit('reload')">
            <InterfaceArrowsSynchronize size="14" class="icon" />
            Reload
        </DropdownButton>
        <DropdownButton
            v-if="!isDefault"
            class="danger"
            @click="emit('delete')"
        >
            <InterfaceDeleteBin1 class="icon" size="14" />
            Delete
        </DropdownButton>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import InterfaceLink from '~/components/streamline/InterfaceLink.vue';
import InterfaceEditPencil from '~/components/streamline/InterfaceEditPencil.vue';
import InterfaceDeleteBin1 from '~/components/streamline/InterfaceDeleteBin1.vue';
import InterfaceFileDoubleAlt from '~/components/streamline/InterfaceFileDoubleAlt.vue';
import InterfaceAlignBackAlternate from '~/components/streamline/InterfaceAlignBackAlternate.vue';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import InterfaceArrowsSynchronize from '~/components/streamline/InterfaceArrowsSynchronize.vue';

@Component({
    name: 'IntegrationViewDropdown',
    components: {
        InterfaceArrowsSynchronize,
        LoadingIcon,
        InterfaceAlignBackAlternate,
        InterfaceFileDoubleAlt,
        InterfaceDeleteBin1,
        InterfaceEditPencil,
        InterfaceLink,
        DropdownButton,
    },
})
export default class IntegrationViewDropdown extends Vue {
    @Prop({ required: false, default: false })
    isDefault!: boolean;

    emit(item: string) {
        this.$emit(item);
        this.$emit('close');
    }
}
</script>
<style lang="scss" scoped>
.integration-view-dropdown {
    @include frostedGlassBackground;
    @include contextMenu;
}
</style>
