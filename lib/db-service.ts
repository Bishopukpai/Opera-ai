// lib/db-service.ts
import { db } from './firebase'; // Adjust this path to match your Firebase config client file
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export interface Incident {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
  timestamp: any;
  businessId: string;
}

export const dbService = {
  /**
   * Listens to the incidents collection in real-time for a specific business tenant
   */
  subscribeToIncidents: (businessId: string, callback: (incidents: Incident[]) => void) => {
    // Reference the global incidents collection
    const incidentsRef = collection(db, 'incidents');
    
    // Query to filter by businessId and sort by newest arrivals first
    const q = query(
      incidentsRef,
      orderBy('timestamp', 'desc')
    );

    // Turn on the persistent real-time snapshot pipe
    return onSnapshot(q, (snapshot) => {
      const incidentsList: Incident[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Secure check: Only pass back data matching this specific business tenant
        if (data.businessId === businessId) {
          incidentsList.push({
            id: doc.id,
            ...data
          } as Incident);
        }
      });
      callback(incidentsList);
    }, (error) => {
      console.error("Firestore Streaming Synch Error:", error);
    });
  }
};