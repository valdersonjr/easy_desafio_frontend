export interface OrderDto {
  id: number
  code: string
  bay: string
  created_date?: Date
  load_id: number
  load_code?: string
  has_product?: boolean
}
