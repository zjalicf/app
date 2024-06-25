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
                d="M13.25,1.5H.75A.76.76,0,0,1,0,.75.76.76,0,0,1,.75,0h12.5A.76.76,0,0,1,14,.75.76.76,0,0,1,13.25,1.5Z"
            />
            <path
                d="M13.25,5.67H3.75a.75.75,0,0,1,0-1.5h9.5a.75.75,0,0,1,0,1.5Z"
            />
            <path
                d="M13.25,14H.75a.75.75,0,0,1,0-1.5h12.5a.75.75,0,0,1,0,1.5Z"
            />
            <path
                d="M13.25,9.83H3.75a.75.75,0,0,1,0-1.5h9.5a.75.75,0,0,1,0,1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingRightAlign',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
