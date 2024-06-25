<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect x="4.5" width="9.5" height="9.5" rx="1.5" />
            <circle cx="9.25" cy="12.75" r="1.25" />
            <circle cx="1.25" cy="4.75" r="1.25" />
            <circle cx="1.25" cy="8.75" r="1.25" />
            <circle cx="1.25" cy="12.75" r="1.25" />
            <circle cx="5.25" cy="12.75" r="1.25" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditSelectFront',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
