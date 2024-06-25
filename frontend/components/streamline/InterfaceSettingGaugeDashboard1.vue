<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM7,2a5,5,0,0,1,5,5,4.5,4.5,0,0,1-.13,1.11.24.24,0,0,1-.24.2H8.78a.24.24,0,0,1-.21-.12.25.25,0,0,1,0-.25L9.68,5.79a.74.74,0,0,0-.31-1,.76.76,0,0,0-1,.32L6.75,8.17a.25.25,0,0,1-.23.14H2.37a.24.24,0,0,1-.24-.2A4.5,4.5,0,0,1,2,7,5,5,0,0,1,7,2Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingGaugeDashboard1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
