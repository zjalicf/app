<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM9.76,5.62a.75.75,0,0,1,.73.87L10,9.86a.75.75,0,0,1-.74.64H5a1.27,1.27,0,0,1-.58-.14L4,10.15a.2.2,0,0,0-.11,0H3.75a.25.25,0,0,1-.25-.24V6.25A.25.25,0,0,1,3.75,6h0A.25.25,0,0,0,4,5.88L5.58,3.34a.72.72,0,0,1,1.33.38V5.38a.25.25,0,0,0,.25.24Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'InterfaceFavoriteLikeCircle',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
