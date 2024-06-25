<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.25,6.25H9a.24.24,0,0,1-.23-.14,2,2,0,0,0-3.58,0A.24.24,0,0,1,5,6.25H.75a.75.75,0,0,0,0,1.5H5a.24.24,0,0,1,.23.14,2,2,0,0,0,3.58,0A.24.24,0,0,1,9,7.75h4.23a.75.75,0,0,0,0-1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceHierarchy9',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
