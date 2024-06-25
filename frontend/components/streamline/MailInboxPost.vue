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
                d="M12,3.5h-.75a.25.25,0,0,0-.25.25V5.5a2.25,2.25,0,0,1-4.5,0V3.75a.25.25,0,0,0-.25-.25H4a3,3,0,0,0-3,3V9a1,1,0,0,0,1,1H6a.25.25,0,0,1,.25.25v3a.75.75,0,0,0,1.5,0v-3A.25.25,0,0,1,8,10h4a1,1,0,0,0,1-1V4.5A1,1,0,0,0,12,3.5Z"
            />
            <path
                d="M6.75,1.5h1A.25.25,0,0,1,8,1.75V5.5a.75.75,0,0,0,1.5,0V.75A.76.76,0,0,0,8.75,0h-2A.76.76,0,0,0,6,.75.76.76,0,0,0,6.75,1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MailInboxPost',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
