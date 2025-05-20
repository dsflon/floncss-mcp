export interface ServerConfig {
  name: string;
  version: string;
}

export interface FlonCSSDataEntry {
  title: string;
  url: string;
  content: string;
}

export interface FlonCSSData {
  [key: string]: FlonCSSDataEntry;
}
