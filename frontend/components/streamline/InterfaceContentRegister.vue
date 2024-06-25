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
                d="M8.25,6a.76.76,0,0,0-.75-.75H6a.25.25,0,0,0-.25.25v1A.25.25,0,0,0,6,6.75H7.5A.76.76,0,0,0,8.25,6Z"
            />
            <path
                d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM9.75,9v.5a.75.75,0,0,1-1.5,0V9a.76.76,0,0,0-.75-.75H6a.25.25,0,0,0-.25.25v1a.75.75,0,0,1-1.5,0v-5A.76.76,0,0,1,5,3.75H7.5a2.25,2.25,0,0,1,1.8,3.6.24.24,0,0,0,0,.3A2.26,2.26,0,0,1,9.75,9Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceContentRegister',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
