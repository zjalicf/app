<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,7a.76.76,0,0,0-.75-.75h-1A.25.25,0,0,1,12,6V4.5A1.5,1.5,0,0,0,10.5,3h-1A1.5,1.5,0,0,0,8,4.5V6a.25.25,0,0,1-.25.25H6.25A.25.25,0,0,1,6,6V3A1.5,1.5,0,0,0,4.5,1.5h-1A1.5,1.5,0,0,0,2,3V6a.25.25,0,0,1-.25.25h-1a.75.75,0,0,0,0,1.5h1A.25.25,0,0,1,2,8v3a1.5,1.5,0,0,0,1.5,1.5h1A1.5,1.5,0,0,0,6,11V8a.25.25,0,0,1,.25-.25h1.5A.25.25,0,0,1,8,8V9.5A1.5,1.5,0,0,0,9.5,11h1A1.5,1.5,0,0,0,12,9.5V8a.25.25,0,0,1,.25-.25h1A.76.76,0,0,0,14,7Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignVerticalCenter',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
