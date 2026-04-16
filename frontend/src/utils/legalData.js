export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', options);
}

export function formatDateTime(value, options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', options);
}

export function formatTime(value, options = { hour: '2-digit', minute: '2-digit' }) {
  if (!value) return 'Not set';
  const date = new Date(`1970-01-01T${String(value).slice(0, 5)}:00`);
  if (!Number.isNaN(date.getTime()) && String(value).length <= 5) {
    return date.toLocaleTimeString('en-IN', options);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString('en-IN', options);
}

export function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function getCaseRouteId(caseItem) {
  return caseItem?.databaseId ?? (typeof caseItem?.id === 'number' ? caseItem.id : null);
}

export function getDatabaseId(item) {
  return item?.databaseId ?? (typeof item?.id === 'number' ? item.id : null);
}

export function getCaseNumber(caseItem) {
  return caseItem?.caseNumber || caseItem?.case_number || 'Pending Number';
}

export function getCaseType(caseItem) {
  return caseItem?.caseType || caseItem?.case_type || 'General';
}

export function getCaseCourtRoom(caseItem) {
  return caseItem?.courtRoom || caseItem?.court_room_name || 'To be assigned';
}

export function getCaseFilingDate(caseItem) {
  return caseItem?.filingDate || caseItem?.filing_date || null;
}

export function getCaseNextHearing(caseItem) {
  return caseItem?.nextHearing || caseItem?.next_hearing || null;
}

export function getDisplayName(user) {
  if (!user) return 'User';
  return user.name || user.email || 'User';
}

export function matchText(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(query.toLowerCase());
}

export function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

export const CASE_STATUS_OPTIONS = [
  { value: 'filed', label: 'Filed' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'hearing_scheduled', label: 'Hearing Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'judgment_reserved', label: 'Judgment Reserved' },
  { value: 'closed', label: 'Closed' },
  { value: 'dismissed', label: 'Dismissed' },
];

export function extractSharedCaseToken(value) {
  const match = String(value || '').trim().match(/\/api\/cases\/shared\/report\/([^/?#]+)\.pdf(?:[?#].*)?$/i);
  return match?.[1] || null;
}
