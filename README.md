# AI カスタマーサポートプラットフォーム

<div align="center">

**カスタマーハラスメント対策 × AI感情分析 × リアルタイムダッシュボード**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Jest](https://img.shields.io/badge/Jest-Tested-C21325?logo=jest)](https://jestjs.io/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel)](https://vercel.com/)

[Live Demo](https://ai-customer-support-platform-eosin.vercel.app) | [GitHub](https://github.com/jizhaoganye-dev/ai-customer-support-platform)

</div>

---

## 概要

コールセンター・カスタマーサポート部門向けの**AIカスタマーハラスメント対策プラットフォーム**です。

暴言・侮辱・脅迫などのカスタマーハラスメントをリアルタイムで検知し、オペレーターの心理的負荷を軽減しながら、適切なエスカレーション判断を支援します。

### 主要機能

| 機能 | 説明 |
|------|------|
| **カスハラ検知** | 日本語の暴言・侮辱・脅迫をキーワード＋パターンマッチングで即時検知（カタカナ・ひらがな・漢字対応） |
| **感情分析（Sentiment Analysis）** | ユーザーメッセージの感情を4段階（怒り・不満・中立・良好）でリアルタイム分類 |
| **AI自動応答チャット** | 20以上のFAQパターンに基づくコンテキスト応答エンジン |
| **AI→人間ハンドオフ** | 怒り・高深刻度検出時にコンテキスト（要約・注文番号・感情状態）をメタデータとして引き継ぎ |
| **リアルタイムダッシュボード** | CSAT・自動解決率・カスハラ検知数・怒り検知をKPI階層で表示 |
| **アナリティクス** | 会話数推移・カスハラ検知推移・ステータス分布（横棒グラフ）・満足度推移 |
| **カスハラ研修モジュール** | 対応シナリオベースのインタラクティブ学習機能 |
| **レスポンシブデザイン** | モバイル対応サイドバー・ホワイトスペース最適化 |

---

## デモアカウント

```
メールアドレス: admin@company.co.jp
パスワード: password123
```

ログイン後、AIチャットで以下を試せます：
- 「返品について」「配送状況」— AI自動応答
- 「バカ野郎」「ふざけるな」— カスハラ検知＋感情分析アラート
- 「ありがとう」— ポジティブ感情検出

---

## 技術スタック

```
フロントエンド:   Next.js 14 (App Router) / TypeScript / React 18
バックエンド:     Next.js API Routes (サーバーサイド)
データベース:     Supabase (PostgreSQL) — env未設定時はlocalStorageフォールバック
AI:               OpenAI GPT-4o-mini — env未設定時はルールベースエンジン
スタイリング:     Tailwind CSS 3.4
チャート:         Recharts 2.10 (AreaChart, BarChart)
状態管理:         React Context API + localStorage + Supabase
認証:             AuthProvider + AuthGate + Edge Middleware
テスト:           Jest (ユニットテスト)
デプロイ:         Vercel
CI/CD:            GitHub Actions
```

### サーバーサイドAPI

| エンドポイント | メソッド | 機能 |
|---------------|---------|------|
| `/api/chat` | POST | AI応答生成（OpenAI or ルールベース） |
| `/api/analyze` | POST | カスハラ検知 + 感情分析 |
| `/api/health` | GET | ヘルスチェック（サービス接続状態） |

### グレースフルデグラデーション設計

| 環境変数 | 設定時 | 未設定時 |
|---------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | PostgreSQL永続化 | localStorage |
| `OPENAI_API_KEY` | GPT-4o-mini応答 | ルールベース応答 |

---

## プロジェクト構造

```
ai-customer-support-platform/
├── app/
│   ├── layout.tsx              # ルートレイアウト（dynamic import, SSR制御）
│   ├── page.tsx                # ログインページ
│   ├── providers.tsx           # AuthProvider + ConversationProvider
│   ├── error.tsx               # グローバルError Boundary
│   ├── globals.css             # グローバルCSS + Tailwindディレクティブ
│   ├── signup/page.tsx         # サインアップ
│   ├── api/
│   │   ├── chat/route.ts       # AI応答API（OpenAI / ルールベース）
│   │   ├── analyze/route.ts    # カスハラ検知 + 感情分析API
│   │   └── health/route.ts     # ヘルスチェックAPI
│   └── dashboard/
│       ├── layout.tsx          # ダッシュボードレイアウト（サイドバー・AuthGate）
│       ├── page.tsx            # KPIダッシュボード
│       ├── chat/page.tsx       # AIチャット（感情分析・ハンドオフ）
│       ├── conversations/page.tsx  # 会話管理
│       ├── analytics/page.tsx  # アナリティクス
│       ├── training/page.tsx   # カスハラ研修
│       └── settings/page.tsx   # 設定
├── lib/
│   ├── auth-context.tsx        # 認証Context + AuthGateコンポーネント
│   ├── conversation-store.tsx  # 会話・ハラスメントイベントの永続化ストア
│   ├── mock-data.ts            # カスハラ検知・感情分析・ハンドオフロジック
│   ├── supabase.ts             # Supabaseクライアント（フォールバック付き）
│   ├── database.types.ts       # Supabase型定義
│   └── utils.ts                # ユーティリティ（cn, formatDate）
├── __tests__/
│   ├── harassment-detection.test.ts  # カスハラ検知テスト（13ケース）
│   ├── sentiment-analysis.test.ts    # 感情分析テスト（10ケース）
│   └── handoff-context.test.ts       # ハンドオフテスト（6ケース）
├── middleware.ts               # Edge Middleware（レート制限・セキュリティヘッダー）
├── jest.config.ts              # Jest設定
├── .env.example                # 環境変数テンプレート
├── .github/workflows/ci-cd.yml # CI/CDパイプライン
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## アーキテクチャの設計判断

### なぜクライアント完結型か

本プロジェクトは**ポートフォリオ作品**として、バックエンドサービスへの依存なしに以下を実証します：

1. **React Context + localStorage** によるリアルタイム状態管理
2. **`dynamic(() => ..., { ssr: false })`** によるSSR/ハイドレーション問題の解決
3. **AuthGate パターン** — 認証状態確定までの描画ブロックによるレースコンディション防止
4. **`typeof window === 'undefined'` ガード** — 全localStorage参照のSSR安全性確保

### 本番環境への拡張ポイント

| 現在（デモ） | 本番構成 |
|-------------|---------|
| localStorage | Supabase / Convex |
| クライアント認証 | Clerk / NextAuth.js |
| キーワードマッチング | OpenAI GPT-4 / Gemini 2.0 |
| モックFAQ | RAG（pgvector + Embedding） |
| クライアントストア | WebSocket + リアルタイムDB |

---

## ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/jizhaoganye-dev/ai-customer-support-platform.git
cd ai-customer-support-platform

# 依存関係をインストール
npm install

# 環境変数を設定（任意 — なくても動作します）
cp .env.example .env.local

# 開発サーバーを起動
npm run dev
```

`http://localhost:3000` でアクセス可能です。

## テスト

```bash
# ユニットテスト実行
npm test

# ウォッチモード
npm run test:watch
```

テスト対象:
- `detectHarassment()` — カスハラ検知（13テストケース）
- `analyzeSentiment()` — 感情分析（10テストケース）
- `buildHandoffContext()` — ハンドオフコンテキスト生成（6テストケース）

---

## 対応する求人要件

本プロジェクトは以下の案件例に対応する実装力を実証します：

- **カスタマーハラスメント対策学習ツールの開発**（TypeScript / Next.js / Vercel）
- **AIチャットボット開発**（自然言語処理・FAQ自動応答）
- **接客支援ツール開発**（データ入力・売上データ閲覧）

### 使用AIツール
- **Cursor** — AIコーディングアシスタント
- **Claude** — コード生成・レビュー・アーキテクチャ設計

---

## ライセンス

MIT License
