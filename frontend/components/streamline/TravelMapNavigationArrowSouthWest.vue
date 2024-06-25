<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.93,1.74a.52.52,0,0,0-.07-.58A.52.52,0,0,0,13.29,1l-13,5.5a.52.52,0,0,0,0,.92l13,5.5a.52.52,0,0,0,.57-.12.52.52,0,0,0,.07-.58L11.12,7.12a.25.25,0,0,1,0-.24Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelMapNavigationArrowSouthWest',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
