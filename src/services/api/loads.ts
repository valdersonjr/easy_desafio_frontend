import { ApiResponseDto, LoadDto } from '../../dtos'
import api from './api'

export interface LoadListProps {
  page?: number
  perPage?: number
  code?: string
  lesserDate?: Date
  greaterDate?: Date
  sortColumn?: string
  sortDirection?: string
}

const loadsService = {
  create: (code: string, Date: Date): Promise<ApiResponseDto> => {
    return api.post(
      'loads',
      {
        load: {
          code: code,
          delivery_date: Date,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },

  show: (id: number): Promise<ApiResponseDto> => {
    return api.get(`loads/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  list: ({
    page = 1,
    perPage = 10,
    code = '',
    lesserDate,
    greaterDate,
    sortColumn = 'code',
    sortDirection = 'asc',
  }: LoadListProps): Promise<ApiResponseDto> => {
    const sortQuery = sortColumn && sortDirection ? `&sort=${sortColumn}%20${sortDirection}` : ''

    const url =
      lesserDate && greaterDate
        ? `loads?page=${page}&per_page=${perPage}&q[code_cont]=${code}&q[delivery_date_gteq]=${lesserDate}&q[delivery_date_lteq]=${greaterDate}${sortQuery}`
        : `loads?page=${page}&per_page=${perPage}&q[code_cont]=${code}${sortQuery}`

    return api.get(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  update: ({ id, code, delivery_date }: LoadDto): Promise<ApiResponseDto> => {
    return api.put(
      `loads/${id}`,
      {
        load: {
          code: code,
          delivery_date: delivery_date,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },

  delete: (id: number): Promise<ApiResponseDto> => {
    return api.delete(`loads/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },
}

export default loadsService
