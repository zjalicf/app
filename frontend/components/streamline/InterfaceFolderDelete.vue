<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M14,4.24a1.5,1.5,0,0,0-1.5-1.49H6.56a.26.26,0,0,1-.25-.19l-.16-.67A1.51,1.51,0,0,0,4.69.75H1.5A1.5,1.5,0,0,0,0,2.25v9.5a1.5,1.5,0,0,0,1.5,1.5h11a1.5,1.5,0,0,0,1.06-.44A1.52,1.52,0,0,0,14,11.75Zm-4.72,5H4.75a.75.75,0,0,1,0-1.5h4.5a.75.75,0,0,1,0,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceFolderDelete',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
