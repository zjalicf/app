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
                d="M12.12,3.25h-6a1.5,1.5,0,0,0-1.5,1.5v4.5a1.5,1.5,0,0,0,1.5,1.5h6a1.5,1.5,0,0,0,1.5-1.5V4.75A1.5,1.5,0,0,0,12.12,3.25Zm.42,2.62-3,2A.7.7,0,0,1,9.12,8a.69.69,0,0,1-.41-.13l-3-2a.74.74,0,0,1-.21-1,.75.75,0,0,1,1-.2L9,6.26a.26.26,0,0,0,.27,0l2.45-1.63a.75.75,0,0,1,1,.2A.74.74,0,0,1,12.54,5.87Z"
            />
            <path d="M2.38,4.75h-2a.75.75,0,1,1,0-1.5h2a.75.75,0,0,1,0,1.5Z" />
            <path d="M2.38,7.75h-2a.75.75,0,1,1,0-1.5h2a.75.75,0,0,1,0,1.5Z" />
            <path d="M2.38,10.75h-2a.75.75,0,1,1,0-1.5h2a.75.75,0,0,1,0,1.5Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MailSendEmailEnvelope',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
