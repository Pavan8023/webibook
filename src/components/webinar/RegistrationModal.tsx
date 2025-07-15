
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistrationForm } from "./RegistrationForm";
import CheckCircle2 from "@/components/ui/CheckCircle2";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  webinarId: string;
  webinarTitle: string;
  webinarDate: string;
  webinarTime: string;
}

export const RegistrationModal = ({
  isOpen,
  onClose,
  webinarId,
  webinarTitle,
  webinarDate,
  webinarTime,
}: RegistrationModalProps) => {
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegistrationSuccess = () => {
    setIsRegistered(true);
  };

  const handleClose = () => {
    onClose();
    // Reset the state after closing with a short delay
    setTimeout(() => {
      setIsRegistered(false);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isRegistered ? (
          <>
            <DialogHeader>
              <DialogTitle>Register for Webinar</DialogTitle>
              <DialogDescription>
                Complete the form below to secure your spot for "{webinarTitle}" on {webinarDate} at {webinarTime}.
              </DialogDescription>
            </DialogHeader>
            <RegistrationForm 
              webinarId={webinarId} 
              webinarTitle={webinarTitle}
              webinarDate={webinarDate}
              webinarTime={webinarTime}
              onSuccess={handleRegistrationSuccess} 
            />
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="mb-2">Registration Confirmed!</DialogTitle>
            <DialogDescription className="mb-4">
              You're all set for "{webinarTitle}". A confirmation email has been sent with all the details.
            </DialogDescription>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-medium">Mark your calendar</p>
              <p className="text-muted-foreground mt-1">{webinarDate} at {webinarTime}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
