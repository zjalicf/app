<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,14a6.78,6.78,0,0,1-2.63-.52.22.22,0,0,0-.14,0L1.41,14a1.2,1.2,0,0,1-1.33-1.6l.73-1.94a.26.26,0,0,0,0-.21A7,7,0,1,1,7,14ZM4.4,11.93a.85.85,0,0,1,.31.06A5.38,5.38,0,0,0,7,12.5,5.5,5.5,0,1,0,2.31,9.87a.73.73,0,0,1,.06.66L1.82,12a.28.28,0,0,0,0,.25.24.24,0,0,0,.24.08l2.16-.39Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MailChatBubbleOvalAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
