import API_BASE_URL from '../config/api';

export const ENDPOINTS = {
  REGISTER:       `${API_BASE_URL}/api/auth/register`,
  LOGIN:          `${API_BASE_URL}/api/auth/login`,
  ME:             `${API_BASE_URL}/api/auth/me`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD:  `${API_BASE_URL}/api/auth/reset-password`,
  SEND_OTP:        `${API_BASE_URL}/api/auth/send-otp`,
  VERIFY_OTP:      `${API_BASE_URL}/api/auth/verify-otp`,
  COURSES:        (type) => `${API_BASE_URL}/api/courses/${type}`,
  ENROLLMENTS:    `${API_BASE_URL}/api/enrollments`,
  MY_ENROLLMENTS: `${API_BASE_URL}/api/enrollments/me`,

  MATERIALS:            `${API_BASE_URL}/api/materials`,
  MATERIAL_UPLOAD:       `${API_BASE_URL}/api/materials/upload`,
  MATERIAL_ACCESS:  (id) => `${API_BASE_URL}/api/materials/${id}/access`,
  MATERIAL_DOWNLOAD:(id) => `${API_BASE_URL}/api/materials/${id}/download`,
  MATERIAL_DELETE:  (id) => `${API_BASE_URL}/api/materials/${id}`,

  CONFIRM_PAYMENT: `${API_BASE_URL}/api/payment/confirm`,
  MY_PURCHASES:    `${API_BASE_URL}/api/payment/my-purchases`,
  ADMIN_PURCHASES: `${API_BASE_URL}/api/payment/purchases`,
  PAYMENT_STATS:   `${API_BASE_URL}/api/payment/stats`,

  QUIZ_QUESTIONS:  (id) => `${API_BASE_URL}/api/quiz/${id}/questions`,
  QUIZ_SUBMIT:     (id) => `${API_BASE_URL}/api/quiz/${id}/submit`,
  QUIZ_CERTIFICATE:(id) => `${API_BASE_URL}/api/quiz/${id}/certificate`,
  MY_CERTIFICATES: `${API_BASE_URL}/api/quiz/my-certificates`,

  COURSE_STATUS:      (group) => `${API_BASE_URL}/api/course/${group}/status`,
  COURSE_FINAL:        (group) => `${API_BASE_URL}/api/course/${group}/final`,
  COURSE_FINAL_SUBMIT: (group) => `${API_BASE_URL}/api/course/${group}/final/submit`,
  COURSE_CERTIFICATE:  (group) => `${API_BASE_URL}/api/course/${group}/certificate`,
};

