<template>
  <div class="absolute">
    <VaModal v-model="isOpenChild" size="small" hide-default-actions @close="handleModalClose">
      <div class="flex flex-col gap-3">
        <span class="text-lg font-bold"> {{ props.message }}</span>
        <div class="flex flex-row items-center gap-3 px-3 py-2">
          <va-button preset="secondary" class="min-w-[6rem]" @click="handleModalClose">{{
            props.cancelText
          }}</va-button>
          <va-button color="primary" class="min-w-[6rem]" @click="handleSubmitClick">
            <fulfilling-square-spinner v-if="isLoadingChild" :size="10" :animation-duration="2000" />
            <span v-if="!isLoadingChild">{{ props.okText }}</span>
          </va-button>
        </div>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits } from 'vue'
  import { FulfillingSquareSpinner } from 'epic-spinners'

  const emits = defineEmits(['isLoadingValueChange', 'isOpenValueChange'])

  const props = defineProps({
    message: {
      type: String,
      default: 'Are you sure?',
    },
    okText: {
      type: String,
      default: 'submit',
    },
    cancelText: {
      type: String,
      default: 'Cancel',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  })

  const isOpenChild = ref(props.isOpen)
  const isLoadingChild = ref(props.isLoading)

  const handleModalClose = () => {
    isOpenChild.value = false
    isLoadingChild.value = false
    emits('isOpenValueChange', isOpenChild.value)
    emits('isLoadingValueChange', isLoadingChild.value)
  }

  const handleSubmitClick = () => {
    isLoadingChild.value = true
    emits('isLoadingValueChange', isLoadingChild.value)
  }
</script>
