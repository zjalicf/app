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
                d="M14,2a2,2,0,0,0-2-2H3A2,2,0,0,0,1,2V9.48a.29.29,0,0,1,0,.09L.09,12a1.5,1.5,0,0,0,1.8,2L5.38,13H12a2,2,0,0,0,2-2Zm-1.5,9a.5.5,0,0,1-.5.5H5.32a.69.69,0,0,0-.2,0L2,12.37a.25.25,0,0,1-.3-.32l.78-2.13a.8.8,0,0,0,0-.26V2A.5.5,0,0,1,3,1.5h9a.5.5,0,0,1,.5.5Z"
            />
            <path
                d="M8.5,4.62a.17.17,0,0,1-.12,0,.17.17,0,0,1,0-.14v0a.63.63,0,1,0-1.22-.28l-.08.32a.23.23,0,0,1-.24.19H6.29a.18.18,0,0,1-.15-.07.21.21,0,0,1,0-.16.63.63,0,0,0-1.22-.28l-.08.32a.23.23,0,0,1-.24.19H4.25a.63.63,0,0,0,0,1.26.18.18,0,0,1,.14.06.17.17,0,0,1,0,.15l-.13.59a.26.26,0,0,1-.25.2H3.75a.62.62,0,1,0,0,1.24.16.16,0,0,1,.15.2v0a.63.63,0,0,0,.47.75H4.5a.63.63,0,0,0,.61-.48l.08-.32a.24.24,0,0,1,.24-.2H6a.19.19,0,0,1,.15.08.21.21,0,0,1,0,.16.63.63,0,0,0,.47.75h.14a.63.63,0,0,0,.61-.48l.08-.32a.24.24,0,0,1,.24-.2H8A.62.62,0,0,0,8,6.88a.19.19,0,0,1-.14-.07.17.17,0,0,1,0-.15L8,6.07a.25.25,0,0,1,.25-.19H8.5a.63.63,0,0,0,0-1.26Zm-2,2.06a.26.26,0,0,1-.25.2H5.84a.25.25,0,0,1-.24-.31l.11-.5A.25.25,0,0,1,6,5.88h.45a.25.25,0,0,1,.2.09.26.26,0,0,1,0,.21Z"
            />
            <path
                d="M10.75,3a.76.76,0,0,0-.75.75v2a.75.75,0,0,0,1.5,0v-2A.76.76,0,0,0,10.75,3Z"
            />
            <circle cx="10.75" cy="8.25" r="0.75" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MailChatBubbleCensorSquareAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
