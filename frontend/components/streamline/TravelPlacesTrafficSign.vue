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
                d="M10.5,3.5A3.5,3.5,0,1,0,5.83,6.8.26.26,0,0,1,6,7v3a.25.25,0,0,0,.25.25h1.5A.25.25,0,0,0,8,10V7a.26.26,0,0,1,.17-.24A3.5,3.5,0,0,0,10.5,3.5Z"
            />
            <path d="M8.75,14H5.25a1,1,0,0,1,0-2h3.5a1,1,0,0,1,0,2Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelPlacesTrafficSign',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
