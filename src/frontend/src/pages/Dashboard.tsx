import { useDataStore } from "@/stores/useDataStore";
import type { ColumnStat, DashboardConfig, ParsedDataset } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  DollarSign,
  Package,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Tooltip Style ────────────────────────────────────────────────────────────
const TT = {
  contentStyle: {
    background: "oklch(0.118 0.016 266 / 0.97)",
    border: "1px solid oklch(0.22 0.018 266 / 0.6)",
    borderRadius: "0.75rem",
    backdropFilter: "blur(20px)",
    color: "oklch(0.96 0.008 240)",
    fontSize: "0.78rem",
    padding: "8px 12px",
  },
  labelStyle: { color: "oklch(0.71 0.22 240)", fontWeight: 600 },
  itemStyle: { color: "oklch(0.96 0.008 240)" },
};

const CHART_COLORS = ["#4A7FA7","#7C5CBF","#3BAD7A","#E8A820","#E85D75","#5BC4C0"];
const DONUT_COLORS = ["#4A7FA7","#7C5CBF","#E8A820","#E85D75","#3BAD7A","#5BC4C0"];

// ─── Mock Dataset (shown when no file uploaded) ───────────────────────────────
const MOCK_MONTHLY = [
  {month:"Jan",Revenue:4.2,Expenses:3.1,Profit:1.1,Orders:312},
  {month:"Feb",Revenue:4.8,Expenses:3.3,Profit:1.5,Orders:347},
  {month:"Mar",Revenue:5.1,Expenses:3.4,Profit:1.7,Orders:389},
  {month:"Apr",Revenue:4.7,Expenses:3.5,Profit:1.2,Orders:356},
  {month:"May",Revenue:5.6,Expenses:3.6,Profit:2.0,Orders:421},
  {month:"Jun",Revenue:6.2,Expenses:3.8,Profit:2.4,Orders:468},
  {month:"Jul",Revenue:6.8,Expenses:4.0,Profit:2.8,Orders:512},
  {month:"Aug",Revenue:7.1,Expenses:4.1,Profit:3.0,Orders:534},
  {month:"Sep",Revenue:6.5,Expenses:4.0,Profit:2.5,Orders:490},
  {month:"Oct",Revenue:7.4,Expenses:4.2,Profit:3.2,Orders:561},
  {month:"Nov",Revenue:8.2,Expenses:4.4,Profit:3.8,Orders:623},
  {month:"Dec",Revenue:9.1,Expenses:4.7,Profit:4.4,Orders:714},
];
const MOCK_FORECAST = [
  {month:"Oct",Actual:7.4,Forecast:null},
  {month:"Nov",Actual:8.2,Forecast:null},
  {month:"Dec",Actual:9.1,Forecast:null},
  {month:"Jan",Actual:null,Forecast:9.8},
  {month:"Feb",Actual:null,Forecast:10.6},
  {month:"Mar",Actual:null,Forecast:11.4},
  {month:"Apr",Actual:null,Forecast:12.1},
];
const MOCK_CATEGORY = [
  {name:"Electronics",value:34,color:"#4A7FA7"},
  {name:"Apparel",    value:22,color:"#7C5CBF"},
  {name:"Home",       value:18,color:"#E8A820"},
  {name:"Beauty",     value:14,color:"#E85D75"},
  {name:"Sports",     value:12,color:"#3BAD7A"},
];
const MOCK_KPIS = [
  {id:"revenue",  title:"Total Revenue",    value:"₹75.7L", change:"+18.3%",trend:"up",   sub:"vs last year",     icon:DollarSign},
  {id:"profit",   title:"Net Profit",       value:"₹27.6L", change:"+24.1%",trend:"up",   sub:"margin 36.4%",     icon:TrendingUp},
  {id:"orders",   title:"Total Orders",     value:"5,727",  change:"+12.7%",trend:"up",   sub:"avg ₹13,217/order",icon:Package},
  {id:"customers",title:"Active Customers", value:"11,842", change:"+9.4%", trend:"up",   sub:"↑ 847 this month",  icon:Users},
  {id:"aov",      title:"Avg Order Value",  value:"₹13,217",change:"+4.8%", trend:"up",   sub:"target ₹14,000",   icon:Target},
  {id:"returns",  title:"Return Rate",      value:"3.2%",   change:"-0.8%", trend:"up",   sub:"industry avg 5.1%",icon:BarChart2},
];
const MOCK_INSIGHTS = [
  "Revenue grew 18.3% YoY — December peak of ₹9.1L is the strongest month. 📈 Q4 is your power quarter.",
  "Electronics contributes 34% of revenue. SmartHome Hub growing at 22% — consider scaling inventory. 🔥",
  "Return rate at 3.2% is well below industry average of 5.1% — excellent product-market fit. 👑",
  "Forecast predicts ₹12.1L revenue by April — maintain current growth trajectory, mere aaka. ✨",
];
const MOCK_TABLE = [
  {name:"ProX Laptop 15\"",  cat:"Electronics",rev:"₹18.4L",units:412, growth:"+14%",trend:"up"},
  {name:"Urban Tee Co.",     cat:"Apparel",    rev:"₹12.1L",units:893, growth:"+8%", trend:"up"},
  {name:"SmartHome Hub",     cat:"Electronics",rev:"₹10.7L",units:287, growth:"+22%",trend:"up"},
  {name:"Glow Serum Kit",    cat:"Beauty",     rev:"₹8.9L", units:641, growth:"+31%",trend:"up"},
  {name:"AirPod Max Clone",  cat:"Electronics",rev:"₹7.4L", units:198, growth:"-3%", trend:"down"},
  {name:"Yoga Pro Mat",      cat:"Sports",     rev:"₹5.2L", units:504, growth:"+9%", trend:"up"},
];

