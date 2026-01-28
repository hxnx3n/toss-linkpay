import { useState } from 'react'

export default function HomePage() {
  const [searchUuid, setSearchUuid] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchUuid.trim()) {
      window.location.href = `/pay/${searchUuid.trim()}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-toss-blue mb-3">LinkPay</h1>
          <p className="text-toss-gray text-lg">간편 결제 링크 서비스</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">결제하기</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                결제 코드 (UUID)
              </label>
              <input
                type="text"
                value={searchUuid}
                onChange={(e) => setSearchUuid(e.target.value)}
                placeholder="결제 코드를 입력하세요"
                required
                className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent text-center font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-toss-blue text-white rounded-xl hover:bg-toss-blueDark transition-colors font-semibold text-lg"
            >
              결제 페이지로 이동
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/admin/login"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            관리자 로그인 →
          </a>
        </div>
      </div>
    </div>
  )
}
