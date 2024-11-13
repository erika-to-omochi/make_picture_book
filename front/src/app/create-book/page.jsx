'use client';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

const Canvas = dynamic(() => import('../components/Canvas.jsx'), { ssr: false });

export default function CreateBookPage() {
  const [texts, setTexts] = useState([]);

  return (
    <div>
    </div>
  );
}