// ─── Derive real dashboard data from uploaded CSV/PDF ─────────────────────────
function deriveFromDataset(dataset: ParsedDataset, dashboard: DashboardConfig) {
  const { rows, columnStats } = dataset;
  const numericCols = columnStats.filter((c: ColumnStat) => c.dataType === "number").map((c: ColumnStat) => c.columnName);
  const textCols    = columnStats.filter((c: ColumnStat) => c.dataType === "text").map((c: ColumnStat) => c.columnName);

  // ── KPIs from dashboard config ──────────────────────────────────────────────
  const kpiIcons = [DollarSign, TrendingUp, Package, Users, Target, BarChart2];
  const kpis = dashboard.kpis.map((k, i) => ({
    id: `kpi_${i}`,
    title: k.title,
    value: k.value,
    change: k.change,
    trend: k.trend as "up" | "down" | "neutral",
    sub: `${k.trend === "up" ? "↑" : k.trend === "down" ? "↓" : "—"} from first row`,
    icon: kpiIcons[i % kpiIcons.length],
  }));

  // Pad to 6 KPIs if fewer numeric columns
  while (kpis.length < 6 && numericCols.length > kpis.length) {
    const col = numericCols[kpis.length];
    const stat = columnStats.find((c: ColumnStat) => c.columnName === col);
    if (stat) {
      kpis.push({
        id: `kpi_extra_${kpis.length}`,
        title: col,
        value: stat.max ?? "—",
        change: "—",
        trend: "neutral",
        sub: `max: ${stat.max}`,
        icon: kpiIcons[kpis.length % kpiIcons.length],
      });
    }
  }

  // ── Bar / Line chart data — numeric cols over row index (up to 30 rows) ─────
  const sliceRows = rows.slice(0, 30);
  const labelCol  = textCols[0] ?? null;
  const barCols   = numericCols.slice(0, 3);
  const barData   = sliceRows.map((r, i) => {
    const obj: Record<string, string | number> = {
      label: labelCol ? String(r[labelCol] ?? i + 1).slice(0, 10) : `R${i + 1}`,
    };
    for (const c of barCols) obj[c] = Number(r[c] ?? 0);
    return obj;
  });

  // ── Donut — categorical distribution ─────────────────────────────────────────
  let donutData: {name: string; value: number; color: string}[] = [];
  const catCol = textCols.find((col) => {
    const stat = columnStats.find((c: ColumnStat) => c.columnName === col);
    return stat?.uniqueValues && stat.uniqueValues.length >= 2 && stat.uniqueValues.length <= 12;
  });
  if (catCol) {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const val = String(row[catCol] ?? "Other");
      counts[val] = (counts[val] ?? 0) + 1;
    }
    donutData = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({
        name: name.slice(0, 16),
        value,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }));
    // Convert to percentage
    const total = donutData.reduce((s, d) => s + d.value, 0);
    donutData = donutData.map((d) => ({ ...d, value: Math.round((d.value / total) * 100) }));
  } else if (numericCols.length >= 2) {
    // fallback: show share of totals of numeric cols
    donutData = numericCols.slice(0, 5).map((col, i) => {
      const stat = columnStats.find((c: ColumnStat) => c.columnName === col);
      const total = rows.reduce((s, r) => s + Number(r[col] ?? 0), 0);
      return { name: col.slice(0, 16), value: Math.round(total), color: DONUT_COLORS[i] };
    });
    const grandTotal = donutData.reduce((s, d) => s + d.value, 0);
    donutData = donutData.map((d) => ({ ...d, value: Math.round((d.value / grandTotal) * 100) }));
  }

  // ── Forecast — use last 3 actual rows + project 4 more ──────────────────────
  const forecastCol   = numericCols[0];
  const actualRows    = rows.slice(-4);
  const forecastLabel = labelCol ?? null;
  const lastVals      = actualRows.map((r) => Number(r[forecastCol] ?? 0));
  const avgGrowth     = lastVals.length > 1
    ? lastVals.reduce((s, v, i) => (i === 0 ? 0 : s + (v - lastVals[i - 1])), 0) / (lastVals.length - 1)
    : 0;

  const forecastData = [
    ...actualRows.map((r, i) => ({
      label: forecastLabel ? String(r[forecastLabel] ?? `R${i + 1}`).slice(0, 6) : `R${rows.length - 3 + i}`,
      Actual: Number(r[forecastCol] ?? 0),
      Forecast: null as number | null,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      label: `+${i + 1}`,
      Actual: null as number | null,
      Forecast: Math.round((lastVals[lastVals.length - 1] + avgGrowth * (i + 1)) * 100) / 100,
    })),
  ];

  // ── Table — top rows by first numeric column ──────────────────────────────
  const tableCol = numericCols[0];
  const tableRows = [...rows]
    .sort((a, b) => Number(b[tableCol] ?? 0) - Number(a[tableCol] ?? 0))
    .slice(0, 6)
    .map((r, i) => {
      const prevVal = rows[Math.max(0, rows.indexOf(r) - 1)];
      const curr    = Number(r[tableCol] ?? 0);
      const prev    = prevVal ? Number(prevVal[tableCol] ?? curr) : curr;
      const pct     = prev !== 0 ? (((curr - prev) / Math.abs(prev)) * 100).toFixed(1) : "0.0";
      const colLabel = textCols[0] ? String(r[textCols[0]] ?? `Row ${i + 1}`).slice(0, 24) : `Row ${i + 1}`;
      return {
        name: colLabel,
        cat: textCols[1] ? String(r[textCols[1]] ?? "—").slice(0, 14) : "—",
        rev: curr >= 1_000_000 ? `${(curr / 1_000_000).toFixed(1)}M` : curr >= 1000 ? `${(curr / 1000).toFixed(1)}K` : String(curr),
        units: i + 1,
        growth: `${Number(pct) >= 0 ? "+" : ""}${pct}%`,
        trend: Number(pct) >= 0 ? "up" : "down",
      };
    });

  return { kpis, barData, barCols, donutData, forecastData, forecastCol, tableRows };
}

