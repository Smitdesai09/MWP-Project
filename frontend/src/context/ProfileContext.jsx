import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

// Helper to extract profile data from GET response
function extractProfile(data) {
  if (!data) return null;
  // Backend GET returns { success: true, data: profileObject }
  if (data.data) return data.data;
  if (data.profile) return data.profile;
  if (data.age !== undefined || data.riskScore !== undefined) return data;
  return null;
}

export const ProfileProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  const checkProfile = async () => {
    if (!user) {
      setProfileExists(false);
      setProfileData(null);
      setLoading(false);
      return;
    }
    
    try {
      const res = await API.get('/profile');
      const profile = extractProfile(res.data);
      if (profile) {
        setProfileData(profile);
        setProfileExists(true);
      } else {
        setProfileExists(false);
        setProfileData(null);
      }
    } catch (err) {
      setProfileExists(false);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

  // FIX: saveProfile function that triggers a re-fetch
  // Since backend doesn't return the profile on POST/PATCH, we must GET it again
  const saveProfile = async () => {
    await checkProfile();
  };

  useEffect(() => {
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
      saveProfile // EXPORTED: This fixes the "saveProfile is not a function" error
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);