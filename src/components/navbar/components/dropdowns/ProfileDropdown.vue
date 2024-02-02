<template>
  <div class="profile-dropdown-wrapper">
    <va-dropdown v-model="isShown" class="profile-dropdown" stick-to-edges :offset="[13, 0]">
      <template #anchor>
        <span class="profile-dropdown__anchor">
          <slot />
          <va-icon class="px-2" :name="isShown ? 'angle_up' : 'angle_down'" :color="colors.primary" />
        </span>
      </template>
      <va-dropdown-content class="profile-dropdown__content">
        <va-list-item v-for="option in options" :key="option.name" class="p-2">
          <router-link :to="{ name: option.redirectTo }" class="profile-dropdown__item">
            <div @click="handleOptionClick(option.name)">
              {{ t(`user.${option.name}`) }}
            </div>
          </router-link>
        </va-list-item>
      </va-dropdown-content>
    </va-dropdown>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import router from '../../../../router'
  import { useColors, useToast } from 'vuestic-ui'

  const { t } = useI18n()
  const { init } = useToast()
  const { colors } = useColors()

  withDefaults(
    defineProps<{
      options?: { name: string; redirectTo: string }[]
    }>(),
    {
      options: () => [
        {
          name: 'profile',
          redirectTo: 'profile',
        },
        {
          name: 'logout',
          redirectTo: 'login',
        },
      ],
    },
  )

  const isShown = ref(false)

  const handleOptionClick = (option: string) => {
    if (option === 'logout') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      init({ message: t('messages.toast.logout.success'), color: 'success' })
      router.push({ name: 'login' })
    } else if (option === 'profile') {
      router.push({ name: 'profile' })
    }
  }
</script>

<style lang="scss" scoped>
  .profile-dropdown {
    cursor: pointer;

    &__anchor {
      display: inline-block;
    }

    &__item {
      display: block;
      color: var(--va-gray);

      &:hover,
      &:active {
        color: var(--va-primary);
      }
    }
  }
</style>
