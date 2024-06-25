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
                d="M.75,13.25A.76.76,0,0,1,0,12.5V1.5A.76.76,0,0,1,.75.75a.76.76,0,0,1,.75.75v11A.76.76,0,0,1,.75,13.25Z"
            />
            <path
                d="M7,11.25a.76.76,0,0,1-.75-.75v-7a.75.75,0,0,1,1.5,0v7A.76.76,0,0,1,7,11.25Z"
            />
            <path
                d="M4,9.75A.76.76,0,0,1,3.25,9V5a.75.75,0,0,1,1.5,0V9A.76.76,0,0,1,4,9.75Z"
            />
            <path
                d="M13.25,13.25a.76.76,0,0,1-.75-.75V1.5a.75.75,0,0,1,1.5,0v11A.76.76,0,0,1,13.25,13.25Z"
            />
            <path
                d="M10,9.75A.76.76,0,0,1,9.25,9V5a.75.75,0,0,1,1.5,0V9A.76.76,0,0,1,10,9.75Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceIdVoice1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
