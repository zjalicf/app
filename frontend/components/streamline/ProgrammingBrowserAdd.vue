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
                d="M12.75,0H1.25A1.25,1.25,0,0,0,0,1.25v11.5A1.25,1.25,0,0,0,1.25,14h11.5A1.25,1.25,0,0,0,14,12.75V1.25A1.25,1.25,0,0,0,12.75,0ZM12.5,12.25a.25.25,0,0,1-.25.25H1.75a.25.25,0,0,1-.25-.25V4.75a.25.25,0,0,1,.25-.25h10.5a.25.25,0,0,1,.25.25Z"
            />
            <path
                d="M8.75,7.75H8a.25.25,0,0,1-.25-.25V6.75a.75.75,0,0,0-1.5,0V7.5A.25.25,0,0,1,6,7.75H5.25a.75.75,0,0,0,0,1.5H6a.25.25,0,0,1,.25.25v.75a.75.75,0,0,0,1.5,0V9.5A.25.25,0,0,1,8,9.25h.75a.75.75,0,0,0,0-1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingBrowserAdd',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
