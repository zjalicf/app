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
                d="M7.13,14a7,7,0,1,1,6.69-9.06,1,1,0,0,1-1.91.59A5,5,0,1,0,7.13,12a1,1,0,1,1,0,2Z"
            />
            <circle cx="10.12" cy="12.75" r="1" />
            <circle cx="12.87" cy="8" r="1" />
            <circle cx="12.62" cy="11" r="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfacePageControllerLoadingHalf',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
