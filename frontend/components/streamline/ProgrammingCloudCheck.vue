<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.67,6.08a.27.27,0,0,1-.19-.22,4.25,4.25,0,0,0-8.25-1A.25.25,0,0,1,3,5a3.5,3.5,0,0,0,.47,7H11a3,3,0,0,0,.67-5.92Zm-2.39.7-3.5,3.5a.75.75,0,0,1-1.06,0l-1.5-1.5A.75.75,0,0,1,4.28,7.72l.79.79a.25.25,0,0,0,.36,0L8.22,5.72A.75.75,0,0,1,9.28,6.78Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingCloudCheck',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
