# ⚡ 1コマンド自動デプロイガイド

## 🚀 世界に公開するまで1コマンドのみ

### たった1つのコマンド：

```powershell
.\deploy-now.ps1
```

**これだけです！**

---

## 📋 このスクリプトが自動で実行すること

1. ✅ GitHub認証（ブラウザが開きます）
2. ✅ GitHubリポジトリ作成
3. ✅ コードをプッシュ
4. ✅ Vercel認証（ブラウザが開きます）
5. ✅ Vercelにプロジェクトをリンク
6. ✅ 本番環境にデプロイ
7. ✅ 公開URLを取得
8. ✅ ブラウザで自動的に開く

**⏱️ 所要時間：2-3分**

---

## 💡 実行方法

### PowerShellで実行：

```powershell
# プロジェクトディレクトリに移動
cd C:\Users\jizha\ai-customer-support-platform

# 実行権限を設定（初回のみ）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# デプロイスクリプトを実行
.\deploy-now.ps1
```

---

## 🎯 完了後に得られるもの

### 1. 公開URL
```
https://ai-customer-support-platform.vercel.app
または
https://ai-customer-support-platform-username.vercel.app
```

このURLを**世界中の誰でもアクセス可能**

### 2. GitHubリポジトリ
```
https://github.com/yourusername/ai-customer-support-platform
```

ソースコードが公開され、採用担当者が確認可能

### 3. 自動デプロイ有効化
- 今後 `git push` するだけで自動更新
- CI/CDパイプライン稼働中

---

## 📝 実行ログの例

```
╔══════════════════════════════════════════════════════════════╗
║  🚀 完全自動デプロイ開始                                   ║
║  AI Customer Support Platform                               ║
╚══════════════════════════════════════════════════════════════╝

[1/5] GitHub認証を確認中...
✅ GitHub認証済み

[2/5] GitHubリポジトリを作成してコードをプッシュ中...
✅ GitHubリポジトリ作成完了
   📍 https://github.com/username/ai-customer-support-platform.git

[3/5] Vercel認証を確認中...
✅ Vercel認証済み

[4/5] プロジェクトをVercelにリンク中...
✅ Vercelにリンク完了

[5/5] 本番環境にデプロイ中...
⏳ デプロイには2-3分かかります...

╔══════════════════════════════════════════════════════════════╗
║  ✅ デプロイ完全成功！                                     ║
╚══════════════════════════════════════════════════════════════╝

🎉 おめでとうございます！プロジェクトが世界に公開されました！

🌐 公開URL:
   https://ai-customer-support-platform.vercel.app (クリックして開く)

📦 GitHubリポジトリ:
   https://github.com/username/ai-customer-support-platform
```

---

## 🆘 エラーが発生した場合

### GitHub認証エラー
```powershell
# 手動で認証
gh auth login
```

### Vercel CLI未インストール
```powershell
# Vercel CLIをインストール
npm install -g vercel
```

### 実行権限エラー
```powershell
# 管理者としてPowerShellを開く
# そして実行
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎨 デプロイ後の設定

### 環境変数を追加（必須）

1. Vercel Dashboard: https://vercel.com/dashboard
2. プロジェクトを選択
3. Settings → Environment Variables
4. 以下を追加：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Redeploy

### Supabaseセットアップ

1. https://supabase.com でプロジェクト作成
2. SQL Editor で `database/schema.sql` を実行
3. Project Settings → API から URL と Key を取得
4. Vercelの環境変数に追加

### OpenAI API Key

バックエンド（別途デプロイ）で必要：
```
OPENAI_API_KEY=sk-your-key-here
```

---

## 📊 デプロイ後の確認事項

### ✅ チェックリスト

- [ ] 公開URLが開ける
- [ ] GitHubリポジトリが表示される
- [ ] READMEが正しく表示される
- [ ] プロジェクト構造が完全
- [ ] Vercel Dashboardでデプロイ成功確認

---

## 🔄 今後の更新方法

### コードを変更したら：

```powershell
# 変更をコミット
git add .
git commit -m "機能追加"

# プッシュ
git push

# ✨ Vercelが自動的にデプロイ！
```

**手動デプロイは二度と必要ありません！**

---

## 🎯 応募時に使用するURL

### GitHubリポジトリ
```
https://github.com/yourusername/ai-customer-support-platform
```

### Live Demo
```
https://ai-customer-support-platform.vercel.app
```

この2つのURLを応募書類に記載してください。

---

## 💡 Pro Tip

### カスタムドメインを追加（オプション）

1. Vercel Dashboard → Settings → Domains
2. あなたのドメインを追加
3. DNS設定を更新
4. 完了！

例：`ai-support.yourdomain.com`

---

## 🌟 完成！

**あなたのポートフォリオは今、世界中の誰でも見ることができます！**

バレットグループ株式会社の採用担当者も、このURLから：
- ✅ 実際に動作するデモを確認
- ✅ ソースコードを閲覧
- ✅ あなたの技術力を評価

できます。

**今すぐ `.\deploy-now.ps1` を実行して、世界に公開しましょう！** 🚀
