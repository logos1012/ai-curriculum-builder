import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          AI 강의 커리큘럼 작성 도구
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          프리랜서 강사를 위한 AI 기반 맞춤형 커리큘럼 작성 웹 애플리케이션
        </p>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            대화형 AI와 함께 다양한 대상(주부, 학생, 직장인 등)에게 맞는<br />
            AI 교육 커리큘럼을 쉽고 빠르게 만들어보세요.
          </p>
          
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              시작하기
            </Link>
            <Link
              href="/about"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              자세히 보기
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">대화형 생성</h3>
            <p className="text-gray-600">AI와의 질문-답변을 통해 정교한 커리큘럼을 단계적으로 완성</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">실시간 편집</h3>
            <p className="text-gray-600">작성 과정이 실시간으로 렌더링되는 직관적인 편집 환경</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">맞춤형 특화</h3>
            <p className="text-gray-600">AI 도구 활용법에 특화된 교육 콘텐츠 자동 생성</p>
          </div>
        </div>
      </main>
    </div>
  );
}
