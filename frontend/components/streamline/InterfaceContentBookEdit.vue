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
                d="M13.21,3.8,11.71.3a.53.53,0,0,0-.92,0L9.29,3.8a.48.48,0,0,0,0,.2v8a1.84,1.84,0,0,0,2,2,1.84,1.84,0,0,0,2-2V4A.48.48,0,0,0,13.21,3.8Z"
            />
            <path
                d="M7.75,5.75A.25.25,0,0,0,7.5,5.5H4.75a1,1,0,0,1,0-2H7.63a.25.25,0,0,0,.23-.17l1.28-3a.29.29,0,0,0,0-.24A.26.26,0,0,0,8.91,0H2.25A1.5,1.5,0,0,0,.75,1.5v11A1.5,1.5,0,0,0,2.25,14H7.88a.22.22,0,0,0,.21-.12.26.26,0,0,0,0-.24A3.76,3.76,0,0,1,7.75,12Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceContentBookEdit',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
