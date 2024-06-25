<template>
    <svg :width="size" :height="size" fill="currentColor" viewBox="0 0 24 24">
        <g><rect fill="none" height="24" width="24" /></g>
        <g>
            <g>
                <g>
                    <path
                        d="M2.5,4v3h5v12h3V7h5V4H2.5z M21.5,9h-9v3h3v7h3v-7h3V9z"
                    />
                </g>
            </g>
        </g>
    </svg>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Header3 extends Vue {
    @Prop({ default: 20 }) readonly size: number | undefined;
}
</script>
