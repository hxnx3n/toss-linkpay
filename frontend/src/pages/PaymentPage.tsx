import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadTossPayments, TossPaymentsPayment } from '@tosspayments/tosspayments-sdk'

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
  createdAt: string
}

export default function PaymentPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tossPayment, setTossPayment] = useState<TossPaymentsPayment | null>(null)
  const [ready, setReady] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT'>('CARD')

  useEffect(() => {
    fetchPayment()
  }, [uuid])

  useEffect(() => {
    if (payment && payment.status === 'PENDING') {
      initTossPayments()
    }
  }, [payment])

  const fetchPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${uuid}`)
      const data = await response.json()

      if (data.success) {
        setPayment(data.data)
        if (data.data.status !== 'PENDING') {
          navigate(`/result/${uuid}`)
        }
      } else {
        setError('결제 정보를 찾을 수 없습니다.')
      }
    } catch {
      setError('결제 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const initTossPayments = async () => {
    try {
      // 클라이언트 키 조회
      const keyResponse = await fetch('/api/payments/client-key')
      const keyData = await keyResponse.json()
      const clientKey = keyData.data.clientKey

      // 토스페이먼츠 SDK 초기화 (API 개별 연동 방식)
      const tossPayments = await loadTossPayments(clientKey)

      // 결제 객체 생성
      const paymentInstance = tossPayments.payment({
        customerKey: `customer_${uuid}`,
      })

      setTossPayment(paymentInstance)
      setReady(true)
    } catch (err) {
      console.error('토스페이먼츠 초기화 실패:', err)
      setError('결제 시스템 초기화에 실패했습니다.')
    }
  }

  const handlePayment = async () => {
    if (!tossPayment || !payment) return

    setProcessing(true)

    try {
      // 결제 요청 옵션 기본 설정
      const requestOptions: any = {
        method: selectedMethod,
        amount: {
          currency: 'KRW',
          value: payment.amount,
        },
        orderId: payment.id,
        orderName: payment.title,
        successUrl: `${window.location.origin}/pay/${uuid}/success`,
        failUrl: `${window.location.origin}/pay/${uuid}/fail`,
      }

      // 결제 수단별 추가 옵션
      if (selectedMethod === 'CARD') {
        requestOptions.card = {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: false,
          useAppCardOnly: false,
        }
      } else if (selectedMethod === 'TRANSFER') {
        requestOptions.transfer = {
          useEscrow: false,
        }
      } else if (selectedMethod === 'VIRTUAL_ACCOUNT') {
        requestOptions.virtualAccount = {
          useEscrow: false,
          validHours: 24,
        }
      }

      await tossPayment.requestPayment(requestOptions)
    } catch (err: any) {
      // 사용자가 결제를 취소한 경우
      if (err.code === 'USER_CANCEL') {
        alert('결제가 취소되었습니다.')
      } else {
        alert(err.message || '결제 요청에 실패했습니다.')
      }
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-toss-blue border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error}</h2>
          <p className="text-gray-500 mb-6">UUID를 다시 확인해주세요.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-toss-blue text-white rounded-xl hover:bg-toss-blueDark transition-colors"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* 결제 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          {/* 결제 제목 및 금액 */}
          <div className="px-5 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{payment?.title}</h2>
            <p className="text-3xl font-black text-toss-blue">
              {payment?.amount.toLocaleString()}
              <span className="text-xl font-bold ml-1">원</span>
            </p>
            {payment?.description && (
              <p className="text-sm text-gray-500 mt-1">{payment.description}</p>
            )}
          </div>

          {/* 품목 목록 */}
          {payment?.items && payment.items.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">주문 내역</p>
              <div className="space-y-3">
                {payment.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.price.toLocaleString()}원 × {item.quantity}개
                      </p>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>

              {/* 합계 */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">합계</span>
                <span className="text-lg font-bold text-toss-blue">
                  {payment?.amount.toLocaleString()}원
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 결제 수단 선택 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="px-5 py-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">결제 수단</p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedMethod === 'CARD'
                  ? 'border-toss-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedMethod === 'CARD' ? 'bg-toss-blue' : 'bg-gray-100'
                  }`}>
                  <span className="text-2xl">{selectedMethod === 'CARD' ? '💳' : '💳'}</span>
                </div>
                <div className="text-left flex-1">
                  <p className={`font-semibold ${selectedMethod === 'CARD' ? 'text-toss-blue' : 'text-gray-900'}`}>
                    카드 결제
                  </p>
                  <p className="text-sm text-gray-500">신용/체크카드</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'CARD' ? 'border-toss-blue bg-toss-blue' : 'border-gray-300'
                  }`}>
                  {selectedMethod === 'CARD' && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('TRANSFER')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedMethod === 'TRANSFER'
                  ? 'border-toss-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedMethod === 'TRANSFER' ? 'bg-toss-blue' : 'bg-gray-100'
                  }`}>
                  <span className="text-2xl">🏦</span>
                </div>
                <div className="text-left flex-1">
                  <p className={`font-semibold ${selectedMethod === 'TRANSFER' ? 'text-toss-blue' : 'text-gray-900'}`}>
                    계좌이체
                  </p>
                  <p className="text-sm text-gray-500">실시간 계좌이체</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'TRANSFER' ? 'border-toss-blue bg-toss-blue' : 'border-gray-300'
                  }`}>
                  {selectedMethod === 'TRANSFER' && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('VIRTUAL_ACCOUNT')}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${selectedMethod === 'VIRTUAL_ACCOUNT'
                  ? 'border-toss-blue bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedMethod === 'VIRTUAL_ACCOUNT' ? 'bg-toss-blue' : 'bg-gray-100'
                  }`}>
                  <span className="text-2xl">📋</span>
                </div>
                <div className="text-left flex-1">
                  <p className={`font-semibold ${selectedMethod === 'VIRTUAL_ACCOUNT' ? 'text-toss-blue' : 'text-gray-900'}`}>
                    가상계좌
                  </p>
                  <p className="text-sm text-gray-500">무통장입금</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'VIRTUAL_ACCOUNT' ? 'border-toss-blue bg-toss-blue' : 'border-gray-300'
                  }`}>
                  {selectedMethod === 'VIRTUAL_ACCOUNT' && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 결제 버튼 */}
        <button
          onClick={handlePayment}
          disabled={!ready || processing}
          className="w-full py-4 bg-toss-blue text-white rounded-2xl hover:bg-toss-blueDark transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200/50"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              결제 처리 중...
            </span>
          ) : !ready ? (
            '준비 중...'
          ) : (
            `${payment?.amount.toLocaleString()}원 결제하기`
          )}
        </button>

        {/* 안내 문구 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            토스페이먼츠를 통해 안전하게 결제됩니다
          </p>
          <p className="text-xs text-gray-400 mt-1">
            결제 번호: {payment?.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </main>
    </div>
  )
}
