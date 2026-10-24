import { AdminCredentials, AdminSession } from '../types/admin';

export const adminAuthRepository = {
  async signIn({ email, password }: AdminCredentials): Promise<AdminSession> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || !password.trim()) {
      throw new Error('INVALID_DEMO_CREDENTIALS');
    }

    // Simulação local: não envia nem armazena a senha. Qualquer e-mail válido e senha preenchida servem para visualizar a área.
    return { email: normalizedEmail, name: 'Administrador' };
  },

  async signOut(): Promise<void> {
    // Sessão apenas em memória.
  },
};
