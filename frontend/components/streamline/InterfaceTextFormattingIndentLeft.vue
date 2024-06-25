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
                d="M8.75,2.75h4.5a.75.75,0,0,0,0-1.5H8.75a.75.75,0,0,0,0,1.5Z"
            />
            <path
                d="M8,5.75a.76.76,0,0,0,.75.75h2.5a.75.75,0,0,0,0-1.5H8.75A.76.76,0,0,0,8,5.75Z"
            />
            <path
                d="M13.25,8.5H8.75a.75.75,0,0,0,0,1.5h4.5a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M11.25,12.25H8.75a.75.75,0,0,0,0,1.5h2.5a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M1.28,4.47A.75.75,0,0,0,.22,5.53L1.51,6.82a.25.25,0,0,1,0,.36L.22,8.47a.75.75,0,0,0,0,1.06.75.75,0,0,0,1.06,0l2-2a.75.75,0,0,0,0-1.06Z"
            />
            <path
                d="M5.75,0A.76.76,0,0,0,5,.75v12.5a.75.75,0,0,0,1.5,0V.75A.76.76,0,0,0,5.75,0Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingIndentLeft',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
