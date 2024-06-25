<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect width="14" height="8" rx="1.75" />
            <rect x="5.75" y="9.5" width="2.5" height="4.5" rx="0.75" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ShoppingStoreSignage2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
