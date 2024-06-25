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
                d="M7,11a4,4,0,1,1,4-4A4,4,0,0,1,7,11ZM7,4.5A2.5,2.5,0,1,0,9.5,7,2.5,2.5,0,0,0,7,4.5Z"
            />
            <circle cx="7" cy="1" r="1" />
            <circle cx="2.76" cy="2.76" r="1" />
            <circle cx="1" cy="7" r="1" />
            <circle cx="2.76" cy="11.24" r="1" />
            <circle cx="7" cy="13" r="1" />
            <circle cx="11.24" cy="11.24" r="1" />
            <circle cx="13" cy="7" r="1" />
            <circle cx="11.24" cy="2.76" r="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLightingBrightness4',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
