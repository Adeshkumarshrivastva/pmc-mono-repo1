import { DAY_MAP } from './booking'

export const EXPERT_TYPES = [
  'PSYCHOLOGIST',
  'PSYCHIATRIST',
  'CLINICAL_PSYCHOLOGIST',
  'CONSULTANT_PHYSICIAN',
  'REHABILITATION_PSYCHOLOGIST',
  'COUNSELLING_PSYCHOLOGIST',
  'NEUROLOGIST',
  'GENERAL_PHYSICIAN',
  'OTHER',
] as const
export type ExpertType = (typeof EXPERT_TYPES)[number]

export const genderOptions = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
]

export const EXPERT_TYPES_CONFIG: Record<ExpertType, { value: ExpertType; label: string }> = {
  PSYCHIATRIST: { value: 'PSYCHIATRIST', label: 'Psychiatrist' },
  PSYCHOLOGIST: { value: 'PSYCHOLOGIST', label: 'Psychologist' },
  CLINICAL_PSYCHOLOGIST: { value: 'CLINICAL_PSYCHOLOGIST', label: 'Clinical Psychologist' },
  CONSULTANT_PHYSICIAN: { value: 'CONSULTANT_PHYSICIAN', label: 'Consultant Physician' },
  REHABILITATION_PSYCHOLOGIST: { value: 'REHABILITATION_PSYCHOLOGIST', label: 'Rehabilitation Psychologist' },
  COUNSELLING_PSYCHOLOGIST: { value: 'COUNSELLING_PSYCHOLOGIST', label: 'Counselling Psychologist' },
  NEUROLOGIST: { value: 'NEUROLOGIST', label: 'Neurologist' },
  GENERAL_PHYSICIAN: { value: 'GENERAL_PHYSICIAN', label: 'General Physician' },
  OTHER: { value: 'OTHER', label: 'Other' },
}

export const specializationOptions = [
  { value: 'Academic Stress', label: 'Academic Stress' },
  { value: 'Addiction', label: 'Addiction' },
  { value: 'Adolescent Therapy', label: 'Adolescent Therapy' },
  { value: 'Anxiety', label: 'Anxiety' },
  { value: 'Anxiety Disorders', label: 'Anxiety Disorders' },
  { value: 'Anxiety Management', label: 'Anxiety Management' },
  { value: 'Behavioral Issues', label: 'Behavioral Issues' },
  { value: 'Bipolar Disorder', label: 'Bipolar Disorder' },
  { value: 'CBT', label: 'CBT' },
  { value: 'Child Psychology', label: 'Child Psychology' },
  { value: 'Deep TMS Therapy', label: 'Deep TMS Therapy' },
  { value: 'Depression', label: 'Depression' },
  { value: 'Family Therapy', label: 'Family Therapy' },
  { value: 'Medication Management', label: 'Medication Management' },
  { value: 'Mindfulness', label: 'Mindfulness' },
  { value: 'Motivational Therapy', label: 'Motivational Therapy' },
  { value: 'Perinatal Psychiatry', label: 'Perinatal Psychiatry' },
  { value: 'Positive Psychology', label: 'Positive Psychology' },
  { value: 'Psychometric Testing', label: 'Psychometric Testing' },
  { value: 'PTSD', label: 'PTSD' },
  { value: 'Resilience Building', label: 'Resilience Building' },
  { value: 'Self-esteem Issues', label: 'Self-esteem Issues' },
  { value: 'Stress Management', label: 'Stress Management' },
  { value: 'Stress Reduction', label: 'Stress Reduction' },
  { value: 'Talk Therapy', label: 'Talk Therapy' },
  { value: 'Trauma', label: 'Trauma' },
  { value: 'Trauma Therapy', label: 'Trauma Therapy' },
  { value: "Women's Mental Health", label: "Women's Mental Health" },
]

export function isExpertOnline(
  availability?: {
    dayOfTheWeek: string
    endTime: string
    isActive: boolean
  }[],
): boolean {
  if (!availability || availability.length === 0) {
    return false
  }

  const currentDayOfWeek = DAY_MAP[new Date().getDay()]

  const currentMinutes = new Date().getUTCHours() * 60 + new Date().getUTCMinutes()
  return availability.some((slot) => {
    if (!slot.isActive) {
      return false
    }
    if (slot.dayOfTheWeek !== currentDayOfWeek) {
      return false
    }

    const endTime = new Date(slot.endTime)
    const endMinutes = endTime.getUTCHours() * 60 + endTime.getUTCMinutes()

    return endMinutes > currentMinutes
  })
}
