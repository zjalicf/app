<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.25,0H2.75A1.76,1.76,0,0,0,1,1.75v10.5A1.76,1.76,0,0,0,2.75,14h8.5A1.76,1.76,0,0,0,13,12.25V1.75A1.76,1.76,0,0,0,11.25,0ZM2.75,1.5h1.5a.25.25,0,0,1,.25.25V3.5A.5.5,0,0,0,5,4H9a.5.5,0,0,0,.5-.5V1.75a.25.25,0,0,1,.25-.25h1.5a.25.25,0,0,1,.25.25v3.5a.25.25,0,0,1-.25.25H2.75a.25.25,0,0,1-.25-.25V1.75A.25.25,0,0,1,2.75,1.5Zm8.5,11H2.75a.25.25,0,0,1-.25-.25v-5A.25.25,0,0,1,2.75,7h8.5a.25.25,0,0,1,.25.25v5A.25.25,0,0,1,11.25,12.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelHotelBed1Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
