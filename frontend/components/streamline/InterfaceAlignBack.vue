<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect width="10.5" height="10.5" rx="1.5" />
            <path
                d="M14,12a2,2,0,0,1-2,2H4a1,1,0,0,1,0-2h7.5a.5.5,0,0,0,.5-.5V4a1,1,0,0,1,2,0Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignBack',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
