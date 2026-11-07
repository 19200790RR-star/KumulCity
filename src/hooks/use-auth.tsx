import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

export type AppRole = 'admin' | 'visitor';
export type LocalUser = { id: string; email: string };

type LocalAccount = LocalUser & { role: AppRole };

type AuthContextValue = {
  loading: boolean;
  user: LocalUser | null;
  role: AppRole | null;
  error: string | null;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, role: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
};

const ACCOUNTS_KEY = 'kumulcity.local.accounts.v1';
const SESSION_KEY = 'kumulcity.local.session.v1';
const AuthContext = createContext<AuthContextValue | null>(null);

function isAppRole(value: unknown): value is AppRole {
  return value === 'admin' || value === 'visitor';
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseAccounts(value: string | null): LocalAccount[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) throw new Error('Saved local accounts are invalid.');
  return parsed.filter(
    (account: unknown): account is LocalAccount => {
      if (typeof account !== 'object' || account === null) return false;
      return (
        'id' in account &&
        typeof account.id === 'string' &&
        'email' in account &&
        typeof account.email === 'string' &&
        'role' in account &&
        isAppRole(account.role)
      );
    },
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function restoreLocalSession() {
      try {
        const [accountsValue, sessionId] = await AsyncStorage.multiGet([
          ACCOUNTS_KEY,
          SESSION_KEY,
        ]);
        const savedAccounts = parseAccounts(accountsValue[1]);
        const savedUser = savedAccounts.find((account) => account.id === sessionId[1]);

        if (active) {
          setAccounts(savedAccounts);
          setUser(savedUser ? { id: savedUser.id, email: savedUser.email } : null);
          setRole(savedUser?.role ?? null);
        }
      } catch (restoreError) {
        console.error('Unable to restore the local KumulCity profile.', restoreError);
        if (active) setError('Could not load local app data. Please restart the app.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void restoreLocalSession();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(
    async (email: string) => {
      const normalizedEmail = normalizeEmail(email);
      const account =
        accounts.find((item) => item.email === normalizedEmail) ??
        parseAccounts(await AsyncStorage.getItem(ACCOUNTS_KEY)).find(
          (item) => item.email === normalizedEmail,
        );

      if (!account) throw new Error('No local profile found for that email. Create an account first.');

      await AsyncStorage.setItem(SESSION_KEY, account.id);
      setUser({ id: account.id, email: account.email });
      setRole(account.role);
      setError(null);
    },
    [accounts],
  );

  const signUp = useCallback(
    async (email: string, selectedRole: AppRole) => {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Enter a valid email address.');
      }

      const savedAccounts = parseAccounts(await AsyncStorage.getItem(ACCOUNTS_KEY));
      if (savedAccounts.some((account) => account.email === normalizedEmail)) {
        throw new Error('A local profile with this email already exists. Sign in instead.');
      }

      const account: LocalAccount = {
        id: normalizedEmail,
        email: normalizedEmail,
        role: selectedRole,
      };
      const nextAccounts = [...savedAccounts, account];
      await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
      await AsyncStorage.setItem(SESSION_KEY, account.id);
      setAccounts(nextAccounts);
      setUser({ id: account.id, email: account.email });
      setRole(account.role);
      setError(null);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
    setRole(null);
  }, []);

  const value = useMemo(
    () => ({ loading, user, role, error, signIn, signUp, signOut }),
    [loading, user, role, error, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}
