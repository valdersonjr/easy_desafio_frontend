import api from './api'
import apiResponseDto from '../../../dtos/apiResponseDto'

interface SignUpData {
  name?: string
  email: string
  password: string
  password_confirmation: string
  profile?: string
}

const usersService = {
  signUp: ({ name, email, password, password_confirmation, profile }: SignUpData): Promise<apiResponseDto> => {
    return api.post('user/sign_up', {
      user: {
        name: name,
        email: email,
        password: password,
        password_confirmation: password_confirmation,
        profile: profile,
      },
    })
  },
}

export default usersService
