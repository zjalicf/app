<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.25,12.5a.76.76,0,0,0,.74-.89L12.58,4A3,3,0,0,0,9.63,1.5H4.75a.75.75,0,0,0,0,1.5H9.21a2,2,0,0,1,2,1.64V4.7a.3.3,0,0,1,0,.21.25.25,0,0,1-.2.09H9.07a9.52,9.52,0,0,0-9,6.51.75.75,0,0,0,.1.68.77.77,0,0,0,.61.31Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelHotelIron',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
