export const setCookie = (name: string, value: string, maxAge: number = 3600) => {
  if (typeof document === "undefined") return

  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Strict; Secure`
}

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return

  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift()
    return cookieValue || null
  }

  return null
}