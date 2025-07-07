export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">커리큘럼 대시보드</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          새 커리큘럼 만들기
        </button>
      </div>
      
      {/* 필터 및 검색 */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="커리큘럼 검색..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option value="">모든 유형</option>
          <option value="online">온라인</option>
          <option value="offline">오프라인</option>
          <option value="hybrid">혼합형</option>
        </select>
      </div>

      {/* 커리큘럼 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 예시 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">주부를 위한 AI 활용법</h3>
            <span className="text-sm text-gray-500">2024.07.07</span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p><strong>대상:</strong> 주부</p>
            <p><strong>기간:</strong> 4주</p>
            <p><strong>형식:</strong> 온라인</p>
          </div>
          
          <div className="mb-4 pt-4 border-t">
            <p className="text-sm line-clamp-3">
              일상생활에서 활용할 수 있는 AI 도구들을 소개하고, 
              실습을 통해 직접 사용해보는 실용적인 강의입니다.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              편집
            </button>
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              복제
            </button>
            <button className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
              삭제
            </button>
          </div>
        </div>

        {/* 빈 상태 */}
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-xl">+</span>
          </div>
          <p className="text-gray-500 mb-2">새로운 커리큘럼을 만들어보세요</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}