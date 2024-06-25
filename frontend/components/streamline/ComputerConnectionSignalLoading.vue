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
                d="M3.25,10.25A.74.74,0,0,1,2.72,10L.22,7.53a.75.75,0,0,1,0-1.06L2.72,4A.75.75,0,1,1,3.78,5L2,6.82a.25.25,0,0,0,0,.36L3.78,9a.75.75,0,0,1,0,1.06A.74.74,0,0,1,3.25,10.25Z"
            />
            <circle cx="5.25" cy="7" r="1" />
            <path
                d="M10.75,10.25a.74.74,0,0,1-.53-.22.75.75,0,0,1,0-1.06L12,7.18a.25.25,0,0,0,0-.36L10.22,5A.75.75,0,1,1,11.28,4l2.5,2.5a.75.75,0,0,1,0,1.06L11.28,10A.74.74,0,0,1,10.75,10.25Z"
            />
            <circle cx="8.75" cy="7" r="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerConnectionSignalLoading',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
