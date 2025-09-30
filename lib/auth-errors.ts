export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/invalid-credential": "Email ou senha incorretos",
    "auth/user-disabled": "Usuário desabilitado",
    "auth/user-not-found": "Usuário não encontrado",
    "auth/wrong-password": "Senha incorreta",
    "auth/email-already-in-use": "Este email já está em uso",
    "auth/weak-password": "Senha muito fraca",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
    "auth/invalid-email": "Email inválido",
    "auth/operation-not-allowed": "Operação não permitida",
    "auth/requires-recent-login": "Esta operação requer login recente",
    "auth/id-token-expired": "Sessão expirada. Faça login novamente.",
    "auth/argument-error": "Token inválido",
  }

  return errorMessages[errorCode] || "Erro desconhecido ao processar autenticação"
}

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: "Email é obrigatório" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Email inválido" }
  }

  return { valid: true }
}

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: "Senha é obrigatória" }
  }

  if (password.length < 6) {
    return { valid: false, error: "Senha deve ter no mínimo 6 caracteres" }
  }

  return { valid: true }
}

export const validateDisplayName = (name: string): { valid: boolean; error?: string } => {
  if (!name) {
    return { valid: false, error: "Nome é obrigatório" }
  }

  if (name.trim().length < 3) {
    return { valid: false, error: "Nome deve ter no mínimo 3 caracteres" }
  }

  return { valid: true }
}