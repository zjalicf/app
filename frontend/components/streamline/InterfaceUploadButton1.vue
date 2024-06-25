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
                d="M9.78,3.53a.75.75,0,0,0,0-1.06L7.53.22a.75.75,0,0,0-1.06,0L4.22,2.47a.75.75,0,0,0,0,1.06.74.74,0,0,0,.53.22H6A.25.25,0,0,1,6.25,4V7.75a.75.75,0,0,0,1.5,0V4A.25.25,0,0,1,8,3.75H9.25A.74.74,0,0,0,9.78,3.53Z"
            />
            <path
                d="M12,6.5a1,1,0,0,0-1-1H9.5a.25.25,0,0,0-.25.25v2a2.25,2.25,0,0,1-4.5,0v-2A.25.25,0,0,0,4.5,5.5H3a1,1,0,0,0-1,1V13a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceUploadButton1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
