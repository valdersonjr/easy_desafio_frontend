import api from './api'
import { ApiResponseDto } from '../../dtos'

const palletizerService = {
  palletizer: (load_code: string): Promise<ApiResponseDto> => {
    return api.post(
      'palletizer',
      {
        load_code: load_code,
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },
}

export default palletizerService
