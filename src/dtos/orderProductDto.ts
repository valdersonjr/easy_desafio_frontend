import { OrderDto } from './orderDto'
import { ProductDto } from './productDto'

export interface OrderProductDto {
  id: number
  quantity: string
  box?: boolean
  product: ProductDto
  order: OrderDto
}
