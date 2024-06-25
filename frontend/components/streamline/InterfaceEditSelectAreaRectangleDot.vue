<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <circle cx="1.25" cy="1.25" r="1.25" />
            <circle cx="5.08" cy="1.25" r="1.25" />
            <circle cx="8.92" cy="1.25" r="1.25" />
            <circle cx="12.75" cy="1.25" r="1.25" />
            <circle cx="1.25" cy="12.75" r="1.25" />
            <circle cx="5.08" cy="12.75" r="1.25" />
            <circle cx="8.92" cy="12.75" r="1.25" />
            <circle cx="12.75" cy="12.75" r="1.25" />
            <circle cx="12.75" cy="5.08" r="1.25" />
            <circle cx="12.75" cy="8.92" r="1.25" />
            <circle cx="1.25" cy="5.08" r="1.25" />
            <circle cx="1.25" cy="8.92" r="1.25" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceEditSelectAreaRectangleDot',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
