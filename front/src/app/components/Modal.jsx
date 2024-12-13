"use client";

import React from 'react';

export default function Modal({ isOpen, onClose, onSave, modalType, title, setTitle, author, setAuthor, tags, setTags, visibility, setVisibility }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-80">
        <h2 className="text-lg font-bold mb-4">{modalType === "draft" ? "下書き保存（空白でもOKです）" : "完成保存"}</h2>
        <label className="block mb-2">タイトル</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mb-4" />
        <label className="block mb-2">作者</label>
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full p-2 border rounded mb-4" />
        <label className="block mb-2">タグ</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full p-2 border rounded mb-4" />
        {modalType === "complete" && (
          <div className="mb-4">
            <label className="block mb-2">公開範囲</label>
            <label className="inline-flex items-center mr-2">
              <input type="radio" value="public" checked={visibility === "public"} onChange={() => setVisibility("public")} />
              <span className="ml-2">全体に公開</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" value="private" checked={visibility === "private"} onChange={() => setVisibility("private")} />
              <span className="ml-2">公開しない</span>
            </label>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="p-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">キャンセル</button>
          <button onClick={onSave} className="p-2 bg-customButton text-white rounded-md hover:bg-opacity-80">保存</button>
        </div>
      </div>
    </div>
  );
}
