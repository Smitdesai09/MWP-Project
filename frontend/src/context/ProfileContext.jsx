import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

// Helper to extract profile data
function extractProfile(data) {
  if (!data) return null
  if (data.data)    return data.data
  if (data.profile) return data.profile
  if (data.age !== undefined || data.riskScore !== undefined) return data
  return null
}

export const ProfileProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth(); // Get auth loading state
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading]             = useState(true); // Start true
  const [profileData, setProfileData]     = useState(null);

  const checkProfile = async () => {
    if (!user) {
      // If user is definitively null (after auth loaded), we are done.
      setProfileExists(false);
      setProfileData(null);
      setLoading(false);
      return;
    }
    
    // User exists, check for profile
    try {
      const res = await API.get('/profile');
      const profile = extractProfile(res.data);
      if (profile) {
        setProfileData(profile);
        setProfileExists(true);
      } else {
        setProfileExists(false);
      }
    } catch (err) {
      setProfileExists(false);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ⚠️ CRITICAL FIX: Only run check when Auth is FINISHED loading
    if (!authLoading) {
      checkProfile();
    }
  }, [user, authLoading]);

  return (
    <ProfileContext.Provider value={{
      profileExists,
      setProfileExists,
      profileData,
      loading,
      checkProfile,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);