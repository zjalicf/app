<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="11" cy="2.25" r="2.25" />
            <path
                d="M11,6c-2.92,0-3,6.73-3,7.5a.5.5,0,0,0,.5.5h5a.5.5,0,0,0,.5-.5C14,12.73,13.92,6,11,6Z"
            />
            <circle cx="3" cy="2.25" r="2.25" />
            <path
                d="M5.5,6H.5a.5.5,0,0,0-.5.5C0,7.27.08,14,3,14S6,7.27,6,6.5A.5.5,0,0,0,5.5,6Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'TravelWayfinderToiletSignManWoman',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
