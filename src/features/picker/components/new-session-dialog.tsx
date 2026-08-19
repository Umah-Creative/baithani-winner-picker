import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type NewSessionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function NewSessionDialog(props: NewSessionDialogProps) {
  const { open, onOpenChange, onConfirm } = props;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start a new draw session?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears all drawn numbers and returns them to the draw pool.
            Event settings and range stay unchanged. <br /> <br />
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep current session</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Start new session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
