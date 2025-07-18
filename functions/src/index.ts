import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const updateEventStatus = functions.https.onCall(async (data, context) => {
  try {
    const now = admin.firestore.Timestamp.now();
    const eventsRef = admin.firestore().collection('events');

    // 1) upcoming → live
    const todayISO = now.toDate().toISOString().split('T')[0];
    const nowTime = now.toDate().toLocaleTimeString('en-US', { hour12: false });

    const upcomingSnap = await eventsRef
      .where('status', '==', 'upcoming')
      .where('date', '<=', todayISO)
      .where('time', '<=', nowTime)
      .get();

    for (const doc of upcomingSnap.docs) {
      await doc.ref.update({ status: 'live' });
    }

    // 2) live → past
    const liveSnap = await eventsRef.where('status', '==', 'live').get();
    for (const doc of liveSnap.docs) {
      const e = doc.data();
      const start = new Date(`${e.date}T${e.time}`);
      const finish = new Date(start.getTime() + parseInt(e.duration, 10) * 60000);

      if (now.toDate() > finish) {
        await doc.ref.update({ status: 'past' });
      }
    }

    return { success: true, updated: upcomingSnap.size + liveSnap.size };
  } catch (err) {
    console.error('Error updating event status:', err);
    throw new functions.https.HttpsError('internal', 'Failed to update event status');
  }
});
