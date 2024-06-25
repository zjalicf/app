<template>
    <svg
        class="icon"
        :width="size"
        :height="size"
        viewBox="0 0 18 19"
        fill="currentColor"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M16.9993 6.78575L15.0184 15.5426M16.9993 6.78575L12.2757 8.27128M16.9993 6.78575L9.91388 1M15.0184 15.5426L12.2757 8.27128M15.0184 15.5426L8.0854 17.8881M15.0184 15.5426L6.25691 15.8553M12.2757 8.27128L9.91388 1M12.2757 8.27128L6.25691 15.8553M12.2757 8.27128L2.98086 6.55119M9.91388 1L2.98086 6.55119M9.91388 1L3.28561 4.12743M6.25691 15.8553L2.98086 6.55119M6.25691 15.8553L1 12.5715M6.25691 15.8553L8.0854 17.8881M2.98086 6.55119L3.28561 4.12743M2.98086 6.55119L1 12.5715M3.28561 4.12743L1 12.5715M1 12.5715L8.0854 17.8881"
            stroke-width="1.2"
        />
    </svg>
</template>

<script>
export default {
    name: 'Acreom',
    props: {
        size: {
            type: String,
            required: false,
            default: '20',
        },
    },
};
</script>
