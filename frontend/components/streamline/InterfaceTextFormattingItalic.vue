<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.5,1a1,1,0,0,0-1-1H5A1,1,0,0,0,5,2H7.27a.26.26,0,0,1,.2.1.24.24,0,0,1,0,.23l-3.16,9.5A.26.26,0,0,1,4.1,12H1.5a1,1,0,0,0,0,2H9a1,1,0,0,0,0-2H6.73a.26.26,0,0,1-.2-.1.24.24,0,0,1,0-.23l3.16-9.5A.26.26,0,0,1,9.9,2h2.6A1,1,0,0,0,13.5,1Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingItalic',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
