interface jsonResponseStructure {
  code: number
  message?: string[] | string | null
  data?: any | null
  meta?: any | null
}

export interface ApiResponseDto {
  data: jsonResponseStructure
  status: number
  headers: { authorization: string }
}
