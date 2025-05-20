import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from 'url';
// ESモジュール対応のパス解決関数
export function getModuleDirPath() {
    const __filename = fileURLToPath(import.meta.url);
    return dirname(dirname(__filename)); // utils/から見て2階層上がsrcフォルダになる
}
// JSONファイルを読み込み、オブジェクトとして返す関数
export function loadJsonFile(filePath) {
    try {
        const jsonContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonContent);
    }
    catch (error) {
        console.error(`Failed to load JSON file: ${error}`);
        console.error(`Attempted to load from path: ${filePath}`);
        throw error;
    }
}
