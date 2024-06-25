<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,1.25A1.25,1.25,0,0,0,12.75,0H2.25A1.25,1.25,0,0,0,1,1.25v9.11a.29.29,0,0,1,0,.09L.05,13a.74.74,0,0,0,.89,1l3.6-1h8.21A1.25,1.25,0,0,0,14,11.75ZM8.5,9h-4a.75.75,0,0,1,0-1.5h4A.75.75,0,0,1,8.5,9Zm2-3.5h-6A.75.75,0,0,1,4.5,4h6a.75.75,0,0,1,0,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MailChatBubbleTextSquare',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
