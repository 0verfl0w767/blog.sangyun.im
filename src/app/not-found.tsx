import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-500 mb-6">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="text-sm text-gray-900 underline underline-offset-4 hover:text-gray-600 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
