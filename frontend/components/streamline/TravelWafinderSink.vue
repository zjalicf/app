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
                d="M13,9.5H4.5a.25.25,0,0,1-.25-.25V2.75a1.25,1.25,0,0,1,2.5,0,.75.75,0,0,0,1.5,0,2.75,2.75,0,0,0-5.5,0v6.5a.25.25,0,0,1-.25.25H1a1,1,0,0,0-1,1V11a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3v-.5A1,1,0,0,0,13,9.5Z"
            />
            <path
                d="M7.5,5a.76.76,0,0,0-.75.75v1a.75.75,0,0,0,1.5,0v-1A.76.76,0,0,0,7.5,5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelWafinderSink',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
