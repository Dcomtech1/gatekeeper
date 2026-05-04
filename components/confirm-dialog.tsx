'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Dialog heading, e.g. "CONFIRM_DELETE" */
  title?: string
  /** Subheading below the title */
  description?: string
  /** Name of the entity being acted on — shown in a framed box */
  subject?: string
  /** Label above the entity name box, e.g. "TARGET_EVENT" */
  subjectLabel?: string
  /** Warning body text */
  body?: string
  /** Confirm button label */
  confirmLabel?: string
  isPending?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'CONFIRM_ACTION',
  description = 'THIS_ACTION_IS_IRREVERSIBLE',
  subject,
  subjectLabel = 'TARGET',
  body = 'This action is permanent and cannot be undone.',
  confirmLabel = 'CONFIRM',
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="border-2 border-foreground rounded-none bg-background max-w-md p-0 gap-0"
      >
        {/* Red accent strip */}
        <div className="h-2 bg-denied w-full" />

        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-display text-3xl uppercase text-foreground leading-none">
              {title}
            </DialogTitle>
            <DialogDescription className="font-mono text-sm uppercase text-foreground/60 tracking-widest mt-3">
              {description}
            </DialogDescription>
          </DialogHeader>

          {subject && (
            <div className="border-2 border-foreground/20 p-4 mb-6 bg-secondary">
              <p className="font-mono text-xs uppercase text-foreground/50 mb-1 tracking-widest">
                {subjectLabel}
              </p>
              <p className="font-display text-2xl uppercase text-foreground leading-tight">
                {subject}
              </p>
            </div>
          )}

          <p className="font-mono text-xs text-foreground/60 uppercase mb-8 leading-relaxed">
            {body}
          </p>

          <DialogFooter className="flex-row gap-3 sm:flex-row justify-end">
            <DialogClose asChild>
              <Button variant="ghost" size="default" className="flex-1">
                CANCEL
              </Button>
            </DialogClose>
            <Button
              variant="danger"
              size="default"
              disabled={isPending}
              className="flex-1"
              onClick={onConfirm}
            >
              {isPending ? 'PROCESSING...' : confirmLabel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
