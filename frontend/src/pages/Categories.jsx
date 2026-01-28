import { useState, useEffect } from 'react'
import { getCategories, createCategory, deleteCategory } from '../services/api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    keywords: '',
    icon: '📁',
    color: '#6B7280'
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('カテゴリの読み込みエラー:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createCategory(formData)
      setShowForm(false)
      setFormData({
        name: '',
        type: 'expense',
        keywords: '',
        icon: '📁',
        color: '#6B7280'
      })
      loadCategories()
    } catch (error) {
      console.error('カテゴリの作成エラー:', error)
      alert('カテゴリの作成に失敗しました')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('このカテゴリを削除しますか?')) {
      try {
        await deleteCategory(id)
        loadCategories()
      } catch (error) {
        console.error('削除エラー:', error)
        alert('削除に失敗しました')
      }
    }
  }

  const expenseCategories = categories.filter(cat => cat.type === 'expense')
  const incomeCategories = categories.filter(cat => cat.type === 'income')

  return (
    <div className="px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">カテゴリ管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'キャンセル' : '+ 新規カテゴリ'}
        </button>
      </div>

      {/* 新規カテゴリフォーム */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">新規カテゴリを追加</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">カテゴリ名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">種類</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="expense">支出</option>
                  <option value="income">収入</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                キーワード（カンマ区切り、自動分類に使用）
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="例: スーパー,コンビニ,レストラン"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">アイコン</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">色</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

      {/* カテゴリ一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 支出カテゴリ */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <h3 className="text-lg font-medium text-red-900">支出カテゴリ</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {expenseCategories.map((category) => (
              <div key={category.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    {category.keywords && (
                      <div className="text-xs text-gray-500">
                        キーワード: {category.keywords}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  削除
                </button>
              </div>
            ))}
            {expenseCategories.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500">カテゴリがありません</div>
            )}
          </div>
        </div>

        {/* 収入カテゴリ */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-green-50 border-b border-green-200">
            <h3 className="text-lg font-medium text-green-900">収入カテゴリ</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {incomeCategories.map((category) => (
              <div key={category.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    {category.keywords && (
                      <div className="text-xs text-gray-500">
                        キーワード: {category.keywords}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  削除
                </button>
              </div>
            ))}
            {incomeCategories.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500">カテゴリがありません</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
