<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12,0H2A2,2,0,0,0,0,2V12a2,2,0,0,0,2,2H12a2,2,0,0,0,2-2V2A2,2,0,0,0,12,0ZM10,10.75H4a.75.75,0,0,1,0-1.5h6a.75.75,0,0,1,0,1.5Zm0-3H4a.75.75,0,0,1,0-1.5h6a.75.75,0,0,1,0,1.5Zm0-3H4a.75.75,0,0,1,0-1.5h6a.75.75,0,0,1,0,1.5Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingMenuParallelHamburgerSquare',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
