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
                d="M7,14a7,7,0,1,1,7-7A7,7,0,0,1,7,14ZM7,1.5A5.5,5.5,0,1,0,12.5,7,5.51,5.51,0,0,0,7,1.5Z"
            />
            <path d="M5,9A.75.75,0,0,1,3.5,9V5A.75.75,0,0,1,5,5Z" />
            <path
                d="M10.5,9.25a.75.75,0,0,1-.42.67.74.74,0,0,1-.78-.07L6.3,7.6a.75.75,0,0,1,0-1.2l3-2.25a.74.74,0,0,1,.78-.07.75.75,0,0,1,.42.67Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentControlButtonPreviousCircleAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
