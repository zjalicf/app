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
                d="M7,3.5a1,1,0,0,0,1,1H9.25a.25.25,0,0,1,.25.25V6a1,1,0,0,0,2,0V4.5a2,2,0,0,0-2-2H8A1,1,0,0,0,7,3.5Z"
            />
            <path
                d="M14,9.5a1,1,0,0,0-1-1H5.75a.25.25,0,0,1-.25-.25V1a1,1,0,0,0-2,0V3.25a.25.25,0,0,1-.25.25H1a1,1,0,0,0,0,2H3.25a.25.25,0,0,1,.25.25V8.5a2,2,0,0,0,2,2H8.25a.25.25,0,0,1,.25.25V13a1,1,0,0,0,2,0V10.75a.25.25,0,0,1,.25-.25H13A1,1,0,0,0,14,9.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditCrop',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
