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
                d="M8,9a.25.25,0,0,0-.25.25v1a.75.75,0,0,1-1.5,0v-1A.25.25,0,0,0,6,9H.25A.25.25,0,0,0,0,9.25V12.5A1.5,1.5,0,0,0,1.5,14h11A1.5,1.5,0,0,0,14,12.5V9.25A.25.25,0,0,0,13.75,9Z"
            />
            <path
                d="M13.75,7.5A.25.25,0,0,0,14,7.25V5.5A1.5,1.5,0,0,0,12.5,4H11.24A.25.25,0,0,1,11,3.76a4,4,0,0,0-8,0A.25.25,0,0,1,2.76,4H1.5A1.5,1.5,0,0,0,0,5.5V7.25a.25.25,0,0,0,.25.25ZM7,2A2,2,0,0,1,9,3.71a.23.23,0,0,1-.06.2A.25.25,0,0,1,8.73,4H5.27a.25.25,0,0,1-.19-.09A.23.23,0,0,1,5,3.71,2,2,0,0,1,7,2Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingToolBox',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
