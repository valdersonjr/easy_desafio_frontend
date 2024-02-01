import api from './api'
import { ApiResponseDto } from '../../dtos'

const countsService = {
  list: (): Promise<ApiResponseDto> => {
    return api.get('counts', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },
}

export default countsService
