export interface SignUpDataDto {
  name?: string
  email: string
  password: string
  password_confirmation: string
  profile?: string
}

export interface SignInDataDto {
  email: string
  password: string
}

export interface UserDto {
  id: number
  name: string
  email: string
  profile: string
}
