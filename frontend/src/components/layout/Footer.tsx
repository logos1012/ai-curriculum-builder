export function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="text-xl">🎓</div>
            <span className="text-lg font-semibold text-gray-900">
              AI 커리큘럼 빌더
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            © 2024 AI 커리큘럼 빌더. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}