<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.8,13.11a1.22,1.22,0,0,1-.77-.28L11,12c-1.73-1.51-2.2-2-3.92-2a.24.24,0,0,0-.25.24v1.23a1.2,1.2,0,0,1-.77,1.12,1.18,1.18,0,0,1-1.31-.31L.31,7.36a1.2,1.2,0,0,1,0-1.65L4.81,1.24A1.22,1.22,0,0,1,6.12,1a1.2,1.2,0,0,1,.74,1.11V3.34a.25.25,0,0,0,.23.25c4.44.3,5.58,4.19,6.85,7.94a1.19,1.19,0,0,1-.47,1.37A1.13,1.13,0,0,1,12.8,13.11ZM5.36,9.46a1,1,0,0,1,1-1H7a5.93,5.93,0,0,1,4.51,1.91.24.24,0,0,0,.31,0,.24.24,0,0,0,.09-.28c-.79-2.39-2.05-5.06-5.36-5.06H6.33a1,1,0,0,1-1-1V3.43a.25.25,0,0,0-.16-.24.27.27,0,0,0-.27.06L1.78,6.39a.26.26,0,0,0,0,.35L4.92,10.2A.25.25,0,0,0,5.36,10Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MailSendReplyAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
