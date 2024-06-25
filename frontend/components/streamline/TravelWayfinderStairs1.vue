<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,.54A.54.54,0,0,0,13.46,0H9.15a.54.54,0,0,0-.53.54V4a.28.28,0,0,1-.27.27H4.85a.54.54,0,0,0-.54.54v3.5A.28.28,0,0,1,4,8.62H.54A.54.54,0,0,0,0,9.15v4.31A.54.54,0,0,0,.54,14H13.46a.54.54,0,0,0,.54-.54Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelWayfinderStairs1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
