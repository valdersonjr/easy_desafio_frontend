<template>
  <div class="flex flex-row gap-6">
    <va-card
      v-for="count in countsArray"
      :key="count[0]"
      :color="count[2]"
      class="cursor-pointer hover:shadow-lg hover:scale-105 transition-transform"
      @click="onCardClick(count[3])"
    >
      <va-card-content>
        <h2 class="va-h2 m-0">{{ count[1] }}</h2>
        <p class="w-32">{{ t(`dashboard.info.${count[0]}`) }}</p>
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
  import router from '../../../router'

  const { init } = useToast()
  const { t } = useI18n()

  const counts = ref({
    products: 0,
    orders: 0,
    loads: 0,
    users: 0,
  })

  const colors = ['primary', 'info', 'secondary', 'success']
  const routes = ['load-info', 'order-info', 'product-info', 'user-info']

  const countsArray = ref<any>([])

  const fetchCounts = async () => {
    const response = await countsService.list()
    if (response.data) {
      counts.value = response.data.counts
      countsArray.value = Object.entries(counts.value)

      countsArray.value.forEach((count: any) => {
        count.push(colors[countsArray.value.indexOf(count)])
      })

      countsArray.value.forEach((count: any) => {
        count.push(routes[countsArray.value.indexOf(count)])
      })
    }

    if (response.status !== 200) {
      init({ message: t('messages.toast.dashboard.error'), color: 'danger' })
    }
  }

  const onCardClick = (route: string) => {
    router.push({ name: route })
  }

  fetchCounts()
</script>
