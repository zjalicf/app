<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13,6a6,6,0,1,0-7,5.92.25.25,0,0,1,.21.24v1.09a.75.75,0,0,0,1.5,0V12.16A.25.25,0,0,1,8,11.92,6,6,0,0,0,13,6ZM8.06,10.36a.23.23,0,0,1-.21,0,.24.24,0,0,1-.1-.19V8.41a.26.26,0,0,1,.07-.17L9,7A.75.75,0,1,0,8,6l-.79.79a.25.25,0,0,1-.36,0L6,6A.75.75,0,0,0,5,7L6.18,8.24a.26.26,0,0,1,.07.17v1.71a.24.24,0,0,1-.1.19.23.23,0,0,1-.21,0,4.5,4.5,0,1,1,2.12,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'NatureEcologyTree2Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
