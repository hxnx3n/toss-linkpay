import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

interface PaymentItem {
  name: string
  price: number
  quantity: number
}

interface Payment {
  id: string
  title: string
  amount: number
  description: string
  items: PaymentItem[]
  status: string
  payerName: string
  payerEmail: string
  paymentMethod: string
  createdAt: string
  paidAt: string
}

export default function PaymentResultPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayment()
  }, [uuid])

  const fetchPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${uuid}`)
      const data = await response.json()
      if (data.success) {
        setPayment(data.data)
      }
    } catch {
      console.error('Failed to fetch payment')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-toss-blue border-t-transparent"></div>
      </div>
    )
  }

  const isSuccess = payment?.status === 'COMPLETED'
  const isCancelled = payment?.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className={`px-6 py-8 text-center ${isSuccess ? 'bg-gradient-to-b from-green-50 to-white' : isCancelled ? 'bg-gradient-to-b from-gray-100 to-white' : 'bg-gradient-to-b from-red-50 to-white'}`}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-500' : isCancelled ? 'bg-gray-400' : 'bg-red-500'}`}>
              {isSuccess ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : isCancelled ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            
            <h1 className={`text-xl font-bold mb-1 ${isSuccess ? 'text-green-600' : isCancelled ? 'text-gray-600' : 'text-red-600'}`}>
              {isSuccess ? '결제 완료' : isCancelled ? '결제 취소됨' : '결제 실패'}
            </h1>
            <p className="text-gray-500 text-sm">{payment?.title}</p>
          </div>

          <div className="px-6 py-6 border-b border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">결제 금액</p>
              <p className="text-3xl font-black text-gray-900">
                {payment?.amount.toLocaleString()}
                <span className="text-xl font-bold text-gray-600 ml-1">원</span>
              </p>
            </div>
          </div>

          {payment?.items && payment.items.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">주문 내역</p>
              <div className="space-y-2">
                {payment.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{item.name} × {item.quantity}</span>
                    <span className="text-gray-900 font-medium">{(item.price * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">결제 정보</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">결제 번호</span>
                <span className="font-mono text-xs text-gray-700">{payment?.id.slice(0, 18)}...</span>
              </div>
              {payment?.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-500">결제 수단</span>
                  <span className="text-gray-700">{payment.paymentMethod}</span>
                </div>
              )}
              {payment?.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">결제 일시</span>
                  <span className="text-gray-700">
                    {new Date(payment.paidAt).toLocaleString('ko-KR')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">상태</span>
                <span className={`font-medium ${isSuccess ? 'text-green-600' : isCancelled ? 'text-gray-600' : 'text-red-600'}`}>
                  {isSuccess ? '결제 완료' : isCancelled ? '취소됨' : '실패'}
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 bg-gray-50" style={{
            backgroundImage: 'radial-gradient(circle at 8px 0, transparent 8px, white 8px)',
            backgroundSize: '16px 100%',
            backgroundPosition: '0 -8px',
          }}></div>
        </div>

        <div className="mt-6 space-y-3">
          <a
            href="/"
            className="block w-full py-4 bg-toss-blue text-white rounded-xl hover:bg-toss-blueDark transition-colors font-bold text-center"
          >
            홈으로 돌아가기
          </a>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          토스페이먼츠를 통해 안전하게 결제되었습니다
        </p>
      </div>
    </div>
  )
}
