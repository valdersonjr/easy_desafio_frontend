import { ApiResponseDto, OrderDto } from '../../dtos'
import api from './api'

export interface OrderListProps {
  code?: string
  bay?: string
  load_id?: number
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

  show: (id: number): Promise<ApiResponseDto> => {
    return api.get(`orders/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  list: ({
    code = '',
    bay = '',
    page = 1,
    perPage = 10,
    sortColumn = 'code',
    sortDirection = 'asc',
    load_id,
  }: OrderListProps): Promise<ApiResponseDto> => {
    const loadIdQuery = load_id ? `&q[load_id_eq]=${load_id}` : ''

    const url = `orders?page=${page}&per_page=${perPage}&q[code_cont]=${code}&q[bay_cont]=${bay}${loadIdQuery}&sort=${sortColumn}%20${sortDirection}`

    return api.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  update: ({ id, code, bay, load_id }: OrderDto): Promise<ApiResponseDto> => {
    return api.put(
      `orders/${id}`,
      {
        order: {
          code: code,
          bay: bay,
          load_id: load_id,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },

  delete: (id: number): Promise<ApiResponseDto> => {
    return api.delete(`orders/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },
}

export default ordersService
