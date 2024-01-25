import api from './api'
import { ApiResponseDto, SignUpDataDto, SignInDataDto } from '../../../dtos'

const usersService = {
  signUp: ({ name, email, password, password_confirmation, profile }: SignUpDataDto): Promise<ApiResponseDto> => {
    return api.post('users', {
      user: {
        name: name,
        email: email,
        password: password,
        password_confirmation: password_confirmation,
        profile: profile,
      },
    })
  },

  signIn: ({ email, password }: SignInDataDto): Promise<ApiResponseDto> => {
    return api.post('users/sign_in', {
      user: {
        email: email,
        password: password,
      },
    })
  },
}

export default usersService
