<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect x="4" y="4" width="6" height="6" rx="1.5" />
            <circle cx="1.25" cy="1.25" r="1.25" />
            <circle cx="12.75" cy="1.25" r="1.25" />
            <circle cx="1.25" cy="7" r="1.25" />
            <circle cx="12.75" cy="7" r="1.25" />
            <circle cx="1.25" cy="12.75" r="1.25" />
            <circle cx="7" cy="12.75" r="1.25" />
            <circle cx="7" cy="1.25" r="1.25" />
            <circle cx="12.75" cy="12.75" r="1.25" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditExpand',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
