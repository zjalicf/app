<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.26,13.93a.52.52,0,0,0,.58-.07.52.52,0,0,0,.12-.57L7.46.29a.52.52,0,0,0-.92,0L1,13.29a.52.52,0,0,0,.12.57.52.52,0,0,0,.58.07l5.14-2.81a.26.26,0,0,1,.24,0Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'TravelMapNavigationArrow2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
