<template>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 14 14"
        fill="currentColor"
        :width="size"
        :height="size"
    >
        <path
            d="M12.84,7.09A1.51,1.51,0,0,0,11.4,6h-.9a.25.25,0,0,1-.25-.25V3.8a.26.26,0,0,1,.18-.24C12.58,3,14,1.83,14,.5a.5.5,0,0,0-.5-.5H.5A.5.5,0,0,0,0,.5C0,1.83,1.42,3,3.57,3.56a.26.26,0,0,1,.18.24v2A.25.25,0,0,1,3.5,6H2.6A1.51,1.51,0,0,0,1.16,7.09L.1,10.81A2.49,2.49,0,0,0,2.5,14h9a2.49,2.49,0,0,0,2.4-3.19ZM7,8.5c1.38,0,2.5.67,2.5,1.5S8.38,11.5,7,11.5,4.5,10.83,4.5,10,5.62,8.5,7,8.5ZM5.25,4.17A.27.27,0,0,1,5.33,4a.3.3,0,0,1,.2-.06A13.87,13.87,0,0,0,7,4a13.87,13.87,0,0,0,1.47-.08.3.3,0,0,1,.2.06.27.27,0,0,1,.08.19V5.75A.25.25,0,0,1,8.5,6h-3a.25.25,0,0,1-.25-.25Z"
        />
    </svg>
</template>
<script>
export default {
    name: 'FoodKitchenwareScale',
    props: {
        size: {
            type: String,
            required: false,
            default: '14',
        },
    },
};
</script>
