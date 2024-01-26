import { ApiResponseDto } from '../../dtos'
import api from './api'

const authService = {
  validateSession: (authToken: string): Promise<ApiResponseDto> => {
    const headers = {
      Authorization: `Bearer ${authToken}`,
    }

    return api.get('validate_session', { headers })
  },
}

export default authService
