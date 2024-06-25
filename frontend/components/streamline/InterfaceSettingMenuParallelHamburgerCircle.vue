<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0Zm3,10.75H4a.75.75,0,0,1,0-1.5h6a.75.75,0,0,1,0,1.5Zm0-3H4a.75.75,0,0,1,0-1.5h6a.75.75,0,0,1,0,1.5Zm0-3H4a.75.75,0,0,1,0-1.5h6a.75.75,0,0,1,0,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingMenuParallelHamburgerCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
