<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.21,6.71a1,1,0,0,1-1.42,0L8.93,3.84a.26.26,0,0,0-.28,0A.25.25,0,0,0,8.5,4V9a5,5,0,0,1-5,5h-2a1,1,0,0,1,0-2h2a3,3,0,0,0,3-3V4a.25.25,0,0,0-.15-.23.26.26,0,0,0-.28,0L3.21,6.71A1,1,0,0,1,1.79,5.29l5-5a1,1,0,0,1,1.42,0l5,5A1,1,0,0,1,13.21,6.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsBendUpRight1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
