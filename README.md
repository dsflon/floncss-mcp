# FlonCSS MCP サーバー

このリポジトリは、FlonCSS のドキュメントを提供する Model Context Protocol（MCP）サーバーを実装しています。VS Code 内で FlonCSS のドキュメントを簡単に参照できるようになります。

## セットアップと実行方法

### 前提条件

- Node.js (v22 以上を推奨)
- npm または yarn

### インストール

VS Code の MCP 設定に以下を追加します：

```json
"mcp": {
  "servers": {
    "floncss-mcp": {
      "command": "npx",
      "args": ["-y", "floncss-mcp"],
      "type": "stdio"
    }
  }
}
```

## VS Code での MCP 設定方法

VS Code で MCP を使用するには、以下の手順で設定します。

1. VS Code で設定ファイルを開く（Command + , または File > Preferences > Settings）

2. 「設定の検索」ボックスに「mcp」と入力

3. 「Model Context Protocol: Server Command Configuration」をクリックして、settings.json を編集

4. 上記のインストールセクションの設定を追加

5. VS Code を再起動して設定を反映

## MCP サーバーの使用方法

この MCP サーバーは以下の機能を提供しています：

### 1. プロンプト機能（推奨）

VS Code Copilot チャットで `/` を入力すると、以下のプロンプトが使用できます：

- **`/floncss-coding`** - FlonCSS コーディングモードを起動
  - FlonCSS フレームワークに従った HTML/CSS のコーディングをサポート
  - 完全なドキュメント（docs、utilities、settings）が自動的に読み込まれます
- **`/floncss-refactor`** - FlonCSS リファクタリングモードを起動
  - 既存のコードを FlonCSS のベストプラクティスに従ってリファクタリング
  - ITCSS アーキテクチャの原則に基づいた改善をサポート
- **`/floncss-setting`** - FlonCSS 設定モードを起動
  - デザイン仕様に基づいて CSS 変数を設定
  - colors、fonts、gutters、gaps、breakpoints の設定をサポート

### 2. ツール機能

チャットで以下のように指示することで、ツールを呼び出せます：

#### `handle_floncss_mention` ツール

FlonCSS のコーディングモードを起動するツールです。

**使い方の例：**

- 「`floncss:coding` モードで HTML を作成して」
- 「`floncss:refactor` モードでこのコードを改善して」
- 「`floncss:setting` モードで色の設定をして」

**パラメータ：**

- `text`: モード名（`floncss:coding`、`floncss:refactor`、`floncss:setting`）

#### `get_floncss_docs` ツール

FlonCSS のドキュメントを直接取得します。

**使い方の例：**

- 「FlonCSS の utilities ドキュメントを取得して」
- 「FlonCSS の settings の colors ドキュメントを見せて」

**パラメータ：**

- `category`: ドキュメントのカテゴリ（"docs", "settings", "utilities"）
- `path`: カテゴリ内の特定のパス（オプション）

## 使用例

### プロンプト機能を使う場合（推奨）

VS Code Copilot チャットで：

```
/floncss-coding

デザインに基づいてヒーローセクションを作成してください
```

### ツール機能を使う場合

VS Code Copilot チャットで：

```
floncss:coding モードでレスポンシブなナビゲーションを作成してください
```

または

```
FlonCSS の utilities ドキュメントを取得して、グリッドシステムの使い方を教えてください
```

## トラブルシューティング

- **エラー「FlonCSS documentation loaded successfully」が表示されない場合**: ドキュメント JSON ファイルのパスが正しいか確認してください。
- **VS Code で接続できない場合**: 設定の絶対パスが正しいか確認してください。
