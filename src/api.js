export const API_URL =
  'https://script.google.com/macros/s/AKfycbzv7tkWcUvmpP8eyPXZK4Rr_2KBqyXgyODMhvAZGkBNhAn7aOmYdAMqOCqAvshwkd2E/exec';

export const ADMIN_PASSWORD = 'Ldirinem2025';
const DEBUG_API = true;

async function parseJsonResponse(response) {
  const result = await response.json();
  if (DEBUG_API) {
    console.debug('[Blogging API response]', response.url, result);
  }
  if (!result.success) {
    throw new Error(result.message || 'Server request failed');
  }
  return result;
}

function logApiRequest(label, url, payload) {
  if (!DEBUG_API) return;
  console.debug(`[Blogging API request] ${label}`, { url, payload });
}

export async function submitExperience(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'submitExperience',
      ...payload
    })
  });
  return parseJsonResponse(response);
}

export async function getExperiences() {
  const response = await fetch(`${API_URL}?action=getExperiencias&t=${Date.now()}`);
  const result = await parseJsonResponse(response);
  return (result.data || []).filter(
    (publication) => publication.id && publication.studentName
  );
}

export async function validateAdmin(password) {
  const response = await fetch(
    `${API_URL}?action=validateAdmin&password=${encodeURIComponent(password)}`
  );
  const result = await parseJsonResponse(response);
  return Boolean(result.data?.valid);
}

export async function deleteExperience(publicationId) {
  const params = new URLSearchParams({
    action: 'deleteExperiencia',
    id: publicationId,
    password: ADMIN_PASSWORD,
    t: Date.now()
  });
  return parseJsonResponse(await fetch(`${API_URL}?${params.toString()}`));
}

export async function getComments(publicationId) {
  const params = new URLSearchParams({
    action: 'getComments',
    publicationId,
    t: Date.now()
  });
  const result = await parseJsonResponse(await fetch(`${API_URL}?${params.toString()}`));
  return result.data?.comments || [];
}

export async function submitComment({ publicationId, name, comment }) {
  const params = new URLSearchParams({
    action: 'submitComment',
    publicationId,
    name,
    comment,
    t: Date.now()
  });
  return parseJsonResponse(await fetch(`${API_URL}?${params.toString()}`));
}

export async function deleteComment({ publicationId, commentId }) {
  const params = new URLSearchParams({
    action: 'deleteComment',
    publicationId,
    commentId,
    password: ADMIN_PASSWORD,
    t: Date.now()
  });
  return parseJsonResponse(await fetch(`${API_URL}?${params.toString()}`));
}

export async function cleanOrphanRecords() {
  const params = new URLSearchParams({
    action: 'cleanOrphanRecords',
    password: ADMIN_PASSWORD
  });
  const result = await parseJsonResponse(await fetch(`${API_URL}?${params.toString()}`));
  return result.data;
}

export async function initializeBloggingFolders() {
  const params = new URLSearchParams({
    action: 'initializeBloggingFolders',
    password: ADMIN_PASSWORD,
    t: Date.now()
  });
  const result = await parseJsonResponse(await fetch(`${API_URL}?${params.toString()}`));
  return result.data;
}

export async function scanBloggingUploads() {
  const params = new URLSearchParams({
    action: 'scanBloggingUploads',
    password: ADMIN_PASSWORD,
    t: Date.now()
  });
  const url = `${API_URL}?${params.toString()}`;
  logApiRequest('scanBloggingUploads', url);
  const result = await parseJsonResponse(await fetch(url));
  return result.data;
}

export async function consolidateBloggingFolders() {
  const params = new URLSearchParams({
    action: 'consolidateBloggingFolders',
    password: ADMIN_PASSWORD,
    t: Date.now()
  });
  const result = await parseJsonResponse(await fetch(`${API_URL}?${params.toString()}`));
  return result.data;
}

export async function getBloggingContent({ section, contentType, status, admin = false, sync = false } = {}) {
  const params = new URLSearchParams({
    action: 'getBloggingContent',
    t: Date.now()
  });
  if (section) params.set('section', section);
  if (contentType) params.set('contentType', contentType);
  if (status) params.set('status', status);
  if (admin) params.set('password', ADMIN_PASSWORD);
  if (sync) params.set('sync', 'true');
  const url = `${API_URL}?${params.toString()}`;
  logApiRequest('getBloggingContent', url, { section, contentType, status, admin, sync });
  const result = await parseJsonResponse(await fetch(url));
  return result.data || [];
}

export async function uploadBloggingContentBatch(payload) {
  logApiRequest('uploadBloggingContentBatch', API_URL, {
    section: payload.section,
    contentType: payload.contentType,
    fileCount: payload.files?.length || 0,
    fileNames: payload.files?.map((file) => file.name)
  });
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'uploadBloggingContentBatch',
      password: ADMIN_PASSWORD,
      ...payload
    })
  });
  const result = await parseJsonResponse(response);
  return result.data;
}

export async function deleteBloggingContentBatch(ids) {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      action: 'deleteBloggingContentBatch',
      password: ADMIN_PASSWORD,
      ids
    })
  });
  const result = await parseJsonResponse(response);
  return result.data;
}
