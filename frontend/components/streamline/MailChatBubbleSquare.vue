<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.75,0H2.25A1.25,1.25,0,0,0,1,1.25v9.11a.29.29,0,0,1,0,.09L.05,13a.75.75,0,0,0,.7,1,.63.63,0,0,0,.19,0l3.6-1h8.21A1.25,1.25,0,0,0,14,11.75V1.25A1.25,1.25,0,0,0,12.75,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MailChatBubbleSquare',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
