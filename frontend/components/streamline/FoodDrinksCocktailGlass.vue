<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M13.18,2.13A1.25,1.25,0,0,0,12.29,0H1.71A1.25,1.25,0,0,0,.82,2.13L6,7.27a1,1,0,0,1,.29.7v4.28A.25.25,0,0,1,6,12.5H4.25a.75.75,0,0,0,0,1.5h5.5a.75.75,0,0,0,0-1.5H8a.25.25,0,0,1-.25-.25V8A1,1,0,0,1,8,7.27ZM11.09,1.5a.25.25,0,0,1,.23.15.26.26,0,0,1-.06.28L7.18,6a.25.25,0,0,1-.36,0L2.74,1.93a.26.26,0,0,1-.06-.28.25.25,0,0,1,.23-.15Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'FoodDrinksCocktailGlass',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
