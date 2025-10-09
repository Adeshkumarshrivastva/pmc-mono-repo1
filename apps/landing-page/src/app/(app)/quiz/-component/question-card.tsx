import { CheckCircle } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Option = {
  value: string
  label: string
}

type QuestionCardProps = {
  questionNumber: number
  question: string
  value: string | undefined
  onChange: (value: string) => void
  isAnswered: boolean
  options: Option[]
}

export function QuestionCard({ questionNumber, question, value, onChange, isAnswered, options }: QuestionCardProps) {
  return (
    <div
      className={cn(
        'bg-background rounded-lg p-6 shadow-sm border transition-all duration-200',
        isAnswered ? 'border-primary/50 bg-[#e8eedf]' : 'border-border hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-medium text-foreground flex-1">
          {questionNumber}. {question}
        </h3>
        {isAnswered && <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 ml-2" />}
      </div>

      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {options.map((option) => (
          <Label
            key={option.value}
            className={cn(
              'flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-all duration-200',
              value === option.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50 hover:bg-accent/50',
            )}
          >
            <RadioGroupItem value={option.value} className="flex-shrink-0" />
            <span className="flex-1">{option.label}</span>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
