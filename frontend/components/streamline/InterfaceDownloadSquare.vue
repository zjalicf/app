<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,3a3,3,0,0,0-3-3H3A3,3,0,0,0,0,3v8a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3ZM9.78,7.22a.75.75,0,0,1,0,1.06L7.53,10.53a.75.75,0,0,1-1.06,0L4.22,8.28A.75.75,0,0,1,5.28,7.22l.54.54a.26.26,0,0,0,.28.06.25.25,0,0,0,.15-.23V4a.75.75,0,0,1,1.5,0V7.59a.25.25,0,0,0,.15.23.26.26,0,0,0,.28-.06l.54-.54A.75.75,0,0,1,9.78,7.22Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceDownloadSquare',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
