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
                d="M1.75,9.5a.25.25,0,0,1-.25-.25V1.75a.25.25,0,0,1,.25-.25H6.68a.24.24,0,0,0,.22-.14l.5-1a.23.23,0,0,0,0-.24A.22.22,0,0,0,7.18,0H1.75A1.76,1.76,0,0,0,0,1.75v10.5A1.76,1.76,0,0,0,1.75,14h6.5A1.76,1.76,0,0,0,10,12.25V9.75a.25.25,0,0,0-.25-.25Zm4,3H4.25a.75.75,0,0,1,0-1.5h1.5a.75.75,0,0,1,0,1.5Z"
            />
            <path
                d="M13.87,6.27,11.07.66a1.2,1.2,0,0,0-2.14,0L6.13,6.27A1.19,1.19,0,0,0,7.2,8h5.6a1.19,1.19,0,0,0,1.07-1.73ZM10.75,5.5a.75.75,0,0,1-1.5,0V4a.75.75,0,0,1,1.5,0Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingBugThreatPhone',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
