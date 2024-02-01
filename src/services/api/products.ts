import { ApiResponseDto } from '../../dtos'
import api from './api'

export interface ProductListProps {
  page?: number
  perPage?: number
  name?: string
  ballast?: string
}

const productsService = {
  create: (name: string, ballast: string): Promise<ApiResponseDto> => {
    return api.post(
      'products',
      {
        product: {
          name: name,
          ballast: ballast,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },

  list: ({ page = 1, perPage = 10, name = '', ballast = '' }: ProductListProps): Promise<ApiResponseDto> => {
    return api.get(`products?page=${page}&per_page=${perPage}&q[name_cont]=${name}&q[ballast_cont]=${ballast}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  update: (id: number, name: string, ballast: string): Promise<ApiResponseDto> => {
    return api.put(
      `products/${id}`,
      {
        product: {
          name: name,
          ballast: ballast,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },

  show: (id: number): Promise<ApiResponseDto> => {
    return api.get(`products/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  delete: (id: number): Promise<ApiResponseDto> => {
    return api.delete(`products/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },
}

export default productsService
