<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13,2H1A1,1,0,0,0,0,3v8a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1V3A1,1,0,0,0,13,2ZM4,8.75a.75.75,0,0,1-1.5,0V5.25a.75.75,0,0,1,1.5,0Zm3.75,0a.75.75,0,0,1-1.5,0V5.25a.75.75,0,0,1,1.5,0Zm3.75,0a.75.75,0,0,1-1.5,0V5.25a.75.75,0,0,1,1.5,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ShippingBoxContainer',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
