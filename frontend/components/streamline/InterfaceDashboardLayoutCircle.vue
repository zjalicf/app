<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="3" cy="3" r="3" />
            <circle cx="11" cy="3" r="3" />
            <circle cx="3" cy="11" r="3" />
            <circle cx="11" cy="11" r="3" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceDashboardLayoutCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
