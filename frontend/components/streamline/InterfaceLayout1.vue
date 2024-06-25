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
                d="M4.25.25A.25.25,0,0,0,4,0H1.94A1.94,1.94,0,0,0,0,1.94V12.06A1.94,1.94,0,0,0,1.94,14H4a.25.25,0,0,0,.25-.25Z"
            />
            <path
                d="M5.75,6A.25.25,0,0,0,6,6.25h7.75A.25.25,0,0,0,14,6V1.94A1.94,1.94,0,0,0,12.06,0H6a.25.25,0,0,0-.25.25Z"
            />
            <path
                d="M6,7.75A.25.25,0,0,0,5.75,8v5.75A.25.25,0,0,0,6,14h6.06A1.94,1.94,0,0,0,14,12.06V8a.25.25,0,0,0-.25-.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceLayout1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
