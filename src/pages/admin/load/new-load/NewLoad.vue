<template>
  <div class="flex flex-col items-center">
    <va-card class="px-3 py-4 mt-32">
      <va-card-title>{{ t('loads.newLoad.title') }}</va-card-title>
      <va-card-content>
        <form class="flex flex-col gap-4" @submit.prevent="onsubmit">
          <va-input
            v-model="code"
            type="text"
            placeholder="LD1234"
            :label="t('loads.newLoad.form.inputs.code')"
            :error="!!codeErrors.length"
            :error-messages="codeErrors"
          />
          <VueDatePicker v-model="deliveryDate" :enable-time-picker="false" format="dd/MM/yy" locale="pt-BR" required />
          <div class="flex flex-row justify-around">
            <va-button type="reset" preset="secondary" class="w-[6rem]">
              {{ t('loads.newLoad.form.buttons.reset') }}
            </va-button>
            <va-button class="w-[6rem]" type="submit">
              <div v-if="!loadingStatus">
                {{ t('loads.newLoad.form.buttons.submit') }}
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
  import loadsService from '../../../../services/api/loads'
  import router from '../../../../router'
  import { FulfillingSquareSpinner } from 'epic-spinners'
  import { useGlobalStore } from '../../../../stores/global-store'
  import VueDatePicker from '@vuepic/vue-datepicker'

  const GlobalStore = useGlobalStore()
  const { t } = useI18n()

  const code = ref('')
  const currentDate = new Date()
  const deliveryDate = ref(currentDate)

  const codeErrors = ref<string[]>([])
  const loadingStatus = ref(false)

  const formReady = computed(() => {
    return !codeErrors.value.length
  })

  const onsubmit = () => {
    if (GlobalStore.user.profile !== 'admin') {
      alert(`${GlobalStore.user.profile.toUpperCase()} profile are not allowed to alter other users`)
      router.push({ name: 'load-info' })
      return
    }

    codeErrors.value = code.value ? [] : ['Code is required']

    if (formReady.value) {
      loadingStatus.value = true

      loadsService
        .create(code.value, deliveryDate.value)
        .then((response: ApiResponseDto) => {
          if (response.status === 201) router.push({ name: 'load-info' })
        })
        .catch((error: any) => {
          console.log('Error:', error)
          if (error.response.status === 422) {
            alert('Code has already been taken')
          }
        })
        .finally(() => {
          loadingStatus.value = false
        })
    }
  }
</script>
