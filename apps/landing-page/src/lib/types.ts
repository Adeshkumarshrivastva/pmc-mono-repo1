export type QuizOption = {
  value: string
  label: string
  score: number
  id?: string
}

export type QuizQuestion = {
  question: string
  options: QuizOption[]
  id?: string
}

export type Quiz = {
  id: string
  title: string
  slug: string
  image:
    | {
        url: string
        alt?: string
      }
    | string
  route: string
  order: number
  description?: string
  questionnaire: QuizQuestion[]
  contactFormTitle?: string
  contactFormDescription?: string
  createdAt: string
  updatedAt: string
}

export type QuizPageGlobal = {
  heading: string
  subtitle1?: string
  subtitle2?: string
}

export type Media = {
  url: string
  alt?: string
  filename: string
}
