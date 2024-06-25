<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.67,6.08a.27.27,0,0,1-.19-.22,4.25,4.25,0,0,0-8.25-1A.25.25,0,0,1,3,5a3.5,3.5,0,0,0,.47,7H11a3,3,0,0,0,.67-5.92Zm-2.78.77A.75.75,0,0,1,8.25,8H8a.25.25,0,0,0-.25.25v1.5a.75.75,0,0,1-1.5,0V8.25A.25.25,0,0,0,6,8H5.75a.75.75,0,0,1-.64-1.15l1.25-2a.79.79,0,0,1,1.28,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingCloudUpload',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
