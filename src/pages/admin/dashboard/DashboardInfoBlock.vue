<template>
  <div class="flex flex-row gap-6">
    <va-card class="" color="primary">
      <va-card-content>
        <h2 class="va-h2 m-0">{{ counts.users }}</h2>
        <p class="w-32">{{ t('dashboard.info.users') }}</p>
      </va-card-content>
    </va-card>
    <va-card color="info">
      <va-card-content>
        <h2 class="va-h2 m-0">{{ counts.products }}</h2>
        <p class="w-32">{{ t('dashboard.info.products') }}</p>
      </va-card-content>
    </va-card>
    <va-card color="secondary">
      <va-card-content>
        <h2 class="va-h2 m-0">{{ counts.loads }}</h2>
        <p class="w-32">{{ t('dashboard.info.loads') }}</p>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { VaCard, VaCardContent } from 'vuestic-ui'
  import countsService from '../../../services/api/counts'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'

  const { init } = useToast()
  const { t } = useI18n()

  const counts = ref({
    products: 0,
    users: 0,
    loads: 0,
  })

  const fetchCounts = async () => {
    const response = await countsService.list()
    if (response.data) {
      counts.value = response.data.counts
    }

    if (response.status !== 200) {
      init({ message: t('messages.toast.dashboard.error'), color: 'danger' })
    }
  }

  fetchCounts()
</script>
