<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect x="5" y="4.75" width="4" height="9.25" rx="0.25" />
            <path
                d="M13.75,3.25A.25.25,0,0,0,14,3V1.94A1.94,1.94,0,0,0,12.06,0H1.94A1.94,1.94,0,0,0,0,1.94V3a.25.25,0,0,0,.25.25Z"
            />
            <path
                d="M10.75,4.75A.25.25,0,0,0,10.5,5v8.75a.25.25,0,0,0,.25.25h1.31A1.94,1.94,0,0,0,14,12.06V5a.25.25,0,0,0-.25-.25Z"
            />
            <path
                d="M3.5,5a.25.25,0,0,0-.25-.25h-3A.25.25,0,0,0,0,5v7.06A1.94,1.94,0,0,0,1.94,14H3.25a.25.25,0,0,0,.25-.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLayout6',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
