import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export function useSettings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDocs(collection(db, 'settings'));
        const data: any = {};
        snap.forEach(d => {
          data[d.id] = d.data().value;
        });

        // Merge local overrides if available
        const local = localStorage.getItem('emiral_settings_override');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            Object.assign(data, parsed);
          } catch (e) {}
        }

        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
        // Fallback to local storage if network or permissions fail
        const local = localStorage.getItem('emiral_settings_override');
        if (local) {
          try {
            setSettings(JSON.parse(local));
          } catch (e) {}
        }
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  return { settings, loading };
}
