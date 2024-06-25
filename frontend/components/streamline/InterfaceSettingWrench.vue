<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.66,2.73a.52.52,0,0,0-.36-.3.49.49,0,0,0-.45.14l-2,2.05a1,1,0,0,1-1.41,0,1,1,0,0,1,0-1.42l2-2.05A.5.5,0,0,0,11.57.7a.48.48,0,0,0-.3-.36A4.4,4.4,0,0,0,5.42,5.83a.25.25,0,0,1-.06.26L.53,10.92a1.8,1.8,0,0,0,2.55,2.55L7.91,8.64a.27.27,0,0,1,.26-.06A4.45,4.45,0,0,0,12.11,8,4.42,4.42,0,0,0,13.66,2.73Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceSettingWrench',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
