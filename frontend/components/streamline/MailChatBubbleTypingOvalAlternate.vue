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
                d="M7,14a6.78,6.78,0,0,1-2.63-.52.22.22,0,0,0-.14,0L1.41,14,1.2,14a1.2,1.2,0,0,1-.92-.43,1.17,1.17,0,0,1-.2-1.19l.73-1.94a.26.26,0,0,0,0-.21A7,7,0,1,1,7,14ZM4.4,11.93a.85.85,0,0,1,.31.06A5.38,5.38,0,0,0,7,12.5,5.5,5.5,0,1,0,2.31,9.87a.73.73,0,0,1,.06.66l-.7,1.88,2.59-.47Z"
            />
            <circle cx="7" cy="7" r="1" />
            <circle cx="4" cy="7" r="1" />
            <circle cx="10" cy="7" r="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MailChatBubbleTypingOvalAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
