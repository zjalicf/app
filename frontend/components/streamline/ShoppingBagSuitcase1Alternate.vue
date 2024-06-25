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
                d="M11.25,3H10V1.75A1.76,1.76,0,0,0,8.25,0H5.75A1.76,1.76,0,0,0,4,1.75V3H2.75A2.75,2.75,0,0,0,0,5.75v5.5A2.75,2.75,0,0,0,2.75,14h8.5A2.75,2.75,0,0,0,14,11.25V5.75A2.75,2.75,0,0,0,11.25,3ZM5.5,1.75a.25.25,0,0,1,.25-.25h2.5a.25.25,0,0,1,.25.25V3h-3Zm7,9.5a1.25,1.25,0,0,1-1.25,1.25H2.75A1.25,1.25,0,0,1,1.5,11.25V5.75A1.25,1.25,0,0,1,2.75,4.5h8.5A1.25,1.25,0,0,1,12.5,5.75Z"
            />
            <path
                d="M10.25,6H3.75a.75.75,0,0,0,0,1.5h6.5a.75.75,0,0,0,0-1.5Z"
            />
            <path
                d="M10.25,9.5H3.75a.75.75,0,0,0,0,1.5h6.5a.75.75,0,0,0,0-1.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ShoppingBagSuitcase1Alternate',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
