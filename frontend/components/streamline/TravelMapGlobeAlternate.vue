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
                d="M6,9.25A3.25,3.25,0,1,1,9.25,6,3.26,3.26,0,0,1,6,9.25Zm0-5A1.75,1.75,0,1,0,7.75,6,1.76,1.76,0,0,0,6,4.25Z"
            />
            <path
                d="M12.12,6a6,6,0,0,0-6-6,.75.75,0,0,0,0,1.5,4.5,4.5,0,1,1-3,7.85.75.75,0,0,0-1,1.12,6,6,0,0,0,3,1.45.26.26,0,0,1,.22.25v.08a.25.25,0,0,1-.25.25H4.38a.75.75,0,1,0,0,1.5h3.5a.75.75,0,1,0,0-1.5H7.13a.25.25,0,0,1-.25-.25v-.08a.25.25,0,0,1,.21-.25A6,6,0,0,0,12.12,6Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelMapGlobeAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
