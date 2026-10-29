export const iemSources = {
  home: "https://iem.cyut.edu.tw/",
  labs: "https://iem.cyut.edu.tw/p/404-1032-9806.php?Lang=zh-tw",
  floor5: "https://iem.cyut.edu.tw/p/404-1032-63128.php?Lang=zh-tw",
  floor6: "https://iem.cyut.edu.tw/p/404-1032-61729.php?Lang=zh-tw",
  image5: "https://iem.cyut.edu.tw/var/file/32/1032/img/438590009.png",
  image6: "https://iem.cyut.edu.tw/var/file/32/1032/img/457016844.png",
  curriculum: "https://iem.cyut.edu.tw/p/404-1032-9813.php?Lang=zh-tw",
  plan115: "https://iem.cyut.edu.tw/var/file/32/1032/img/567/394227692.pdf",
  timetable: "https://cts.cyut.edu.tw/CTS0006",
  project: "https://iem.cyut.edu.tw/p/404-1032-9818.php?Lang=zh-tw",
};
export interface IemResource {
  id: string;
  name: string;
  room: string;
  floor: string;
  parentId?: string;
  kind: "實驗與實習" | "系務與討論";
  equipment: string[];
  learn: string;
  source: string;
}
const lab = (
  id: string,
  name: string,
  room: string,
  floor: string,
  equipment: string[],
  learn: string,
): IemResource => ({
  id,
  name,
  room,
  floor,
  parentId: room.startsWith("E-") ? "science" : undefined,
  kind: "實驗與實習",
  equipment,
  learn,
  source: iemSources.labs,
});
export const iemResources: IemResource[] = [
  lab(
    "iem-manufacturing",
    "製造程序實習工廠",
    "E-101",
    "1F",
    ["製造程序與工具機教學設備"],
    "從工件加工理解製造流程與工具機操作。",
  ),
  lab(
    "iem-mechatronics",
    "機電整合實驗室",
    "E-516.1",
    "5F",
    ["PLC 教學實驗箱", "空壓／油壓設備", "機電整合模擬工作站"],
    "把程式控制與機械動作串成自動化系統。",
  ),
  lab(
    "iem-health",
    "亞健康族群健康促進中心",
    "E-607",
    "6F",
    ["人因分析與健康促進教學資源", "雲端資料庫與資通訊應用"],
    "練習把人因觀察與資料應用帶進健康服務情境。",
  ),
  lab(
    "iem-tpm",
    "TPM訓練道場",
    "E-608",
    "6F",
    ["螺絲螺帽／潤滑／傳動", "空壓／油壓／電氣訓練資源"],
    "從設備基本技能理解維護與生產效率。",
  ),
  lab(
    "iem-virtual",
    "虛擬製造與模擬實驗室",
    "E-609",
    "6F",
    ["數位製造與虛擬實境模擬", "人機互動研究資源"],
    "用模擬比較製造規劃方案與人機互動。",
  ),
  lab(
    "iem-reverse",
    "逆向工程實驗室",
    "E-616",
    "6F",
    ["3D 掃描", "曲面重建軟體", "CAD／CAM 整合"],
    "由實體樣品重建數位模型，再思考製造方式。",
  ),
  lab(
    "iem-quality",
    "品質管理暨自動化檢測實驗室",
    "E-617",
    "6F",
    ["品質檢測教學資源", "電腦視覺與自動化檢測"],
    "將品質工具連結到實際量測與檢測問題。",
  ),
  lab(
    "iem-human",
    "人因工程實驗室",
    "E-619",
    "6F",
    ["動作分析系統", "力量測系統", "生理訊號系統"],
    "觀察動作與負荷，思考作業和產品如何更適合使用者。",
  ),
  lab(
    "iem-decision",
    "計量分析與生產決策實驗室",
    "E-620",
    "6F",
    ["電腦設備", "專業應用軟體"],
    "把資料分析、模型與生產問題連結，練習做有依據的決策。",
  ),
  lab(
    "iem-molding",
    "射出成型實驗室",
    "C-101",
    "待確認",
    ["射出成型與模具功能測試", "製程參數實驗資源"],
    "透過參數實驗理解製程條件與結果的關係。",
  ),
  {
    id: "iem-office",
    name: "工業工程與管理系辦公室",
    room: "E-508",
    floor: "5F",
    parentId: "science",
    kind: "系務與討論",
    equipment: ["系務與修課諮詢窗口"],
    learn: "不知道從哪裡開始時，先向系辦詢問修課、實驗室使用與申請方式。",
    source: iemSources.floor5,
  },
  {
    id: "iem-graduate",
    name: "研究生專題討論室",
    room: "E-509",
    floor: "5F",
    parentId: "science",
    kind: "系務與討論",
    equipment: ["研究生專題討論空間"],
    learn: "與指導老師確認專題討論與空間使用安排。",
    source: iemSources.floor5,
  },
  {
    id: "iem-project",
    name: "大學生專題研討室",
    room: "E-516.2",
    floor: "5F",
    parentId: "science",
    kind: "系務與討論",
    equipment: ["大學生專題研討空間"],
    learn: "以團隊討論整理題目、分工、實驗與成果。",
    source: iemSources.floor5,
  },
  {
    id: "iem-meeting",
    name: "工管系會議室",
    room: "E-520",
    floor: "5F",
    parentId: "science",
    kind: "系務與討論",
    equipment: ["會議與討論空間"],
    learn: "用途與借用方式請向系辦確認。",
    source: iemSources.floor5,
  },
];
export type Course = { name: string; term: "上" | "下"; resources: string[] };
export const iemYears: {
  year: number;
  title: string;
  goal: string;
  core: Course[];
  electives: string[];
}[] = [
  {
    year: 1,
    title: "打好基礎，認識現場",
    goal: "建立工程、管理與程式的共同語言。",
    core: [
      { name: "工業工程概論", term: "上", resources: ["iem-office"] },
      { name: "邏輯思考與演算", term: "上", resources: [] },
      { name: "製造程序", term: "上", resources: ["iem-manufacturing"] },
      {
        name: "製造程序實習(一)",
        term: "上",
        resources: ["iem-manufacturing"],
      },
      { name: "電腦圖學", term: "上", resources: ["iem-reverse"] },
      { name: "工業管理", term: "下", resources: [] },
      { name: "微積分", term: "下", resources: [] },
      { name: "程式設計", term: "下", resources: ["iem-decision"] },
      { name: "工業會計", term: "下", resources: [] },
      { name: "普通物理", term: "下", resources: [] },
    ],
    electives: ["製造程序實習(二)", "經濟學"],
  },
  {
    year: 2,
    title: "學會分析與改善",
    goal: "用工作研究、統計和決策方法拆解問題。",
    core: [
      { name: "工作研究", term: "上", resources: ["iem-human"] },
      { name: "工作研究實習", term: "上", resources: ["iem-human"] },
      { name: "管理數學", term: "上", resources: ["iem-decision"] },
      { name: "工程經濟", term: "上", resources: [] },
      {
        name: "資料庫管理系統",
        term: "下",
        resources: ["iem-decision", "iem-health"],
      },
      { name: "作業研究(一)", term: "下", resources: ["iem-decision"] },
      {
        name: "工程統計",
        term: "下",
        resources: ["iem-quality", "iem-decision"],
      },
      { name: "工程統計實習", term: "下", resources: ["iem-quality"] },
    ],
    electives: [
      "可程式控制器(PLC)實習",
      "油壓/空壓/電氣技能實習",
      "機電整合概論",
    ],
  },
  {
    year: 3,
    title: "連結品質、生產與人因",
    goal: "把分析能力用在系統、現場與使用者需求。",
    core: [
      { name: "品質管制", term: "上", resources: ["iem-quality"] },
      { name: "品管實習", term: "上", resources: ["iem-quality"] },
      { name: "生產管理", term: "上", resources: ["iem-decision", "iem-tpm"] },
      { name: "人因工程", term: "上", resources: ["iem-human", "iem-health"] },
      { name: "設施規劃", term: "下", resources: ["iem-virtual"] },
      { name: "工程寫作與報告", term: "下", resources: ["iem-project"] },
    ],
    electives: ["人因工程實習", "精實生產管理", "CNC機台實作實習", "物料管理"],
  },
  {
    year: 4,
    title: "整合專題與產業經驗",
    goal: "把學到的工具整合成可以說明、驗證的成果。",
    core: [
      {
        name: "專題製作與實習",
        term: "上",
        resources: ["iem-project", "iem-graduate"],
      },
      { name: "工業工程與管理實務講座", term: "上", resources: [] },
    ],
    electives: ["系統模擬", "製造執行系統", "射出成型機台實作實習", "企業實習"],
  },
];
export const iemPaths = [
  {
    id: "smart",
    name: "智慧製造與設備",
    question: "想讓機台與生產流程更聰明？",
    courses: ["製造程序", "可程式控制器(PLC)實習", "製造執行系統"],
    resources: [
      "iem-manufacturing",
      "iem-mechatronics",
      "iem-tpm",
      "iem-virtual",
      "iem-reverse",
      "iem-molding",
    ],
    project: "學習任務：畫出一段製程，思考感測、控制與維護能改善哪些問題。",
  },
  {
    id: "quality",
    name: "品質與數據決策",
    question: "喜歡用資料找出原因與比較方案？",
    courses: ["工程統計", "品質管制", "作業研究(一)"],
    resources: ["iem-quality", "iem-decision"],
    project: "學習任務：用一組資料比較品質差異，說明抽樣、量測與判讀方式。",
  },
  {
    id: "human",
    name: "人因與工作改善",
    question: "想讓產品與工作更符合人的需求？",
    courses: ["工作研究", "人因工程", "人因工程實習"],
    resources: ["iem-human", "iem-health"],
    project: "學習任務：觀察一個操作動作，提出可驗證的負荷或介面改善構想。",
  },
  {
    id: "operations",
    name: "生產與營運管理",
    question: "對排程、物流與系統效率有興趣？",
    courses: ["生產管理", "設施規劃", "物料管理"],
    resources: ["iem-decision", "iem-virtual", "iem-tpm"],
    project: "學習任務：畫出物料或服務流程，找出等待、搬運與瓶頸。",
  },
];
