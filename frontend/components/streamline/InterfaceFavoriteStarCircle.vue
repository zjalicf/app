<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0Zm3.19,5.75a.53.53,0,0,1,.44.37.52.52,0,0,1-.14.56L9.25,7.9a.23.23,0,0,0-.07.22l.28,1.74a.52.52,0,0,1-.21.53.55.55,0,0,1-.58,0L7.13,9.63a.27.27,0,0,0-.23,0l-1.57.82a.55.55,0,0,1-.58,0,.52.52,0,0,1-.21-.53l.29-1.72a.26.26,0,0,0-.07-.22L3.51,6.68a.52.52,0,0,1-.14-.56.53.53,0,0,1,.44-.37L5.53,5.5a.3.3,0,0,0,.19-.14l.79-1.58a.57.57,0,0,1,1,0l.77,1.57a.26.26,0,0,0,.19.13Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceFavoriteStarCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
