<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="7" cy="11.5" r="2.5" />
            <circle cx="7" cy="2.5" r="2.5" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingMenuVerticalAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
