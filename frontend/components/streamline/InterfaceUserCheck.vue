<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="4.75" cy="2.75" r="2.75" />
            <path
                d="M6.66,13.34A2.25,2.25,0,0,1,8.07,9.51a.25.25,0,0,0,.21-.16.25.25,0,0,0,0-.26,4.63,4.63,0,0,0-3-1.57A4.75,4.75,0,0,0,0,12.25V13a1,1,0,0,0,1,1H6.71A.26.26,0,0,0,7,13.85a.28.28,0,0,0-.06-.28Z"
            />
            <path
                d="M9.75,14a.74.74,0,0,1-.53-.22l-1.5-1.5a.75.75,0,0,1,1.06-1.06l.79.79a.25.25,0,0,0,.36,0l2.79-2.79a.75.75,0,0,1,1.06,1.06l-3.5,3.5A.74.74,0,0,1,9.75,14Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceUserCheck',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
