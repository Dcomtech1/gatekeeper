'use client'

import { ConfirmDialog } from '@/components/confirm-dialog'

interface DeleteEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventName: string | undefined
  isPending: boolean
  onConfirm: () => void
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  eventName,
  isPending,
  onConfirm,
}: DeleteEventDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="CONFIRM_DELETE"
      description="THIS_ACTION_IS_IRREVERSIBLE"
      subject={eventName}
      subjectLabel="TARGET_EVENT"
      body="Deleting this event will permanently remove all associated data including invitations and entry logs. This cannot be undone."
      confirmLabel="CONFIRM_DELETE"
      isPending={isPending}
      onConfirm={onConfirm}
    />
  )
}
