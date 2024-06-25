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
                d="M12.5,5.5A5.5,5.5,0,1,0,6,10.89a.23.23,0,0,0,.21-.05.25.25,0,0,0,.09-.19V8.41a.26.26,0,0,0-.07-.17L5,7A.75.75,0,0,1,6,6l.79.79a.25.25,0,0,0,.36,0L8,6A.75.75,0,1,1,9,7L7.82,8.24a.26.26,0,0,0-.07.17v2.24a.25.25,0,0,0,.09.19.23.23,0,0,0,.21.05A5.49,5.49,0,0,0,12.5,5.5Z"
            />
            <path
                d="M7,10.25a.76.76,0,0,0-.75.75v2.25a.75.75,0,0,0,1.5,0V11A.76.76,0,0,0,7,10.25Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'NatureEcologyTree2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
