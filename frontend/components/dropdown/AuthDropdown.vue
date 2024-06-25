<template>
    <div class="auth-dropdown no-drag">
        <DropdownButton @click="logOut"> Log Out </DropdownButton>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DropdownButton from '~/components/dropdown/DropdownButton.vue';
import { TrackEvent } from '~/helpers/decorators';
import { TrackingAction, TrackingType } from '~/@types/tracking';

@Component({
    name: 'AuthDropdown',
    components: { DropdownButton },
})
export default class AuthDropdown extends Vue {
    @TrackEvent(TrackingType.AUTH, {
        action: TrackingAction.LOG_OUT,
    })
    logOut() {
        this.$store.dispatch('auth/logout');
        this.$dropdown.hideAll();
    }
}
</script>
<style lang="scss" scoped>
.auth-dropdown {
    @include frostedGlassBackground;
    @include contextMenu;

    min-width: 150px;

    :deep(button) {
        min-width: auto;
    }
}
</style>
