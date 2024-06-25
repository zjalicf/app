<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect x="3.5" width="10.5" height="5" rx="1" />
            <rect x="3.5" y="8" width="10.5" height="5" rx="1" />
            <circle cx="1" cy="1" r="1" />
            <circle cx="1" cy="9" r="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingWebImportantFieldAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
