from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import io
from datetime import datetime
from typing import List

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/csv")
async def import_csv(
    file: UploadFile = File(...),
    account_id: int = None,
    db: Session = Depends(get_db)
):
    """
    CSVファイルから取引データをインポート

    CSVフォーマット例:
    日付,内容,金額,カテゴリ
    2024-01-15,スーパーマーケット,-3500,食費
    2024-01-16,給料,250000,給料
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="CSVファイルのみ対応しています")

    try:
        # CSVを読み込み
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))

        # 必須カラムチェック
        required_columns = ['日付', '内容', '金額']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"必須カラムが不足しています: {', '.join(missing_columns)}"
            )

        imported_count = 0
        errors = []

        for idx, row in df.iterrows():
            try:
                # 日付の解析
                try:
                    date = pd.to_datetime(row['日付'])
                except:
                    errors.append(f"行{idx + 2}: 日付の形式が不正です")
                    continue

                # 金額の解析
                try:
                    amount = float(row['金額'])
                except:
                    errors.append(f"行{idx + 2}: 金額の形式が不正です")
                    continue

                # 取引タイプの判定
                transaction_type = "income" if amount > 0 else "expense"

                # カテゴリの取得または自動判定
                category_id = None
                if 'カテゴリ' in row and pd.notna(row['カテゴリ']):
                    # カテゴリ名からIDを検索
                    category = db.query(crud.models.Category).filter(
                        crud.models.Category.name == row['カテゴリ']
                    ).first()
                    if category:
                        category_id = category.id

                # 取引を作成
                transaction = schemas.TransactionCreate(
                    date=date,
                    description=str(row['内容']),
                    amount=amount,
                    type=transaction_type,
                    category_id=category_id,
                    account_id=account_id,
                    memo=str(row.get('メモ', '')) if 'メモ' in row else None
                )

                crud.create_transaction(db, transaction)
                imported_count += 1

            except Exception as e:
                errors.append(f"行{idx + 2}: {str(e)}")

        return {
            "success": True,
            "imported_count": imported_count,
            "total_rows": len(df),
            "errors": errors if errors else None
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSVインポートエラー: {str(e)}")


@router.get("/template")
def download_csv_template():
    """CSVテンプレートの例を返す"""
    return {
        "template": {
            "columns": ["日付", "内容", "金額", "カテゴリ", "メモ"],
            "example_rows": [
                {
                    "日付": "2024-01-15",
                    "内容": "スーパーマーケット",
                    "金額": -3500,
                    "カテゴリ": "食費",
                    "メモ": "週末の買い物"
                },
                {
                    "日付": "2024-01-20",
                    "内容": "給料",
                    "金額": 250000,
                    "カテゴリ": "給料",
                    "メモ": ""
                }
            ]
        }
    }
