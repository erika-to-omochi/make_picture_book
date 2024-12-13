"use client";

import Link from "next/link";
import { FaBook, FaEdit, FaInfoCircle, FaUser } from "react-icons/fa";
import { usePathname } from "next/navigation";
import useAuthStore from "../../stores/authStore";

export default function DefaultFooter() {
  const pathname = usePathname();
  const { userName, isLoggedIn } = useAuthStore();

  const isEditOrCreatePage =
    pathname === "/create-book" ||
    (pathname.startsWith("/books/") && pathname.endsWith("/edit"));

  return (
    <footer
      className={`flex ${
        isEditOrCreatePage ? "justify-end pr-8 gap-4" : "justify-center gap-12"
      } p-2 text-bodyText text-sm`}
      style={{
        backgroundColor: isEditOrCreatePage ? "transparent" : "rgba(255, 255, 255, 0.8)",
        position: "fixed",
        bottom: 0,
        width: "100%",
      }}
    >
      <Link href="/index-books" className="flex flex-col items-center mx-2">
        <FaBook size={32} className="text-icon" />
        <span>見る</span>
      </Link>
      <Link href="/create-book" className="flex flex-col items-center mx-2">
        <FaEdit size={32} className="text-icon" />
        <span>作る</span>
      </Link>
      <Link href="/app-guide" className="flex flex-col items-center mx-2">
        <FaInfoCircle size={32} className="text-icon" />
        <span>使い方</span>
      </Link>
      {/* ログインしている場合のみ表示 */}
      {isLoggedIn && (
        <Link href="/myPage" className="flex flex-col items-center mx-2">
          <FaUser size={32} className="text-icon" />
          <span>{userName}</span>
        </Link>
      )}
    </footer>
  );
}
