import { API_URL } from "../config"

export type LoginParams = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  email: string
  role: string
}

export async function postLogin(params: LoginParams): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.error || `Failed to login: ${res.status}`)
  }

  return res.json()
}


export type RefreshTokenParams = {
  refreshToken: string
}

export type RefreshTokenResponse = {
  accessToken: string
  expiresIn: number
  email: string
  role: string
}

export async function postRefreshToken(
  params: RefreshTokenParams
): Promise<RefreshTokenResponse> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(errorData?.error || `Failed to refresh token: ${res.status}`)
  }

  return res.json()
}
