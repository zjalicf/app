<template>
    <div
        class="linear-issue-assignee"
        :style="{ '--icon-size': `${size}px`, '--font-size': `${fontSize}px` }"
    >
        <InterfaceUserCircle
            v-if="!user || !user.id"
            :size="`${size}`"
            class="linear-issue-assignee--none"
        />
        <div
            v-else-if="!user.avatarUrl"
            class="linear-issue-assignee__initials"
            :style="{
                '--icon-bg-color': `${iconBgColor}`,
            }"
        >
            {{ initials }}
        </div>
        <img v-else :src="user.avatarUrl" :alt="user.name" />
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import InterfaceUserCircle from '~/components/streamline/InterfaceUserCircle.vue';
import { initialsBackgroundColor } from '~/components/linear/helpers';

@Component({
    name: 'LinearUserIcon',
    components: { InterfaceUserCircle },
})
export default class LinearUserIcon extends Vue {
    @Prop({ required: true, default: null })
    user!: any;

    @Prop({ default: 18 })
    size!: number;

    @Prop({ default: 9 })
    fontSize!: number;

    get initials() {
        if (!this.user?.id) return null;
        const name = this.user.name ?? this.user.email;
        let firstInitial, lastInitial;
        const letterRegex = new RegExp('^\\p{Letter}', 'u'); // Matches any Unicode letter.
        // If the name is an email, use the part before "@", replacing "." with " ".
        // Otherwise, use the name as is.
        const processedName = name.includes('@')
            ? name.split('@')[0].replace(/\./g, ' ')
            : name;
        // Split the processed name into words that start with a letter.
        const nameParts = (processedName.match(/\S+/g) || []).filter(
            (part: string) => letterRegex.test(part),
        );
        // Determine the initials: if there are at least two parts, use the first letter of the
        // first and last parts. If not, just take the first two characters of the processed name.
        const initials =
            nameParts.length > 1
                ? `${
                      (firstInitial = nameParts[0]) != null
                          ? firstInitial[0]
                          : ''
                  }${
                      (lastInitial = nameParts[nameParts.length - 1]) != null
                          ? lastInitial[0]
                          : ''
                  }`
                : processedName.slice(0, 2);

        // Return the initials in uppercase if they match the regex, else return null.
        return initials.match(/^[a-z0-9]*$/i) ? initials.toUpperCase() : null;
    }

    get iconBgColor() {
        if (!this.user?.id) return null;
        const id =
            this.user.id.split('/').length > 1
                ? this.$entities.linear.parseId(this.user.id).id
                : this.user.id;
        return initialsBackgroundColor(id);
    }
}
</script>
<style lang="scss" scoped>
.linear-issue-assignee {
    width: var(--icon-size);
    height: var(--icon-size);

    &--none {
        opacity: 0.3;
    }

    &__initials {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size);
        text-transform: uppercase;
        width: var(--icon-size);
        height: var(--icon-size);
        border-radius: 50%;
        flex-shrink: 0;

        color: white !important;
        background: var(--icon-bg-color);
    }

    img {
        width: var(--icon-size);
        height: var(--icon-size);
        border-radius: 50%;
        flex-shrink: 0;
    }
}
</style>
