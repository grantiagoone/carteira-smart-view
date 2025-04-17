
import { useEffect } from 'react';
import { setBrapiToken } from '@/services/brapiService';

const DEFAULT_TOKEN = 'wdv23aKZTtYg5VBLbxprE9';

export const useBrapiToken = () => {
  useEffect(() => {
    // Check if there's an existing token
    const existingToken = localStorage.getItem('BRAPI_TOKEN');
    
    // If no token exists, set the default one
    if (!existingToken) {
      setBrapiToken(DEFAULT_TOKEN);
    }
  }, []);

  return null;
};
