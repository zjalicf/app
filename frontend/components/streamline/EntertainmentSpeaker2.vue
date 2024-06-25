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
                d="M10.5,0h-7A1.5,1.5,0,0,0,2,1.5v11A1.5,1.5,0,0,0,3.5,14h7A1.5,1.5,0,0,0,12,12.5V1.5A1.5,1.5,0,0,0,10.5,0ZM7,1.5A1.5,1.5,0,1,1,5.5,3,1.5,1.5,0,0,1,7,1.5Zm0,11a3,3,0,1,1,3-3A3,3,0,0,1,7,12.5Z"
            />
            <circle cx="7" cy="9.5" r="1.5" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentSpeaker2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
