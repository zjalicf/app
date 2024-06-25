<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="6.13" cy="6" r="3" />
            <path
                d="M12.13,6a6,6,0,0,0-6-6,.75.75,0,0,0,0,1.5,4.5,4.5,0,1,1-3,7.85.75.75,0,0,0-1,1.12,6,6,0,0,0,3,1.45.26.26,0,0,1,.22.25v.08a.25.25,0,0,1-.25.25H4.38a.75.75,0,1,0,0,1.5h3.5a.75.75,0,1,0,0-1.5H7.13a.25.25,0,0,1-.25-.25v-.08a.25.25,0,0,1,.21-.25A6,6,0,0,0,12.13,6Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelMapGlobe',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
