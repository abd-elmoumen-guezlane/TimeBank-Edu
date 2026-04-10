import { useRef, useState } from 'react';
import { Camera, Trash2, Check } from 'lucide-react';
import Avatar from './Avatar';
import { useApp } from '../../context/AppContext';
import { readImageFileAsDataUrl } from '../../utils/profilePhoto';

/**
 * Choisir / prévisualiser / enregistrer / supprimer la photo de profil (data URL + localStorage via updateProfile).
 */
export default function ProfilePhotoSection({ size = 'xl', compact = false, variant = 'stack' }) {
  const { currentUser, updateProfile } = useApp();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const displaySrc = preview || currentUser?.avatarPhoto || null;

  const handlePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await readImageFileAsDataUrl(file);
      setPreview(url);
      setError('');
    } catch (err) {
      setError(err.message || 'Erreur de lecture du fichier');
    }
  };

  const savePhoto = () => {
    if (!preview) return;
    updateProfile({ avatarPhoto: preview });
    setPreview(null);
    setError('');
  };

  const clearPhoto = () => {
    if (preview) {
      setPreview(null);
      setError('');
      return;
    }
    updateProfile({ avatarPhoto: null });
    setError('');
  };

  const isRow = variant === 'row';

  return (
    <div className={isRow ? 'flex flex-col sm:flex-row sm:items-start gap-4' : `text-center ${compact ? '' : ''}`}>
      <div className={isRow ? 'flex-shrink-0 mx-auto sm:mx-0' : 'inline-block relative'}>
        <Avatar initials={currentUser?.avatar || '?'} src={displaySrc} size={size} alt={currentUser?.name || 'Profil'} />
      </div>
      <div className={isRow ? 'flex-1 min-w-0' : ''}>
        {error && <p className="text-xs text-red-600 mt-0 mb-2 sm:text-left">{error}</p>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handlePick} />
        <div className={`flex flex-col gap-2 ${isRow ? 'mt-0 items-stretch sm:items-start' : `mt-3 ${compact ? 'items-stretch' : 'items-center'}`}`}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm text-primary-600 border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50 dark:border-primary-700 dark:hover:bg-primary-900/20 inline-flex items-center justify-center gap-2"
        >
          <Camera size={16} />
          {currentUser?.avatarPhoto || preview ? 'Changer la photo' : 'Ajouter une photo'}
        </button>
        {preview && (
          <button type="button" onClick={savePhoto} className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 inline-flex items-center justify-center gap-2">
            <Check size={16} />
            Enregistrer cette photo
          </button>
        )}
        {(currentUser?.avatarPhoto || preview) && (
          <button
            type="button"
            onClick={clearPhoto}
            className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 inline-flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Retirer la photo
          </button>
        )}
        </div>
        <p className={`text-xs text-gray-400 ${isRow ? 'mt-2 text-left' : 'mt-2'}`}>JPG, PNG, WebP ou GIF — max 2 Mo (stockage local)</p>
      </div>
    </div>
  );
}
