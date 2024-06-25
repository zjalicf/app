<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="6" cy="7" r="2.5" />
            <path
                d="M2.25,7a3.2,3.2,0,0,1,.07-.7.26.26,0,0,0-.06-.21A.22.22,0,0,0,2.07,6H1A1,1,0,0,0,1,8H2.07a.23.23,0,0,0,.19-.09.26.26,0,0,0,.06-.21A3.2,3.2,0,0,1,2.25,7Z"
            />
            <path
                d="M13,6H9.93a.23.23,0,0,0-.19.09.26.26,0,0,0-.06.21,3.53,3.53,0,0,1,0,1.4.26.26,0,0,0,.06.21A.22.22,0,0,0,9.93,8H13a1,1,0,0,0,0-2Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingSlideHorizontal',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
