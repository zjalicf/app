<template>
    <svg :width="size" :height="size" fill="currentColor" viewBox="0 0 24 24">
        <path
            d="M20 5a1 1 0 0 0-1-1h-5a1 1 0 0 0 0 2h2.57l-3.28 3.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0L18 7.42V10a1 1 0 0 0 1 1a1 1 0 0 0 1-1zm-9.29 8.29a1 1 0 0 0-1.42 0L6 16.57V14a1 1 0 0 0-1-1a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 0-2H7.42l3.29-3.29a1 1 0 0 0 0-1.42z"
            fill="currentColor"
        ></path>
    </svg>
</template>

<script>
export default {
    name: 'ExpandIcon',
    props: {
        size: {
            type: String,
            default: '20',
        },
    },
};
</script>
