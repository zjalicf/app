<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,5.25A1.76,1.76,0,0,0,12.25,3.5h-2A.25.25,0,0,1,10,3.25v-1A1.76,1.76,0,0,0,8.25.5H5.75A1.76,1.76,0,0,0,4,2.25v1a.25.25,0,0,1-.25.25h-2A1.76,1.76,0,0,0,0,5.25v6.5A1.76,1.76,0,0,0,1.75,13.5h10.5A1.76,1.76,0,0,0,14,11.75Zm-8.5-3A.25.25,0,0,1,5.75,2h2.5a.25.25,0,0,1,.25.25v1a.25.25,0,0,1-.25.25H5.75a.25.25,0,0,1-.25-.25Zm1.5,9A2.75,2.75,0,1,1,9.75,8.5,2.75,2.75,0,0,1,7,11.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ImageCamera2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
