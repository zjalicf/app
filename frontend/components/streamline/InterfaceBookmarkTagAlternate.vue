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
                d="M10.39,13.43a1.94,1.94,0,0,1-2.75,0L.46,6.25A1.57,1.57,0,0,1,0,5L.23,1.7A1.57,1.57,0,0,1,1.7.23L5,0A1.63,1.63,0,0,1,6.25.46l7.18,7.18a1.94,1.94,0,0,1,0,2.75ZM5.27,1.6a.26.26,0,0,0-.19-.07L1.8,1.72a.09.09,0,0,0-.08.08L1.51,5a.24.24,0,0,0,.07.2L8.7,12.37a.45.45,0,0,0,.63,0l3-3h0A.44.44,0,0,0,12.5,9a.42.42,0,0,0-.13-.31Z"
            />
            <circle cx="4" cy="4" r="1" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceBookmarkTagAlternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
