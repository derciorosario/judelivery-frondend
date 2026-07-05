// Access code utilities for frontend-only encryption and validation

// Simple encryption using a fixed key (for frontend obscuration)
const ENCRYPTION_KEY = 'meucasamento_access_2024';

// Generate a 6-digit numeric access code
export const generateAccessCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simple XOR encryption with base64 encoding
export const encryptAccessCode = (code) => {
  try {
    const key = ENCRYPTION_KEY;
    let encrypted = '';

    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }

    // Convert to base64 for URL-safe string
    return btoa(encrypted);
  } catch (error) {
    console.error('Error encrypting access code:', error);
    return null;
  }
};

// Decrypt the access code
export const decryptAccessCode = (encrypted) => {
  try {
    const key = ENCRYPTION_KEY;

    // Decode from base64
    const encryptedBytes = atob(encrypted);
    let decrypted = '';

    for (let i = 0; i < encryptedBytes.length; i++) {
      const charCode = encryptedBytes.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode);
    }

    return decrypted;
  } catch (error) {
    console.error('Error decrypting access code:', error);
    return null;
  }
};

// Validate if a decrypted code is a valid 6-digit number
export const isValidAccessCode = (code) => {
  return /^\d{6}$/.test(code);
};

// Generate both code and encrypted version
export const generateAccessCodePair = () => {
  const code = generateAccessCode();
  const encrypted = encryptAccessCode(code);
  return { code, encrypted };
};

// Validate encrypted code against expected code
export const validateEncryptedCode = (encrypted, expectedCode) => {
  const decrypted = decryptAccessCode(encrypted);
  return decrypted === expectedCode && isValidAccessCode(decrypted);
};

// Local storage keys
const PROFILE_ACCESS_KEY = 'meucasamento_profile_access';
const ALBUM_ACCESS_KEY_PREFIX = 'meucasamento_album_access_';

// Store profile access (valid for all albums of that user)
export const storeProfileAccess = (userId, accessCode) => {
  try {
    const accessData = {
      userId,
      accessCode,
      timestamp: Date.now()
    };
    localStorage.setItem(PROFILE_ACCESS_KEY, JSON.stringify(accessData));
  } catch (error) {
    console.error('Error storing profile access:', error);
  }
};

// Check if profile access is valid
export const hasValidProfileAccess = (userId, encryptedCode) => {
  try {
    const stored = localStorage.getItem(PROFILE_ACCESS_KEY);
    if (!stored) return false;

    const accessData = JSON.parse(stored);

    // Check if it's for the same user and within 24 hours
    if (accessData.userId !== userId) return false;

    const hoursSinceAccess = (Date.now() - accessData.timestamp) / (1000 * 60 * 60);
    if (hoursSinceAccess > 24) {
      localStorage.removeItem(PROFILE_ACCESS_KEY);
      return false;
    }

    // Validate the code
    return validateEncryptedCode(encryptedCode, accessData.accessCode);
  } catch (error) {
    console.error('Error checking profile access:', error);
    return false;
  }
};

// Store album-specific access
export const storeAlbumAccess = (albumId, accessCode) => {
  try {
    const accessData = {
      albumId,
      accessCode,
      timestamp: Date.now()
    };
    localStorage.setItem(`${ALBUM_ACCESS_KEY_PREFIX}${albumId}`, JSON.stringify(accessData));
  } catch (error) {
    console.error('Error storing album access:', error);
  }
};

// Check if album access is valid
export const hasValidAlbumAccess = (albumId, encryptedCode) => {
  try {
    const stored = localStorage.getItem(`${ALBUM_ACCESS_KEY_PREFIX}${albumId}`);
    if (!stored) return false;

    const accessData = JSON.parse(stored);

    // Check if it's for the same album and within 24 hours
    if (accessData.albumId !== albumId) return false;

    const hoursSinceAccess = (Date.now() - accessData.timestamp) / (1000 * 60 * 60);
    if (hoursSinceAccess > 24) {
      localStorage.removeItem(`${ALBUM_ACCESS_KEY_PREFIX}${albumId}`);
      return false;
    }

    // Validate the code
    return validateEncryptedCode(encryptedCode, accessData.accessCode);
  } catch (error) {
    console.error('Error checking album access:', error);
    return false;
  }
};