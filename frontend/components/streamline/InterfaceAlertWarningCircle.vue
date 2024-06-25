<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM6.25,3.5a.75.75,0,0,1,1.5,0v3a.75.75,0,0,1-1.5,0ZM7,11a1,1,0,1,1,1-1A1,1,0,0,1,7,11Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAlertWarningCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
