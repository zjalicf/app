<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.67,6.08a.27.27,0,0,1-.19-.22,4.25,4.25,0,0,0-8.25-1A.25.25,0,0,1,3,5a3.5,3.5,0,0,0,.47,7H11a3,3,0,0,0,.67-5.92ZM9.25,8.5h-1A.25.25,0,0,0,8,8.75v1a.75.75,0,0,1-1.5,0v-1a.25.25,0,0,0-.25-.25h-1a.75.75,0,0,1,0-1.5h1a.25.25,0,0,0,.25-.25v-1a.75.75,0,0,1,1.5,0v1A.25.25,0,0,0,8.25,7h1a.75.75,0,0,1,0,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingCloudAdd',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
