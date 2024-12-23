'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';

export default function AuthCallback() {
  const router = useRouter();
  const setUserName = useAuthStore((state) => state.setUserName);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const handleAuth = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userName = params.get('user_name');
      if (token) {
        // ユーザー名がわからないなら、仮の名前 or null でセット
        setUserName(userName ?? 'GoogleUser');
        setAccessToken(token);
        // isLoggedIn => true になる （userName が truthy なら）
        router.push('/');
      } else {
        router.push('/login?error=missing_token');
      }
    };
    handleAuth();
  }, [router, setUserName, setAccessToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>認証中...</p>
    </div>
  );
}
