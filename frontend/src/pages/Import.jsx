import { useState, useEffect } from 'react'
import { importCSV, getAccounts, getCSVTemplate } from '../services/api'

export default function Import() {
  const [accounts, setAccounts] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

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

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      alert('CSVファイルを選択してください')
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const accountId = selectedAccount ? parseInt(selectedAccount) : null
      const response = await importCSV(selectedFile, accountId)
      setResult(response.data)
      setSelectedFile(null)

      // ファイル入力をリセット
      const fileInput = document.getElementById('file-input')
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('インポートエラー:', error)
      setResult({
        success: false,
        error: error.response?.data?.detail || 'インポートに失敗しました'
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="px-4 sm:px-0">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">CSVインポート</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* インポートフォーム */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CSVファイルをアップロード</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSVファイルを選択
              </label>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-500">
                  選択ファイル: {selectedFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                口座（オプション）
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">選択なし</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleImport}
              disabled={!selectedFile || importing}
              className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                !selectedFile || importing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {importing ? 'インポート中...' : 'インポート'}
            </button>
          </div>

          {/* インポート結果 */}
          {result && (
            <div className={`mt-6 p-4 rounded-md ${
              result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h4 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                {result.success ? 'インポート完了' : 'インポート失敗'}
              </h4>
              {result.success && (
                <div className="mt-2 text-sm text-green-700">
                  <p>インポート件数: {result.imported_count} / {result.total_rows} 件</p>
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">エラー:</p>
                      <ul className="list-disc list-inside">
                        {result.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {result.error && (
                <p className="mt-2 text-sm text-red-700">{result.error}</p>
              )}
            </div>
          )}
        </div>

        {/* CSVフォーマット説明 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">CSVフォーマット</h3>

          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-600 mb-4">
              以下の形式のCSVファイルをインポートできます。
            </p>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">必須カラム:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>日付</strong>: YYYY-MM-DD形式（例: 2024-01-15）</li>
                <li>• <strong>内容</strong>: 取引の説明</li>
                <li>• <strong>金額</strong>: 正の数=収入、負の数=支出</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">オプションカラム:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>カテゴリ</strong>: カテゴリ名（未指定の場合は自動判定）</li>
                <li>• <strong>メモ</strong>: 追加のメモ</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-2">CSVの例:</h4>
              <pre className="text-xs text-gray-800 overflow-x-auto">
{`日付,内容,金額,カテゴリ,メモ
2024-01-15,スーパーマーケット,-3500,食費,週末の買い物
2024-01-16,コンビニ,-850,食費,
2024-01-20,給料,250000,給料,
2024-01-22,電車代,-1200,交通費,通勤定期`}
              </pre>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>ヒント:</strong> 銀行やクレジットカードのオンラインバンキングから
                ダウンロードしたCSVファイルを、上記の形式に加工してインポートしてください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
