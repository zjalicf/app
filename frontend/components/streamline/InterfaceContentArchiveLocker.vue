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
                d="M13.75,6.25A.25.25,0,0,0,14,6V2.5A2.5,2.5,0,0,0,11.5,0h-9A2.5,2.5,0,0,0,0,2.5V6a.25.25,0,0,0,.25.25ZM7,1.75A1.25,1.25,0,1,1,5.75,3,1.25,1.25,0,0,1,7,1.75Z"
            />
            <path
                d="M.25,7.75A.25.25,0,0,0,0,8v3.5A2.5,2.5,0,0,0,2.5,14h9A2.5,2.5,0,0,0,14,11.5V8a.25.25,0,0,0-.25-.25ZM7,12a1.25,1.25,0,1,1,1.25-1.25A1.25,1.25,0,0,1,7,12Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceContentArchiveLocker',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
