import { getFunctions } from 'firebase/functions';
import { app } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

const functions = getFunctions(app);

// Cloud function to update event status
export const updateEventStatus = httpsCallable(functions, 'updateEventStatus');

// Call this function periodically in your main app
export const scheduleStatusUpdates = () => {
  // Update status every minute
  setInterval(() => {
    updateEventStatus().catch(error => {
      console.error('Error updating event status:', error);
    });
  }, 60000); // 60 seconds
};