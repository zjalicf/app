<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M11.67,6.08a.27.27,0,0,1-.19-.22,4.25,4.25,0,0,0-8.25-1A.25.25,0,0,1,3,5a3.5,3.5,0,0,0,.47,7H11a3,3,0,0,0,.67-5.92ZM8.49,8.18,9.78,9.47a.75.75,0,0,1,0,1.06.75.75,0,0,1-1.06,0L7.43,9.24a.25.25,0,0,0-.36,0L5.78,10.53a.75.75,0,0,1-1.06,0,.75.75,0,0,1,0-1.06L6,8.18a.25.25,0,0,0,0-.36L4.72,6.53A.75.75,0,0,1,5.78,5.47L7.07,6.76a.25.25,0,0,0,.36,0L8.72,5.47A.75.75,0,0,1,9.78,6.53L8.49,7.82A.25.25,0,0,0,8.49,8.18Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ProgrammingCloudDelete',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
