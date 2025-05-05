import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ProfileStep } from "@/modules/challenges/components/welcome-dialog/ProfileStep";
import { QuickTourStep } from "@/modules/challenges/components/welcome-dialog/QuickTourStep";
import { useWelcomeDialog } from "@/modules/challenges/hooks/useWelcomeDialog";
import { X } from "lucide-react";

export function WelcomeDialog() {
  const { open, step, handleNext, completeWelcome } = useWelcomeDialog();

  if (!open) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogOverlay className='fixed inset-0 bg-black/30 backdrop-blur-sm' />
      <AlertDialogContent className='max-w-md p-6'>
        <AlertDialogTitle className='sr-only'>Welcome Dialog</AlertDialogTitle>
        <div className='flex justify-end'>
          <Button variant='ghost' size='icon' onClick={completeWelcome}>
            <X size={18} />
          </Button>
        </div>

        {step === 0 && <ProfileStep handleNext={handleNext} />}
        {step === 1 && <QuickTourStep handleNext={handleNext} />}
      </AlertDialogContent>
    </AlertDialog>
  );
}
