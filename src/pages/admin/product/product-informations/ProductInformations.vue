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
      <form class="flex flex-row gap-3 px-3 justify-center items-center" @submit.prevent="onFormSubmit">
        <va-input
          v-model="nameFilter"
          type="text"
          :label="t('products.informations.filter.form.inputs.name')"
          placeholder="Product"
        />
        <va-input
          v-model="ballastFilter"
          type="number"
          :label="t('products.informations.filter.form.inputs.ballast')"
          placeholder="000"
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
      <va-card-title>{{ t('products.informations.table.title') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <table class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th>{{ t('products.informations.table.headers.name') }}</th>
              <th>{{ t('products.informations.table.headers.ballast') }}</th>
              <th>{{ t('products.informations.table.headers.created_date') }}</th>
              <th>{{ t('products.informations.table.headers.update') }}</th>
              <th>{{ t('products.informations.table.headers.delete') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td class="w-[30%]">{{ product.name }}</td>
              <td class="w-[20%]">{{ product.ballast }}</td>
              <td class="">{{ formatDate(product.created_at) }}</td>
              <td>
                <va-button class="px-2" color="info" icon="edit" plain @click="handleProductUpdate(product.id)" />
              </td>
              <td>
                <va-button class="px-2" color="danger" icon="delete" plain @click="handleProductDeletion(product.id)" />
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
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import formatDate from '../../../../services/utils/dateConverter'
  import productsService from '../../../../services/api/products'
  import { ProductDto } from '../../../../dtos'
  import { useGlobalStore } from '../../../../stores/global-store'
  import UserEdit from './product-edit/ProductEdit.vue'
  import ConfirmationModal from '../../../../components/modals/ConfirmationModal.vue'
  import { useToast } from 'vuestic-ui'

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

  const onFormSubmit = () => {
    fetchProducts()
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
        perPage: 10,
        name: nameFilter.value,
        ballast: ballastFilter.value,
      })
      products.value = response.data.data
      currentPage.value = response.data.meta?.current_page || 1
      totalPages.value = response.data.meta?.total_pages || 1
    } catch (error: any) {
      if (error.response.status === 404) products.value = []
      currentPage.value = 1
      totalPages.value = 1
    }
  }

  const fetchProduct = async (id: number) => {
    try {
      const response = await productsService.show(id)
      productShow.value = response.data.data
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

  fetchProducts()
  watch(() => currentPage.value, fetchProducts)
  watch(
    () => isConfirmationModalLoading.value,
    () => {
      if (isConfirmationModalLoading.value) deleteProduct(productIdToDelete.value)
    },
  )
</script>
