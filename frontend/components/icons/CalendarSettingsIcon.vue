<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        :width="size"
        preserveAspectRatio="xMidYMid meet"
        fill="currentColor"
        viewBox="0 0 448 512"
    >
        <path
            fill="currentColor"
            d="M96 32c0-17.67 14.3-32 32-32s32 14.33 32 32v32h128V32c0-17.67 14.3-32 32-32s32 14.33 32 32v32h48c26.5 0 48 21.49 48 48v48H0v-48c0-26.51 21.49-48 48-48h48V32zm352 432c0 26.5-21.5 48-48 48H48c-26.51 0-48-21.5-48-48V192h448v272zM200 272v56h-56c-13.3 0-24 10.7-24 24s10.7 24 24 24h56v56c0 13.3 10.7 24 24 24s24-10.7 24-24v-56h56c13.3 0 24-10.7 24-24s-10.7-24-24-24h-56v-56c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
        ></path>
    </svg>
</template>

<script>
export default {
    name: 'CalendarSettingsIcon',
    props: {
        size: {
            type: String,
            default: '20',
        },
    },
};
</script>
