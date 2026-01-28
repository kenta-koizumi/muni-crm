from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Account(Base):
    """口座・カード情報"""
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # 口座名（例: 三菱UFJ銀行、楽天カード）
    type = Column(String, nullable=False)  # bank, credit_card, cash, etc.
    balance = Column(Float, default=0.0)  # 現在残高
    currency = Column(String, default="JPY")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # リレーション
    transactions = relationship("Transaction", back_populates="account")


class Category(Base):
    """取引カテゴリ"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    type = Column(String, nullable=False)  # income, expense
    keywords = Column(Text)  # 自動分類用キーワード（カンマ区切り）
    icon = Column(String, default="📁")  # アイコン
    color = Column(String, default="#6B7280")  # 表示色
    created_at = Column(DateTime, default=datetime.utcnow)

    # リレーション
    transactions = relationship("Transaction", back_populates="category")


class Transaction(Base):
    """取引記録"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)  # 取引日
    description = Column(String, nullable=False)  # 取引内容
    amount = Column(Float, nullable=False)  # 金額（正=収入、負=支出）
    type = Column(String, nullable=False)  # income, expense

    # 外部キー
    category_id = Column(Integer, ForeignKey("categories.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))

    # 追加情報
    memo = Column(Text)  # メモ
    is_recurring = Column(Integer, default=0)  # 定期支出フラグ

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # リレーション
    category = relationship("Category", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
