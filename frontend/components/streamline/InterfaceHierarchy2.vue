<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.75,9.65V8A1.76,1.76,0,0,0,11,6.25H8A.25.25,0,0,1,7.75,6V4.35a2,2,0,1,0-1.5,0V6A.25.25,0,0,1,6,6.25H3A1.76,1.76,0,0,0,1.25,8V9.65a2,2,0,1,0,1.5,0V8A.25.25,0,0,1,3,7.75H6A.25.25,0,0,1,6.25,8V9.65a2,2,0,1,0,1.5,0V8A.25.25,0,0,1,8,7.75h3a.25.25,0,0,1,.25.25V9.65a2,2,0,1,0,1.5,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceHierarchy2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
