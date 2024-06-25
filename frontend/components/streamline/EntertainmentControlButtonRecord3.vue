<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <circle cx="7" cy="7" r="7" />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonRecord3',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
