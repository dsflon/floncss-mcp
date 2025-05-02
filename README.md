# FlonCSS MCP サーバー

このリポジトリは、FlonCSS のドキュメントを提供する Model Context Protocol（MCP）サーバーを実装しています。VS Code 内で FlonCSS のドキュメントを簡単に参照できるようになります。

## セットアップと実行方法

### 前提条件

- Node.js (v18 以上を推奨)
- npm または yarn

### インストール

1. リポジトリをクローンする

   ```bash
   git clone https://github.com/dsflon/floncss-mcp
   cd floncss-mcp
   ```

2. 依存関係をインストールする

   ```bash
   npm install
   # または
   yarn install
   ```

3. プロジェクトをビルドする
   ```bash
   npm run build
   # または
   yarn build
   ```

### 直接実行する（VS Code で MCP 設定する場合は不要）

ビルド後、以下のコマンドで MCP サーバーを実行できます：

```bash
node build/index.js
```

## VS Code での MCP 設定方法

VS Code で MCP を使用するには、以下の手順で設定します。

1. VS Code で設定ファイルを開く（Command + , または File > Preferences > Settings）

2. 「設定の検索」ボックスに「mcp」と入力

3. 「Model Context Protocol: Server Command Configuration」をクリックして、settings.json を編集

4. settings.json に以下の設定を追加：

```json
"mcp": {
  "servers": {
    ...

    "floncss-mcp": {
      "command": "node",
      "args": [
        "<絶対パス>/floncss-mcp/build/index.js"
      ]
    }
  }
}
```

注意: `<絶対パス>` の部分を実際のプロジェクトの絶対パスに置き換えてください。
例えば: `/Users/username/MCP/floncss-mcp/build/index.js`

5. VS Code を再起動して設定を反映

## MCP サーバーの使用方法

この MCP サーバーは以下のツールを提供しています：

- `get_floncss_docs`: FlonCSS のドキュメントを取得する
  - パラメータ:
    - `category`: ドキュメントのカテゴリ（"docs", "settings", "utilities"のいずれか、必須）
    - `path`: カテゴリ内の特定のパス（例：'colors', 'installation'、オプション）

## 例

VS Code で次のように MCP コマンドを使用できます：

```
@floncss-mcp get_floncss_docs category=docs path=installation
```

これにより、FlonCSS のインストールに関するドキュメントが表示されます。

## トラブルシューティング

- **エラー「FlonCSS documentation loaded successfully」が表示されない場合**: ドキュメント JSON ファイルのパスが正しいか確認してください。
- **VS Code で接続できない場合**: 設定の絶対パスが正しいか確認してください。
