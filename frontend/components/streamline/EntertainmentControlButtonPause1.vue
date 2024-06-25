<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect x="2" width="3.5" height="14" rx="1.25" />
            <rect x="8.5" width="3.5" height="14" rx="1.25" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonPause1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
