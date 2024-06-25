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
                d="M1.5,6a.5.5,0,0,0,.5.5h9a.5.5,0,0,0,.5-.5V5.5a5,5,0,0,0-10,0Z"
            />
            <path
                d="M14,8.75A.76.76,0,0,0,13.25,8H.75a.75.75,0,0,0,0,1.5h.5a.25.25,0,0,1,.25.25V12a1.5,1.5,0,0,0,3,0v-.25a.25.25,0,0,1,.25-.25H8a2,2,0,0,0,2-1.78.25.25,0,0,1,.25-.22h3A.76.76,0,0,0,14,8.75Z"
            />
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ShoppingClothAccessoriesConstructionHelmet1',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
