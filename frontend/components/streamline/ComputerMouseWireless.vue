<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0A5,5,0,0,0,2,5V9A5,5,0,0,0,12,9V5A5,5,0,0,0,7,0ZM8,5A1,1,0,0,1,6,5V3A1,1,0,0,1,8,3Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ComputerMouseWireless',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
