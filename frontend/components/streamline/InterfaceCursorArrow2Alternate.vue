<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M5.22,14a1.65,1.65,0,0,1-1.58-1.1L.11,2.77A2.09,2.09,0,0,1,2.77.11L12.9,3.64a1.64,1.64,0,0,1,0,3.11L8.49,8.34a.25.25,0,0,0-.15.15L6.74,12.9A1.63,1.63,0,0,1,5.22,14ZM2.09,1.5a.61.61,0,0,0-.42.17.62.62,0,0,0-.14.61L5.05,12.4c0,.13.25.08.27,0L7.09,7.54a.77.77,0,0,1,.45-.45l4.84-1.76a.15.15,0,0,0,.12-.14.15.15,0,0,0-.1-.14h0L2.28,1.53A.63.63,0,0,0,2.09,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceCursorArrow2Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
