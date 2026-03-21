"use client";

const isLocalStorageAvailable = typeof window !== 'undefined';

export const setToken = (token: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('token', token);
    localStorage.setItem('tokenTimestamp', Date.now().toString());
    console.log('Token set:', token);
  }
};

export const getToken = () => {
  if (isLocalStorageAvailable) {
    // Check old local storage
    const legacyToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Check new Cookie storage system
    if (typeof document !== 'undefined') {
      const nameEQ = "accessToken=";
      const ca = document.cookie.split(';');
      for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
    }
    return legacyToken;
  }
  return null;
};

export const isAuthenticated = () => {
  const token = getToken();
  const isAuth = !!token;
  return isAuth;
};

export const setUser = (user: any): void => {
  if (isLocalStorageAvailable) {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  }
};

export const getUser = (): any | null => {
  if (isLocalStorageAvailable) {
    try {
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

export const setUserID = (id: any): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('id', id);
  }
};

export const getUserID = (): any | null => {
  if (isLocalStorageAvailable) {
    return localStorage.getItem('id') || sessionStorage.getItem('id');
  }
  return null;
};



export const setUserName = (username: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('username', username);
  }
};

export const getUserName = (): string | null => {
  if (isLocalStorageAvailable) {
    return localStorage.getItem('username') || sessionStorage.getItem('username');
  }
  return null;
};

export const setFullName = (fullName: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('fullName', fullName);
  }
};

export const getFullName = (): string | null => {
  if (isLocalStorageAvailable) {
    return localStorage.getItem('fullName') || sessionStorage.getItem('fullName');
  }
  return null;
};

// Aliases for compatibility
export const setfullname = setFullName;
export const getfullname = getFullName;

export const setEmail = (email: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('email', email);
  }
};

export const getEmail = () => {
  if (isLocalStorageAvailable) {
    return localStorage.getItem('email') || sessionStorage.getItem('email');
  }
  return null;
};

export const setMobileNumber = (mobileNumber: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('mobileNumber', mobileNumber);
  }
};

export const getMobileNumber = (): string | null => {
  if (isLocalStorageAvailable) {
    return localStorage.getItem('mobileNumber') || sessionStorage.getItem('mobileNumber');
  }
  return null;
};

// Aliases for compatibility
export const setPhoneNumber = setMobileNumber;
export const getPhoneNumber = getMobileNumber;

export const setRole = (role: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('role', role);
  }
};

export const getRole = (): string | null => {
  if (isLocalStorageAvailable) {
    return localStorage.getItem('role') || sessionStorage.getItem('role');
  }
  return null;
};

export const handleLogout = (): void => {
  if (isLocalStorageAvailable) {
    localStorage.clear();
    window.location.href = "/sign-in";
  }
};

export const setRefreshToken = (token: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('refreshToken', token);
  }
};

export const getRefreshToken = (): string | null => {
  if (isLocalStorageAvailable) {
    return localStorage.getItem('refreshToken');
  }
  return null;
};
