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
                d="M12.25,14H1.75A1.76,1.76,0,0,1,0,12.25V1.75A1.76,1.76,0,0,1,1.75,0h4A.76.76,0,0,1,6.5.75a.76.76,0,0,1-.75.75h-4a.25.25,0,0,0-.25.25v10.5a.25.25,0,0,0,.25.25h10.5a.25.25,0,0,0,.25-.25v-4a.75.75,0,0,1,1.5,0v4A1.76,1.76,0,0,1,12.25,14Z"
            />
            <path
                d="M14,4.25a.74.74,0,0,1-1.29.51l-1-1a.24.24,0,0,0-.35,0l-3.8,3.8A.75.75,0,0,1,6.47,6.47l3.8-3.8a.24.24,0,0,0,0-.35l-1-1A.76.76,0,0,1,9,.75.76.76,0,0,1,9.75,0h3.5A.76.76,0,0,1,14,.75Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsExpand5Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
