import { ApiResponseDto, OrderDto } from '../../dtos'
import api from './api'

export interface OrderListProps {
  code?: string
  bay?: string
  load_id?: string
  page?: number
  perPage?: number
  sortColumn?: string
  sortDirection?: string
}

const ordersService = {
  // create: (code: string, bay: Date): Promise<ApiResponseDto> => {
  //     return api.post(
  //         'orders',
  //         {
  //             order: {
  //                 code: code,
  //                 bay: bay,
  //             },
  //         },
  //         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  //     )
  // },

  // show: (id: number): Promise<ApiResponseDto> => {
  //     return api.get(`orders/${id}`, {
  //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  //     })
  // },

  list: ({
    code = '',
    bay = '',
    page = 1,
    perPage = 10,
    sortColumn = 'code',
    sortDirection = 'asc',
    load_id,
  }: OrderListProps): Promise<ApiResponseDto> => {
    const sortQuery = `&sort=${sortColumn}%20${sortDirection}`

    const url = `orders?page=${page}&per_page=${perPage}&q[code_cont]=${code}&q[bay_cont]=${bay}&q[load_id_eq]=${load_id}${sortQuery}`

    return api.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  // update: ({ id, code, bay }: OrderDto): Promise<ApiResponseDto> => {
  //     return api.put(
  //         `orders/${id}`,
  //         {
  //             order: {
  //                 code: code,
  //                 bay: bay,
  //             },
  //         },
  //         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
  //     )
  // },

  // destroy: (id: number): Promise<ApiResponseDto> => {
  //     return api.delete(`orders/${id}`, {
  //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  //     })
  // },
}

export default ordersService
