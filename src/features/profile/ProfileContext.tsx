import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SeekerProfile } from '../../types';

const LS_KEY = 'ezyjobs.profile.v1';

export const defaultProfile: SeekerProfile = {
  country: 'DZ',
  level: 'entry',
  remoteOnly: true,
  commitments: ['part-time', 'freelance', 'internship'],
  languages: [
    { code: 'ar', level: 'native' },
    { code: 'en', level: 'intermediate' },
  ],
  skills: [],
  categories: [],
  hoursPerWeek: 20,
};

interface ProfileState {
  profile: SeekerProfile;
  setProfile: (p: SeekerProfile) => void;
  reset: () => void;
  ready: boolean;
}

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<SeekerProfile>(defaultProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setProfileState({ ...defaultProfile, ...JSON.parse(raw) });
    } catch {
      /* تجاهل */
    }
    setReady(true);
  }, []);

  const value = useMemo<ProfileState>(
    () => ({
      profile,
      ready,
      setProfile: (p) => {
        setProfileState(p);
        try {
          localStorage.setItem(LS_KEY, JSON.stringify(p));
        } catch {
          /* تجاهل */
        }
      },
      reset: () => {
        setProfileState(defaultProfile);
        localStorage.removeItem(LS_KEY);
      },
    }),
    [profile, ready],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}
