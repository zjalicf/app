<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="7" cy="2.25" r="2.25" />
            <path
                d="M10,6H4a.5.5,0,0,0-.5.5c0,.77.1,7.5,3.5,7.5s3.5-6.73,3.5-7.5A.5.5,0,0,0,10,6Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelWayfinderToiletSignMan',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
