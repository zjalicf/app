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
                d="M7,14a6.78,6.78,0,0,1-2.63-.52.22.22,0,0,0-.14,0L1.41,14a1.17,1.17,0,0,1-1.13-.41,1.17,1.17,0,0,1-.2-1.19l.73-1.94a.26.26,0,0,0,0-.21A7,7,0,1,1,7,14ZM4.4,11.93a.85.85,0,0,1,.31.06A5.38,5.38,0,0,0,7,12.5,5.5,5.5,0,1,0,2.31,9.87a.73.73,0,0,1,.06.66L1.82,12a.28.28,0,0,0,0,.25.24.24,0,0,0,.24.08l2.16-.39Z"
            />
            <path d="M7,9a1,1,0,1,0,1,1A1,1,0,0,0,7,9Z" />
            <path
                d="M7,8.38A.63.63,0,0,1,7,7.12,1.37,1.37,0,1,0,5.62,5.75a.62.62,0,1,1-1.24,0A2.62,2.62,0,1,1,7,8.38Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MailChatBubbleOvalQuestionAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
