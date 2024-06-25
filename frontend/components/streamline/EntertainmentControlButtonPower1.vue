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
                d="M7,14A7,7,0,0,1,1.75,2.38,1,1,0,0,1,3.25,3.7a5,5,0,1,0,7.5,0,1,1,0,0,1,1.5-1.32A7,7,0,0,1,7,14Z"
            />
            <path
                d="M7,6.5a1,1,0,0,1-1-1V1A1,1,0,0,1,8,1V5.5A1,1,0,0,1,7,6.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonPower1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
