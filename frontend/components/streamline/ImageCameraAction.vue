<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11,0H3A1,1,0,0,0,2,1V9a1,1,0,0,0,1,1H4.25a.25.25,0,0,1,.25.25v2a.25.25,0,0,1-.25.25h-.5a.75.75,0,0,0,0,1.5h6.5a.75.75,0,0,0,0-1.5h-.5a.25.25,0,0,1-.25-.25v-2A.25.25,0,0,1,9.75,10H11a1,1,0,0,0,1-1V1A1,1,0,0,0,11,0ZM8,12.25a.25.25,0,0,1-.25.25H6.25A.25.25,0,0,1,6,12.25v-2A.25.25,0,0,1,6.25,10h1.5a.25.25,0,0,1,.25.25ZM7,7.5A2.5,2.5,0,1,1,9.5,5,2.5,2.5,0,0,1,7,7.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ImageCameraAction',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
