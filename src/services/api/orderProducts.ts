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
}

const orderProductsService = {
  // create: (quantity: string, box: boolean, product: ProductDto, order: OrderDto): Promise<ApiResponseDto> => {
  //     return api.post(
  //         'order_products',
  //         {
  //             order_product: {
  //                 quantity: quantity,
  //                 box: box,
  //                 product: product,
  //                 order: order,
  //             },
  //         },
  //         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  //     )
  // },

  // show: (id: number): Promise<ApiResponseDto> => {
  //     return api.get(`order_products/${id}`, {
  //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  //     })
  // },

  list: ({
    quantity = '',
    box = false,
    order_id,
    product_id,
    page = 1,
    perPage = 10,
    sortColumn = 'quantity',
    sortDirection = 'asc',
  }: OrderProductListProps): Promise<ApiResponseDto> => {
    const sortQuery = `&sort=${sortColumn}%20${sortDirection}`

    const url = `order_products?page=${page}&per_page=${perPage}&q[quantity_eq]=${quantity}&q[box_eq]=${box}&q[order_id_eq]=${order_id}`

    return api.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  // update: ({ id, quantity, box, product, order }: OrderProductDto): Promise<ApiResponseDto> => {
  //     return api.put(
  //         `order_products/${id}`,
  //         {
  //             order_product: {
  //                 quantity: quantity,
  //                 box: box,
  //                 product: product,
  //                 order: order,
  //             },
  //         },
  //         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  //     )
  // },

  // delete: (id: number): Promise<ApiResponseDto> => {
  //     return api.delete(`order_products/${id}`, {
  //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  //     })
  // },
}

export default orderProductsService
