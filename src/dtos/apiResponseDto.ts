interface meta {
  current_page: number
  per_page: number
  total_entries: number
  total_pages: number
}

interface jsonResponseStructure {
  code: number
  message?: string[] | string
  [key: string]: any
  meta?: meta
}

export interface ApiResponseDto {
  data: jsonResponseStructure
  status: number
  headers: { authorization: string }
}
