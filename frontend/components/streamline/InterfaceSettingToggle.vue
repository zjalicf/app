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
                d="M11,.25H3a3,3,0,0,0,0,6h8a3,3,0,0,0,0-6Zm-.5,4.5A1.5,1.5,0,1,1,12,3.25,1.5,1.5,0,0,1,10.5,4.75Z"
            />
            <path
                d="M11,7.75H3a3,3,0,0,0,0,6h8a3,3,0,0,0,0-6Zm-7.5,4.5A1.5,1.5,0,1,1,5,10.75,1.5,1.5,0,0,1,3.5,12.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingToggle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
