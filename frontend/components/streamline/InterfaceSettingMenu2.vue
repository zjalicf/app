<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <path d="M13,3H6A1,1,0,0,1,6,1h7a1,1,0,0,1,0,2Z" />
            <path d="M10.75,8h-7a1,1,0,0,1,0-2h7a1,1,0,0,1,0,2Z" />
            <path
                d="M9.5,12a1,1,0,0,1-1,1H1a1,1,0,0,1,0-2H8.5A1,1,0,0,1,9.5,12Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingMenu2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
