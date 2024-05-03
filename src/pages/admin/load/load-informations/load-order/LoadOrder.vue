<template>
  <div class="flex flex-col gap-3 items-center">
    <OrderEdit
      v-if="isOrderEditModalOpen"
      :is-open="isOrderEditModalOpen"
      :order="orderShow"
      @isOpenValueChange="handleIsOrderEditModalOpenValueChange"
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
    <va-card class="w-full pb-4">
      <va-card-title>{{ t('orders.informations.filter.title') }}</va-card-title>
      <form class="flex flex-row gap-3 px-3 justify-center items-center" @submit.prevent="onFilterSubmit">
        <va-input
          v-model="codeFilter"
          type="text"
          :label="t('orders.informations.filter.form.inputs.code')"
          placeholder="OR1234"
        />
        <va-input
          v-model="bayFilter"
          type="text"
          :label="t('orders.informations.filter.form.inputs.bay')"
          placeholder="BAY123"
        />
        <va-button class="px-2" color="primary" type="reset" @click="handleFilterClear">{{
          t('orders.informations.filter.form.buttons.clear')
        }}</va-button>
        <va-button type="submit" class="px-2" color="info">{{
          t('orders.informations.filter.form.buttons.search')
        }}</va-button>
      </form>
    </va-card>

    <va-card class="w-full">
      <va-card-title>Adicionar nova lista</va-card-title>
      <va-card-content>
        <form class="flex flex-row gap-3" @submit.prevent="onSubmit">
          <va-input v-model="code" type="text" label="Código" placeholder="OR1234" required />
          <va-input v-model="bay" type="text" label="Baia" placeholder="BAY123" required />
          <va-button color="success" class="w-[6rem]" type="submit"> Adicionar </va-button>
        </form>
      </va-card-content>
    </va-card>

    <div class="w-full">
      <va-button class="w-[6rem]" color="alert" :disabled="sortButtonState" @click="palletize">
        <div v-if="!sortButtonState">Ordenar</div>
        <FulfillingSquareSpinner v-if="sortButtonState" color="#fff" :size="14" :animation-duration="2000" />
      </va-button>
    </div>

    <va-card class="w-full">
      <va-card-title>{{ t('orders.informations.table.title') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <table class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th class="cursor-pointer" @click="handleSorting('code')">
                <sorting-icon-div :text="t('orders.informations.table.headers.code')" />
              </th>
              <th class="cursor-pointer" @click="handleSorting('bay')">
                <sorting-icon-div :text="t('orders.informations.table.headers.bay')" />
              </th>
              <th class="cursor-pointer">
                {{ t('orders.informations.table.headers.created_date') }}
              </th>
              <th>Lista</th>
              <th>Lista Ordenada</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="w-[30%]">{{ order.code }}</td>
              <td>{{ order.bay }}</td>
              <td class="">{{ formatDate(order.created_date) }}</td>
              <td>
                <button
                  class="px-2 py-[3px] action-btn"
                  @click="handleOrderProductsRedirect(order.id, order.code, 'order-products')"
                >
                  <va-icon name="vuestic-iconset-eye" />
                </button>
              </td>
              <td>
                <button
                  v-if="order.sorted"
                  class="px-8 action-btn"
                  @click="handleOrderProductsRedirect(order.id, order.code, 'sorted-order-products')"
                >
                  <PalletIcon class="mt-2 fill-current text-red-500" width="15px" height="15px" />
                </button>
                <div v-if="!order.sorted" class="px-2">
                  <PalletIcon class="mt-2" width="15px" height="15px" />
                </div>
              </td>
              <td>
                <va-button
                  class="action-btn py-[6px]"
                  color="info"
                  icon="edit"
                  plain
                  @click="handleOrderUpdate(order.id)"
                />
                <va-button
                  class="action-btn py-[6px]"
                  color="danger"
                  icon="delete"
                  plain
                  @click="handleOrderDeletion(order.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </va-card-content>
    </va-card>
    <VaPagination v-model="currentPage" :pages="totalPages" :visible-pages="3" buttons-preset="secondary" />
    <div class="w-full">
      <va-button class="mt-4" color="danger" @click="handleBackButtonBehaviour">{{
        t('orders.listProducts.add_product.buttons.back')
      }}</va-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ordersService from '../../../../../services/api/orders'
  import formatDate from '../../../../../services/utils/dateConverter'
  import SortingIconDiv from '../../../../../components/sorting-icon-div/SortingIconDiv.vue'
  import { useGlobalStore } from '../../../../../stores/global-store'
  import { useToast } from 'vuestic-ui'
  import { ApiResponseDto, OrderDto } from '../../../../../dtos'
  import { useRoute } from 'vue-router'
  import router from '../../../../../router'
  import PalletIcon from '../../../../../components/icons/PalletIcon.vue'
  import palletizerService from '../../../../../services/api/palletizer'
  import { FulfillingSquareSpinner } from 'epic-spinners'
  import ConfirmationModal from '../../../../../components/modals/ConfirmationModal.vue'
  import OrderEdit from './order-edit/OrderEdit.vue'

  const { t } = useI18n()
  const { init } = useToast()

  const loadCode = useRoute().params.id

  const orders = ref([]) as any
  const currentPage = ref(1)
  const totalPages = ref(1)
  const sortColumn = ref('code')
  const sortDirection = ref('asc')
  // const checkboxState = ref(false)
  const bayFilter = ref('')
  const sortButtonState = ref(false)
  const isConfirmationModalOpen = ref(false)
  const isConfirmationModalLoading = ref(false)
  const isOrderEditModalOpen = ref(false)
  const orderIdToDelete = ref(-1)
  const orderShow = ref({} as OrderDto)

  const code = ref('')
  const bay = ref('')
  const codeErrors = ref<string[]>([])
  const loadCodeErrors = ref<string[]>([])

  const codeFilter = ref('')

  const palletize = async () => {
    sortButtonState.value = true
    try {
      const response = await palletizerService.palletizer(String(loadCode))
      fetchOrders()
    } catch (error) {
      console.log('Error:', error)
    } finally {
      sortButtonState.value = false
    }
  }

  const handleOrderProductsRedirect = (id: number, code: string, pathName: string) => {
    router.push({ name: pathName, params: { id, code } })
  }

  const handleFilterClear = () => {
    codeFilter.value = ''
    bayFilter.value = ''
    fetchOrders()
  }

  const handleNewOrderInputClear = () => {
    code.value = ''
    bay.value = ''
  }

  const onFilterSubmit = () => {
    fetchOrders()
  }

  const handleSorting = (field: string) => {
    if (sortColumn.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = field
      sortDirection.value = 'asc'
    }
    fetchOrders()
  }

  const handleOrderDeletion = (id: number) => {
    if (useGlobalStore().user.profile === 'admin') {
      orderIdToDelete.value = id
      isConfirmationModalOpen.value = true
    } else {
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${useGlobalStore().user.profile.toUpperCase()}`,
        color: 'danger',
      })
    }
  }

  const clearOrdersList = () => {
    orders.value = []
    currentPage.value = 1
    totalPages.value = 1
  }

  const handleOrderUpdate = (id: number) => {
    if (useGlobalStore().user.profile === 'admin') fetchOrder(id)
    else
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${useGlobalStore().user.profile.toUpperCase()}`,
        color: 'danger',
      })
  }

  const fetchOrder = async (id: number) => {
    try {
      const response = await ordersService.show(id)
      orderShow.value = response.data.order
      isOrderEditModalOpen.value = true
    } catch (error) {
      console.log('Error fetching user:', error)
    }
  }

  const handleBackButtonBehaviour = () => {
    router.push({ name: 'load-info', params: { id: loadCode } })
  }

  const onSubmit = () => {
    if (useGlobalStore().user.profile !== 'admin') {
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${useGlobalStore().user.profile.toUpperCase()}`,
        color: 'danger',
      })
      return
    }

    ordersService
      .create(code.value, bay.value, String(loadCode))
      .then((response: ApiResponseDto) => {
        if (response.status === 201) {
          init({ message: t('messages.toast.order.new.success'), color: 'success' })
          fetchOrders()
          handleNewOrderInputClear()
        }
      })
      .catch((error: any) => {
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
  }

  const fetchOrders = async () => {
    try {
      const response = await ordersService.list({
        page: currentPage.value,
        perPage: 10,
        code: codeFilter.value,
        bay: bayFilter.value,
        load_code: String(loadCode),
        sortColumn: sortColumn.value,
        sortDirection: sortDirection.value,
        // hasProduct: checkboxState.value,
      })

      if (response.status === 204) {
        clearOrdersList()
        return
      }

      orders.value = response.data.orders
      currentPage.value = response.data.pagination_meta?.current_page || 1
      totalPages.value = response.data.pagination_meta?.total_pages || 1
    } catch (error: any) {
      clearOrdersList()
    }
  }

  const handleIsOrderEditModalOpenValueChange = (newValue: boolean) => {
    isOrderEditModalOpen.value = newValue
    if (!isOrderEditModalOpen.value) fetchOrders()
  }

  const deleteOrder = async (id: number) => {
    try {
      const response = await ordersService.delete(id)
      if (response.status === 200) {
        isConfirmationModalOpen.value = false
        isConfirmationModalLoading.value = false
        fetchOrders()
        init({ message: t('messages.toast.order.list_products.modal.delete.success'), color: 'success' })
      }
    } catch (error) {
      console.error(error)
      init({ message: t('messages.toast.order.list_products.delete.error'), color: 'danger' })
    }
  }

  const handleIsOpenConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalOpen.value = newValue
  }

  const handleIsLoadingConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalLoading.value = newValue
  }

  fetchOrders()
  watch(() => currentPage.value, fetchOrders)

  watch(
    () => isConfirmationModalLoading.value,
    () => {
      if (isConfirmationModalLoading.value) deleteOrder(orderIdToDelete.value)
    },
  )
</script>
