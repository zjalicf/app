<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path
                d="M10,8.76A3.17,3.17,0,0,0,7,6.5H7A3.17,3.17,0,0,0,4,8.76l-.2.66a2.41,2.41,0,0,0,.38,2.11h0a2.38,2.38,0,0,0,1.92,1H7.94a2.38,2.38,0,0,0,1.92-1h0a2.41,2.41,0,0,0,.38-2.11Z"
            />
            <ellipse cx="1.5" cy="8" rx="1.5" ry="2" />
            <ellipse cx="4.5" cy="3.5" rx="1.5" ry="2" />
            <ellipse cx="9.5" cy="3.5" rx="1.5" ry="2" />
            <ellipse cx="12.5" cy="8" rx="1.5" ry="2" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelHotelPetPaw',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
