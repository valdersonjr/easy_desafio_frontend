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
  list: ({
    quantity = '',
    box,
    order_id,
    productName = '',
    page = 1,
    perPage = 10000,
    sortColumn = 'layer',
    sortDirection = 'desc',
  }: OrderProductListProps): Promise<ApiResponseDto> => {
    const sortQuery = `&sort=${sortColumn}%20${sortDirection}`
    const boxQuery = box === true ? `&q[box_eq]=${box}` : ''

    const url = `sorted_order_products?page=${page}&per_page=${perPage}&q[quantity_eq]=${quantity}${boxQuery}&q[order_id_eq]=${order_id}&q[product_name_cont]=${productName}${sortQuery}`

    return api.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },
}

export default orderProductsService
