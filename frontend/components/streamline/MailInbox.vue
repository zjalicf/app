<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,1.75A1.76,1.76,0,0,0,12.25,0H1.75A1.76,1.76,0,0,0,0,1.75V12.5A1.5,1.5,0,0,0,1.5,14h11A1.5,1.5,0,0,0,14,12.5Zm-12.5,0a.25.25,0,0,1,.25-.25h10.5a.25.25,0,0,1,.25.25v5.5a.25.25,0,0,1-.25.25H10A1.5,1.5,0,0,0,8.5,9a1.5,1.5,0,0,1-3,0A1.5,1.5,0,0,0,4,7.5H1.75a.25.25,0,0,1-.25-.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'MailInbox',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
