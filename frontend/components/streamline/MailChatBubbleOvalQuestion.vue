<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0A7,7,0,0,0,0,7a6.89,6.89,0,0,0,1,3.55.25.25,0,0,1,0,.22L0,13.32A.5.5,0,0,0,.59,14L4,13.37a.22.22,0,0,1,.14,0A7,7,0,1,0,7,0ZM7,11.25a1,1,0,1,1,1-1A1,1,0,0,1,7,11.25Zm0-3a.75.75,0,0,1,0-1.5A1.25,1.25,0,1,0,5.75,5.5a.75.75,0,0,1-1.5,0A2.75,2.75,0,1,1,7,8.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MailChatBubbleOvalQuestion',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
