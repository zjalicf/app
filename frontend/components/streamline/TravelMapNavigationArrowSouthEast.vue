<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M.07,12.26a.52.52,0,0,0,.07.58A.52.52,0,0,0,.71,13l13-5.5a.52.52,0,0,0,0-.92L.71,1a.52.52,0,0,0-.57.12.52.52,0,0,0-.07.58L2.88,6.88a.26.26,0,0,1,0,.24Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelMapNavigationArrowSouthEast',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
