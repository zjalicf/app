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
                d="M11.25,0H5.89A2.44,2.44,0,0,0,4.44.47L2.3,2a2.5,2.5,0,0,0-1,2V12.5A1.5,1.5,0,0,0,2.75,14H8.11a2.44,2.44,0,0,0,1.45-.47l2.56-1.82a1.5,1.5,0,0,0,.63-1.22v-9A1.5,1.5,0,0,0,11.25,0Zm-6,12.5A2.25,2.25,0,1,1,7.5,10.25,2.25,2.25,0,0,1,5.25,12.5ZM4,5.25A1.25,1.25,0,1,1,5.25,6.5,1.25,1.25,0,0,1,4,5.25Zm6.05-3.8-1.2.86a1,1,0,0,1-.58.19H4.09a.26.26,0,0,1-.24-.17A.25.25,0,0,1,4,2.05L5,1.28A1.53,1.53,0,0,1,5.89,1h4a.26.26,0,0,1,.24.17A.25.25,0,0,1,10.05,1.45Z"
            />
            <circle cx="5.25" cy="10.25" r="1.25" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'EntertainmentSpeaker2Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
