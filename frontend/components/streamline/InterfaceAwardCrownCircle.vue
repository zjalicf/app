<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0Zm4,8A1.5,1.5,0,0,1,9.5,9.5h-5A1.5,1.5,0,0,1,3,8V6a.5.5,0,0,1,.8-.4l.85.64a.5.5,0,0,0,.66,0L6.65,4.85a.5.5,0,0,1,.7,0L8.69,6.19a.5.5,0,0,0,.66,0l.85-.64A.5.5,0,0,1,11,6Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceAwardCrownCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
