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
                d="M11.57,7.34,9.66,1.89a2.82,2.82,0,0,0-5.32,0L2.43,7.34a2,2,0,0,0,.26,1.82A2,2,0,0,0,4.32,10H6a.25.25,0,0,0,.25-.25V8.41a.26.26,0,0,0-.07-.17L5,7A.75.75,0,0,1,6,6l.79.79a.25.25,0,0,0,.36,0L8,6A.75.75,0,1,1,9,7L7.82,8.24a.26.26,0,0,0-.07.17V9.75A.25.25,0,0,0,8,10H9.68a2,2,0,0,0,1.63-.84A2,2,0,0,0,11.57,7.34Z"
            />
            <path
                d="M7,9.5a.76.76,0,0,0-.75.75v3a.75.75,0,0,0,1.5,0v-3A.76.76,0,0,0,7,9.5Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'NatureEcologyTree1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
