import { useState, useEffect } from 'react'
import { getAccounts, createAccount, deleteAccount } from '../services/api'

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    balance: 0,
    currency: 'JPY'
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const response = await getAccounts()
      setAccounts(response.data)
    } catch (error) {
      console.error('口座の読み込みエラー:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createAccount({
        ...formData,
        balance: parseFloat(formData.balance)
      })
      setShowForm(false)
      setFormData({
        name: '',
        type: 'bank',
        balance: 0,
        currency: 'JPY'
      })
      loadAccounts()
    } catch (error) {
      console.error('口座の作成エラー:', error)
      alert('口座の作成に失敗しました')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('この口座を削除しますか?')) {
      try {
        await deleteAccount(id)
        loadAccounts()
      } catch (error) {
        console.error('削除エラー:', error)
        alert('削除に失敗しました')
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  const getAccountTypeLabel = (type) => {
    const types = {
      'bank': '銀行',
      'credit_card': 'クレジットカード',
      'cash': '現金',
      'other': 'その他'
    }
    return types[type] || type
  }

  const getAccountIcon = (type) => {
    const icons = {
      'bank': '🏦',
      'credit_card': '💳',
      'cash': '💵',
      'other': '💼'
    }
    return icons[type] || '💼'
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">口座管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'キャンセル' : '+ 新規口座'}
        </button>
      </div>

      {/* 総残高カード */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="text-white">
          <p className="text-sm opacity-90">総残高</p>
          <p className="text-4xl font-bold mt-2">{formatCurrency(totalBalance)}</p>
          <p className="text-sm opacity-75 mt-2">{accounts.length} 件の口座</p>
        </div>
      </div>

      {/* 新規口座フォーム */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">新規口座を追加</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">口座名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例: 三菱UFJ銀行、楽天カード"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">種類</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="bank">銀行</option>
                  <option value="credit_card">クレジットカード</option>
                  <option value="cash">現金</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">初期残高</label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  step="1"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                追加
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 口座一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getAccountIcon(account.type)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500">{getAccountTypeLabel(account.type)}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(account.id)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                削除
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">残高</p>
              <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(account.balance)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">口座がありません</p>
          <p className="text-sm text-gray-400 mt-2">「+ 新規口座」ボタンから追加してください</p>
        </div>
      )}
    </div>
  )
}
