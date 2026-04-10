/**
 * Filtre les notifications selon le destinataire (admin, utilisateur ciblé, ou héritage « globale »).
 */
export function notificationVisibleForUser(n, currentUser) {
  if (!currentUser) return false;
  if (n.recipientRole === 'admin') return currentUser.role === 'admin';
  if (n.recipientUserId != null) return currentUser.id === n.recipientUserId;
  return true;
}

export function filterNotificationsForUser(notifications, currentUser) {
  if (!notifications?.length) return [];
  return notifications.filter((n) => notificationVisibleForUser(n, currentUser));
}
