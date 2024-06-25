<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <g>
            <rect x="3" y="8" width="3" height="6" rx="1" />
            <rect x="8" y="8" width="3" height="6" rx="1" />
            <path
                d="M13,11a1,1,0,0,1-1-1V7A5,5,0,0,0,2,7v3a1,1,0,0,1-2,0V7A7,7,0,0,1,14,7v3A1,1,0,0,1,13,11Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'InterfaceHelpCustomerSupport5',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
