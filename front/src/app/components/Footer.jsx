import Link from "next/link";
import { FaBook, FaEdit, FaInfoCircle } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      className="flex justify-center gap-8 p-4 text-bodyText text-sm"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        position: "fixed",
        bottom: 0,
        width: "100%",
      }}
    >
      <Link href="/index-books" className="flex flex-col items-center mx-2">
        <FaBook size={32} className="text-icon"/>
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
    </footer>
  );
}
