<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect width="6" height="8" rx="1" />
            <rect y="10" width="6" height="4" rx="1" />
            <rect x="8" y="6" width="6" height="8" rx="1" />
            <rect x="8" width="6" height="4" rx="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceDashboardLayout3',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
