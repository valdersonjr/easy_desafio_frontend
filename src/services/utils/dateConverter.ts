export default function formatDate(inputDate: string): string {
  const date = new Date(inputDate)
  const day = date.getUTCDate().toString().padStart(2, '0')
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = date.getUTCFullYear()

  return `${day}/${month}/${year}`
}
