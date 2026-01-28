# 個人用家計簿自動化システム (Personal Money Tracker)

マネーフォワード的な個人用家計簿管理システムです。銀行口座やクレジットカードのデータを自動で取り込み、支出を可視化・分析します。

## 主な機能

- 📊 **取引管理**: 収入・支出の記録と管理
- 🏷️ **自動分類**: 取引内容から自動的にカテゴリを判定
- 📈 **レポート**: 月次・年次レポート、カテゴリ別集計
- 💳 **データインポート**: CSV/Excel形式での銀行・カードデータの取り込み
- 🎯 **予算管理**: カテゴリ別の予算設定と進捗追跡
- 📱 **レスポンシブデザイン**: PC・スマホ対応

## 技術スタック

### バックエンド
- **Python 3.11+**
- **FastAPI**: 高速なWeb APIフレームワーク
- **SQLAlchemy**: ORM
- **SQLite**: データベース (個人用として軽量)
- **Pydantic**: データバリデーション

### フロントエンド
- **React 18**
- **Vite**: 高速なビルドツール
- **Tailwind CSS**: スタイリング
- **Recharts**: グラフ・チャート表示
- **React Query**: データフェッチング

## プロジェクト構造

```
muni-crm/
├── backend/              # FastAPI バックエンド
│   ├── app/
│   │   ├── main.py      # アプリケーションエントリポイント
│   │   ├── models.py    # データベースモデル
│   │   ├── schemas.py   # Pydantic スキーマ
│   │   ├── database.py  # DB接続設定
│   │   ├── crud.py      # CRUD操作
│   │   └── api/
│   │       ├── transactions.py  # 取引API
│   │       ├── categories.py    # カテゴリAPI
│   │       └── reports.py       # レポートAPI
│   ├── requirements.txt
│   └── .env.example
├── frontend/             # React フロントエンド
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/  # 共通コンポーネント
│   │   ├── pages/       # ページコンポーネント
│   │   └── services/    # API通信
│   └── index.html
├── data/                # データファイル（.gitignore）
│   └── database.db
└── docs/                # ドキュメント
```

## セットアップ

### バックエンド

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

バックエンドは http://localhost:8000 で起動します。
API ドキュメント: http://localhost:8000/docs

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

フロントエンドは http://localhost:5173 で起動します。

## 使い方

1. **取引の登録**: 手動で収入・支出を登録
2. **CSVインポート**: 銀行やクレジットカードのCSVファイルをアップロード
3. **自動分類**: 取引内容から自動的にカテゴリを判定
4. **レポート確認**: ダッシュボードで支出を可視化

## データインポート形式

銀行やクレジットカードのCSVファイルは以下の形式に対応：

```csv
日付,内容,金額,残高
2024-01-15,スーパーマーケット,-3500,
2024-01-16,給料,250000,
```

## 開発

### データベース初期化

```bash
cd backend
python -m app.database
```

### テスト実行

```bash
# バックエンド
cd backend
pytest

# フロントエンド
cd frontend
npm test
```

## ライセンス

MIT

## 今後の追加予定機能

- [ ] 口座・カード情報の管理
- [ ] 定期支出の自動検出
- [ ] 予算アラート機能
- [ ] データのエクスポート
- [ ] 複数通貨対応
- [ ] スクレイピングによる自動取得（技術的制約あり）
