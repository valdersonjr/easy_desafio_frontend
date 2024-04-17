<template>
  <div class="flex flex-col items-center">
    <va-card class="px-3 py-4 mt-32">
      <va-card-title>{{ t('products.newProduct.title') }}</va-card-title>
      <va-card-content>
        <form class="flex flex-col gap-4" @submit.prevent="onsubmit">
          <va-input
            v-model="name"
            type="text"
            placeholder="Product 1"
            :label="t('products.newProduct.form.inputs.name')"
            :error="!!nameErrors.length"
            :error-messages="nameErrors"
          />
          <va-input
            v-model="ballast"
            type="text"
            placeholder="LX"
            :label="t('products.newProduct.form.inputs.ballast')"
            :error="!!ballastErrors.length"
            :error-messages="ballastErrors"
          />
          <div class="flex flex-row justify-around">
            <va-button type="reset" preset="secondary" class="w-[6rem]">
              {{ t('products.newProduct.form.buttons.reset') }}
            </va-button>
            <va-button class="w-[6rem]" type="submit">
              <div v-if="!loadingStatus">
                {{ t('products.newProduct.form.buttons.submit') }}
              </div>
              <FulfillingSquareSpinner v-if="loadingStatus" color="#fff" :size="14" :animation-duration="2000" />
            </va-button>
          </div>
        </form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ApiResponseDto } from '../../../../dtos'
  import productsService from '../../../../services/api/products'
  import router from '../../../../router'
  import { FulfillingSquareSpinner } from 'epic-spinners'
  import { useGlobalStore } from '../../../../stores/global-store'
  import { useToast } from 'vuestic-ui'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()
  const { init } = useToast()

  const name = ref('')
  const ballast = ref('')

  const nameErrors = ref<string[]>([])
  const ballastErrors = ref<string[]>([])
  const loadingStatus = ref(false)

  const formReady = computed(() => {
    return !(ballastErrors.value.length || nameErrors.value.length)
  })

  const onsubmit = () => {
    if (GlobalStore.user.profile !== 'admin') {
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
      return
    }

    nameErrors.value = name.value ? [] : ['Name is required']
    ballastErrors.value = ballast.value ? [] : ['Email is required']

    if (formReady.value) {
      loadingStatus.value = true

      productsService
        .create(name.value, ballast.value)
        .then((response: ApiResponseDto) => {
          if (response.status === 201) {
            router.push({ name: 'product-info' })
            init({ message: t('messages.toast.product.new.success'), color: 'success' })
          }
        })
        .catch((error: any) => {
          console.log('Error:', error)
          init({ message: t('messages.toast.product.new.error'), color: 'danger' })
        })
        .finally(() => {
          loadingStatus.value = false
        })
    }
  }
</script>
