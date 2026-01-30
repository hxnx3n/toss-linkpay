import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface AlertModalProps {
  isOpen: boolean
  title?: string
  message: string
  onClose: () => void
}

function AlertModal({ isOpen, title, message, onClose }: AlertModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="p-6 text-center">
          {title && <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>}
          <p className="text-sm text-gray-600 whitespace-pre-line">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-4 text-sm font-medium text-toss-blue hover:bg-blue-50 transition-colors border-t border-gray-100"
        >
          확인
        </button>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmStyle?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmStyle = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{message}</p>
        </div>
        <div className="flex border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 py-4 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-l border-gray-100 ${confirmStyle === 'danger'
              ? 'text-red-600 hover:bg-red-50'
              : 'text-toss-blue hover:bg-blue-50'
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

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

export default function AdminPage() {
  const navigate = useNavigate()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [items, setItems] = useState<PaymentItem[]>([{ name: '', price: 0, quantity: 1 }])
  const [creating, setCreating] = useState(false)
  const [createdLink, setCreatedLink] = useState<{ paymentId: string; paymentUrl: string } | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'amount' | 'title'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    confirmStyle?: 'danger' | 'primary'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  })

  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title?: string
    message: string
  }>({
    isOpen: false,
    message: '',
  })

  const closeConfirmModal = useCallback(() => setConfirmModal(prev => ({ ...prev, isOpen: false })), [])
  const closeAlertModal = useCallback(() => setAlertModal(prev => ({ ...prev, isOpen: false })), [])

  const showAlert = useCallback((message: string, title?: string) => {
    setAlertModal({ isOpen: true, message, title })
  }, [])

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; confirmStyle?: 'danger' | 'primary' }
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText: options?.confirmText,
      confirmStyle: options?.confirmStyle,
      onConfirm: () => {
        onConfirm()
        closeConfirmModal()
      },
    })
  }

  useEffect(() => {
    verifyAndFetch()
  }, [])

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  })

  const verifyAndFetch = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        localStorage.removeItem('admin_token')
        navigate('/admin/login')
        return
      }

      fetchPayments()
    } catch {
      navigate('/admin/login')
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments', {
        headers: getAuthHeaders(),
      })
      const data = await response.json()
      if (data.success) {
        setPayments(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    const validItems = items.filter(item => item.name && item.price > 0)
    if (validItems.length === 0) {
      showAlert('최소 1개의 품목을 입력해주세요.')
      return
    }

    const totalAmount = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    if (totalAmount < 100) {
      showAlert('총 금액은 최소 100원 이상이어야 합니다.')
      return
    }

    setCreating(true)

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          amount: totalAmount,
          description,
          items: validItems,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setCreatedLink(data.data)
        setTitle('')
        setDescription('')
        setItems([{ name: '', price: 0, quantity: 1 }])
        fetchPayments()
      }
    } catch (error) {
      showAlert('결제 링크 생성에 실패했습니다.')
    } finally {
      setCreating(false)
    }
  }

  const addItem = () => {
    setItems([...items, { name: '', price: 0, quantity: 1 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof PaymentItem, value: string | number) => {
    const newItems = [...items]
    if (field === 'name') {
      newItems[index].name = value as string
    } else if (field === 'price') {
      newItems[index].price = parseInt(value as string) || 0
    } else if (field === 'quantity') {
      newItems[index].quantity = parseInt(value as string) || 1
    }
    setItems(newItems)
  }

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleCancelPayment = (uuid: string) => {
    showConfirm(
      '결제 취소',
      '정말 이 결제를 취소하시겠습니까?',
      async () => {
        try {
          const response = await fetch(`/api/payments/${uuid}/cancel`, {
            method: 'POST',
            headers: getAuthHeaders(),
          })

          const data = await response.json()
          if (data.success) {
            fetchPayments()
          } else {
            showAlert(data.message || '결제 취소에 실패했습니다.')
          }
        } catch (error) {
          showAlert('결제 취소에 실패했습니다.')
        }
      },
      { confirmText: '취소하기', confirmStyle: 'danger' }
    )
  }

  const handleRefundPayment = (uuid: string) => {
    showConfirm(
      '결제 환불',
      '정말 이 결제를 환불하시겠습니까?\n토스페이먼츠로 환불 요청이 전송됩니다.',
      async () => {
        try {
          const response = await fetch(`/api/payments/${uuid}/refund`, {
            method: 'POST',
            headers: getAuthHeaders(),
          })

          const data = await response.json()
          if (data.success) {
            showAlert('환불이 완료되었습니다.', '환불 완료')
            fetchPayments()
          } else {
            showAlert(data.message || '환불에 실패했습니다.')
          }
        } catch (error) {
          showAlert('환불에 실패했습니다.')
        }
      },
      { confirmText: '환불하기', confirmStyle: 'danger' }
    )
  }

  const handleDeletePayment = (uuid: string) => {
    showConfirm(
      '결제 내역 삭제',
      '정말 이 결제 내역을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      async () => {
        try {
          const response = await fetch(`/api/payments/${uuid}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          })

          const data = await response.json()
          if (data.success) {
            fetchPayments()
          } else {
            showAlert(data.message || '삭제에 실패했습니다.')
          }
        } catch (error) {
          showAlert('삭제에 실패했습니다.')
        }
      },
      { confirmText: '삭제하기', confirmStyle: 'danger' }
    )
  }

  const handleDeleteAllPayments = () => {
    showConfirm(
      '⚠️ 전체 결제 내역 삭제',
      '정말 모든 결제 내역을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 결제 기록이 영구적으로 삭제됩니다.',
      async () => {
        try {
          const response = await fetch('/api/payments/delete-all', {
            method: 'POST',
            headers: getAuthHeaders(),
          })

          const data = await response.json()
          if (data.success) {
            showAlert(data.message, '삭제 완료')
            fetchPayments()
          } else {
            showAlert(data.message || '초기화에 실패했습니다.')
          }
        } catch (error) {
          showAlert('초기화에 실패했습니다.')
        }
      },
      { confirmText: '전체 삭제', confirmStyle: 'danger' }
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showAlert('클립보드에 복사되었습니다!', '복사 완료')
  }

  // 필터링 및 정렬된 결제 목록
  const filteredAndSortedPayments = payments
    .filter(payment => {
      // 상태 필터
      if (statusFilter !== 'all' && payment.status !== statusFilter) return false
      // 검색 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          payment.title.toLowerCase().includes(query) ||
          payment.id.toLowerCase().includes(query) ||
          payment.amount.toString().includes(query)
        )
      }
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      PENDING: '대기',
      COMPLETED: '완료',
      FAILED: '실패',
      CANCELLED: '취소',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-800 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">LinkPay Admin</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
              <p className="text-xs text-gray-500">전체</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'COMPLETED').length}
              </p>
              <p className="text-xs text-gray-500">완료</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {payments.filter(p => p.status === 'PENDING').length}
              </p>
              <p className="text-xs text-gray-500">대기</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-toss-blue">
                {payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">총 매출(원)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">새 결제 링크 생성</h2>
              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    결제 제목 *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 상품 구매 대금"
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-600">
                      품목 *
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-xs text-toss-blue hover:text-toss-blueDark font-medium"
                    >
                      + 품목 추가
                    </button>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="품목명"
                          className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent text-sm"
                        />
                        <input
                          type="number"
                          value={item.price || ''}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          placeholder="가격"
                          min="1"
                          className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent text-sm"
                        />
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          min="1"
                          className="w-14 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent text-sm"
                        />
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-full text-sm font-bold transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">품목명 / 가격 / 수량</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">총 결제금액</span>
                    <span className="text-lg font-bold text-toss-blue">₩{getTotalAmount().toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    설명 (선택)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="결제에 대한 추가 설명"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 bg-toss-blue text-white rounded-lg hover:bg-toss-blueDark transition-colors font-medium disabled:opacity-50"
                >
                  {creating ? '생성 중...' : '결제 링크 생성'}
                </button>
              </form>

              {createdLink && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">✅ 생성 완료!</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(`${window.location.origin}${createdLink.paymentUrl}`)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                    >
                      링크 복사
                    </button>
                    <button
                      onClick={() => copyToClipboard(createdLink.paymentId)}
                      className="flex-1 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                    >
                      UUID 복사
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">결제 목록</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {filteredAndSortedPayments.length}건
                      </span>
                      {payments.length > 0 && (
                        <button
                          onClick={handleDeleteAllPayments}
                          className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          전체 삭제
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="제목, UUID, 금액으로 검색..."
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent text-sm"
                      />
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent text-sm bg-white"
                    >
                      <option value="all">전체 상태</option>
                      <option value="PENDING">대기</option>
                      <option value="COMPLETED">완료</option>
                      <option value="FAILED">실패</option>
                      <option value="CANCELLED">취소</option>
                    </select>

                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-')
                        setSortBy(field as 'createdAt' | 'amount' | 'title')
                        setSortOrder(order as 'asc' | 'desc')
                      }}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-toss-blue focus:border-transparent text-sm bg-white"
                    >
                      <option value="createdAt-desc">최신순</option>
                      <option value="createdAt-asc">오래된순</option>
                      <option value="amount-desc">금액 높은순</option>
                      <option value="amount-asc">금액 낮은순</option>
                      <option value="title-asc">제목 오름차순</option>
                      <option value="title-desc">제목 내림차순</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredAndSortedPayments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {payments.length === 0 ? '결제 내역이 없습니다.' : '검색 결과가 없습니다.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제 수단</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">생성일</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAndSortedPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-800">{payment.title}</div>
                            <div className="text-xs text-gray-400 font-mono break-all">
                              {payment.id}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">
                            {payment.amount.toLocaleString()}원
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {payment.paymentMethod || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button
                                onClick={() => copyToClipboard(`${window.location.origin}/pay/${payment.id}`)}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                              >
                                복사
                              </button>
                              {payment.status === 'PENDING' && (
                                <button
                                  onClick={() => handleCancelPayment(payment.id)}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  취소
                                </button>
                              )}
                              {payment.status === 'COMPLETED' && (
                                <button
                                  onClick={() => handleRefundPayment(payment.id)}
                                  className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                                >
                                  환불
                                </button>
                              )}
                              <button
                                onClick={() => handleDeletePayment(payment.id)}
                                className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmStyle={confirmModal.confirmStyle}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        onClose={closeAlertModal}
      />
    </div>
  )
}
