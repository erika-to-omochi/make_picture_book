import React, { Suspense } from 'react';
import BookListPage from './BookListPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookListPage />
    </Suspense>
  );
}
