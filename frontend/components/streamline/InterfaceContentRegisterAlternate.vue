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
                d="M7.5,3.88H5a.62.62,0,0,0-.62.62v5a.62.62,0,1,0,1.24,0V8.38a.26.26,0,0,1,.26-.25H7.5A.88.88,0,0,1,8.38,9v.5a.62.62,0,1,0,1.24,0V9a2.08,2.08,0,0,0-.47-1.34.24.24,0,0,1,0-.32A2.08,2.08,0,0,0,9.62,6,2.12,2.12,0,0,0,7.5,3.88Zm-1.62,3a.26.26,0,0,1-.26-.25V5.38a.26.26,0,0,1,.26-.25H7.5a.88.88,0,1,1,0,1.75Z"
            />
            <path
                d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM7,12.5A5.5,5.5,0,1,1,12.5,7,5.51,5.51,0,0,1,7,12.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceContentRegisterAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
