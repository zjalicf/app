<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,4a2.5,2.5,0,0,0-2.5-2.5h-9A2.5,2.5,0,0,0,0,4v6a2.5,2.5,0,0,0,2.5,2.5h9A2.5,2.5,0,0,0,14,10ZM9.57,7.62,6.36,9.41h0a.72.72,0,0,1-.71,0,.69.69,0,0,1-.35-.61V5.21a.69.69,0,0,1,.35-.61.72.72,0,0,1,.71,0L9.57,6.38a.7.7,0,0,1,0,1.24Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'ComputerLogoYoutube',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
