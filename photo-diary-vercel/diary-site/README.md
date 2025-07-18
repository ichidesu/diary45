# 写真日記サイト

リアルタイム形式の写真付き日記サイトです。誰でも自由に日記を投稿・閲覧できます。

## 機能

- 📝 日記投稿（タイトル、内容、写真）
- 📷 写真アップロード機能
- ⏱️ リアルタイム更新（30秒ごと）
- 📱 レスポンシブデザイン
- 🎨 モダンなUI/UX

## 技術スタック

- **バックエンド**: Flask, SQLAlchemy
- **フロントエンド**: HTML, CSS, JavaScript
- **データベース**: SQLite
- **デプロイ**: Vercel

## Vercelでのデプロイ手順

### 1. GitHubリポジトリ作成

1. [GitHub](https://github.com)にログイン
2. 新しいリポジトリを作成
3. このプロジェクトをアップロード

```bash
git remote add origin https://github.com/yourusername/photo-diary.git
git branch -M main
git push -u origin main
```

### 2. Vercelでデプロイ

1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでサインアップ/ログイン
3. "New Project"をクリック
4. GitHubリポジトリを選択
5. プロジェクト設定:
   - Framework Preset: "Other"
   - Build Command: (空白のまま)
   - Output Directory: (空白のまま)
   - Install Command: `pip install -r requirements.txt`
6. "Deploy"をクリック

### 3. 環境変数設定（オプション）

Vercelダッシュボードで以下の環境変数を設定できます：

- `SECRET_KEY`: Flaskのシークレットキー
- `DATABASE_URL`: 外部データベースURL（PostgreSQLなど）

## ローカル開発

```bash
# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# アプリケーション起動
python src/main.py
```

ブラウザで `http://localhost:5000` にアクセス

## プロジェクト構造

```
photo-diary/
├── api/
│   └── index.py          # Vercel用エントリーポイント
├── src/
│   ├── models/           # データベースモデル
│   ├── routes/           # APIルート
│   ├── static/           # 静的ファイル
│   └── main.py           # Flaskアプリケーション
├── vercel.json           # Vercel設定
├── requirements.txt      # Python依存関係
└── README.md
```

## 独自ドメイン設定

1. Vercelダッシュボードでプロジェクトを選択
2. "Settings" → "Domains"
3. カスタムドメインを追加
4. DNSレコードを設定

## ライセンス

MIT License

