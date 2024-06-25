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
                d="M7.25,12.5H5.75a.75.75,0,0,0,0,1.5h1.5a.75.75,0,0,0,0-1.5Z"
            />
            <g>
                <circle cx="10.5" cy="2.5" r="2.5" />
                <path
                    d="M11.5,10a1,1,0,0,1-1-1V6.74a.25.25,0,0,0-.24-.25,4,4,0,0,1-3.76-4,3.43,3.43,0,0,1,.11-.86.12.12,0,0,0,0-.1.15.15,0,0,0-.09,0,4,4,0,0,0-4,4V9a1,1,0,0,1-1,1,.5.5,0,0,0,0,1h10a.5.5,0,0,0,0-1Z"
                />
            </g>
        </g>
    </svg>
</template>
<script>
export default {
    name: 'PhoneNotificationAlarm2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
