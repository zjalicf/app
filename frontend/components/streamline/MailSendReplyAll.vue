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
                d="M9.25,4.75H7.16a.25.25,0,0,1-.23-.15A.26.26,0,0,1,7,4.32L8.28,3A.75.75,0,1,0,7.22,2l-3,3A.75.75,0,0,0,4.22,6l3,3A.75.75,0,0,0,8.28,9,.75.75,0,0,0,8.28,8L7,6.68a.26.26,0,0,1-.06-.28.25.25,0,0,1,.23-.15H9.25A3.26,3.26,0,0,1,12.5,9.5v2a.75.75,0,0,0,1.5,0v-2A4.75,4.75,0,0,0,9.25,4.75Z"
            />
            <path
                d="M2,5.68a.25.25,0,0,1,0-.36L4.28,3A.75.75,0,0,0,3.22,2l-3,3A.75.75,0,0,0,.22,6l3,3A.75.75,0,0,0,4.28,9,.75.75,0,0,0,4.28,8Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MailSendReplyAll',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
