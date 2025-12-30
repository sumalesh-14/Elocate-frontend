"use client";

const isLocalStorageAvailable = typeof window !== 'undefined';

export const setToken = (token: string): void => {
  if (isLocalStorageAvailable) {
    localStorage.setItem('token', token);
    console.log('Token set:', token);
  }
};

export const getToken = () => {
  if (isLocalStorageAvailable) {
    const token = localStorage.getItem('token');
    return token;
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
      const user = localStorage.getItem('user');
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
    const userId = localStorage.getItem('id');
    return userId;
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
    const username = localStorage.getItem('username');
    return username;
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
    const fullName = localStorage.getItem('fullName');
    return fullName;
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
    const email = localStorage.getItem('email');
    return email;
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
    const mobileNumber = localStorage.getItem('mobileNumber');
    return mobileNumber;
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
    return localStorage.getItem('role');
  }
  return null;
};

export const handleLogout = (): void => {
  if (isLocalStorageAvailable) {
    localStorage.clear();
    window.location.href = "/sign-in";
  }
};
