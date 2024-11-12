// types/Field.ts
export interface Field {
  id: number
  type: string
  position: { x: number; y: number; page: number }
  value?: string
  width?: number
  height?: number
  uniqueId: string
  assignedTo?: string // Assuming it’s a string representing the recipient role ID
}
