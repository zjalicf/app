<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.5,0a1,1,0,0,0-1,1v.25a.25.25,0,0,1-.25.25H4.75a.25.25,0,0,1-.25-.25V1a1,1,0,0,0-2,0V13a1,1,0,0,0,2,0v-.25a.25.25,0,0,1,.25-.25h4.5a.25.25,0,0,1,.25.25V13a1,1,0,0,0,2,0V1A1,1,0,0,0,10.5,0ZM9.25,3.5a.25.25,0,0,1,.25.25v2A.25.25,0,0,1,9.25,6H4.75a.25.25,0,0,1-.25-.25v-2a.25.25,0,0,1,.25-.25Zm-4.5,7a.25.25,0,0,1-.25-.25v-2A.25.25,0,0,1,4.75,8h4.5a.25.25,0,0,1,.25.25v2a.25.25,0,0,1-.25.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelWayfinderLadder',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
