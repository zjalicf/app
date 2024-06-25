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
                d="M13.25,12.5H.75a.75.75,0,0,0,0,1.5h12.5a.75.75,0,0,0,0-1.5Z"
            />
            <rect x="1" width="3" height="11" rx="0.75" />
            <rect x="5.5" y="5" width="3" height="6" rx="0.75" />
            <rect x="10" y="2" width="3" height="9" rx="0.75" />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'MoneyGraphBar',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
