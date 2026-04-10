/** Clé localStorage pour les photos de profil (data URL), par id utilisateur. */
const STORAGE_KEY = 'timebank_profile_photos';

export function getStoredAvatarPhoto(userId) {
  if (userId == null) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[String(userId)] || null;
  } catch {
    return null;
  }
}

export function setStoredAvatarPhoto(userId, dataUrl) {
  if (userId == null) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    if (dataUrl) map[String(userId)] = dataUrl;
    else delete map[String(userId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota / private mode */
  }
}

/** Lit un fichier image et retourne une data URL (max ~2 Mo). */
export function readImageFileAsDataUrl(file, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Veuillez choisir une image (JPG, PNG, WebP…).'));
      return;
    }
    if (file.size > maxBytes) {
      reject(new Error('Fichier trop volumineux (max 2 Mo).'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
}
