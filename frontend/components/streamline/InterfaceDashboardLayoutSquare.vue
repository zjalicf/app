<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect
                width="6"
                height="6"
                rx="1.5"
                transform="translate(0 6) rotate(-90)"
            />
            <rect
                x="8"
                width="6"
                height="6"
                rx="1.5"
                transform="translate(8 14) rotate(-90)"
            />
            <rect
                y="8"
                width="6"
                height="6"
                rx="1.5"
                transform="translate(-8 14) rotate(-90)"
            />
            <rect
                x="8"
                y="8"
                width="6"
                height="6"
                rx="1.5"
                transform="translate(0 22) rotate(-90)"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceDashboardLayoutSquare',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
