<template>
  <div class="px-6 flex flex-col">
    <va-icon
      class="absolute left-0 top-0 m-3 cursor-pointer"
      name="vuestic-iconset-left-arrow"
      @click="handleBackIconClick"
    />
    <h6 class="va-h6 text-center">Produtos da Lista: {{ props.orderCode }}</h6>
    <table v-if="dataExists" class="mt-4 va-table va-table--striped va-table--hoverable w-full">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Lastro</th>
          <th>Quantidade</th>
          <th>Caixa</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="orderProduct in orderProducts" :key="orderProduct.id">
          <td>{{ orderProduct.product.name }}</td>
          <td>{{ orderProduct.product.ballast }}</td>
          <td>{{ orderProduct.quantity }}</td>
          <td>{{ orderProduct.box ? 'Sim' : 'Não' }}</td>
        </tr>
      </tbody>
    </table>
    <span v-if="!dataExists" class="text-center">Nenhum produto encontrado</span>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineProps, defineEmits } from 'vue'
  import orderProductsService from '../../../../../services/api/orderProducts'
  import { OrderProductDto } from '../../../../../dtos'

  const orderProducts = ref<OrderProductDto[]>([])
  const props = defineProps(['orderId', 'orderCode'])
  const dataExists = ref(true)

  const emits = defineEmits(['handleBackIconClick'])

  const fetchOrderProducts = async () => {
    try {
      const response = await orderProductsService.list({
        order_id: props.orderId,
      })
      if (response.status === 204) {
        dataExists.value = false
      } else orderProducts.value = response.data.orderProducts
    } catch (error: any) {
      console.log(error)
    }
  }

  const handleBackIconClick = () => {
    emits('handleBackIconClick', false)
  }

  fetchOrderProducts()
</script>
