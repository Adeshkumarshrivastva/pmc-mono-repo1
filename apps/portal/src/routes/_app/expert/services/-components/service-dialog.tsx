import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ServiceForm } from './service-form'

type ServiceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServiceDialog({ open, onOpenChange }: ServiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Service</DialogTitle>
          <DialogDescription className="text-muted-foreground">Add a new service to your profile</DialogDescription>
        </DialogHeader>

        <ServiceForm mode="create" onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
