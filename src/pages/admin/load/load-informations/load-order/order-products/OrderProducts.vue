<template>
  <div class="flex flex-col gap-3">
    <order-products-edit
      :key="isEditModalOpen.toString()"
      :is-open="isEditModalOpen"
      :list-product="listProduct"
      @handleModalClose="handleListProductsEditModalClose"
    />
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
      <va-card-title>{{ t('orders.listProducts.filter.title') }}</va-card-title>
      <va-card-content>
        <form class="flex flex-col gap-3" @submit.prevent="onFormSubmit()">
          <div class="flex flex-row gap-3">
            <va-input v-model="nameFilter" type="text" :label="t('orders.listProducts.filter.form.inputs.name')" />
            <va-input
              v-model="quantityFilter"
              type="number"
              :label="t('orders.listProducts.filter.form.inputs.quantity')"
            />
            <va-button class="px-2" color="primary" type="reset" @click="handleFilterClear()">{{
              t('orders.listProducts.filter.form.buttons.clear')
            }}</va-button>
            <va-button type="submit" class="px-2" color="info">{{
              t('orders.listProducts.filter.form.buttons.search')
            }}</va-button>
          </div>
          <VaCheckbox v-model="boxFilter" :label="t('orders.listProducts.filter.form.inputs.box')" />
        </form>
      </va-card-content>
    </va-card>

    <va-card class="w-full">
      <va-card-title>Adicionar produtos</va-card-title>
      <va-card-content>
        <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
          <div class="flex flex-row gap-2">
            <VaSelect
              v-model="selectedProducts"
              label="Produtos"
              :options="products"
              multiple
              searchable
              virtual-scroller
              stick-to-edges
              highlight-matched-text
              text-by="name"
              track-by="id"
              :max-visible-options="2"
              :min-search-chars="3"
            />
            <va-input
              v-model="quantity"
              type="number"
              :label="t('orders.listProducts.filter.form.inputs.quantity')"
              required
              :error="!!quantityErrors.length"
              :error-messages="quantityErrors"
            />
          </div>
          <va-checkbox v-model="box" :label="t('orders.listProducts.filter.form.inputs.box')" />
          <va-button color="success" class="w-[6rem]" type="submit"> Adicionar </va-button>
        </form>
      </va-card-content>
    </va-card>

    <va-card>
      <va-card-title>{{ t('orders.listProducts.table.title') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <div class="max-h-[250px] overflow-y-auto">
          <table class="va-table va-table--striped va-table--hoverable w-full">
            <thead>
              <tr>
                <th class="cursor-pointer">
                  {{ t('orders.listProducts.table.headers.name') }}
                </th>
                <th class="cursor-pointer" @click="handleSorting('quantity')">
                  <sorting-icon-div :text="t('orders.listProducts.table.headers.quantity')" />
                </th>
                <th class="cursor-pointer" @click="handleSorting('box')">
                  <sorting-icon-div :text="t('orders.listProducts.table.headers.box')" />
                </th>
                <th>{{ t('orders.listProducts.table.headers.actions') }}</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="orderProduct in orderProducts" :key="orderProduct.id">
                <td class="w-[30%]">{{ orderProduct.product.name }}</td>
                <td class="">{{ orderProduct.quantity }}</td>
                <td class="">{{ orderProduct.box ? 'SIM' : 'NÃO' }}</td>
                <td>
                  <va-button
                    class="action-btn"
                    color="info"
                    icon="edit"
                    plain
                    @click="handleProductListEdition(orderProduct.id, orderProduct.quantity, orderProduct.box)"
                  />
                  <va-button
                    class="action-btn"
                    color="danger"
                    icon="delete"
                    plain
                    @click="handleProductUnlink(orderProduct.id)"
                  />
                </td>
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
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import router from '../../../../../../router'
  import SortingIconDiv from '../../../../../../components/sorting-icon-div/SortingIconDiv.vue'
  import OrderProductsEdit from './order-products-edit/OrderProductsEdit.vue'
  import ConfirmationModal from '../../../../../../components/modals/ConfirmationModal.vue'
  import { useGlobalStore } from '../../../../../../stores/global-store'
  import { useToast } from 'vuestic-ui'
  import productsService from '../../../../../../services/api/products'
  import orderProductsService from '../../../../../../services/api/orderProducts'

  const { t } = useI18n()
  const { init } = useToast()

  const orderId = ref(Number(router.currentRoute.value.params.id))
  const orderProducts = ref([] as any)

  const nameFilter = ref('')
  const quantityFilter = ref('')
  const boxFilter = ref(false)
  const sortColumn = ref('quantity')
  const sortDirection = ref('desc')

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

  const formReady = computed(() => {
    return !quantityErrors.value.length
  })

  const onSubmit = async () => {
    let wasProductAdded = false

    if (!formReady.value) {
      addProductFilterClear()
      return
    }

    selectedProducts.value.forEach(async (product: any) => {
      try {
        const response = await orderProductsService.create(Number(quantity.value), box.value, product.id, orderId.value)
        if (response.status === 201 && !wasProductAdded) {
          wasProductAdded = true
          init({ message: t('messages.toast.order.add_product.success'), color: 'success' })
          fetchOrderProducts(orderId.value)
        }
      } catch (error: any) {
        if (error.response.status === 422) {
          if (error.response.data.message.includes('Quantity must be greater than 0'))
            quantityErrors.value.push(t('orders.listProducts.add_product.modal.form.errors.quantity'))
        } else {
          init({ message: t('messages.toast.order.add_product.error'), color: 'danger' })
        }
      }
    })

    addProductFilterClear()
  }

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

  // const handleProductAddRedirect = () => {
  //   router.push({
  //     name: 'add-product-to-order',
  //     params: { id: orderId.value, code: router.currentRoute.value.params.code },
  //   })
  // }

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
        const response = await orderProductsService.list({
          order_id: orderId,
          productName: nameFilter.value,
          quantity: quantityFilter.value,
          box: boxFilter.value,
          sortColumn: sortColumn.value,
          sortDirection: sortDirection.value,
          perPage: 100,
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

  const unlinkProductFromList = async (id: number) => {
    try {
      const response = await orderProductsService.delete(id)
      if (response.status === 200) {
        isConfirmationModalOpen.value = false
        isConfirmationModalLoading.value = false
        fetchOrderProducts(orderId.value)
        init({ message: t('messages.toast.order.list_products.modal.delete.success'), color: 'success' })
      }
    } catch (error) {
      console.error(error)
      init({ message: t('messages.toast.order.list_products.delete.error'), color: 'danger' })
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

  watch(
    () => isConfirmationModalLoading.value,
    () => {
      if (isConfirmationModalLoading.value) unlinkProductFromList(productIdToUnlink.value)
    },
  )
</script>
