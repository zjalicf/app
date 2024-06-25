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
                d="M13.82,6.52l-1.55-2L13.11,2a.91.91,0,0,0-.21-.93A.92.92,0,0,0,12,.89l-2.39.85L7.48.18A.87.87,0,0,0,6.54.1.91.91,0,0,0,6,.91l.08,2.54L4,5a.91.91,0,0,0-.37.88.89.89,0,0,0,.62.72l2.44.71.77,2.5A.9.9,0,0,0,9,10l1.43-2.1,2.62,0a.92.92,0,0,0,.81-.5A.87.87,0,0,0,13.82,6.52Z"
            />
            <path
                d="M.29,13.71a1,1,0,0,1,0-1.42L4,8.54A1,1,0,0,1,5.46,10L1.71,13.71A1,1,0,0,1,.29,13.71Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditMagicWand',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
