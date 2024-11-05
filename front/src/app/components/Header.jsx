"use client";

import { useState } from "react";
import Link from "next/link";
import { FaHome, FaBook, FaEdit, FaInfoCircle, FaFileAlt, FaShieldAlt, FaEnvelope, FaUser, FaUserPlus, FaSignOutAlt, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

const Header = ({ userName }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLoggedIn = Boolean(userName);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Header 固定 */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between p-4 bg-[#494444] text-white z-50 shadow-md">
        <div className="logo">
          <Link href="/">
            <img src="/path-to-logo.png" alt="App Logo" className="h-8" />
          </Link>
        </div>

        {/* ハンバーガーアイコン */}
        <button className="btn btn-circle swap swap-rotate" onClick={toggleMenu}>
          {!isMenuOpen ? (
            <svg
              className="fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 512 512"
            >
              <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
            </svg>
          ) : (
            <svg
              className="fill-current"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 512 512"
            >
              <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
            </svg>
          )}
        </button>

        {/* ハンバーガーメニューの内容 */}
        {isMenuOpen && (
          <nav
            className="absolute top-20 right-0 text-black rounded shadow-lg p-4 z-10"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.5)" }}
          >
            {isLoggedIn ? (
              <>
                <Link href="/mypage">
                  <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                    <FaUser className="text-icon" /> {userName}のマイページ
                  </p>
                </Link>
                <Link href="/logout">
                  <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                    <FaSignOutAlt className="text-icon" /> ログアウト
                  </p>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                    <FaUser className="text-icon" /> ログイン
                  </p>
                </Link>
                <Link href="/signup">
                  <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                    <FaUserPlus className="text-icon" /> 新規登録
                  </p>
                </Link>
              </>
            )}
            <hr className="border-gray-300 mb-4" />

            <Link href="/index-books">
              <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                <FaBook className="text-icon" /> 絵本を見る
              </p>
            </Link>
            <Link href="/create-book">
              <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                <FaEdit className="text-icon" /> 絵本を作る
              </p>
            </Link>
            <Link href="/app-guide">
              <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                <FaInfoCircle className="text-icon" /> アプリの使い方
              </p>
            </Link>
            <hr className="border-gray-300 mb-4" />

            <Link href="/terms">
              <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                <FaFileAlt className="text-icon" /> 利用規約
              </p>
            </Link>
            <Link href="/privacy-policy">
              <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                <FaShieldAlt className="text-icon" /> プライバシーポリシー
              </p>
            </Link>
            <Link href="/contact">
              <p onClick={toggleMenu} className="flex items-center gap-2 mb-4">
                <FaEnvelope className="text-icon" /> お問い合わせ
              </p>
            </Link>
            <hr className="border-gray-300 mb-4" />
            <footer className="text-center text-gray-600 mt-4 text-xs">
              © 2024 - 絵本がぽんっ
            </footer>
            <div className="flex justify-center gap-4 mt-4">
              <Link href="https://github.com" target="_blank">
                <FaGithub size={24} className="text-icon" />
              </Link>
              <Link href="https://twitter.com" target="_blank">
                <FaXTwitter size={24} className="text-icon" />
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* ヘッダーの高さ分の余白を追加 */}
      <div className="pt-20">
        {/* メインコンテンツ */}
      </div>
    </>
  );
};

export default Header;
