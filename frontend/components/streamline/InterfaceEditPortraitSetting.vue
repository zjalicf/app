<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <rect x="2.5" width="9" height="14" rx="1.5" />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditPortraitSetting',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
