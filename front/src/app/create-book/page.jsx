'use client';
import dynamic from 'next/dynamic';

const Canvas = dynamic(() => import('../components/canvas'), {
  ssr: false, // サーバーサイドレンダリングを無効化
});

export default function Page(props) {
  return <Canvas />;
}
