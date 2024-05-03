<template>
  <div class="flex flex-col gap-3">
    <ConfirmationModal
      v-if="isConfirmationModalOpen"
      :is-open="isConfirmationModalOpen"
      :message="t('loads.informations.delete.confirmation_modal.title')"
      :ok-text="t('loads.informations.delete.confirmation_modal.buttons.confirm')"
      :cancel-text="t('loads.informations.delete.confirmation_modal.buttons.deny')"
      :is-loading="isConfirmationModalLoading"
      @isOpenValueChange="handleIsOpenConfirmationModalValueChange"
      @isLoadingValueChange="handleIsLoadingConfirmationModalValueChange"
    />

    <va-card>
      <va-card-title>Filtros</va-card-title>
      <va-card-content>
        <form class="flex flex-col gap-3" @submit.prevent="onFormSubmit()">
          <div class="flex flex-row gap-3">
            <va-input v-model="nameFilter" type="text" label="Nome" />
            <va-input v-model="quantityFilter" type="number" label="Quantidade" />
            <va-button class="px-2" color="primary" type="reset" @click="handleFilterClear()">Limpar</va-button>
            <va-button type="submit" class="px-2" color="info">Buscar</va-button>
          </div>
          <VaCheckbox v-model="boxFilter" label="Caixa" />
        </form>
      </va-card-content>
    </va-card>

    <va-card>
      <va-card-title>{{ t('orders.listProducts.table.title') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <div class="max-h-[450px] overflow-y-auto">
          <table class="va-table va-table--striped va-table--hoverable w-full">
            <thead>
              <tr>
                <th class="cursor-pointer">
                  {{ t('orders.listProducts.table.headers.name') }}
                </th>
                <th>Layer</th>
                <th class="cursor-pointer" @click="handleSorting('quantity')">
                  <sorting-icon-div :text="t('orders.listProducts.table.headers.quantity')" />
                </th>
                <th class="cursor-pointer" @click="handleSorting('box')">
                  <sorting-icon-div :text="t('orders.listProducts.table.headers.box')" />
                </th>
                <th>Lastro</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="orderProduct in orderProducts" :key="orderProduct.id">
                <td class="w-[30%]">{{ orderProduct.product.name }}</td>
                <td class="">{{ orderProduct.layer }}</td>
                <td class="">{{ orderProduct.quantity }}</td>
                <td class="">{{ orderProduct.box ? 'SIM' : 'NÃO' }}</td>
                <td class="">{{ orderProduct.product.ballast }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </va-card-content>
    </va-card>
    <div>
      <va-button class="mt-4" color="primary" @click="router.back()">{{
        t('orders.listProducts.buttons.back')
      }}</va-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import router from '../../../../../../router'
  import SortingIconDiv from '../../../../../../components/sorting-icon-div/SortingIconDiv.vue'
  import ConfirmationModal from '../../../../../../components/modals/ConfirmationModal.vue'
  import { useGlobalStore } from '../../../../../../stores/global-store'
  import { useToast } from 'vuestic-ui'
  import productsService from '../../../../../../services/api/products'
  import sortedOrderProducts from '../../../../../../services/api/sortedOrderProducts'

  const { t } = useI18n()
  const { init } = useToast()

  const orderId = ref(Number(router.currentRoute.value.params.id))
  const orderProducts = ref([] as any)

  const nameFilter = ref('')
  const quantityFilter = ref('')
  const boxFilter = ref(false)
  const sortColumn = ref('layer')
  const sortDirection = ref('asc')

  const isEditModalOpen = ref(false)
  const listProduct = ref({} as any)

  const isConfirmationModalOpen = ref(false)
  const productIdToUnlink = ref(-1)
  const isConfirmationModalLoading = ref(false)

  const products = ref([]) as any

  const selectedProducts = ref([] as any)
  const quantity = ref(0)
  const box = ref(false)
  const quantityErrors = ref<string[]>([])

  const addProductFilterClear = () => {
    selectedProducts.value = []
    quantity.value = 0
    box.value = false
    quantityErrors.value = []
  }

  const onFormSubmit = () => {
    fetchOrderProducts(orderId.value)
  }

  const handleFilterClear = () => {
    nameFilter.value = ''
    quantityFilter.value = ''
    boxFilter.value = false
    fetchOrderProducts(orderId.value)
  }

  const handleProductListEdition = (id: number, quantity: number, box: boolean) => {
    if (useGlobalStore().user.profile === 'admin') {
      listProduct.value = { id, quantity, box }
      isEditModalOpen.value = true
    } else {
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${useGlobalStore().user.profile.toUpperCase()}`,
        color: 'danger',
      })
    }
  }

  const fetchOrderProducts = async (orderId: number) => {
    try {
      if (orderId) {
        const response = await sortedOrderProducts.list({
          order_id: orderId,
          productName: nameFilter.value,
          quantity: quantityFilter.value,
          box: boxFilter.value,
          sortColumn: sortColumn.value,
          sortDirection: sortDirection.value,
          perPage: 999999,
        })
        if (response.status === 204) orderProducts.value = []
        else if (response.status === 200) orderProducts.value = response.data.orderProducts
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await productsService.list({
        page: 1,
        perPage: 10000,
        sortColumn: 'name',
        sortDirection: 'asc',
      })
      if (response.status === 200) {
        response.data.products.forEach((product: any) => {
          products.value.push({ name: product.name, id: product.id })
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleProductUnlink = (id: number) => {
    if (useGlobalStore().user.profile === 'admin') {
      productIdToUnlink.value = id
      isConfirmationModalOpen.value = true
    } else {
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${useGlobalStore().user.profile.toUpperCase()}`,
        color: 'danger',
      })
    }
  }

  const handleSorting = (column: string) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
    fetchOrderProducts(orderId.value)
  }

  const handleListProductsEditModalClose = (value: boolean) => {
    isEditModalOpen.value = value
    fetchOrderProducts(orderId.value)
  }

  const handleIsOpenConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalOpen.value = newValue
  }

  const handleIsLoadingConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalLoading.value = newValue
  }

  fetchOrderProducts(orderId.value)
  fetchProducts()
</script>
