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
                d="M12.75,0H3.25A1.25,1.25,0,0,0,2,1.25v1.5a.76.76,0,0,0,.75.75h9.5a.25.25,0,0,1,.25.25v5.5a.25.25,0,0,1-.25.25h-.5a.75.75,0,0,0,0,1.5h1A1.25,1.25,0,0,0,14,9.75V1.25A1.25,1.25,0,0,0,12.75,0Z"
            />
            <path
                d="M9.5,6.25A1.25,1.25,0,0,0,8.25,5h-7A1.25,1.25,0,0,0,0,6.25v6.5A1.25,1.25,0,0,0,1.25,14h7A1.25,1.25,0,0,0,9.5,12.75ZM1.75,12.5a.25.25,0,0,1-.25-.25V8.75a.25.25,0,0,1,.25-.25h6A.25.25,0,0,1,8,8.75v3.5a.25.25,0,0,1-.25.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingBrowserMultipleWindow',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
