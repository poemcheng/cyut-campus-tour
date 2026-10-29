# 朝陽漫遊｜朝陽科技大學校園導覽

依使用者提供的 `sch_city-main.zip` 參考製作。保留 Three.js + React + TypeScript + Vite 的互動校園導覽方向，重新整理朝陽科技大學資料、場景及介面，沒有使用南海校區的模型、照片、座標或開放時間。

## 開啟與開發

公開網站：[GitHub Pages](https://poemcheng.github.io/cyut-campus-tour/) · [原始碼](https://github.com/poemcheng/cyut-campus-tour)

需要 Node.js 22.18 以上（測試使用內建 TypeScript 支援）。在本資料夾開啟終端機：

```sh
npm ci
npm run dev
```

開啟終端機顯示的網址。可使用 `npm run build` 產生 `dist/`，再用 `npm run preview` 預覽。`dist` 可交由任何靜態網站伺服器提供服務；請勿直接雙擊 HTML，以免瀏覽器阻擋模組。網頁字型取自 Google Fonts，無網路時使用系統字型；程式與校園圖會隨建置一併提供。

## 已完成功能

- 30 個朝陽地點（含 13 處演講廳、禮堂與會議廳）、中英名稱、分類、簡介及官方資料連結。
- 可旋轉、縮放、重設及切換俯視的 Three.js 校園量體示意。
- 建築點選、鏡頭聚焦、標籤避讓與分類淡化。
- 地點名稱、英文及教室代碼搜尋；支援 `/` 搜尋快捷鍵。
- 三條主題參訪路線及自訂起終點，A* 示意路網連線。
- 導覽播放與暫停；可選瀏覽器中文語音，語音支援依裝置而定。
- 本機收藏、可分享的地點網址參數、官方校園圖縮放。
- 手機版導覽面板、交通與無障礙資訊連結。

## 資料與示意邊界

建築配置參考官方圖，量體、比例、樓面條帶、高度、樹木與路網為視覺示意，沒有使用校方 BIM、GIS 或測繪檔。路線表達參訪順序與示意路網，不提供實測距離、步行時間、即時定位或無障礙路徑保證。現場動線、開放時間與使用規範請依校方最新資訊。

資料核對日期：2026-10-29。

- [朝陽科技大學](https://www.cyut.edu.tw/)
- [官方校園平面圖](https://web.cyut.edu.tw/p/412-1000-4553.php?Lang=zh-tw)
- [各大樓樓層介紹](https://web.cyut.edu.tw/p/412-1000-4556.php?Lang=zh-tw)
- [波錠紀念圖書館](https://www.lib.cyut.edu.tw/)
- [電腦教室分布](https://pmlis.cyut.edu.tw/pcroom.php)
- [交通資訊](https://web.cyut.edu.tw/p/412-1000-4559.php?Lang=zh-tw)
- [無障礙設施導覽](https://web.cyut.edu.tw/p/412-1000-4555.php?Lang=zh-tw)

隨附的 `public/assets/official-campus-map.jpg` 來源為校方公開的校園圖：<https://web.cyut.edu.tw/var/file/0/1000/img/49/422079728.jpg>。圖像權利屬原權利人；本網站為非官方導覽作品。

參考套件：[Lucky-dogz/sch_city](https://github.com/Lucky-dogz/sch_city)，其 package.json 標示 MIT；本實作的路網、A* 與介面重新撰寫。

## 修改與驗證

- `src/data.ts`：地點文字、資料來源與示意座標。
- `src/CampusScene.tsx`：場景、量體與鏡頭控制。
- `src/pathfinding.ts`：示意路網與 A*。
- `src/main.tsx`、`src/style.css`：導覽介面與響應式樣式。
- `npm test`：全部 196 組路網起終點，檢查端點、邊相鄰性及與獨立最短路徑算法的一致性。
- `npm run build`：TypeScript 檢查與正式建置。

不需要任何地圖 API 金鑰。網站不要求定位、相機或登入；收藏只保存在使用者瀏覽器。

## 演講廳、禮堂與會議廳

| 場地 | 所屬大樓 | 樓層 | 房號 |
| --- | --- | --- | --- |
| 波錠廳 | 教學大樓 | 2F | T1-206 |
| 禮堂 | 設計大樓 | 1F | D-127 |
| 時選廳 | 管理大樓 | 3F | T2-305 |
| 天生廳 | 管理大樓 | 4F | T2-405 |
| 美智廳 | 管理大樓 | 6F | T2-606 |
| 圖書館演講廳 | 波錠紀念圖書館 | 1F | 官方頁面未列房號 |
| 理工大樓演講廳 | 理工大樓 | 1F | E-103 |
| 管理大樓演講廳 | 管理大樓 | 1F | T2-104 |
| 設計大樓 D-202 演講廳 | 設計大樓 | 2F | D-202 |
| 設計大樓 D-203 演講廳 | 設計大樓 | 2F | D-203 |
| 設計大樓 D-204 演講廳 | 設計大樓 | 2F | D-204 |
| 國際會議廳 | 航空大樓 | 5F | V-501 |
| 六樓會議廳 | 行政大樓 | 6F | 官方頁面未列房號 |

清單依官方各大樓樓層簡介、[114 學年度畢業典禮場地位置](https://www.cyut.edu.tw/114gra/)及[圖書館場地介紹](https://cyutis.cyut.edu.tw/TSLibrarySpace/Home/SiteIntro)核對，涵蓋公開資料可確認的演講廳與大型廳館。一般會議室、普通教室及歷史上已變更用途的空間未列為演講廳。各場地在 3D 圖上定位於所屬大樓，室內樓層與房號顯示於介紹卡片；不另生成虛構的大樓，也不提供室內逐步導航。

## GitHub Pages 發佈

1. 執行 `npm ci`，再執行 `npm run build:pages`。
2. 將原始碼及產生的 `docs/` 提交到 GitHub。
3. 在儲存庫 Settings → Pages 選擇 Deploy from a branch，指定 `main` 分支的 `/docs` 資料夾並儲存。
4. 發佈網址為 `https://poemcheng.github.io/cyut-campus-tour/`。

`docs/.nojekyll` 關閉 Jekyll 處理。Vite 使用相對資產路徑，同時相容根目錄與 GitHub Pages 子路徑。更新程式後需重新執行 `npm run build:pages` 並提交 `docs/`。公開儲存庫不包含 `.openai/` 平台設定或任何憑證。
