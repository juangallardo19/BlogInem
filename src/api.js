export const API_URL =
  'https://script.google.com/macros/s/AKfycbwiVEWq6dybGTUZAVc1G_vCWd-1i3ySzWZjLWbDLC4l6lYj58vmlFSrFj8GMfRvlXMq/exec';

export const ADMIN_PASSWORD = 'Ldirinem2025';

async function parseJsonResponse(response) {
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Server request failed');
  }
  return result;
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
