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
                d="M7.75,12.5H6.25a.75.75,0,0,0,0,1.5h1.5a.75.75,0,0,0,0-1.5Z"
            />
            <g>
                <path
                    d="M12,10a1,1,0,0,1-1-1l0,0h0a2.28,2.28,0,0,1-.45,0A2.5,2.5,0,0,1,8,6.5a2.46,2.46,0,0,1,.42-1.36.28.28,0,0,0,0-.28A2.46,2.46,0,0,1,8,3.5V1.84a.26.26,0,0,0-.2-.25A4.17,4.17,0,0,0,7,1.5a4,4,0,0,0-4,4V9a1,1,0,0,1-1,1,.5.5,0,0,0,0,1H12a.5.5,0,0,0,0-1Z"
                />
                <g>
                    <path d="M10.5,5.5a1,1,0,1,0,1,1A1,1,0,0,0,10.5,5.5Z" />
                    <path
                        d="M10.5,0a1,1,0,0,0-1,1V3.5a1,1,0,0,0,2,0V1A1,1,0,0,0,10.5,0Z"
                    />
                </g>
            </g>
        </g>
    </svg>
</template>
<script>
export default {
    name: 'PhoneNotificationAlarm1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
