<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,7a7,7,0,1,0-7,7A7,7,0,0,0,14,7ZM5.29,10.71a1,1,0,0,1,0-1.42L7.41,7.18a.25.25,0,0,0,0-.36L5.29,4.71A1,1,0,0,1,6.71,3.29l3,3a1,1,0,0,1,0,1.42l-3,3A1,1,0,0,1,5.29,10.71Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceArrowsRightCircle2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
