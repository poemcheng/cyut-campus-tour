import React, { useRef, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Search,
  MapPin,
  Route,
  Compass,
  Layers,
  Plus,
  Minus,
  RotateCcw,
  Building2,
  BookOpen,
  Leaf,
  Sun,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Play,
  Pause,
  Heart,
  Info,
  ExternalLink,
  ArrowDownUp,
  Menu,
  Check,
  Volume2,
  VolumeX,
  Map,
  Navigation,
} from "lucide-react";
import { CampusScene, type SceneAPI } from "./CampusScene";
import {
  places,
  categories,
  categoryColor,
  tours,
  byId,
  official,
  halls,
  matchesPlace,
} from "./data";
import "./style.css";
import {
  buildingSpecs,
  buildingHeight,
  placeLevel,
  elevationZones,
  floorNumbers,
  levelLabel,
  structureEvidence,
} from "./structure";
import { routeSummary, type RouteMode } from "./pathfinding";
type Tab = "explore" | "routes" | "saved";
function App() {
  const [selected, setSelected] = useState(() => {
    const id = new URLSearchParams(location.search).get("place");
    return places.some((p) => p.id === id) ? id! : "library";
  });
  const [tab, setTab] = useState<Tab>("explore"),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("全部"),
    [labels, setLabels] = useState(true),
    [flat, setFlat] = useState(false),
    [dialog, setDialog] = useState<
      "map" | "info" | "visit" | "structure" | null
    >(null),
    [mapZoom, setMapZoom] = useState(1),
    [sidebar, setSidebar] = useState(false);
  const [heightScale, setHeightScale] = useState(2),
    [sectionFloor, setSectionFloor] = useState<number | null>(null),
    [routeMode, setRouteMode] = useState<RouteMode>("walk"),
    [structureTags, setStructureTags] = useState(true);
  const [detailExpanded, setDetailExpanded] = useState(false),
    [terrainExpanded, setTerrainExpanded] = useState(false),
    [routeExpanded, setRouteExpanded] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const d = JSON.parse(localStorage.getItem("cyut-favorites") ?? "[]");
      return Array.isArray(d)
        ? d.filter(
            (v) => typeof v === "string" && places.some((p) => p.id === v),
          )
        : [];
    } catch {
      return [];
    }
  });
  const [route, setRoute] = useState<string[]>([]),
    [routeTitle, setRouteTitle] = useState(""),
    [start, setStart] = useState("gate"),
    [finish, setFinish] = useState("library"),
    [routeError, setRouteError] = useState(""),
    [playing, setPlaying] = useState(false),
    [progress, setProgress] = useState(0),
    [muted, setMuted] = useState(true),
    [toast, setToast] = useState("");
  const scene = useRef<SceneAPI>(null),
    modal = useRef<HTMLDialogElement>(null),
    search = useRef<HTMLInputElement>(null),
    restoreFocus = useRef<HTMLElement | null>(null);
  const place = byId(selected),
    filtered = places.filter(
      (p) =>
        (category === "全部" || p.category === category) &&
        matchesPlace(p, query),
    );
  const visible =
    tab === "saved"
      ? filtered.filter((p) => favorites.includes(p.id))
      : filtered;
  const buildingId = place.parentId ?? place.id,
    building = buildingSpecs[buildingId],
    routeInfo = routeSummary(route.map(byId), routeMode);
  useEffect(() => {
    try {
      localStorage.setItem("cyut-favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);
  useEffect(() => {
    if (dialog) {
      restoreFocus.current = document.activeElement as HTMLElement;
      modal.current?.showModal();
    } else {
      modal.current?.close();
      restoreFocus.current?.focus();
    }
  }, [dialog]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        setTab("explore");
        setSidebar(true);
        search.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  function select(id: string, focus = true) {
    setDetailExpanded(false);
    setTerrainExpanded(false);
    if ((byId(id).parentId ?? id) !== buildingId) setSectionFloor(null);
    setSelected(id);
    if (focus) scene.current?.focus(id);
    const url = new URL(location.href);
    url.searchParams.set("place", id);
    history.replaceState(null, "", url);
  }
  function changeTab(t: Tab) {
    setTab(t);
    setSidebar(true);
  }
  function beginRoute(ids: string[], title: string) {
    setDetailExpanded(false);
    setTerrainExpanded(false);
    setRouteExpanded(false);
    setSectionFloor(null);
    setRoute(ids);
    setRouteTitle(title);
    setPlaying(false);
    setProgress(0);
    setRouteError("");
    setCategory("全部");
    setQuery("");
    setSidebar(false);
    setLabels(false);
    scene.current?.reset();
  }
  function toggleFavorite(id: string) {
    setFavorites((f) =>
      f.includes(id) ? f.filter((v) => v !== id) : [...f, id],
    );
  }
  function stop() {
    setPlaying(false);
    window.speechSynthesis?.cancel();
  }
  function progressTo(index: number) {
    setProgress(index);
    select(route[index], false);
    if (!muted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const p = byId(route[index]),
        utterance = new SpeechSynthesisUtterance(
          `${p.name}。${p.description.split("。")[0]}。`,
        );
      utterance.lang = "zh-TW";
      window.speechSynthesis.speak(utterance);
    }
  }
  function plan() {
    if (start === finish) {
      setRouteError("請選擇不同的起點與終點。");
      return;
    }
    beginRoute([start, finish], `${byId(start).name} → ${byId(finish).name}`);
  }
  return (
    <div className="app">
      <header className="header">
        <a className="brand" href="./" aria-label="朝陽漫遊首頁">
          <span className="brand-mark">
            <Building2 size={25} />
            <i />
          </span>
          <span>
            <strong>
              朝陽漫遊<span className="brand-dot">.</span>
            </strong>
            <small>CYUT CAMPUS EXPLORER</small>
          </span>
        </a>
        <nav aria-label="主要導覽">
          <button
            className={tab === "explore" ? "nav-active" : ""}
            onClick={() => changeTab("explore")}
          >
            探索校園
          </button>
          <button
            className={tab === "routes" ? "nav-active" : ""}
            onClick={() => changeTab("routes")}
          >
            主題路線
          </button>
          <button onClick={() => setDialog("visit")}>來訪資訊</button>
        </nav>
        <div className="header-right">
          <span className="location">
            <MapPin size={14} />
            臺中・霧峰
          </span>
          <button
            className="official-map"
            onClick={() => {
              setMapZoom(1);
              setDialog("map");
            }}
          >
            <Map size={16} />
            官方校園圖
            <ArrowUpRight size={15} />
          </button>
          <button
            className="icon-btn mobile-menu"
            aria-label="開啟導覽選單"
            onClick={() => setSidebar(!sidebar)}
          >
            <Menu />
          </button>
        </div>
      </header>
      <div className="workspace">
        <aside
          className={`sidebar ${sidebar ? "mobile-open" : ""}`}
          aria-label="校園導覽面板"
        >
          <div className="sidebar-top">
            <div className="eyebrow">YOUR CAMPUS, YOUR WAY</div>
            <h1>
              在朝陽，
              <br />
              發現你的風景<span>。</span>
            </h1>
            <p>
              從第一步開始，讓陌生的校園
              <br />
              成為熟悉的日常。
            </p>
            <button
              className="sidebar-close icon-btn"
              onClick={() => setSidebar(false)}
              aria-label="關閉導覽面板"
            >
              <X size={19} />
            </button>
          </div>
          <div className="panel-tabs">
            <button
              className={tab === "explore" ? "active" : ""}
              onClick={() => setTab("explore")}
            >
              <Compass size={16} />
              探索
            </button>
            <button
              className={tab === "routes" ? "active" : ""}
              onClick={() => setTab("routes")}
            >
              <Route size={16} />
              路線
            </button>
            <button
              className={tab === "saved" ? "active" : ""}
              onClick={() => setTab("saved")}
            >
              <Heart size={16} />
              收藏
              {favorites.length > 0 && (
                <span className="count">{favorites.length}</span>
              )}
            </button>
          </div>
          {tab !== "routes" ? (
            <>
              <div className="search">
                <Search size={17} />
                <input
                  ref={search}
                  aria-label="搜尋建築或地點"
                  placeholder="搜尋建築、地點或教室代碼"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query ? (
                  <button aria-label="清除搜尋" onClick={() => setQuery("")}>
                    <X size={14} />
                  </button>
                ) : (
                  <kbd>/</kbd>
                )}
              </div>
              <div className="filters">
                {["全部", ...categories].map((c) => (
                  <button
                    key={c}
                    className={category === c ? "active" : ""}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="list-heading">
                <span>
                  {tab === "saved" ? "我的收藏" : "校園地點"}
                  <small>{String(visible.length).padStart(2, "0")}</small>
                </span>
                <span>點選以探索</span>
              </div>
              <div className="place-list">
                {visible.map((p) => (
                  <button
                    key={p.id}
                    className={`place-row ${selected === p.id ? "active" : ""}`}
                    onClick={() => {
                      select(p.id);
                      setSidebar(false);
                    }}
                  >
                    <span className="place-index">
                      {String(places.indexOf(p) + 1).padStart(2, "0")}
                    </span>
                    <span className="place-name">
                      <strong>{p.name}</strong>
                      <small>
                        {p.parentId
                          ? `${byId(p.parentId).name} · ${p.floor}${p.room ? ` · ${p.room}` : ""}`
                          : p.en}
                      </small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                ))}
                {visible.length === 0 && (
                  <div className="empty">
                    <Search size={24} />
                    <strong>
                      {tab === "saved" && favorites.length === 0
                        ? "把喜歡的地點留在這裡"
                        : "沒有找到符合的地點"}
                    </strong>
                    <p>
                      {tab === "saved" && favorites.length === 0
                        ? "點選地點卡片的愛心，即可加入收藏。"
                        : "試試「圖書館」、「T1」或更換分類。"}
                    </p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setCategory("全部");
                        setTab("explore");
                      }}
                    >
                      瀏覽所有地點 <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="route-panel">
              <div className="section-label">選一條路線，開始認識朝陽</div>
              {tours.map((t, i) => (
                <button
                  key={t.id}
                  className="tour-card"
                  onClick={() => beginRoute(t.stops, t.title)}
                >
                  <div className={`tour-art art-${i}`}>
                    <span>
                      {i === 0 ? (
                        <Sun size={24} />
                      ) : i === 1 ? (
                        <BookOpen size={24} />
                      ) : (
                        <Leaf size={24} />
                      )}
                    </span>
                    <i />
                    <b>0{i + 1}</b>
                  </div>
                  <div>
                    <span className="tour-tag">
                      {t.tag} · {t.stops.length} 個停留點
                    </span>
                    <h3>
                      {t.title}
                      <ArrowUpRight size={18} />
                    </h3>
                    <p>{t.subtitle}</p>
                  </div>
                </button>
              ))}
              <div className="custom-route">
                <h3>
                  <Route size={17} />
                  安排自己的路線
                </h3>
                <label>
                  起點
                  <select
                    aria-label="路線起點"
                    value={start}
                    onChange={(e) => {
                      setStart(e.target.value);
                      setRouteError("");
                    }}
                  >
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="swap"
                  aria-label="交換起點與終點"
                  onClick={() => {
                    setStart(finish);
                    setFinish(start);
                  }}
                >
                  <ArrowDownUp size={16} />
                </button>
                <label>
                  終點
                  <select
                    aria-label="路線終點"
                    value={finish}
                    onChange={(e) => {
                      setFinish(e.target.value);
                      setRouteError("");
                    }}
                  >
                    {places.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                {routeError && (
                  <p className="form-error" role="alert">
                    {routeError}
                  </p>
                )}
                <button className="primary" onClick={plan}>
                  查看示意路線
                  <ArrowRight size={16} />
                </button>
                <p className="fine-print">
                  路線呈現參訪順序與示意連線；實際動線請參考官方校園圖及現場標示。
                </p>
              </div>
            </div>
          )}
          <div className="sidebar-footer">
            <span className="status-dot" />
            {places.length} 個地點・{halls.length} 處演講廳與禮堂
            <button
              onClick={() => setDialog("info")}
              aria-label="關於本導覽與資料來源"
            >
              <Info size={16} />
            </button>
          </div>
        </aside>
        <main className="map-area">
          <div className="map-heading">
            <div className="eyebrow">CHAOYANG UNIVERSITY OF TECHNOLOGY</div>
            <h2>
              一座校園，無限可能<span>。</span>
            </h2>
            <div className="map-sub">
              <span className="status-dot" />
              立體地形 · 樓層結構 <i /> 尺寸推估
            </div>
          </div>
          <CampusScene
            ref={scene}
            selected={selected}
            filtered={filtered.map((p) => p.id)}
            labels={labels}
            route={route}
            flat={flat}
            playing={playing}
            heightScale={heightScale}
            sectionFloor={sectionFloor}
            routeMode={routeMode}
            structureTags={structureTags}
            onSelect={(id) => select(id)}
            onProgress={progressTo}
            onEnd={stop}
          />
          <div className="map-topright">
            <div className="view-toggle">
              <button
                className={!flat ? "active" : ""}
                onClick={() => setFlat(false)}
              >
                3D 視角
              </button>
              <button
                className={flat ? "active" : ""}
                onClick={() => setFlat(true)}
              >
                俯視
              </button>
              <button
                onClick={() => {
                  setFlat(false);
                  scene.current?.side();
                }}
              >
                側視高差
              </button>
            </div>
            <button
              className={`label-toggle ${labels ? "active" : ""}`}
              aria-label="地點標籤"
              aria-pressed={labels}
              onClick={() => setLabels(!labels)}
            >
              <Layers size={15} />
              <span>地點標籤</span>
            </button>
          </div>
          <section className={`terrain-panel ${!terrainExpanded&&(sectionFloor!==null||route.length>0)?'compact':''} ${terrainExpanded?'mobile-expanded':''}`} aria-label="地形高程控制">
            <div>
              <strong>階地校園</strong>
              <button className="mobile-panel-toggle terrain-toggle" aria-expanded={terrainExpanded} aria-label={terrainExpanded?'收合地形控制':'展開地形控制'} onClick={() => {
                setTerrainExpanded(!terrainExpanded);
                setDetailExpanded(false);
                setRouteExpanded(false);
              }}>
                {terrainExpanded?'收合地形':'地形'} {terrainExpanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
              </button>
              <button onClick={() => setDialog("structure")}>
                圖資與推估 <Info size={12} />
              </button>
            </div>
            <div className="elevation-steps">
              {elevationZones.slice(1).map((z) => (
                <span key={z.id} style={{ borderColor: z.color }}>
                  <b>+{z.level}m</b>
                  <small>第 {z.id} 區</small>
                </span>
              ))}
            </div>
            <label>
              地形垂直顯示
              <select
                aria-label="地形垂直倍率"
                value={heightScale}
                onChange={(e) => setHeightScale(Number(e.target.value))}
              >
                <option value={1}>1×</option>
                <option value={2}>2×（強調高差）</option>
              </select>
            </label>
            <button
              className="structure-tag-toggle"
              aria-pressed={structureTags}
              onClick={() => setStructureTags(!structureTags)}
            >
              {structureTags ? "隱藏" : "顯示"}樓梯標示
            </button>
            <p>區段落差依官方圖 · 相對零點及尺寸推估</p>
          </section>
          <div className="map-tools">
            <button
              title="放大"
              aria-label="放大地圖"
              onClick={() => scene.current?.zoom(1)}
            >
              <Plus size={19} />
            </button>
            <button
              title="縮小"
              aria-label="縮小地圖"
              onClick={() => scene.current?.zoom(-1)}
            >
              <Minus size={19} />
            </button>
            <span />
            <button
              title="重設視角"
              aria-label="重設視角"
              onClick={() => {
                setFlat(false);
                scene.current?.reset();
              }}
            >
              <RotateCcw size={17} />
            </button>
          </div>
          <div className="map-legend">
            <span>
              <i style={{ background: "#b6b5a1" }} />
              教學空間
            </span>
            <span>
              <i style={{ background: "#c9ad87" }} />
              行政與服務
            </span>
            <span>
              <i style={{ background: "#7e9c78" }} />
              運動與綠地
            </span>
          </div>
          <div className="orientation">
            <Compass size={29} strokeWidth={1} />
            <span>依校園圖配置</span>
          </div>
          <article className={`detail-card ${detailExpanded?'expanded':''}`} key={selected} aria-label="地點詳情">
            <div className="detail-overline">
              <span>
                <i style={{ background: categoryColor[place.category] }} />
                {place.category}
              </span>
              <div className="detail-controls">
              <button className="mobile-panel-toggle" aria-expanded={detailExpanded} aria-controls="place-detail-body" onClick={() => {
                setDetailExpanded(!detailExpanded);
                setTerrainExpanded(false);
              }}>
                {detailExpanded?'收合詳情':'展開詳情'} {detailExpanded?<ChevronDown size={15}/>:<ChevronUp size={15}/>}
              </button>
              <button
                aria-label={
                  favorites.includes(selected) ? "取消收藏" : "收藏此地點"
                }
                aria-pressed={favorites.includes(selected)}
                onClick={() => toggleFavorite(selected)}
                className={`icon-btn heart ${favorites.includes(selected) ? "saved" : ""}`}
              >
                <Heart
                  size={18}
                  fill={favorites.includes(selected) ? "currentColor" : "none"}
                />
              </button>
              </div>
            </div>
            <div className="detail-title">
              <span>{String(places.indexOf(place) + 1).padStart(2, "0")}</span>
              <h2>
                {place.name}
                <small>{place.en}</small>
              </h2>
            </div>
            <div className="detail-body" id="place-detail-body">
            <p>{place.description}</p>
            <div className="highlights">
              {place.highlights.map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
            {building && (
              <section className="structure-card" aria-label="建築樓層結構">
                <div>
                  <strong>樓層與結構</strong>
                  <span>
                    {building.floors}F
                    {building.basements ? ` / B${building.basements}` : ""}
                  </span>
                </div>
                <label>
                  建築剖視
                  <select
                    aria-label="建築樓層剖視"
                    value={sectionFloor ?? "all"}
                    onChange={(e) =>
                      setSectionFloor(
                        e.target.value === "all"
                          ? null
                          : Number(e.target.value),
                      )
                    }
                  >
                    <option value="all">完整外觀</option>
                    {floorNumbers(building).map((f) => (
                      <option key={f} value={f}>
                        {levelLabel(f)} 剖視
                      </option>
                    ))}
                  </select>
                </label>
                {place.parentId && (
                  <button
                    onClick={() =>
                      setSectionFloor(parseInt(place.floor ?? "1"))
                    }
                  >
                    查看 {place.floor} 廳館樓層 <Layers size={13} />
                  </button>
                )}
                <small>
                  區域相對高程 +{building.level}m · 層高與室內梯間推估
                </small>
                {sectionFloor !== null && (
                  <p>
                    剖視顯示樓板、柱、兩跑樓梯與電梯核心；平面配置及房間位置未測繪。
                  </p>
                )}
              </section>
            )}
            {place.parentId ? (
              <div className="indoor-location">
                <MapPin size={14} />
                <span>
                  {byId(place.parentId).name} · {place.floor}
                  {place.room ? ` · ${place.room}` : ""}
                  <small>標記呈現所在樓層；房間精確位置未測繪。</small>
                </span>
                <button onClick={() => select(place.parentId!)}>
                  查看大樓
                  <ChevronRight size={13} />
                </button>
              </div>
            ) : (
              halls.some((h) => h.parentId === place.id) && (
                <div className="building-halls">
                  <span>本棟演講廳與禮堂</span>
                  <div>
                    {halls
                      .filter((h) => h.parentId === place.id)
                      .map((h) => (
                        <button key={h.id} onClick={() => select(h.id)}>
                          {h.room ?? h.floor} · {h.name}
                          <ChevronRight size={12} />
                        </button>
                      ))}
                  </div>
                </div>
              )
            )}
            <div className="detail-actions">
              <button
                className="primary"
                onClick={() => {
                  changeTab("routes");
                  setFinish(selected);
                }}
              >
                <Route size={16} />
                規劃參訪
                <ArrowRight size={16} />
              </button>
              <a href={place.source} target="_blank" rel="noreferrer">
                官方資訊
                <ArrowUpRight size={15} />
              </a>
            </div>
            </div>
          </article>
          {route.length > 0 && (
            <section className={`route-player ${routeExpanded?'expanded':''}`} aria-label="參訪路線">
              <div className="route-player-head">
                <span>
                  <Route size={16} />
                  {routeTitle}
                </span>
                <button className="mobile-panel-toggle" aria-expanded={routeExpanded} onClick={() => {
                  setRouteExpanded(!routeExpanded);
                  setTerrainExpanded(false);
                }}>
                  {routeExpanded?'收合路線':'展開路線'} {routeExpanded?<ChevronDown size={14}/>:<ChevronUp size={14}/>}
                </button>
                <button
                  className="icon-btn"
                  aria-label="關閉路線"
                  onClick={() => {
                    stop();
                    setRoute([]);
                    setLabels(true);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="route-stops">
                {route.map((id, i) => (
                  <React.Fragment key={`${id}-${i}`}>
                    <button
                      className={progress === i ? "current" : ""}
                      onClick={() => {
                        stop();
                        setProgress(i);
                        select(id);
                      }}
                    >
                      <span>{i + 1}</span>
                      {byId(id).name}
                    </button>
                    {i < route.length - 1 && <ChevronRight size={13} />}
                  </React.Fragment>
                ))}
              </div>
              <div className="play-controls">
                <button
                  className="play-button"
                  onClick={() => {
                    if (playing) stop();
                    else {
                      setPlaying(true);
                    }
                  }}
                >
                  {playing ? <Pause size={15} /> : <Play size={15} />}{" "}
                  {playing ? "暫停導覽" : "播放導覽"}
                </button>
                <button
                  className="voice"
                  aria-label={muted ? "開啟語音導覽" : "關閉語音導覽"}
                  aria-pressed={!muted}
                  onClick={() => {
                    if (!muted) window.speechSynthesis?.cancel();
                    setMuted(!muted);
                  }}
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <small>參訪順序・路線為示意</small>
              </div>
              <div className="route-mode-control">
                <button
                  className={routeMode === "walk" ? "active" : ""}
                  onClick={() => setRouteMode("walk")}
                >
                  一般步行
                </button>
                <button
                  className={routeMode === "avoid-stairs" ? "active" : ""}
                  onClick={() => setRouteMode("avoid-stairs")}
                >
                  避開樓梯（示意）
                </button>
                <span>
                  階梯 {routeInfo.stairs} 段 · 坡道 {routeInfo.slopes} 段
                </span>
              </div>
              <p className="route-height-note">
                路線隨模型高程起伏；避階示意不代表已驗證的無障礙通路。
              </p>
            </section>
          )}
          <div className="map-bottom">
            <span>拖曳旋轉 · 滾輪縮放 · 點選建築探索</span>
            <button onClick={() => setDialog("info")}>
              示意圖與資料說明
              <Info size={13} />
            </button>
          </div>
          <button className="mobile-explore" onClick={() => setSidebar(true)}>
            <Search size={18} />
            探索地點與路線
          </button>
        </main>
      </div>
      <footer className="footer">
        <span>
          朝陽科技大學 <i /> Chaoyang University of Technology
        </span>
        <span>
          臺中市霧峰區吉峰東路 168 號 <i />
          <a href="tel:+886423323000">04-2332-3000</a>
        </span>
        <a href={official.home} target="_blank" rel="noreferrer">
          前往學校官網
          <ArrowUpRight size={13} />
        </a>
      </footer>
      <dialog
        ref={modal}
        onCancel={() => setDialog(null)}
        onClick={(e) => {
          if (e.target === modal.current) setDialog(null);
        }}
        className={dialog === "map" ? "map-dialog" : ""}
      >
        <div className="dialog-head">
          <div>
            <span className="eyebrow">CYUT CAMPUS EXPLORER</span>
            <h2>
              {dialog === "map"
                ? "官方校園平面圖"
                : dialog === "structure"
                  ? "校園高程與結構依據"
                  : dialog === "visit"
                    ? "下一站，朝陽。"
                    : "關於這份校園導覽"}
            </h2>
          </div>
          <button
            className="icon-btn"
            aria-label="關閉視窗"
            onClick={() => setDialog(null)}
          >
            <X />
          </button>
        </div>
        {dialog === "map" ? (
          <>
            <div className="map-dialog-tools">
              <span>圖像來源：朝陽科技大學官方網站</span>
              <div>
                <button
                  onClick={() => setMapZoom(Math.max(0.5, mapZoom - 0.25))}
                  aria-label="縮小官方校園圖"
                >
                  <Minus size={18} />
                </button>
                <button
                  onClick={() => setMapZoom(Math.min(3, mapZoom + 0.25))}
                  aria-label="放大官方校園圖"
                >
                  <Plus size={18} />
                </button>
                <a href={official.map} target="_blank" rel="noreferrer">
                  開啟原始網頁
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            <div className="official-image">
              <img
                src="./assets/official-campus-map.jpg"
                alt="朝陽科技大學官方校園平面圖，標示建築、運動設施、停車場及校門位置"
                style={{ width: `${mapZoom * 100}%` }}
              />
            </div>
          </>
        ) : dialog === "structure" ? (
          <div className="dialog-body">
            <h3>官方圖可確認的區段落差</h3>
            <p>{structureEvidence.confirmed}</p>
            <table className="height-table">
              <thead>
                <tr>
                  <th>區段</th>
                  <th>圖示落差</th>
                  <th>模型相對高程</th>
                </tr>
              </thead>
              <tbody>
                {elevationZones.slice(1).map((z) => (
                  <tr key={z.id}>
                    <td>{z.name}</td>
                    <td>{z.rise}m</td>
                    <td>+{z.level}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              相對高程為依區段順序累加的模型設定，不是校方提供的絕對標高；地形預設以
              2× 垂直倍率呈現，可切回 1×。
            </p>
            <h3>重建內容與推估範圍</h3>
            <p>
              地形、階地、坡道、中央階梯、建築翼樓、中庭、入口門廊、樓板、梁柱、兩跑樓梯、平台與電梯核心。樓層及廳館所在樓層可由官方資料核對；
              {structureEvidence.inferred}
            </p>
            <p>
              剖視是用來理解樓層關係的結構示意，未提供精確室內房間平面或逐步室內導航。
            </p>
            <div className="source-links">
              <a
                href={structureEvidence.access}
                target="_blank"
                rel="noreferrer"
              >
                官方無障礙設施圖（含區段落差）
                <ArrowUpRight size={14} />
              </a>
              <a
                href={structureEvidence.perspective}
                target="_blank"
                rel="noreferrer"
              >
                官方校園透視圖
                <ArrowUpRight size={14} />
              </a>
              <a
                href={structureEvidence.floors}
                target="_blank"
                rel="noreferrer"
              >
                官方各大樓樓層簡介
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        ) : dialog === "visit" ? (
          <div className="dialog-body">
            <div className="visit-banner">
              <Navigation size={32} />
              <div>
                <h3>朝陽科技大學</h3>
                <p>413310 臺中市霧峰區吉峰東路 168 號</p>
              </div>
            </div>
            <h3>抵達校園</h3>
            <p>搭車前請查詢當日班次；開車入校請依校門管制站與停車場指示。</p>
            <div className="link-grid">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=朝陽科技大學%20臺中市霧峰區吉峰東路168號"
                target="_blank"
                rel="noreferrer"
              >
                <MapPin size={20} />
                <span>
                  開啟 Google 地圖<small>查詢前往學校的路線</small>
                </span>
                <ArrowUpRight size={16} />
              </a>
              <a href={official.transport} target="_blank" rel="noreferrer">
                <Route size={20} />
                <span>
                  官方交通資訊<small>交通示意圖與校園位置</small>
                </span>
                <ArrowUpRight size={16} />
              </a>
              <a href={official.access} target="_blank" rel="noreferrer">
                <Map size={20} />
                <span>
                  無障礙設施導覽<small>請依官方圖與現場狀況規劃</small>
                </span>
                <ArrowUpRight size={16} />
              </a>
            </div>
            <h3>聯絡學校</h3>
            <p>
              總機 <a href="tel:+886423323000">04-2332-3000</a>
              <br />
              校安中心及學生緊急事故通報{" "}
              <a href="tel:+886423320808">04-2332-0808</a>
            </p>
            <p className="fine-print">
              地址與聯絡資訊依學校官網，更新核對日期：2026 年 10 月 29 日。
            </p>
          </div>
        ) : (
          <div className="dialog-body">
            <p>
              本導覽參考 sch_city 套件的 Three.js 校園互動與 A*
              尋路概念，以繁體中文重新製作朝陽科技大學版本。這是非官方的校園探索作品。
            </p>
            <h3>地圖怎麼使用</h3>
            <p>
              拖曳旋轉、滾輪縮放，點選地點或建築查看介紹。可依分類搜尋、收藏地點，或播放主題路線；語音功能視瀏覽器支援情況而定。
            </p>
            <h3>示意範圍</h3>
            <p>
              建築量體、比例、樹木與路網為依官方校園圖整理的視覺示意，並非測繪模型。路線僅供理解參訪順序，不提供精確距離、步行時間、無障礙保證或即時定位；實際通行請依官方圖、現場標示與管制。
            </p>
            <h3>官方資料來源</h3>
            <div className="source-links">
              {[
                ["校園平面圖", official.map],
                ["各大樓樓層介紹", official.floors],
                [
                  "演講廳與禮堂位置（114 學年度）",
                  "https://www.cyut.edu.tw/114gra/",
                ],
                [
                  "圖書館演講廳場地介紹",
                  "https://cyutis.cyut.edu.tw/TSLibrarySpace/Home/SiteIntro",
                ],
                ["波錠紀念圖書館", "https://www.lib.cyut.edu.tw/"],
                ["電腦教室分布", "https://pmlis.cyut.edu.tw/pcroom.php"],
                ["學校官網與聯絡資訊", official.home],
              ].map(([label, url]) => (
                <a href={url} target="_blank" rel="noreferrer" key={url}>
                  {label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            </div>
            <p className="fine-print">
              資料核對：2026-10-29。開放時間與設施使用規定依校方最新公告。參考套件：
              <a
                href="https://github.com/Lucky-dogz/sch_city"
                target="_blank"
                rel="noreferrer"
              >
                Lucky-dogz / sch_city
              </a>
              。
            </p>
          </div>
        )}
      </dialog>
      {toast && (
        <div role="status" className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
