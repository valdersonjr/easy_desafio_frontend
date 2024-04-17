import { ApiResponseDto, OrderDto, OrderProductDto, ProductDto } from '../../dtos'
import api from './api'

export interface OrderProductListProps {
  quantity?: string
  box?: boolean
  order_id?: number
  product_id?: number
  page?: number
  perPage?: number
  sortColumn?: string
  sortDirection?: string
  productName?: string
}

const orderProductsService = {
  create: (quantity: number, box: boolean, productId: number, orderId: number): Promise<ApiResponseDto> => {
    return api.post(
      'order_products',
      {
        order_product: {
          quantity: quantity,
          box: box,
          product_id: productId,
          order_id: orderId,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },

  list: ({
    quantity = '',
    box,
    order_id,
    productName = '',
    page = 1,
    perPage = 10,
    sortColumn = 'quantity',
    sortDirection = 'desc',
  }: OrderProductListProps): Promise<ApiResponseDto> => {
    const sortQuery = `&sort=${sortColumn}%20${sortDirection}`
    const boxQuery = box === true ? `&q[box_eq]=${box}` : ''

    const url = `order_products?page=${page}&per_page=${perPage}&q[quantity_eq]=${quantity}${boxQuery}&q[order_id_eq]=${order_id}&q[product_name_cont]=${productName}${sortQuery}`

    return api.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  update: (id: number, quantity: number, box: boolean): Promise<ApiResponseDto> => {
    return api.put(
      `order_products/${id}`,
      {
        order_product: {
          quantity: quantity,
          box: box,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },

  delete: (id: number): Promise<ApiResponseDto> => {
    return api.delete(`order_products/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },
}

export default orderProductsService
