<template>
    <svg :width="size" :height="size" viewBox="0 0 20 20">
        <g fill="none">
            <path
                d="M12 11a1 1 0 1 0 0-2a1 1 0 0 0 0 2z"
                fill="currentColor"
            ></path>
            <path
                d="M2 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7zm3.5 0a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5zm8.854.646a.5.5 0 0 0-.708 0l-.63.63A1.99 1.99 0 0 0 12 8c-.37 0-.718.101-1.016.277l-.63-.63a.5.5 0 0 0-.708.707l.63.63A1.991 1.991 0 0 0 10 10c0 .37.101.718.277 1.016l-.63.63a.5.5 0 0 0 .707.708l.63-.63c.298.175.645.276 1.016.276c.37 0 .718-.101 1.016-.277l.63.63a.5.5 0 0 0 .708-.707l-.63-.63c.175-.298.276-.645.276-1.016c0-.37-.101-.718-.277-1.016l.63-.63a.5.5 0 0 0 0-.708z"
                fill="currentColor"
            ></path>
        </g>
    </svg>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class VaultIcon extends Vue {
    @Prop({ default: '20' }) readonly size: number | string | undefined;
}
</script>
