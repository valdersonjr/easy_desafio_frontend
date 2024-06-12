<template>
  <div class="flex flex-col gap-3 items-center">
    <UserEdit
      v-if="isProductEditModalOpen"
      :is-open="isProductEditModalOpen"
      :product="productShow"
      @isOpenValueChange="handleIsProductEditModalOpenValueChange"
    />
    <ConfirmationModal
      v-if="isConfirmationModalOpen"
      :is-open="isConfirmationModalOpen"
      :message="t('users.informations.delete.confirmation_modal.title')"
      :ok-text="t('users.informations.delete.confirmation_modal.buttons.confirm')"
      :cancel-text="t('users.informations.delete.confirmation_modal.buttons.deny')"
      :is-loading="isConfirmationModalLoading"
      @isOpenValueChange="handleIsOpenConfirmationModalValueChange"
      @isLoadingValueChange="handleIsLoadingConfirmationModalValueChange"
    />
    <va-card class="w-full pb-4">
      <va-card-title>{{ t('products.informations.filter.title') }}</va-card-title>
      <form class="flex flex-row gap-3 px-3 justify-center items-center" @submit.prevent="onFilterSubmit">
        <va-input
          v-model="nameFilter"
          type="text"
          :label="t('products.informations.filter.form.inputs.name')"
          placeholder="Product"
        />
        <va-input
          v-model="ballastFilter"
          type="text"
          :label="t('products.informations.filter.form.inputs.ballast')"
          placeholder="LX"
        />
        <va-button class="px-2" color="primary" type="reset" @click="handleFilterClear">{{
          t('products.informations.filter.form.buttons.clear')
        }}</va-button>
        <va-button type="submit" class="px-2" color="info">{{
          t('products.informations.filter.form.buttons.search')
        }}</va-button>
      </form>
    </va-card>

    <va-card class="w-full">
      <va-card-title>Novo Produto</va-card-title>
      <va-card-content>
        <form class="flex flex-row gap-3" @submit.prevent="onSubmit">
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
          <va-button color="success" class="w-[6rem]" type="submit">
            {{ t('loads.newLoad.form.buttons.submit') }}
          </va-button>
        </form>
      </va-card-content>
    </va-card>

    <va-card class="w-full">
      <va-card-title>{{ t('products.informations.table.title') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <table class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th @click="handleSorting('name')">
                <sorting-icon-div :text="t('products.informations.table.headers.name')" />
              </th>
              <th @click="handleSorting('ballast')">
                <sorting-icon-div :text="t('products.informations.table.headers.ballast')" />
              </th>
              <th>
                {{ t('products.informations.table.headers.created_date') }}
              </th>
              <th>{{ t('products.informations.table.headers.actions') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td class="w-[30%]">{{ product.name }}</td>
              <td class="w-[20%]">{{ product.ballast }}</td>
              <td class="">{{ formatDate(product.created_at) }}</td>
              <td>
                <div>
                  <va-button
                    class="action-btn"
                    color="info"
                    icon="edit"
                    plain
                    @click="handleProductUpdate(product.id)"
                  />
                  <va-button
                    class="action-btn"
                    color="danger"
                    icon="delete"
                    plain
                    @click="handleProductDeletion(product.id)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </va-card-content>
    </va-card>
    <VaPagination v-model="currentPage" :pages="totalPages" :visible-pages="3" buttons-preset="secondary" />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import formatDate from '../../../../services/utils/dateConverter'
  import productsService from '../../../../services/api/products'
  import { ApiResponseDto, ProductDto } from '../../../../dtos'
  import { useGlobalStore } from '../../../../stores/global-store'
  import UserEdit from './product-edit/ProductEdit.vue'
  import ConfirmationModal from '../../../../components/modals/ConfirmationModal.vue'
  import { useToast } from 'vuestic-ui'
  import SortingIconDiv from '../../../../components/sorting-icon-div/SortingIconDiv.vue'

  const { init } = useToast()
  const { t } = useI18n()
  const GlobalStore = useGlobalStore()

  const isConfirmationModalOpen = ref(false)
  const isProductEditModalOpen = ref(false)
  const isConfirmationModalLoading = ref(false)

  const nameFilter = ref('')
  const ballastFilter = ref('')

  const productShow = ref({} as ProductDto)
  const products = ref([] as ProductDto[])
  const productIdToDelete = ref(-1)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const sortColumn = ref('name')
  const sortDirection = ref('asc')

  const name = ref('')
  const ballast = ref('')

  const nameErrors = ref([] as string[])
  const ballastErrors = ref([] as string[])

  const onFilterSubmit = () => {
    fetchProducts()
  }

  const formReady = computed(() => {
    return !(ballastErrors.value.length || nameErrors.value.length)
  })

  const onSubmit = () => {
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
      productsService
        .create(name.value, ballast.value)
        .then((response: ApiResponseDto) => {
          if (response.status === 201) {
            init({ message: t('messages.toast.product.new.success'), color: 'success' })
            handleNewProductFormClear()
            fetchProducts()
          }
        })
        .catch((error: any) => {
          console.log('Error:', error)
          init({ message: t('messages.toast.product.new.error'), color: 'danger' })
        })
    }
  }

  const handleNewProductFormClear = () => {
    name.value = ''
    ballast.value = ''
  }

  const handleFilterClear = () => {
    nameFilter.value = ''
    ballastFilter.value = ''
    fetchProducts()
  }

  const fetchProducts = async () => {
    try {
      const response = await productsService.list({
        page: currentPage.value,
        perPage: 8,
        name: nameFilter.value,
        ballast: ballastFilter.value,
        sortColumn: sortColumn.value,
        sortDirection: sortDirection.value,
      })
      products.value = response.data.products
      currentPage.value = response.data.pagination_meta?.current_page || 1
      totalPages.value = response.data.pagination_meta?.total_pages || 1
    } catch (error: any) {
      if (error.response.status === 404) products.value = []
      currentPage.value = 1
      totalPages.value = 1
    }
  }

  const fetchProduct = async (id: number) => {
    try {
      const response = await productsService.show(id)
      productShow.value = response.data.product
      isProductEditModalOpen.value = true
    } catch (error) {
      console.log('Error fetching user:', error)
    }
  }

  const handleProductUpdate = (id: number) => {
    if (GlobalStore.user.profile === 'admin') fetchProduct(id)
    else
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
  }

  const handleProductDeletion = (id: number) => {
    if (GlobalStore.user.profile === 'admin') {
      isConfirmationModalOpen.value = true
      productIdToDelete.value = id
    } else
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
  }

  const deleteProduct = async (id: number) => {
    try {
      const response = await productsService.delete(id)
      if (response.status === 200) {
        isConfirmationModalOpen.value = false
        isConfirmationModalLoading.value = false
        fetchProducts()
        init({ message: t('messages.toast.product.delete.success'), color: 'success' })
      }
    } catch (error) {
      console.log('Error deleting user:', error)
      init({ message: t('messages.toast.product.delete.error'), color: 'danger' })
    }
  }

  const handleIsProductEditModalOpenValueChange = (newValue: boolean) => {
    isProductEditModalOpen.value = newValue
    if (!isProductEditModalOpen.value) fetchProducts()
  }

  const handleIsOpenConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalOpen.value = newValue
  }

  const handleIsLoadingConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalLoading.value = newValue
  }

  const handleSorting = (column: string) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
    fetchProducts()
  }

  fetchProducts()
  watch(() => currentPage.value, fetchProducts)
  watch(
    () => isConfirmationModalLoading.value,
    () => {
      if (isConfirmationModalLoading.value) deleteProduct(productIdToDelete.value)
    },
  )
</script>
