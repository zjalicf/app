<template>
    <div v-if="statusVisible" class="network-status">
        <LoadingIcon
            v-if="syncStatusText === 'Connecting...'"
            v-tippy="{ theme: 'tooltip', placement: 'right' }"
            size="12"
            class="icon loading"
            :content="`<div class='tooltip'>Connecting...</div>`"
        />
        <ProgrammingCloudOffAlternate
            v-else-if="syncStatusText === 'No connection. Working offline.'"
            v-tippy="{ theme: 'tooltip', placement: 'right' }"
            size="14"
            class="icon"
            :content="`<div class='tooltip'>No connection. Working offline.</div>`"
        />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import LoadingIcon from '~/components/icons/LoadingIcon.vue';
import ProgrammingCloudOff from '~/components/streamline/ProgrammingCloudOff.vue';
import ProgrammingCloudOffAlternate from '~/components/streamline/ProgrammingCloudOffAlternate.vue';
import ProgrammingCloudCheck from '~/components/streamline/ProgrammingCloudCheck.vue';
import ProgrammingCloudCheckAlternate from '~/components/streamline/ProgrammingCloudCheckAlternate.vue';

@Component({
    name: 'SyncStatus',
    components: {
        ProgrammingCloudCheckAlternate,
        ProgrammingCloudCheck,
        ProgrammingCloudOffAlternate,
        ProgrammingCloudOff,
        LoadingIcon,
    },
})
export default class SyncStatus extends Vue {
    get syncStatusText() {
        return this.$store.getters['syncStatus/statusText'];
    }

    get syncStatus() {
        return this.$store.getters['syncStatus/status'];
    }

    get statusVisible() {
        return this.$store.getters['syncStatus/visible'];
    }
}
</script>
<style lang="scss" scoped>
.loading {
    margin-left: 2px;
}

.network-status {
    margin-left: 8px;
}
</style>
