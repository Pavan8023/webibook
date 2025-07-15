import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

type Role = 'attendee' | 'hoster';
type Provider = 'google' | 'twitter';

export const RoleSelectionModal = ({
  open,
  onClose,
  onRoleSelect,
  provider
}: {
  open: boolean;
  onClose: () => void;
  onRoleSelect: (role: Role) => void;
  provider: Provider;
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>('attendee');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)} as
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedRole === 'attendee' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('attendee')}
              className="h-12"
            >
              Attendee
            </Button>
            <Button
              variant={selectedRole === 'hoster' ? 'default' : 'outline'}
              onClick={() => setSelectedRole('hoster')}
              className="h-12"
            >
              Hoster
            </Button>
          </div>
          <Button 
            className="w-full"
            onClick={() => onRoleSelect(selectedRole)}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};