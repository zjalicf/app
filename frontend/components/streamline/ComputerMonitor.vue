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
                d="M14,1.25A1.25,1.25,0,0,0,12.75,0H3.25A1.25,1.25,0,0,0,2,1.25v2a.25.25,0,0,0,.25.25h5.5A2.75,2.75,0,0,1,10.5,6.25v2.5a.25.25,0,0,0,.25.25h2A1.25,1.25,0,0,0,14,7.75Z"
            />
            <path
                d="M9,6.25A1.25,1.25,0,0,0,7.75,5H1.25A1.25,1.25,0,0,0,0,6.25v4A1.25,1.25,0,0,0,1.25,11.5H3.5a.25.25,0,0,1,.25.25v.5a.25.25,0,0,1-.25.25H2.75a.75.75,0,0,0,0,1.5h3.5a.75.75,0,0,0,0-1.5H5.5a.25.25,0,0,1-.25-.25v-.5a.25.25,0,0,1,.25-.25H7.75A1.25,1.25,0,0,0,9,10.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerMonitor',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
