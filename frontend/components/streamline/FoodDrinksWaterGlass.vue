<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.81.25A.75.75,0,0,0,12.25,0H1.75A.74.74,0,0,0,1,.84L2.3,11.56A2.75,2.75,0,0,0,5,14H9a2.76,2.76,0,0,0,2.73-2.43L13,.84A.75.75,0,0,0,12.81.25ZM11.12,1.5a.27.27,0,0,1,.19.08.25.25,0,0,1,.06.2L11,5.28a.25.25,0,0,1-.25.22H3.3a.25.25,0,0,1-.25-.22l-.42-3.5a.25.25,0,0,1,.06-.2.27.27,0,0,1,.19-.08Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'FoodDrinksWaterGlass',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
