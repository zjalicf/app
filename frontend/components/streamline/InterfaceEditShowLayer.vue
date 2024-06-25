<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.5,3.5H10.25A.25.25,0,0,1,10,3.25V1.75A1.76,1.76,0,0,0,8.25,0h-5A1.76,1.76,0,0,0,1.5,1.75v8A1.76,1.76,0,0,0,3.25,11.5h1.5a.25.25,0,0,1,.25.25V13a1,1,0,0,0,1,1h5.5a1,1,0,0,0,1-1V4.5A1,1,0,0,0,11.5,3.5ZM5,4.5V9.75a.25.25,0,0,1-.25.25H3.25A.25.25,0,0,1,3,9.75v-8a.25.25,0,0,1,.25-.25h5a.25.25,0,0,1,.25.25v1.5a.25.25,0,0,1-.25.25H6A1,1,0,0,0,5,4.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditShowLayer',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
