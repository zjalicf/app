<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12,.56H4.78A2,2,0,0,0,2.9,1.88L.24,9.27A2.85,2.85,0,0,0,0,10.44a3,3,0,0,0,3,3H9a3,3,0,0,0,3-2.56l2-7.82A2,2,0,0,0,12,.56ZM9,12.19H4.12a.63.63,0,0,1,0-1.25H8.33a.63.63,0,0,0,0-1.25H4.12a1.87,1.87,0,0,0-1.87,1.87.25.25,0,0,1-.15.23.25.25,0,0,1-.26,0A1.75,1.75,0,0,1,3,8.69H9a1.75,1.75,0,0,1,0,3.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelHotelTowel',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
