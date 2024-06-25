<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,2A6.9,6.9,0,0,0,0,8.78,6.57,6.57,0,0,0,.54,11.4a1,1,0,0,0,.92.6H12.54a1,1,0,0,0,.92-.6A6.57,6.57,0,0,0,14,8.78,6.9,6.9,0,0,0,7,2Zm4.88,7.81a.24.24,0,0,1-.24.19h-3a.26.26,0,0,1-.21-.11.25.25,0,0,1,0-.24l.79-1.79a.76.76,0,0,0-.39-1,.75.75,0,0,0-1,.38L6.69,9.85a.25.25,0,0,1-.23.15H2.36a.24.24,0,0,1-.24-.19,4.46,4.46,0,0,1-.12-1A4.89,4.89,0,0,1,7,4a4.89,4.89,0,0,1,5,4.78A4.46,4.46,0,0,1,11.88,9.81Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingGaugeDashboard2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
