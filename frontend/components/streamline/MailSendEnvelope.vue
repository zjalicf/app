<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.5,1.25H1.5A1.5,1.5,0,0,0,0,2.75v8.5a1.5,1.5,0,0,0,1.5,1.5h11a1.5,1.5,0,0,0,1.5-1.5V2.75A1.5,1.5,0,0,0,12.5,1.25Zm-.11,4.14-4,2.4a2.71,2.71,0,0,1-2.8,0l-4-2.4a.75.75,0,0,1,.78-1.28l4,2.39a1.22,1.22,0,0,0,1.24,0l4-2.39a.75.75,0,0,1,.78,1.28Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MailSendEnvelope',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
