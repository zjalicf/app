<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,2a1,1,0,0,0-1-1H1A1,1,0,0,0,0,2v8a1,1,0,0,0,1,1H6a.25.25,0,0,1,.25.25v1A.25.25,0,0,1,6,12.5H4A.75.75,0,0,0,4,14h6a.75.75,0,0,0,0-1.5H8a.25.25,0,0,1-.25-.25v-1A.25.25,0,0,1,8,11h5a1,1,0,0,0,1-1ZM5.25,5.87a.62.62,0,0,1-.44-.18.61.61,0,0,1,0-.88L6.56,3.06a.61.61,0,0,1,.88,0L9.19,4.81a.61.61,0,0,1,0,.88.63.63,0,0,1-.44.19H7.88a.25.25,0,0,0-.26.24V8A.62.62,0,0,1,6.38,8V6.12a.26.26,0,0,0-.25-.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceUploadDesktop',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
