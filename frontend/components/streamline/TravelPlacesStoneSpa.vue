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
                d="M1.7,13.51a1.07,1.07,0,0,0,.9.49h8.8a1.07,1.07,0,0,0,.9-.49,2,2,0,0,0,.35-1.13c0-1.78-2.53-3.23-5.65-3.23S1.35,10.6,1.35,12.38A2,2,0,0,0,1.7,13.51Z"
            />
            <ellipse cx="7.54" cy="6.46" rx="4.58" ry="2.69" />
            <ellipse cx="6.19" cy="1.88" rx="3.23" ry="1.88" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelPlacesStoneSpa',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
