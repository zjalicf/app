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
                d="M6.25,12.5H4.75a.75.75,0,0,0,0,1.5h1.5a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M13.71,1.71a1,1,0,0,0,0-1.42,1,1,0,0,0-1.42,0L8.68,3.91a.25.25,0,0,1-.36,0L7.21,2.79a1,1,0,0,0-1.42,0,1,1,0,0,0,0,1.42l2,2a1,1,0,0,0,1.42,0Z"
            />
            <path
                d="M10.5,10a1,1,0,0,1-1-1V8.15A.25.25,0,0,0,9.4,8a.22.22,0,0,0-.22,0A2.59,2.59,0,0,1,8.5,8a2.49,2.49,0,0,1-1.77-.73l-2-2a2.51,2.51,0,0,1,0-3.54s0-.06,0-.1a.1.1,0,0,0-.1,0A4,4,0,0,0,1.5,5.5V9a1,1,0,0,1-1,1,.5.5,0,0,0,0,1h10a.5.5,0,0,0,0-1Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlertAlarmBellCheck',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
