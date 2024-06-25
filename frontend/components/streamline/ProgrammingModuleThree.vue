<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect y="8" width="6" height="6" rx="0.95" />
            <rect x="8" y="8" width="6" height="6" rx="0.95" />
            <rect x="4" width="6" height="6" rx="0.95" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingModuleThree',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
