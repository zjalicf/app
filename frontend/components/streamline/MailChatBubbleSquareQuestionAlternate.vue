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
                d="M.09,12,1,9.57a.29.29,0,0,0,0-.09V2A2,2,0,0,1,3,0h9a2,2,0,0,1,2,2v9a2,2,0,0,1-2,2H5.42L1.89,14A1.5,1.5,0,0,1,.09,12ZM3,1.5a.5.5,0,0,0-.5.5V9.66a.8.8,0,0,1,0,.26l-.78,2.13a.25.25,0,0,0,.3.32l3.15-.84a.69.69,0,0,1,.2,0H12a.5.5,0,0,0,.5-.5V2a.5.5,0,0,0-.5-.5Z"
            />
            <path d="M7.5,8.5a1,1,0,1,0,1,1,1,1,0,0,0-1-1Z" />
            <path
                d="M7.5,7.88a.63.63,0,0,1,0-1.26A1.37,1.37,0,1,0,6.12,5.25a.62.62,0,1,1-1.24,0A2.62,2.62,0,1,1,7.5,7.88Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MailChatBubbleSquareQuestionAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
