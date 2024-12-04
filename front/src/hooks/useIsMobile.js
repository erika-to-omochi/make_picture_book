import { useState, useEffect } from 'react';

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 関数を定義してウィンドウ幅に基づいて状態を更新
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // ブレークポイントを必要に応じて調整
    };

    // イベントリスナーを追加
    window.addEventListener('resize', updateIsMobile);

    // 初期チェック
    updateIsMobile();

    // クリーンアップ
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  return isMobile;
}
