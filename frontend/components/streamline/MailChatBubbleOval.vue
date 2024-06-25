<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0A7,7,0,0,0,0,7a6.89,6.89,0,0,0,1,3.55.25.25,0,0,1,0,.22L0,13.32a.51.51,0,0,0,.09.5A.5.5,0,0,0,.59,14L4,13.37a.22.22,0,0,1,.14,0A7,7,0,1,0,7,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MailChatBubbleOval',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
