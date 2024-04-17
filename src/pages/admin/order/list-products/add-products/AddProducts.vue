<template>
  <AddProductModal
    :key="isAddProductModalOpen.toString()"
    :is-open="isAddProductModalOpen"
    :order-id="Number(router.currentRoute.value.params.id)"
    :product-id="productIdToAdd"
    :order-code="router.currentRoute.value.params.code"
    @isOpenValueChange="handleIsAddProductModalOpenValueChange"
  />
  <div class="flex flex-col items-center gap-3">
    <va-card class="w-full">
      <va-card-title>{{ t('orders.listProducts.add_product.filter.title') }}</va-card-title>
      <va-card-content>
        <form class="flex flex-row gap-3" @submit.prevent="onFormSubmit()">
          <va-input
            v-model="nameFilter"
            type="text"
            :label="t('orders.listProducts.add_product.filter.form.inputs.name')"
          />
          <va-input
            v-model="ballastFilter"
            type="text"
            :label="t('orders.listProducts.add_product.filter.form.inputs.ballast')"
          />
          <va-button class="px-2" color="primary" type="reset" @click="handleFilterClear()">{{
            t('orders.listProducts.add_product.filter.form.buttons.clear')
          }}</va-button>
          <va-button type="submit" class="px-2" color="info">{{
            t('orders.listProducts.add_product.filter.form.buttons.search')
          }}</va-button>
        </form>
      </va-card-content>
    </va-card>
    <va-card class="w-full">
      <va-card-title
        >{{ t('orders.listProducts.add_product.table.title') }}
        <span class="list-text ml-1">{{ router.currentRoute.value.params.code }} </span></va-card-title
      >
      <va-card-content class="overflow-auto">
        <table class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th class="cursor-pointer" @click="handleSorting('name')">
                <sorting-icon-div :text="t('orders.listProducts.add_product.table.headers.name')" />
              </th>
              <th class="cursor-pointer" @click="handleSorting('ballast')">
                <sorting-icon-div :text="t('orders.listProducts.add_product.table.headers.ballast')" />
              </th>
              <th>{{ t('orders.listProducts.add_product.table.headers.add') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="product in notAddedProducts" :key="product.id">
              <td class="w-[30%]">{{ product.name }}</td>
              <td class="">{{ product.ballast }}</td>
              <td>
                <va-button
                  class="px-2"
                  color="success"
                  icon="add"
                  plain
                  @click="handleProductAddModalOpening(product.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </va-card-content>
    </va-card>
    <VaPagination v-model="currentPage" :pages="totalPages" :visible-pages="3" buttons-preset="secondary" />
    <div class="w-full">
      <va-button class="mt-4" color="danger" @click="router.go(-1)">{{
        t('orders.listProducts.add_product.buttons.back')
      }}</va-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import productsService from '../../../../../services/api/products'
  import SortingIconDiv from '../../../../../components/sorting-icon-div/SortingIconDiv.vue'
  import AddProductModal from './AddProductModal.vue'
  import router from '../../../../../router'

  const { t } = useI18n()

  const nameFilter = ref('')
  const ballastFilter = ref('')

  const isAddProductModalOpen = ref(false)
  const productIdToAdd = ref(-1)
  const notAddedProducts = ref([] as any)

  const currentPage = ref(1)
  const totalPages = ref(1)
  const sortColumn = ref('name')
  const sortDirection = ref('asc')

  const onFormSubmit = () => fetchNotAddedProducts()

  const handleFilterClear = () => {
    nameFilter.value = ''
    ballastFilter.value = ''
    fetchNotAddedProducts()
  }

  const handleSorting = (column: string) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
    fetchNotAddedProducts()
  }

  const fetchNotAddedProducts = async () => {
    try {
      const response = await productsService.productsNotAddedToGivenOrder(
        Number(router.currentRoute.value.params.id),
        currentPage.value,
        10,
        nameFilter.value,
        ballastFilter.value,
        sortColumn.value,
        sortDirection.value,
      )
      if (response.status === 204) notAddedProducts.value = []
      else if (response.status === 200) {
        notAddedProducts.value = response.data.products
        currentPage.value = response.data.pagination_meta?.current_page || 1
        totalPages.value = response.data.pagination_meta?.total_pages || 1
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleProductAddModalOpening = (productId: number) => {
    productIdToAdd.value = productId
    isAddProductModalOpen.value = true
    console.log('cliquei', isAddProductModalOpen.value)
  }

  const handleIsAddProductModalOpenValueChange = (value: boolean) => {
    isAddProductModalOpen.value = value
    fetchNotAddedProducts()
  }

  fetchNotAddedProducts()

  watch(() => currentPage.value, fetchNotAddedProducts)
</script>

<style lang="scss" scoped>
  .list-text {
    text-decoration: underline;
  }
</style>
