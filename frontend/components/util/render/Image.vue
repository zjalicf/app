<template>
    <img :src="src" />
</template>

<script>
export default {
    name: 'ImageComponent',
    components: {},
    data() {
        return {
            src: '',
        };
    },
    mounted() {
        if (this.$attrs.src) {
            this.src = this.attrs.src;
            return;
        }
        const { id } = this.$attrs;

        if (this.$route.path.includes('sharing')) {
            this.src =
                this.$config.baseUrl +
                `/api/images/sharing/${this.$route.params.id}/${id}`;
            return;
        }

        const image = this.$store.getters['image/byId'](id);

        if (image?.filepath && image.isOnDisk) {
            this.src = image.filepath;
            return;
        }
        if (image?.remoteUri) {
            const accessToken =
                this.$store.getters['user/credentials'].accessToken;
            this.src = image.remoteUri + `?token=${accessToken}`;
            return;
        }

        const vault = this.$store.getters['vault/active'];
        if (vault.type === 'remote' && !vault.filepath && image?.data) {
            this.src = image.data;
        }
    },
};
</script>
