<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path d="M2.75,14h-2a.75.75,0,0,1,0-1.5h2a.75.75,0,0,1,0,1.5Z" />
            <path d="M8,14H6a.75.75,0,0,1,0-1.5H8A.75.75,0,0,1,8,14Z" />
            <path d="M13.25,14h-2a.75.75,0,0,1,0-1.5h2a.75.75,0,0,1,0,1.5Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'PhoneSignalOff',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
