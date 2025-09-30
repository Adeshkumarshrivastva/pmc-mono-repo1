import z from 'zod'

export const medicineConfig = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
})
export type Medicine = z.infer<typeof medicineConfig>

export const prescriptionConfig = z.object({
  medicines: z.array(medicineConfig.extend({ instructions: z.string().optional() })).optional(),
  notes: z.string().optional(),
})
export type Prescription = z.infer<typeof prescriptionConfig>
