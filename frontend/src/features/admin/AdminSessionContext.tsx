import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { adminAuthRepository } from '../../services/adminAuthRepository';
import { AdminCredentials, AdminSession } from '../../types/admin';

interface AdminSessionValue {
  session: AdminSession | null;
  signIn: (credentials: AdminCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

export function AdminSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AdminSession | null>(null);

  async function signIn(credentials: AdminCredentials) {
    setSession(await adminAuthRepository.signIn(credentials));
  }

  async function signOut() {
    await adminAuthRepository.signOut();
    setSession(null);
  }

  return <AdminSessionContext.Provider value={{ session, signIn, signOut }}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const value = useContext(AdminSessionContext);
  if (!value) throw new Error('AdminSessionProvider não encontrado');
  return value;
}
