<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect x="3.5" y="3.5" width="10.5" height="10.5" rx="1.5" />
            <path
                d="M0,2A2,2,0,0,1,2,0h8a1,1,0,0,1,0,2H2.5a.5.5,0,0,0-.5.5V10a1,1,0,0,1-2,0Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlignFront',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
