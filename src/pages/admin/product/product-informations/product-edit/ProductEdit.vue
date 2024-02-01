<template>
  <div class="absolute">
    <VaModal v-model="isOpenChild" ok-text="Submit" hide-default-actions close-button @close="handleModalClose">
      <h3 class="va-h3">{{ t('products.informations.edit.modal.title') }}</h3>
      <form class="flex flex-col gap-3" @submit.prevent="handleFormSubmit">
        <va-input
          v-model="name"
          :label="t('products.informations.edit.modal.form.inputs.name')"
          :error="!!nameErrors.length"
          :error-messages="nameErrors"
          type="text"
        />
        <va-input
          v-model="ballast"
          :label="t('products.informations.edit.modal.form.inputs.ballast')"
          :error="!!ballastErrors.length"
          :error-messages="ballastErrors"
          type="number"
        />
        <div class="flex flex-row justify-around">
          <va-button preset="secondary" class="min-w-[6rem]" type="Cancel" @click="handleModalClose">{{
            t('products.informations.edit.modal.form.buttons.cancel')
          }}</va-button>
          <va-button class="min-w-[6rem]" type="submit">{{
            t('products.informations.edit.modal.form.buttons.save')
          }}</va-button>
        </div>
      </form>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps, computed } from 'vue'
  import productsService from '../../../../../services/api/products'
  import { ApiResponseDto } from '../../../../../dtos'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const props = defineProps(['isOpen', 'product'])

  const emits = defineEmits(['isOpenValueChange'])

  const isOpenChild = ref(props.isOpen)

  const name = ref(props.product.name)
  const ballast = ref(props.product.ballast)

  const nameErrors = ref<string[]>([])
  const ballastErrors = ref<string[]>([])

  const handleModalClose = () => {
    isOpenChild.value = false
    emits('isOpenValueChange', isOpenChild.value)
  }

  const formReady = computed(() => {
    return !(nameErrors.value.length || ballastErrors.value.length)
  })

  const handleFormSubmit = () => {
    nameErrors.value = name.value ? [] : ['Name is required']
    ballastErrors.value = ballast.value ? [] : ['Ballast is required']

    if (formReady.value) {
      productsService
        .update(props.product.id, name.value, ballast.value)
        .then((response: ApiResponseDto) => {
          if (response.status === 200) handleModalClose()
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
  }
</script>
