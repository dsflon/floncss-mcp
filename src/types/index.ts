// FlonCSS データの型定義
export interface FlonCSSData {
  [key: string]: {
    title?: string;
    url?: string;
    content?: string;
    [otherProps: string]: any;
  };
}

// サーバー設定の型定義
export interface ServerConfig {
  name: string;
  version: string;
  [key: string]: unknown;  // 追加のプロパティを許可するためのインデックスシグネチャ
}
