<template>
  <div class="flex flex-col items-center">
    <va-card class="px-3 py-4 mt-32">
      <va-card-title>{{ t('orders.newOrder.title') }}</va-card-title>
      <va-card-content>
        <form class="flex flex-col gap-4" @submit.prevent="onsubmit">
          <va-input
            v-model="code"
            type="text"
            placeholder="123"
            :label="t('orders.newOrder.form.inputs.code')"
            required
            :error="!!codeErrors.length"
          />
          <va-input v-model="bay" type="text" placeholder="1" :label="t('orders.newOrder.form.inputs.bay')" required />
          <va-input
            v-model="loadCode"
            type="text"
            placeholder="LD1234"
            :label="t('orders.newOrder.form.inputs.load_code')"
            required
            :error="!!loadCodeErrors.length"
          />
          <div class="flex flex-row justify-around">
            <va-button type="reset" preset="secondary" class="w-[6rem]" @click="clearForm()">
              {{ t('orders.newOrder.form.buttons.reset') }}
            </va-button>
            <va-button class="w-[6rem]" type="submit">
              <div v-if="!loadingStatus">
                {{ t('orders.newOrder.form.buttons.submit') }}
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
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ApiResponseDto } from '../../../../dtos'
  import ordersService from '../../../../services/api/orders'
  import router from '../../../../router'
  import { FulfillingSquareSpinner } from 'epic-spinners'
  import { useGlobalStore } from '../../../../stores/global-store'
  import { useToast } from 'vuestic-ui'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()
  const { init } = useToast()

  const code = ref('')
  const bay = ref('')
  const loadCode = ref('')

  const codeErrors = ref<string[]>([])
  const loadCodeErrors = ref<string[]>([])

  const loadingStatus = ref(false)

  const onsubmit = () => {
    if (GlobalStore.user.profile !== 'admin') {
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
      return
    }

    loadingStatus.value = true

    ordersService
      .create(code.value, bay.value, loadCode.value)
      .then((response: ApiResponseDto) => {
        if (response.status === 201) {
          router.push({ name: 'list-products', params: { id: response.data.order_id, code: code.value } })
          init({ message: t('messages.toast.order.new.success'), color: 'success' })
        }
      })
      .catch((error: any) => {
        console.log('Error:', error)
        if (error.response.status === 422) {
          if (error.response.data.message.includes('Code has already been taken')) {
            init({ message: t('messages.toast.order.new.error_code'), color: 'danger' })
            codeErrors.value = ['Code has already been taken']
            loadCodeErrors.value = []
          } else if (error.response.data.message.includes('Load not found')) {
            init({ message: t('messages.toast.order.new.error_load_code'), color: 'danger' })
            loadCodeErrors.value = ['Load not found']
            codeErrors.value = []
          } else init({ message: t('messages.toast.order.new.error'), color: 'danger' })
        } else init({ message: t('messages.toast.order.new.error'), color: 'danger' })
      })
      .finally(() => {
        loadingStatus.value = false
      })
  }

  const clearForm = () => {
    code.value = ''
    bay.value = ''
    loadCode.value = ''
  }

  // const clearErrors = () => {
  //     codeErrors.value = []
  //     loadCodeErrors.value = []
  // }
</script>
