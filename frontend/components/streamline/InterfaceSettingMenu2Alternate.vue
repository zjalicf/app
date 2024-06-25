<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect y="1" width="10" height="5" rx="1.5" />
            <rect x="4" y="8" width="10" height="5" rx="1.5" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingMenu2Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
