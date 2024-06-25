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
                d="M13,9.38a1,1,0,0,1-1-1V5.88a1,1,0,1,1,2,0v2.5A1,1,0,0,1,13,9.38Z"
            />
            <g>
                <path
                    d="M10.71,5.88a.23.23,0,0,0,.18-.09A.22.22,0,0,0,11,5.6a5.22,5.22,0,0,0-10.4,0,.22.22,0,0,0,.06.19.26.26,0,0,0,.18.09Z"
                />
                <path
                    d="M.5,8.85a.09.09,0,0,1,0,.05L0,11.23a1,1,0,0,0,1,1.15H3.69a1,1,0,0,0,.92-.61L5.35,10a.24.24,0,0,1,.23-.15h4.67A.76.76,0,0,0,11,9.12V7.62a.25.25,0,0,0-.25-.24H.75a.25.25,0,0,0-.25.24Z"
                />
            </g>
        </g>
    </svg>
</template>
<script>
export default {
    name: 'ShoppingClothAccessoriesMiningHelmet',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
