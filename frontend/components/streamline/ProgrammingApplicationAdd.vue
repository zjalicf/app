<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect width="6" height="6" rx="1" />
            <rect x="8" width="6" height="6" rx="1" />
            <rect y="8" width="6" height="6" rx="1" />
            <path
                d="M14,10.75a.76.76,0,0,0-.75-.75h-1.5a.25.25,0,0,1-.25-.25V8.25a.75.75,0,0,0-1.5,0v1.5a.25.25,0,0,1-.25.25H8.25a.75.75,0,0,0,0,1.5h1.5a.25.25,0,0,1,.25.25v1.5a.75.75,0,0,0,1.5,0v-1.5a.25.25,0,0,1,.25-.25h1.5A.76.76,0,0,0,14,10.75Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingApplicationAdd',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
