<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="1.5" cy="2" r="1.5" />
            <path d="M13,3H5.5a1,1,0,0,1,0-2H13a1,1,0,0,1,0,2Z" />
            <circle cx="1.5" cy="7" r="1.5" />
            <path d="M13,8H5.5a1,1,0,0,1,0-2H13a1,1,0,0,1,0,2Z" />
            <circle cx="1.5" cy="12" r="1.5" />
            <path d="M13,13H5.5a1,1,0,0,1,0-2H13a1,1,0,0,1,0,2Z" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceTextFormattingListBullets',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
