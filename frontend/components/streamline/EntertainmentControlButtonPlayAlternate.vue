<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M2.32,14A2.32,2.32,0,0,1,0,11.68V2.32A2.33,2.33,0,0,1,3.36.24l9.35,4.67a2.34,2.34,0,0,1,0,4.18L3.36,13.76A2.33,2.33,0,0,1,2.32,14Zm0-12A.32.32,0,0,0,2,2.32v9.36a.34.34,0,0,0,.47.29L11.81,7.3a.33.33,0,0,0,0-.6L2.47,2A.4.4,0,0,0,2.32,2Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonPlayAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
