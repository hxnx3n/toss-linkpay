import { useParams, useSearchParams } from 'react-router-dom'

export default function PaymentFailPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const [searchParams] = useSearchParams()

  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-xl font-semibold text-red-600 mb-2">결제 실패</h2>
        <p className="text-gray-500 mb-2">{errorMessage || '결제 처리 중 오류가 발생했습니다.'}</p>
        {errorCode && (
          <p className="text-xs text-gray-400 mb-6">오류 코드: {errorCode}</p>
        )}
        <div className="flex gap-3 justify-center">
          <a
            href={`/pay/${uuid}`}
            className="px-6 py-3 bg-toss-blue text-white rounded-xl hover:bg-toss-blueDark transition-colors"
          >
            다시 시도하기
          </a>
          <a
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  )
}
