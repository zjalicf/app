<template>
    <svg :width="size" :height="size" fill="currentColor" viewBox="0 0 24 24">
        <path
            d="M19 9h-2.58l3.29-3.29a1 1 0 1 0-1.42-1.42L15 7.57V5a1 1 0 0 0-1-1a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 0-2zm-9 4H5a1 1 0 0 0 0 2h2.57l-3.28 3.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0L9 16.42V19a1 1 0 0 0 1 1a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1z"
            fill="currentColor"
        ></path>
    </svg>
</template>

<script>
export default {
    name: 'CollapseIcon',
    props: {
        size: {
            type: String,
            default: '20',
        },
    },
};
</script>
