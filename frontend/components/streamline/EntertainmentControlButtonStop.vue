<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <rect width="14" height="14" rx="1.75" />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonStop',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