function getAuthHeaders() {
  const token = localStorage.getItem('pmc_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// The Online Course purchase/quiz/certificate flow works without logging in.
// Visitors without an account get a persistent per-browser guest id so their
// purchase and certificate stick around across visits, same as a logged-in user.
export function getOrCreateGuestId() {
  let id = localStorage.getItem('pmc_guest_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('pmc_guest_id', id);
  }
  return id;
}

// Identity headers for the material/payment/quiz endpoints — sends the JWT
// if logged in, otherwise the guest id. Never both.
function getIdentityHeaders() {
  const token = localStorage.getItem('pmc_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : { 'X-Guest-Id': getOrCreateGuestId() }),
  };
}

// Appends the JWT (or guest id) as a query param — for <iframe>/<a href>
// file links, which can't send custom headers.
export function withIdentity(url) {
  const token = localStorage.getItem('pmc_token');
  const param = token ? `token=${encodeURIComponent(token)}` : `guest=${encodeURIComponent(getOrCreateGuestId())}`;
  return `${url}?${param}`;
}

export async function apiRegister({ name, email, phone, password }) {
  const res = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, email, phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function apiLogin({ email, password }) {
  const res = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function apiForgotPassword({ email }) {
  const res = await fetch(ENDPOINTS.FORGOT_PASSWORD, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Could not generate reset token');
  return data;
}

export async function apiResetPassword({ token, password }) {
  const res = await fetch(ENDPOINTS.RESET_PASSWORD, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ token, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Password reset failed');
  return data;
}

export async function apiSendOtp(phone) {
  const res = await fetch(ENDPOINTS.SEND_OTP, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Could not send OTP');
  return data; // { message, devOtp? }
}

export async function apiVerifyOtp({ phone, otp, name }) {
  const res = await fetch(ENDPOINTS.VERIFY_OTP, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ phone, otp, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'OTP verification failed');
  return data; // { token, user }
}

export async function apiGetMe() {
  const res = await fetch(ENDPOINTS.ME, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export async function apiGetCourses(type) {
  const res = await fetch(ENDPOINTS.COURSES(type), { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load courses');
  return data;
}

export async function apiEnroll({ courseId, courseType, courseTitle, price }) {
  const res = await fetch(ENDPOINTS.ENROLLMENTS, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ courseId, courseType, courseTitle, price }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Enrollment failed');
  return data;
}

export async function apiGetMyEnrollments() {
  const res = await fetch(ENDPOINTS.MY_ENROLLMENTS, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load enrollments');
  return data;
}

export async function apiUpdateProgress(enrollmentId, progress) {
  const res = await fetch(`${API_BASE_URL}/api/enrollments/${enrollmentId}/progress`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ progress }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update progress');
  return data;
}

export async function apiGetEnrollmentStats() {
  const res = await fetch(`${API_BASE_URL}/api/enrollments/stats`, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load stats');
  return data;
}

// ---- Course material (PPT/PDF), payment & certification ----

export async function apiGetMaterials() {
  const res = await fetch(ENDPOINTS.MATERIALS);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load course material');
  return data;
}

export async function apiUploadMaterial({ title, file, courseGroup, order }) {
  const token = localStorage.getItem('pmc_token');
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  if (courseGroup) formData.append('courseGroup', courseGroup);
  if (order) formData.append('order', order);

  const res = await fetch(ENDPOINTS.MATERIAL_UPLOAD, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {}, // no Content-Type — browser sets multipart boundary
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload failed');
  return data;
}

export async function apiDeleteMaterial(materialId) {
  const res = await fetch(ENDPOINTS.MATERIAL_DELETE(materialId), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove material');
  return data;
}

export async function apiCheckAccess(materialId) {
  const res = await fetch(ENDPOINTS.MATERIAL_ACCESS(materialId), { headers: getIdentityHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to check access');
  return data;
}

// Learner scans the static QR shown in the payment dialog and pays directly,
// then hits "I've Paid" — this just records the purchase and unlocks the
// material, there is no gateway callback to verify against.
export async function apiConfirmPayment({ materialId, name, email, phone, reason }) {
  const res = await fetch(ENDPOINTS.CONFIRM_PAYMENT, {
    method: 'POST',
    headers: getIdentityHeaders(),
    body: JSON.stringify({ materialId, name, email, phone, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Could not confirm payment');
  return data;
}

export async function apiGetMyPurchases() {
  const res = await fetch(ENDPOINTS.MY_PURCHASES, { headers: getIdentityHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load purchases');
  return data;
}

export async function apiGetAdminPurchases() {
  const res = await fetch(ENDPOINTS.ADMIN_PURCHASES, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load purchases');
  return data;
}

export async function apiGetPaymentStats() {
  const res = await fetch(ENDPOINTS.PAYMENT_STATS, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load stats');
  return data;
}

export async function apiGetMyCertificates() {
  const res = await fetch(ENDPOINTS.MY_CERTIFICATES, { headers: getIdentityHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load certificates');
  return data;
}

export async function apiGetQuizQuestions(materialId) {
  const res = await fetch(ENDPOINTS.QUIZ_QUESTIONS(materialId), { headers: getIdentityHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load quiz');
  return data;
}

export async function apiSubmitQuiz(materialId, answers) {
  const res = await fetch(ENDPOINTS.QUIZ_SUBMIT(materialId), {
    method: 'POST',
    headers: getIdentityHeaders(),
    body: JSON.stringify({ answers }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit quiz');
  return data;
}

// ---- Sequential course (courseGroup materials + final bundle assessment) ----

export async function apiGetCourseStatus(courseGroup) {
  const res = await fetch(ENDPOINTS.COURSE_STATUS(courseGroup), { headers: getIdentityHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load course status');
  return data;
}

export async function apiGetFinalAssessment(courseGroup) {
  const res = await fetch(ENDPOINTS.COURSE_FINAL(courseGroup), { headers: getIdentityHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to load final assessment');
  return data;
}

export async function apiSubmitFinalAssessment(courseGroup, { answers, longAnswerText }) {
  const res = await fetch(ENDPOINTS.COURSE_FINAL_SUBMIT(courseGroup), {
    method: 'POST',
    headers: getIdentityHeaders(),
    body: JSON.stringify({ answers, longAnswerText }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit final assessment');
  return data;
}

export default ENDPOINTS;
