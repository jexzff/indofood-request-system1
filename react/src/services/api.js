const API_URL = 'http://127.0.0.1:8000/api'

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.message || 'Terjadi kesalahan pada server'
    )
  }

  return data
}

// =====================================================
// LOGIN
// =====================================================

export async function login(username, password, role) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
      role,
    }),
  })
}

// =====================================================
// USERS
// =====================================================

export async function createUser(data) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getUsers() {
  return request('/users')
}

// =====================================================
// REQUEST
// =====================================================

export async function createRequest(data) {
  return request('/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getRequests() {
  return request('/requests')
}

export async function confirmRequest(id, actual) {
  return request(`/requests/${id}/confirm`, {
    method: 'PUT',
    body: JSON.stringify({
      actual,
    }),
  })
}

// =====================================================
// RETURN
// =====================================================

export async function createReturn(data) {
  return request('/returns', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getReturns() {
  return request('/returns')
}

export async function confirmReturn(id, actual) {
  return request(`/returns/${id}/confirm`, {
    method: 'PUT',
    body: JSON.stringify({
      actual,
    }),
  })
}

// =====================================================
// HISTORY
// =====================================================

export async function getHistory() {
  return request('/history')
}