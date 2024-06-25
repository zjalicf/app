<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.94,9a.5.5,0,0,0,.49-.6A5.49,5.49,0,0,0,8.2,3.88.25.25,0,0,1,8,3.64V3A1,1,0,0,0,6,3v.64a.25.25,0,0,1-.2.24A5.49,5.49,0,0,0,1.57,8.4a.5.5,0,0,0,.49.6Zm1.31,3H.75a.75.75,0,0,1,0-1.5h12.5a.75.75,0,0,1,0,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelHotelServingDome',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
