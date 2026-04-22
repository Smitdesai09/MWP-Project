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
  const { user, loading: authLoading } = useAuth();
  const [profileExists, setProfileExists] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [profileData, setProfileData]     = useState(null);

  const checkProfile = async () => {
    if (!user) {
      setProfileExists(false);
      setProfileData(null);
      setLoading(false);
      return;
    }
    
    try {
      // ⚠️ FIX: validateStatus prevents 404 from logging as an error.
      // 404 is a valid state here: it just means "Profile not created yet".
      const res = await API.get('/profile', {
        validateStatus: (status) => status < 500
      });

      const profile = extractProfile(res.data);
      
      // Check for success OR if status is 404 (not found)
      if (res.status === 404 || !profile) {
        setProfileExists(false);
        setProfileData(null);
      } else {
        setProfileData(profile);
        setProfileExists(true);
      }
    } catch (err) {
      // Only catches network errors now
      setProfileExists(false);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  };

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
      saveProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);