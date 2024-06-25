<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.56,5.85,8.15.43A1.55,1.55,0,0,0,6,.43L3.44,3a1.5,1.5,0,0,0,0,2.12L5,6.67A.24.24,0,0,1,5,7L.41,11.58a1.41,1.41,0,0,0,2,2L7,9A.29.29,0,0,1,7.15,9,.26.26,0,0,1,7.32,9l1.53,1.53A1.47,1.47,0,0,0,9.91,11,1.46,1.46,0,0,0,11,10.55L13.56,8A1.52,1.52,0,0,0,14,6.91,1.5,1.5,0,0,0,13.56,5.85Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingHammer',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
