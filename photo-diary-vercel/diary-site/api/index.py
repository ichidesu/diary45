import os
import sys
# プロジェクトルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app

# Vercel用のハンドラー
def handler(request):
    return app(request.environ, lambda status, headers: None)

# 開発用
if __name__ == '__main__':
    app.run(debug=True)

