<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="11.5" cy="4.5" r="2.5" />
            <path
                d="M11.5,8.5A4,4,0,0,1,10,8.22a.22.22,0,0,0-.22,0L6.91,10.13a.76.76,0,0,1-.82,0L1.84,7.38a.77.77,0,0,1-.22-1,.75.75,0,0,1,1-.22l3.7,2.4a.28.28,0,0,0,.28,0L8.36,7.4a.25.25,0,0,0,.11-.17A.29.29,0,0,0,8.42,7,4,4,0,0,1,7.5,4.5c0-.08,0-.15,0-.22A.24.24,0,0,0,7.27,4H1.5A1.5,1.5,0,0,0,0,5.5v7A1.5,1.5,0,0,0,1.5,14h10A1.5,1.5,0,0,0,13,12.5V8.56a.25.25,0,0,0-.1-.2.25.25,0,0,0-.22,0A3.88,3.88,0,0,1,11.5,8.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MailInboxEnvelopeNotification',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
