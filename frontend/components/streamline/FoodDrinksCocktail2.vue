<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M10.85.14l-2.5.5a.74.74,0,0,0-.59.62l-.37,2.4a.25.25,0,0,1-.25.22H3a.75.75,0,0,0-.75.75v7.5A1.76,1.76,0,0,0,4,13.88H9a1.76,1.76,0,0,0,1.75-1.75V4.63A.75.75,0,0,0,10,3.88H9.17A.25.25,0,0,1,9,3.79a.25.25,0,0,1-.06-.2l.21-1.41A.27.27,0,0,1,9.33,2l1.82-.36a.76.76,0,0,0,.59-.88A.76.76,0,0,0,10.85.14ZM9.25,7.88A.25.25,0,0,1,9,8.13H4a.25.25,0,0,1-.25-.25V5.63A.25.25,0,0,1,4,5.38H9a.25.25,0,0,1,.25.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'FoodDrinksCocktail2',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
