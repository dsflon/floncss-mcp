export const codingGuidelines = {
  html: [
    "「FlonCSS」のコーディングルール、classの命名規則を確認しルールに沿ってくださいコーディングしてください",
    "よりセマンティックな html を意識してください",
    "デザインが与えられている場合、デザインをより忠実に再現してください",
    "簡単なレイアウトや装飾部分は「FlonCSS」の utility class を確認し、存在するものを使ってコーディングしてください",
    "「FlonCSS」を確認し、存在しない utility class は使わないようにしてください",
    "複雑なレイアウトや装飾部分は独自にスタイルを記述して下さい",
    "img タグを使用する場合、alt, width, height 属性を必ず指定してください",
  ],
  css: [
    "「FlonCSS」のコーディングルール、classの命名規則を確認しルールに沿ってくださいコーディングしてください",
    "デザインが与えられている場合、デザインをより忠実に再現してください",
    "できるだけ color や font-size、gutter や gap など settings に定義したcss変数を利用してください",
    "特に指示がない場合、css は「src/assets/floncss/home.css」 に記述してください"
  ],
  assets: [
    "デザインが与えられている場合、デザイン上の画像は自分で作成せず「public/assets/images」フォルダにダウンロードし適切なサイズで挿入してください",
    "ロゴやピクトグラムは自分で作成せず svg ファイルとしてダウンロードしてください"
  ],
  js: [
    "特に指示がない場合、js は「src/assets/js/main.js」 に記述してください"
  ]
};

export type GuidelineCategory = keyof typeof codingGuidelines | 'all';
