<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect y="7" width="3.5" height="7" rx="1.25" />
            <path d="M8,12.5H6A.75.75,0,0,0,6,14H8a.75.75,0,0,0,0-1.5Z" />
            <path d="M13.25,12.5h-2a.75.75,0,0,0,0,1.5h2a.75.75,0,0,0,0-1.5Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'PhoneSignalLow',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
