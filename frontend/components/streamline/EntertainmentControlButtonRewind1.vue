<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.62,2.28,8.15,4.76a.25.25,0,0,1-.26,0,.24.24,0,0,1-.14-.22v-1A1.51,1.51,0,0,0,5.37,2.28L.72,5.6a1.72,1.72,0,0,0,0,2.8l4.65,3.32a1.51,1.51,0,0,0,2.38-1.23V9.44a.24.24,0,0,1,.14-.22.25.25,0,0,1,.26,0l3.47,2.48A1.51,1.51,0,0,0,14,10.49v-7A1.51,1.51,0,0,0,11.62,2.28Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonRewind1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
