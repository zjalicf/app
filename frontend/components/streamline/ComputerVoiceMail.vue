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
                d="M7,9.5A3.5,3.5,0,0,0,10.5,6V3.5a3.5,3.5,0,0,0-7,0V6A3.5,3.5,0,0,0,7,9.5Z"
            />
            <path
                d="M13.5,6A.75.75,0,0,0,12,6,5,5,0,0,1,2,6,.75.75,0,0,0,.5,6,6.51,6.51,0,0,0,6,12.43a.25.25,0,0,1,.21.25v.57a.75.75,0,0,0,1.5,0v-.57A.25.25,0,0,1,8,12.43,6.51,6.51,0,0,0,13.5,6Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ComputerVoiceMail',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
