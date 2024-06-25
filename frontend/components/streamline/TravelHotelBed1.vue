<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.75,0H3.25A1.76,1.76,0,0,0,1.5,1.75v10.5A1.76,1.76,0,0,0,3.25,14h7.5a1.76,1.76,0,0,0,1.75-1.75V1.75A1.76,1.76,0,0,0,10.75,0ZM9.5,4.25a.5.5,0,0,1-.5.5H5a.5.5,0,0,1-.5-.5V2.5A.5.5,0,0,1,5,2H9a.5.5,0,0,1,.5.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelHotelBed1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
