const isBrowser = typeof window !== 'undefined';

const setCookie = (name: string, value: string, rememberMe: boolean) => {
  if (isBrowser && document !== undefined) {
    let expires = '';
    if (rememberMe) {
      const date = new Date();
      date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax`;
  }
};

const getCookie = (name: string) => {
  if (isBrowser && document !== undefined) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
      let c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
};

const eraseCookie = (name: string) => {
  if (isBrowser && document !== undefined) {
    document.cookie = name + '=; Max-Age=-99999999; path=/';
  }
};

export const setToken = (token: string, refreshToken?: string | null, rememberMe = true): void => {
  if (isBrowser) {
    setCookie('accessToken', token, rememberMe);
    if (refreshToken) {
      setCookie('refreshToken', refreshToken, rememberMe);
    }
    console.log('Authentication cookies set successfully.');
  }
};

export const getToken = () => {
  if (isBrowser) {
    // Check old localStorage logic just in case the system hasn't cleared it out yet
    const legacyToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    return getCookie('accessToken') || legacyToken;
  }
  return null;
};

export const getRefreshToken = () => {
  if (isBrowser) {
    return getCookie('refreshToken');
  }
  return null;
};

export const isAuthenticated = () => {
  const token = getToken();
  const isAuth = !!token;
  return isAuth;
};

export const setUser = (user: any, rememberMe = true): void => {
  if (isBrowser) {
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  }
};

export const getUser = (): any | null => {
  if (isBrowser) {
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
  if (isBrowser) {
    localStorage.setItem('id', id);
  }
};

export const getUserID = (): any | null => {
  if (isBrowser) {
    const userId = localStorage.getItem('id');
    return userId;
  }
  return null;
};



export const setUserName = (username: string): void => {
  if (isBrowser) {
    localStorage.setItem('username', username);
  }
};

export const getUserName = (): string | null => {
  if (isBrowser) {
    const username = localStorage.getItem('username');
    return username;
  }
  return null;
};

export const setFullName = (fullName: string): void => {
  if (isBrowser) {
    localStorage.setItem('fullName', fullName);
  }
};

export const getFullName = (): string | null => {
  if (isBrowser) {
    const fullName = localStorage.getItem('fullName');
    return fullName;
  }
  return null;
};

// Aliases for compatibility
export const setfullname = setFullName;
export const getfullname = getFullName;

export const setEmail = (email: string): void => {
  if (isBrowser) {
    localStorage.setItem('email', email);
  }
};

export const getEmail = () => {
  if (isBrowser) {
    const email = localStorage.getItem('email');
    return email;
  }
  return null;
};

export const setMobileNumber = (mobileNumber: string): void => {
  if (isBrowser) {
    localStorage.setItem('mobileNumber', mobileNumber);
  }
};

export const getMobileNumber = (): string | null => {
  if (isBrowser) {
    const mobileNumber = localStorage.getItem('mobileNumber');
    return mobileNumber;
  }
  return null;
};

// Aliases for compatibility
export const setPhoneNumber = setMobileNumber;
export const getPhoneNumber = getMobileNumber;

export const setRole = (role: string): void => {
  if (isBrowser) {
    localStorage.setItem('role', role);
  }
};

export const getRole = (): string | null => {
  if (isBrowser) {
    return localStorage.getItem('role');
  }
  return null;
};

export const handleLogout = (): void => {
  if (isBrowser) {
    localStorage.clear();
    sessionStorage.clear();
    eraseCookie('accessToken');
    eraseCookie('refreshToken');
    window.location.href = "/sign-in";
  }
};
