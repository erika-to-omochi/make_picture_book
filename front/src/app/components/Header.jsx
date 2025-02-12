// Header.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBook, FaEdit, FaInfoCircle, FaFileAlt, FaShieldAlt, FaEnvelope, FaUser, FaUserPlus, FaSignOutAlt, FaGithub } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import useAuthStore from '../../stores/authStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userName, isLoggedIn, logout, loginMessage } = useAuthStore();
  const router = useRouter();
  const [logoutMessage, setLogoutMessage] = useState(null);

  // メニューを開閉する関数
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    setLogoutMessage("【ログアウトしました】");
    router.push("/");
    setTimeout(() => setLogoutMessage(null), 3000);
  };

  // メニューを閉じるクリックイベントリスナー
  useEffect(() => {
    const handleClickOutside = (event) => {
      const headerElement = document.querySelector("header");
      if (headerElement && headerElement.contains(event.target)) {
        return;
      }
      setIsMenuOpen(false);
    };

    // イベントリスナーを追加
    document.addEventListener("click", handleClickOutside);

    // コンポーネントのアンマウント時にクリーンアップ
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full flex items-center justify-between p-4 bg-[#494444] text-white z-50 shadow-md">
        <div className="logo">
          <Link href="/">
            <img src="/home/logo.png" alt="App Logo" className="h-8" />
          </Link>
        </div>

        {logoutMessage && <p className="text-green-500">{logoutMessage}</p>}
        {loginMessage && <p className="text-blue-500">{loginMessage}</p>}

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
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            {isLoggedIn ? (
              <>
                <Link href="/myPage">
                  <p onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 mb-4">
                    <FaUser className="text-icon" /> {userName}のマイページ
                  </p>
                </Link>
                <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="flex items-center gap-2 mb-4 cursor-pointer">
                  <FaSignOutAlt className="text-icon" /> ログアウト
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <p onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 mb-4">
                    <FaUser className="text-icon" /> ログイン
                  </p>
                </Link>
                <Link href="/signup">
                  <p onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 mb-4">
                    <FaUserPlus className="text-icon" /> 新規登録
                  </p>
                </Link>
              </>
            )}
            <hr className="border-gray-300 mb-4" />

            <Link href="/index-books">
              <p onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 mb-4">
                <FaBook className="text-icon" /> 絵本を見る
              </p>
            </Link>
            <Link href="/create-book">
              <p onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 mb-4">
                <FaEdit className="text-icon" /> 絵本を作る
              </p>
            </Link>
            <Link href="/app-guide">
              <p onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 mb-4">
                <FaInfoCircle className="text-icon" /> アプリの使い方
              </p>
            </Link>
            <hr className="border-gray-300 mb-4" />

            <Link href="/terms">
              <p onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 mb-4">
                <FaFileAlt className="text-icon" /> 利用規約
              </p>
            </Link>
            <Link href="/privacy-policy">
              <p onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 mb-4">
                <FaShieldAlt className="text-icon" /> プライバシーポリシー
              </p>
            </Link>
            <Link href="/contact">
              <p onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 mb-4">
                <FaEnvelope className="text-icon" /> お問い合わせ
              </p>
            </Link>
            <hr className="border-gray-300 mb-4" />

            <footer className="text-center text-gray-600 mt-4 text-xs">
              © 2024 - 絵本がぽんっ
            </footer>
            <div className="flex justify-center gap-4 mt-4">
              <Link href="https://github.com/erika-to-omochi/make_picture_book" target="_blank">
                <FaGithub size={24} className="text-icon" />
              </Link>
              <Link href="https://x.com/erikaRUNTEQ" target="_blank">
                <FaXTwitter size={24} className="text-icon" />
              </Link>
            </div>
          </nav>
        )}
      </header>

      <div className="pt-20">
      </div>
    </>
  );
};

export default Header;
