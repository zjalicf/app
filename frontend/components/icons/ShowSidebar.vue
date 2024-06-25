<template>
    <svg :width="size" :height="size" viewBox="0 0 16 16">
        <path
            d="M13.0002 1.33337H3.00016C2.07969 1.33337 1.3335 2.07957 1.3335 3.00004V13C1.3335 13.9205 2.07969 14.6667 3.00016 14.6667H13.0002C13.9206 14.6667 14.6668 13.9205 14.6668 13V3.00004C14.6668 2.07957 13.9206 1.33337 13.0002 1.33337Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="transparent"
        />
        <path d="M5.5 1.33337V14.6667" stroke="currentColor" stroke-width="2" />
    </svg>
</template>

<script>
export default {
    name: 'ShowSidebar',
    props: {
        size: {
            type: String,
            default: '16',
        },
    },
};
</script>
