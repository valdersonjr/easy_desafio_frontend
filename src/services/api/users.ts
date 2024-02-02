import api from './api'
import { ApiResponseDto, SignUpDataDto, SignInDataDto, updateByIdDataDto } from '../../dtos'

interface UserListProps {
  page?: number
  perPage?: number
  name?: string
  email?: string
  sortColumn?: string
  sortDirection?: string
}

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

  list: ({
    page = 1,
    perPage = 10,
    name = '',
    email = '',
    sortColumn = 'name',
    sortDirection = 'asc',
  }: UserListProps): Promise<ApiResponseDto> => {
    const sortQuery = sortColumn && sortDirection ? `&sort=${sortColumn}%20${sortDirection}` : ''

    return api.get(`users?page=${page}&per_page=${perPage}&q[name_cont]=${name}&q[email_cont]=${email}${sortQuery}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
  },

  updateById: ({
    id,
    name,
    email,
    password,
    password_confirmation,
    profile,
  }: updateByIdDataDto): Promise<ApiResponseDto> => {
    return api.put(
      `users/${id}`,
      {
        user: {
          name: name,
          email: email,
          password: password,
          password_confirmation: password_confirmation,
          profile: profile,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },

  update: ({ name, email, password, password_confirmation, profile }: SignUpDataDto): Promise<ApiResponseDto> => {
    return api.put(
      'users',
      {
        user: {
          name: name,
          email: email,
          password: password,
          password_confirmation: password_confirmation,
          profile: profile,
        },
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    )
  },

  show: (id: number): Promise<ApiResponseDto> => {
    return api.get(`users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
  },

  delete: (id: number): Promise<ApiResponseDto> => {
    return api.delete(`users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
  },
}

export default usersService
