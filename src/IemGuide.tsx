import { useState, useRef, useEffect } from "react";
import {
  ArrowUpRight,
  MapPin,
  Search,
  Layers,
  BookOpen,
  ArrowRight,
  X,
} from "lucide-react";
import {
  iemResources,
  iemSources,
  iemYears,
  iemPaths,
  type IemResource,
} from "./iem";
import "./iem.css";
type GuideTab = "spaces" | "courses" | "paths";
export function IemGuide({
  onLocate,
}: {
  onLocate: (resource: IemResource) => void;
}) {
  const [tab, setTab] = useState<GuideTab>("spaces"),
    [query, setQuery] = useState(""),
    [floor, setFloor] = useState("全部"),
    [year, setYear] = useState(1),
    [focus, setFocus] = useState<{ name: string; ids: string[] } | null>(null);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    content.current?.scrollTo({ top: 0 });
  }, [tab, year, focus]);
  const normalized = (v: string) => v.toLowerCase().replace(/[\s-]/g, "");
  const resources = iemResources.filter(
    (r) =>
      (floor === "全部" || r.floor === floor) &&
      (!focus || focus.ids.includes(r.id)) &&
      normalized([r.name, r.room, ...r.equipment, r.learn].join(" ")).includes(
        normalized(query),
      ),
  );
  function showResources(name: string, ids: string[]) {
    setFocus({ name, ids });
    setFloor("全部");
    setQuery("");
    setTab("spaces");
  }
  return (
    <div className="iem-guide">
      <div className="iem-intro">
        <div>
          <span className="iem-kicker">YOUR LEARNING, CONNECTED</span>
          <h3>從一門課，找到你的實作場域。</h3>
          <p>認識教室與實驗室、看懂設備用途，再把四年的學習連成自己的方向。</p>
        </div>
        <div className="iem-stats">
          <span>
            <b>10</b>實驗／實習場域
          </span>
          <span>
            <b>5F・6F</b>理工大樓核心空間
          </span>
          <span>
            <b>115</b>入學適用課程
          </span>
        </div>
      </div>
      <nav className="iem-tabs" aria-label="工管系資源分類">
        {(
          [
            ["spaces", "空間與設備"],
            ["courses", "四年課程"],
            ["paths", "學習方向"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="iem-content" ref={content}>
        {tab === "spaces" ? (
          <>
            <div className="iem-section-heading">
              <div>
                <h4>先知道在哪裡，再知道能學什麼</h4>
                <p>
                  系辦 E-508
                  位於理工大樓五樓。一般授課教室請查當期課表，專業場域如下。
                </p>
              </div>
              <a href={iemSources.timetable} target="_blank" rel="noreferrer">
                查上課教室 <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="iem-filters">
              <label>
                <Search size={16} />
                <input
                  aria-label="搜尋工管系資源"
                  placeholder="搜尋 PLC、人因或 E-619"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div>
                {["全部", "1F", "5F", "6F"].map((f) => (
                  <button
                    key={f}
                    className={floor === f ? "active" : ""}
                    aria-pressed={floor === f}
                    onClick={() => setFloor(f)}
                  >
                    {f === "全部" ? "所有樓層" : f}
                  </button>
                ))}
              </div>
            </div>
            {focus && (
              <div className="iem-context">
                「{focus.name}」相關學習資源{" "}
                <button
                  aria-label="清除課程資源篩選"
                  onClick={() => setFocus(null)}
                >
                  <X size={14} />
                  清除篩選
                </button>
              </div>
            )}
            <p className="iem-result-count">
              找到 {resources.length} 處資源 ·
              設備項目依官方用途摘要，實際可用設備與借用須洽系辦。
            </p>
            <div className="iem-resource-grid">
              {resources.map((r) => (
                <article
                  className="iem-resource"
                  key={r.id}
                  aria-label={`${r.room} ${r.name}`}
                >
                  <div className="iem-resource-top">
                    <span className="iem-room">{r.room}</span>
                    <span>{r.kind}</span>
                  </div>
                  <h5>{r.name}</h5>
                  <div className="iem-location">
                    <MapPin size={13} />
                    {r.parentId
                      ? `理工大樓 ${r.floor}`
                      : "官方列為 C-101；所在建築待確認"}
                  </div>
                  <ul>
                    {r.equipment.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                  <p>
                    <b>可以學什麼</b>
                    {r.learn}
                  </p>
                  <div className="iem-resource-actions">
                    {r.parentId ? (
                      <button onClick={() => onLocate(r)}>
                        <Layers size={14} />
                        看所在樓層
                      </button>
                    ) : (
                      <span>未加入推測位置</span>
                    )}
                    <a href={r.source} target="_blank" rel="noreferrer">
                      官方資料 <ArrowUpRight size={13} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
            {resources.length === 0 && (
              <div className="iem-empty">
                沒有符合的資源。
                <button
                  onClick={() => {
                    setQuery("");
                    setFloor("全部");
                    setFocus(null);
                  }}
                >
                  重設篩選
                </button>
              </div>
            )}
            <details className="iem-floorplans">
              <summary>查看官方五、六樓配置圖</summary>
              <p>
                圖中包含電梯、梯間與已標示房間；3D
                模型只定位所在大樓與樓層，室內座標仍為示意。
              </p>
              <div>
                {[5, 6].map((f) => (
                  <figure key={f}>
                    <a
                      href={f === 5 ? iemSources.image5 : iemSources.image6}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        loading="lazy"
                        src={f === 5 ? iemSources.image5 : iemSources.image6}
                        alt={`朝陽工管系官方理工大樓${f}樓配置圖`}
                      />
                    </a>
                    <figcaption>
                      <a
                        href={f === 5 ? iemSources.floor5 : iemSources.floor6}
                        target="_blank"
                        rel="noreferrer"
                      >
                        理工大樓 {f}F 官方頁面 <ArrowUpRight size={13} />
                      </a>
                      點圖可開啟原圖放大
                    </figcaption>
                  </figure>
                ))}
              </div>
            </details>
          </>
        ) : tab === "courses" ? (
          <>
            <div className="iem-section-heading">
              <div>
                <h4>四年，把基礎變成解決問題的能力</h4>
                <p>
                  以下摘要適用 115
                  學年度入學、日間部四技一般班；列示系專業必修與選修例，不含完整通識清單。
                </p>
              </div>
              <a href={iemSources.plan115} target="_blank" rel="noreferrer">
                115 級完整規劃 PDF <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="iem-credit">
              <b>最低畢業 132 學分</b>
              <span>專業必修 70 學分（含院共同 2）</span>
              <span>專業選修至少 24 學分</span>
              <small>
                仍須符合通識、語文及其他修業規定；技優、春季班與不同入學年度請查各自規劃。
              </small>
            </div>
            <div className="iem-year-picker" aria-label="選擇年級">
              {iemYears.map((y) => (
                <button
                  key={y.year}
                  aria-pressed={year === y.year}
                  className={year === y.year ? "active" : ""}
                  onClick={() => setYear(y.year)}
                >
                  大{["一", "二", "三", "四"][y.year - 1]}
                </button>
              ))}
            </div>
            {iemYears
              .filter((y) => y.year === year)
              .map((y) => (
                <section className="iem-year" key={y.year}>
                  <div className="iem-year-title">
                    <span>0{y.year}</span>
                    <div>
                      <h5>{y.title}</h5>
                      <p>{y.goal}</p>
                    </div>
                  </div>
                  <div className="iem-semesters">
                    {(["上", "下"] as const).map((t) => (
                      <section key={t}>
                        <h6>{t}學期 · 系專業必修</h6>
                        {y.core
                          .filter((c) => c.term === t)
                          .map((c) => (
                            <div className="iem-course" key={c.name}>
                              <span>{c.name}</span>
                              {c.resources.length > 0 && (
                                <button
                                  aria-label={`${c.name}相關資源`}
                                  onClick={() =>
                                    showResources(c.name, c.resources)
                                  }
                                >
                                  相關資源 <ArrowRight size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        {y.core.every((c) => c.term !== t) && (
                          <p>
                            本摘要無系專業必修列項；可依選修、實習與個人修課安排規劃。
                          </p>
                        )}
                      </section>
                    ))}
                  </div>
                  <div className="iem-electives">
                    <b>這一年可留意的選修例</b>
                    <p>{y.electives.join(" ／ ")}</p>
                  </div>
                </section>
              ))}
            <div className="iem-note">
              <BookOpen size={19} />
              <p>
                「相關資源」是協助理解課程與能力的延伸建議，並非正式排課或指定上課地點。實際開課、時間、教室、先修與選課限制以課務系統為準。
              </p>
            </div>
            <div className="iem-official-links">
              <a href={iemSources.curriculum} target="_blank" rel="noreferrer">
                各年度／各學制課程規劃 <ArrowUpRight size={14} />
              </a>
              <a href={iemSources.timetable} target="_blank" rel="noreferrer">
                當期課表與授課教室 <ArrowUpRight size={14} />
              </a>
              <a href={iemSources.project} target="_blank" rel="noreferrer">
                專題與實習規定 <ArrowUpRight size={14} />
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="iem-section-heading">
              <div>
                <h4>從你的興趣，選一個起點</h4>
                <p>
                  以下為依課程與場域整理的探索建議，並非正式分組、學程資格或先修順序。
                </p>
              </div>
            </div>
            <div className="iem-path-grid">
              {iemPaths.map((p, i) => (
                <article className="iem-path" key={p.id}>
                  <span>方向 0{i + 1}</span>
                  <h5>{p.name}</h5>
                  <p>{p.question}</p>
                  <b>可以關注的課程</b>
                  <p>{p.courses.join(" ／ ")}</p>
                  <div className="iem-task">{p.project}</div>
                  <button onClick={() => showResources(p.name, p.resources)}>
                    探索相關空間與設備 <ArrowRight size={15} />
                  </button>
                </article>
              ))}
            </div>
            <div className="iem-note">
              <MapPin size={19} />
              <p>
                建議先向系辦或授課老師確認實驗室使用、訓練與預約，再規劃實作。
                <a href="tel:+886423323000,7034">系辦 04-2332-3000 分機 7034</a>{" "}
                · <a href="mailto:iem@cyut.edu.tw">iem@cyut.edu.tw</a>
              </p>
            </div>
          </>
        )}
        <footer className="iem-source-footer">
          資料核對 2026-10-29 · 依
          <a href={iemSources.labs} target="_blank" rel="noreferrer">
            系上實驗室清單
          </a>
          、
          <a href={iemSources.floor5} target="_blank" rel="noreferrer">
            樓層配置圖
          </a>
          與
          <a href={iemSources.curriculum} target="_blank" rel="noreferrer">
            官方課程規劃
          </a>
          整理。未公布的開放時間、設備型號與排課教室不作推定。
        </footer>
      </div>
    </div>
  );
}
