from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# データベースファイルのディレクトリを確保
db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
os.makedirs(db_dir, exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_dir}/database.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """データベースセッションを取得"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """データベースを初期化"""
    from app.models import Transaction, Category, Account
    Base.metadata.create_all(bind=engine)

    # デフォルトカテゴリを作成
    db = SessionLocal()
    try:
        # カテゴリが存在しない場合のみ作成
        if db.query(Category).count() == 0:
            default_categories = [
                # 支出カテゴリ
                Category(name="食費", type="expense", keywords="スーパー,コンビニ,レストラン,カフェ,飲食"),
                Category(name="交通費", type="expense", keywords="電車,バス,タクシー,ガソリン,駐車場"),
                Category(name="住居費", type="expense", keywords="家賃,管理費,水道,電気,ガス"),
                Category(name="通信費", type="expense", keywords="携帯,スマホ,インターネット,Wi-Fi"),
                Category(name="日用品", type="expense", keywords="ドラッグストア,薬局,クリーニング,雑貨"),
                Category(name="娯楽費", type="expense", keywords="映画,書籍,ゲーム,趣味"),
                Category(name="医療費", type="expense", keywords="病院,クリニック,薬局,歯科"),
                Category(name="衣服費", type="expense", keywords="衣類,服,靴,ファッション"),
                Category(name="教育費", type="expense", keywords="学校,授業料,教材,セミナー"),
                Category(name="その他支出", type="expense", keywords=""),

                # 収入カテゴリ
                Category(name="給料", type="income", keywords="給与,給料,賞与,ボーナス"),
                Category(name="副業", type="income", keywords="副業,フリーランス"),
                Category(name="その他収入", type="income", keywords=""),
            ]
            db.add_all(default_categories)
            db.commit()
            print("✓ デフォルトカテゴリを作成しました")
    finally:
        db.close()


if __name__ == "__main__":
    print("データベースを初期化しています...")
    init_db()
    print("✓ データベースの初期化が完了しました")
