import React, { Suspense } from 'react';
import MyPage from './MyPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPage />
    </Suspense>
  );
}