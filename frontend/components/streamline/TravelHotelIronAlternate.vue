<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.7,12A1.31,1.31,0,0,0,14,10.89L12.88,5.6v0s0,0,0,0l-.32-1.24A3.76,3.76,0,0,0,8.92,1.5H4.75a.75.75,0,0,0,0,1.5H8.92A2.25,2.25,0,0,1,11.1,4.69a.23.23,0,0,1,0,.21.26.26,0,0,1-.2.1h-2A9.22,9.22,0,0,0,.08,10.7,1.3,1.3,0,0,0,.29,12a1.47,1.47,0,0,0,1.13.53H12.58A1.44,1.44,0,0,0,13.7,12ZM2,11a.27.27,0,0,1-.22-.12.25.25,0,0,1,0-.24A7.81,7.81,0,0,1,8.85,6.5h2.48a.26.26,0,0,1,.25.2l.82,4a.23.23,0,0,1-.05.21.25.25,0,0,1-.19.09Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelHotelIronAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