// ─── Range Tabs ───────────────────────────────────────────────────────────────
const RANGE_OPTIONS = ["10R","20R","All"] as const;
type Range = typeof RANGE_OPTIONS[number];

function RangeTabs({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <div className="flex items-center gap-1 bg-background/40 rounded-lg p-0.5 border border-border/30">
      {RANGE_OPTIONS.map((r) => (
        <button key={r} type="button" onClick={() => onChange(r)}
          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${value === r ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"}`}>
          {r}
        </button>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ kpi, i }: { kpi: typeof MOCK_KPIS[0]; i: number }) {
  const Icon = kpi.icon;
  const isUp = kpi.trend === "up";
  const isNeutral = kpi.trend === "neutral";
  return (
    <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, delay: i*0.07 }}
      className="glass rounded-2xl p-5 genie-glow flex flex-col gap-2" data-ocid={`dashboard.kpi_${kpi.id}.card`}>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider truncate pr-2">{kpi.title}</span>
        <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      </div>
      <div className="font-display font-bold text-2xl tracking-tight text-card-foreground truncate">{kpi.value}</div>
      <div className="flex items-center justify-between gap-1">
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
          isNeutral ? "bg-muted text-muted-foreground" :
          isUp ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
          {!isNeutral && (isUp ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>)}
          {kpi.change}
        </span>
        <span className="text-xs text-muted-foreground truncate">{kpi.sub}</span>
      </div>
    </motion.div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children, ocid, action }: {
  title: string; subtitle?: string; children: React.ReactNode; ocid?: string; action?: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
      transition={{ duration:0.4 }} className="glass rounded-2xl p-5" data-ocid={ocid}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h2 className="font-display font-semibold text-sm text-card-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

// ─── Mock Data Banner ─────────────────────────────────────────────────────────
function MockBanner({ onNav, onDismiss }: { onNav: () => void; onDismiss: () => void }) {
  return (
    <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
      className="glass rounded-2xl px-4 py-3 border border-primary/20 flex items-center justify-between gap-3"
      data-ocid="dashboard.mock_data_banner">
      <div className="flex items-center gap-2.5 min-w-0">
        <Sparkles className="w-4 h-4 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground truncate">
          <span className="text-card-foreground font-medium">Showing sample data.</span>{" "}
          Upload your CSV or PDF to see live KPIs from your actual data.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" onClick={onNav}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg gradient-accent text-primary-foreground hover:opacity-90 transition-opacity"
          data-ocid="dashboard.upload_data_button">Upload Data</button>
        <button type="button" onClick={onDismiss} className="text-muted-foreground hover:text-card-foreground transition-colors p-1" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { isGenerating, activeDashboard, parsedDataset } = useDataStore();
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [range, setRange] = useState<Range>("All");

  const hasRealData = !!activeDashboard && !!parsedDataset;

  const greeting = ["Salaam, Mere Aaka ✨","Jo Hukum Mere Aaka ✨","Farmaiye, Mere Aaka ✨","Hukum Kijiye ✨"][
    new Date().getMinutes() % 4
  ];

  // Derive real data only when available
  const real = useMemo(() => {
    if (!hasRealData) return null;
    return deriveFromDataset(parsedDataset!, activeDashboard!);
  }, [hasRealData, parsedDataset, activeDashboard]);

  // Slice rows for bar/line chart based on range
  const allBarData  = real ? real.barData : MOCK_MONTHLY.map((d) => ({ ...d, label: d.month }));
  const slicedBar   = range === "10R" ? allBarData.slice(-10) : range === "20R" ? allBarData.slice(-20) : allBarData;
  const barKeys     = real ? real.barCols : ["Revenue","Expenses","Profit"];
  const donutData   = real ? real.donutData : MOCK_CATEGORY;
  const forecastData = real ? real.forecastData : MOCK_FORECAST;
  const forecastY1  = real ? "Actual" : "Actual";
  const forecastY2  = real ? "Forecast" : "Forecast";
  const kpis        = (real ? real.kpis : MOCK_KPIS).slice(0, 6);
  const insights    = real ? (activeDashboard!.aiInsights ?? MOCK_INSIGHTS) : MOCK_INSIGHTS;
  const tableRows   = real ? real.tableRows : MOCK_TABLE;
  const tableTitle  = real ? `Top Rows by ${real.barCols[0] ?? "Value"}` : "Top Products by Revenue";
  const fileName    = activeDashboard ? parsedDataset?.headers?.length
    ? `${parsedDataset.headers.length} columns · ${parsedDataset.rows.length} rows`
    : "" : "";

  return (
    <div className="space-y-5" data-ocid="dashboard.page">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold gradient-text">{greeting}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {hasRealData
              ? `Live Dashboard · ${fileName}`
              : "Business Intelligence Overview · FY 2024–25"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasRealData && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Live Data
            </span>
          )}
          <button type="button" onClick={() => navigate({ to: "/upload-data" })}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all"
            data-ocid="dashboard.upload_new_file_button">
            <Upload className="w-3.5 h-3.5" />
            {hasRealData ? "Upload New File" : "Upload Data"}
          </button>
        </div>
      </motion.div>

      {/* Mock data banner */}
      <AnimatePresence>
        {!bannerDismissed && !hasRealData && !isGenerating && (
          <MockBanner key="mock-banner"
            onNav={() => navigate({ to: "/upload-data" })}
            onDismiss={() => setBannerDismissed(true)} />
        )}
      </AnimatePresence>

      {/* KPIs */}
      <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3" data-ocid="dashboard.kpi.section">
        {kpis.map((k, i) => <KpiCard key={k.id} kpi={k as typeof MOCK_KPIS[0]} i={i} />)}
      </section>

      {/* 4 Charts — 2x2 grid */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4" data-ocid="dashboard.charts.section">

        {/* Chart 1 — Bar */}
        <SectionCard
          title={hasRealData ? `${barKeys.slice(0,3).join(" vs ")}` : "Revenue vs Expenses vs Profit"}
          subtitle={hasRealData ? "From your uploaded data" : "Monthly comparison (₹ in Lakhs)"}
          ocid="dashboard.bar_chart.card"
          action={hasRealData ? <RangeTabs value={range} onChange={setRange} /> : undefined}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={slicedBar} margin={{ top:4, right:4, left:-20, bottom:0 }} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.018 266 / 0.4)" />
              <XAxis dataKey="label" tick={{ fill:"oklch(0.62 0.01 240)", fontSize:10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill:"oklch(0.62 0.01 240)", fontSize:10 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => hasRealData ? (v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)) : `₹${v}L`} />
              <Tooltip {...TT} formatter={(v: number, n: string) => [hasRealData ? v : `₹${v}L`, n]} />
              <Legend wrapperStyle={{ fontSize:11, color:"oklch(0.62 0.01 240)" }} />
              {barKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[i]} radius={[3,3,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Chart 2 — Donut */}
        <SectionCard
          title={hasRealData ? "Category Distribution" : "Revenue by Category"}
          subtitle={hasRealData ? "% share from your data" : "% share of total revenue"}
          ocid="dashboard.donut_chart.card">
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={82}
                paddingAngle={3} dataKey="value" labelLine={false}>
                {donutData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TT.contentStyle} formatter={(v: number, n: string) => [`${v}%`, n]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11, color:"oklch(0.62 0.01 240)" }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Chart 3 — Line */}
        <SectionCard
          title={hasRealData ? `${barKeys[0] ?? "Value"} Trend` : "Revenue vs Profit Trend"}
          subtitle={hasRealData ? "From your uploaded data" : "Monthly actual (₹ in Lakhs)"}
          ocid="dashboard.revenue_chart.card">
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={slicedBar} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.018 266 / 0.4)" />
              <XAxis dataKey="label" tick={{ fill:"oklch(0.62 0.01 240)", fontSize:10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill:"oklch(0.62 0.01 240)", fontSize:10 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => hasRealData ? (v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)) : `₹${v}L`} />
              <Tooltip {...TT} formatter={(v: number, n: string) => [hasRealData ? v : `₹${v}L`, n]} />
              <Legend wrapperStyle={{ fontSize:11, color:"oklch(0.62 0.01 240)" }} />
              {barKeys.slice(0,2).map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i]}
                  strokeWidth={i === 0 ? 2.5 : 2} strokeDasharray={i > 0 ? "5 4" : undefined}
                  dot={false} activeDot={{ r:5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Chart 4 — Forecast */}
        <SectionCard
          title={hasRealData ? `${real?.forecastCol ?? "Value"} Forecast` : "Revenue Forecast"}
          subtitle={hasRealData ? "Last 4 rows + AI projected next 4" : "Actual + AI-projected Q1 2025"}
          ocid="dashboard.forecast_chart.card">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={forecastData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4A7FA7" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#4A7FA7" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#E8A820" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E8A820" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0.018 266 / 0.4)" />
              <XAxis dataKey={hasRealData ? "label" : "month"}
                tick={{ fill:"oklch(0.62 0.01 240)", fontSize:10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill:"oklch(0.62 0.01 240)", fontSize:10 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => hasRealData ? (v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)) : `₹${v}L`} />
              <Tooltip {...TT} formatter={(v: number, n: string) => [hasRealData ? v : `₹${v}L`, n]} />
              <Legend wrapperStyle={{ fontSize:11, color:"oklch(0.62 0.01 240)" }} />
              <Area type="monotone" dataKey={forecastY1} stroke="#4A7FA7" strokeWidth={2.5}
                fill="url(#actualGrad)" dot={{ r:3, fill:"#4A7FA7" }} connectNulls={false} />
              <Area type="monotone" dataKey={forecastY2} stroke="#E8A820" strokeWidth={2}
                fill="url(#forecastGrad)" strokeDasharray="6 4" dot={{ r:3, fill:"#E8A820" }} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

      </section>

      {/* Top Records Table */}
      <SectionCard title={tableTitle}
        subtitle={hasRealData ? `Sorted by highest ${real?.barCols[0] ?? "value"}` : "Ranked by FY 2024–25 revenue"}
        ocid="dashboard.top_products.section">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                {["#","Name", hasRealData ? "Category" : "Category", "Value","Rank","Growth"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((p, i) => (
                <motion.tr key={`${p.name}-${i}`}
                  initial={{ opacity:0, x:-10 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ delay: i*0.05 }}
                  className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                  <td className="py-3 pr-4 text-muted-foreground text-xs">{i+1}</td>
                  <td className="py-3 pr-4 font-medium text-card-foreground max-w-[160px] truncate">{p.name}</td>
                  <td className="py-3 pr-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/80 truncate">{p.cat}</span>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-card-foreground">{p.rev}</td>
                  <td className="py-3 pr-4 text-muted-foreground">#{p.units}</td>
                  <td className="py-3">
                    <span className={`flex items-center gap-1 text-xs font-semibold w-fit px-2 py-0.5 rounded-full ${
                      p.trend === "up" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                      {p.trend === "up" ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                      {p.growth}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Genie Insights */}
      <SectionCard title="Genie Insights ✨"
        subtitle={hasRealData ? "AI analysis of your uploaded data" : "AI-generated analysis of sample data"}
        ocid="dashboard.insights.section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((text, i) => (
            <motion.div key={text.slice(0,20)}
              initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }} transition={{ delay: i*0.08 }}
              className="glass rounded-xl px-4 py-3 flex gap-3 items-start border-l-2 border-primary/50"
              data-ocid={`dashboard.insight.item.${i+1}`}>
              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </SectionCard>

    </div>
  );
}
