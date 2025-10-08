import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Treemap,
} from "recharts";
import {
  Database,
  Activity,
  Bot,
  BarChart3,
  Map,
  Cloud,
  Rocket,
  Sprout,
  Droplet,
  ShieldCheck,
  PlugZap,
  ArrowRight,
  Smartphone,
  Boxes,
  Workflow,
  Filter,
  Play,
  RefreshCcw,
  Upload,
  Sparkles,
  Cog,
  Cpu,
  GitBranch,
  Gauge,
  Satellite,
  Leaf,
  CloudSun,
  Bell,
  Compass,
  Users,
  Building2,
  Factory,
  TrendingUp,
  AlertTriangle,
  Flame,
  Activity as ActivityIcon,
} from "lucide-react";

// Brand palette (Sasini): green, red, white
const BRAND = {
  green: "#0f9d58",
  greenSoft: "#34a853",
  red: "#d93025",
  redSoft: "#ef5350",
  white: "#ffffff",
  bgGradFrom: "#c6f6d5", // immersive baby green
  bgGradTo: "#f6fff8", // soft white/green
};

// -----------------------------
// MOCK DATA (edit freely in UI)
// -----------------------------

const MOCK_BLOCKS = [
  { id: "A1", estate: "Kahawa East", trees: 1200, stage: "Flowering", ndvi: 0.78, cbdRisk: 0.18, ripeness: 0.06, rainfall7d: 12, fertCost: 2100, yieldKg: 940 },
  { id: "A2", estate: "Kahawa East", trees: 980, stage: "Cherry Expansion", ndvi: 0.71, cbdRisk: 0.24, ripeness: 0.12, rainfall7d: 9, fertCost: 1800, yieldKg: 870 },
  { id: "B7", estate: "Sondu Hills", trees: 1400, stage: "Dry Matter", ndvi: 0.67, cbdRisk: 0.32, ripeness: 0.22, rainfall7d: 6, fertCost: 2400, yieldKg: 1020 },
  { id: "C3", estate: "Mavuno Ridge", trees: 1100, stage: "Ripening", ndvi: 0.73, cbdRisk: 0.20, ripeness: 0.64, rainfall7d: 20, fertCost: 1950, yieldKg: 980 },
];

const MOCK_MODELS = [
  { name: "Drone-Edge FlowerCount v1.2", type: "Edge CV", device: "Jetson Xavier", status: "Canary", f1: 0.91 },
  { name: "Drone-Edge Ripeness v0.9", type: "Edge CV", device: "Snapdragon", status: "Stable", f1: 0.88 },
  { name: "Mobile-LeafDetect v0.7", type: "TFLite", device: "Android", status: "Stable", f1: 0.84 },
  { name: "Web-Anomaly v0.3", type: "WebGPU", device: "Browser", status: "Beta", f1: 0.79 },
  { name: "MotherEngine-Yield TFT v2.0", type: "Server DL", device: "GPU Cluster", status: "Stable", mape: 0.11 },
  { name: "MotherEngine-DiseaseSpread v1.1", type: "Server DL", device: "GPU Cluster", status: "Stable", auroc: 0.92 },
];

const COLORS = [BRAND.green, "#2dd4bf", "#84cc16", BRAND.red, "#22c55e", "#0ea5e9", "#9333ea"]; // charts palette

const makeSeries = (n = 12, base = 900) =>
  Array.from({ length: n }, (_, i) => ({
    month: `M${i + 1}`,
    yield: Math.round(base * (0.85 + Math.random() * 0.3)),
    cbd: +(0.1 + Math.random() * 0.2).toFixed(2),
    ndvi: +(0.6 + Math.random() * 0.3).toFixed(2),
    ripeness: +(0.05 + Math.random() * 0.8).toFixed(2),
  }));

const INITIAL_SERIES = makeSeries();

// Utility to generate heat tiles
const makeHeatTiles = () => {
  return Array.from({ length: 64 }, (_, i) => ({
    id: i,
    x: i % 8,
    y: Math.floor(i / 8),
    ndvi: +(0.5 + Math.random() * 0.5).toFixed(2),
    cbdRisk: +(Math.random() * 0.5).toFixed(2),
    ripeness: +(Math.random()).toFixed(2),
  }));
};

// random scatter points for sensor anomalies
const makeScatter = () => Array.from({ length: 20 }, () => ({ x: +(Math.random() * 100).toFixed(1), y: +(Math.random() * 100).toFixed(1), z: +(Math.random() * 50).toFixed(1) }));

// -----------------------------
// LAYOUT
// -----------------------------

export default function App() {
  const [selectedEstate, setSelectedEstate] = useState("Kahawa East");
  const [series, setSeries] = useState(INITIAL_SERIES);
  const [heat, setHeat] = useState(makeHeatTiles());
  const [scatter, setScatter] = useState(makeScatter());
  const [sim, setSim] = useState({ rainDelayWeeks: 0, cbdSpread: 0.15, fertAdj: 0, harvestWeekPullIn: 0 });
  const [prompt, setPrompt] = useState("");
  const [promptAnswer, setPromptAnswer] = useState<string | null>(null);
  const [view, setView] = useState("overview");
  const [ticker, setTicker] = useState<string[]>(["Drone A streaming tiles…", "Weather: light showers expected in 2h", "CBD alert increased in Block B7" ]);

  // Simulate realtime events (ticker + anomaly scatter)
  useEffect(() => {
    const id = setInterval(() => {
      setScatter(makeScatter());
      setTicker((t) => [
        `Realtime ${new Date().toLocaleTimeString()}: ${Math.random()>0.5?"New anomaly tile detected":"Yield forecast recomputed"}`,
        ...t.slice(0, 7),
      ]);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Scenario simulation recompute
  useEffect(() => {
    const base = 900 + sim.fertAdj * 60 - sim.rainDelayWeeks * 40 - sim.cbdSpread * 100 + sim.harvestWeekPullIn * 25;
    setSeries(makeSeries(12, Math.max(500, base)));
    setHeat(makeHeatTiles());
  }, [sim]);

  const estateBlocks = useMemo(() => MOCK_BLOCKS.filter((b) => b.estate === selectedEstate), [selectedEstate]);

  // Mock Prompt Engine (no backend): pattern-based responses
  const runPrompt = () => {
    let ans = "";
    const p = prompt.toLowerCase();
    if (p.includes("yield") && p.includes("next"))
      ans = "Projected estate yield shows +7.8% YoY under current inputs; pulling harvest forward by 1 week preserves quality with minimal loss.";
    else if (p.includes("simulate") && (p.includes("cbd") || p.includes("disease")))
      ans = "CBD spread simulation: without treatment, affected area grows from 12% to 28% in 4 weeks. With copper-based spray + pruning, cap at 15%.";
    else if (p.includes("fertilizer") || p.includes("nutrient"))
      ans = "Recommended NPK 17-17-17 at 85% of last cycle for Blocks A1/A2; supplement with foliar feed in Dry Matter stage.";
    else ans = "I generated a scenario and updated the tiles, charts, and KPIs. Click through tabs for details.";
    setPromptAnswer(ans);
  };

  return (
    <div
      className="min-h-screen w-full text-slate-900"
      style={{ background: `linear-gradient(135deg, ${BRAND.bgGradFrom}, ${BRAND.bgGradTo})` }}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur border-b" style={{ background: "rgba(255,255,255,0.7)" }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md" style={{ background: BRAND.green }}>
            <Sprout className="w-4 h-4" color={BRAND.white} />
          </span>
          <h1 className="font-semibold text-xl">Sasini Coffee Intelligence – Web Platform</h1>
          <div className="ml-auto flex items-center gap-2">
            <Select value={selectedEstate} onValueChange={setSelectedEstate}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Estate" />
              </SelectTrigger>
              <SelectContent>
                {["Kahawa East", "Sondu Hills", "Mavuno Ridge"].map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="gap-1">
              <Satellite className="w-3 h-3" /> Drone: Online
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CloudSun className="w-3 h-3" /> Weather: Synced
            </Badge>
            <Badge variant="outline" className="gap-1">
              <ShieldCheck className="w-3 h-3" /> ESG
            </Badge>
          </div>
        </div>
        {/* realtime ticker */}
        <div className="border-t bg-white/70">
          <div className="max-w-7xl mx-auto px-4 py-1 flex gap-6 overflow-x-auto text-xs">
            {ticker.map((t, i) => (
              <div key={i} className="flex items-center gap-1 whitespace-nowrap">
                <ActivityIcon className="w-3 h-3" color={i===0?BRAND.green:BRAND.red} /> {t}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* TOP NAV TABS */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={view} onValueChange={setView}>
          <TabsList className="grid grid-cols-7 gap-2 bg-white rounded-xl p-1">
            {[
              { k: "overview", t: "Overview" },
              { k: "datahub", t: "Data Hub" },
              { k: "analytics", t: "Analytics" },
              { k: "sim", t: "Scenario Studio" },
              { k: "stakeholders", t: "Stakeholders" },
              { k: "onboarding", t: "Onboarding" },
              { k: "models", t: "AI Models" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.k}
                value={tab.k}
                className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
              >
                {tab.t}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-6">
            <RecommendationsPanel />
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {/* KPI Cards */}
              {[
                { label: "Forecasted Yield (kg)", value: series.reduce((a, b) => a + b.yield, 0), icon: TrendingUp },
                { label: "Avg NDVI", value: (series.reduce((a, b) => a + Number(b.ndvi), 0) / series.length).toFixed(2), icon: Gauge },
                { label: "CBD Risk", value: `${Math.round((series.reduce((a, b) => a + Number(b.cbd), 0) / series.length) * 100)}%`, icon: ShieldCheck },
              ].map((k, i) => (
                <Card key={i} className="shadow-sm border-emerald-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <k.icon className="w-4 h-4" />
                      {k.label}
                    </div>
                    <div className="text-2xl font-semibold mt-1" style={{ color: i===2?BRAND.red:BRAND.green }}>{k.value}</div>
                  </CardContent>
                </Card>
              ))}

              {/* Yield Trend */}
              <Card className="md:col-span-2 shadow-sm border-emerald-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                    <BarChart3 className="w-4 h-4" />Yield & Risk Trend
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={series}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <YAxis yAxisId={1} orientation="right" />
                        <RTooltip />
                        <Area type="monotone" dataKey="yield" stroke={BRAND.green} fill={BRAND.green} fillOpacity={0.15} />
                        <Line type="monotone" dataKey="cbd" stroke={BRAND.red} dot={false} yAxisId={1} />
                        <Bar dataKey="ndvi" fill={BRAND.greenSoft} opacity={0.6} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Estate Heat Tiles */}
              <Card className="shadow-sm border-emerald-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                    <Map className="w-4 h-4" />Estate Heatmap (NDVI)
                  </div>
                  <div className="grid grid-cols-8 gap-1">
                    {heat.map((t) => (
                      <div
                        key={t.id}
                        className="aspect-square rounded-md"
                        style={{ background: `rgba(52,168,83,${t.ndvi})` }}
                        title={`Tile ${t.id} – NDVI ${t.ndvi}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Anomaly Scatter */}
              <Card className="shadow-sm border-emerald-100 md:col-span-3">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                    <AlertTriangle className="w-4 h-4" color={BRAND.red} />Realtime Anomaly Scatter (sensor tiles)
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="x" name="tileX" />
                        <YAxis type="number" dataKey="y" name="tileY" />
                        <ZAxis type="number" dataKey="z" range={[50, 400]} name="risk" />
                        <RTooltip />
                        <Scatter data={scatter} fill={BRAND.redSoft} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prompt Engine */}
            <Card className="mt-4 shadow-sm border-emerald-100">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Bot className="w-4 h-4" />Prompt Engine (LLM + RAG)
                </div>
                <div className="flex gap-2">
                  <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Simulate impact if CBD untreated for 4 weeks" />
                  <Button onClick={runPrompt} className="gap-2" style={{ background: BRAND.green, color: BRAND.white }}>
                    <Sparkles className="w-4 h-4" />Ask
                  </Button>
                </div>
                {promptAnswer && <div className="text-sm p-3 rounded-lg border bg-white">{promptAnswer}</div>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DATA HUB */}
          <TabsContent value="datahub" className="mt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="shadow-sm md:col-span-2 border-emerald-100">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Database className="w-4 h-4" />Unified Data Hub
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { name: "Drone Edge Feeds", status: "Live", icon: Satellite },
                      { name: "Mobile Field Reports", status: "Live", icon: Smartphone },
                      { name: "Soil Analytics (Cropnut)", status: "Live", icon: Droplet },
                      { name: "Weather & Climate", status: "Live", icon: Cloud },
                      { name: "EDMS Hist. Records", status: "Indexed", icon: Boxes },
                      { name: "Market Prices", status: "Live", icon: TrendingUp },
                    ].map((s, i) => (
                      <div key={i} className="border rounded-xl p-3 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2">
                          <s.icon className="w-4 h-4" />
                          {s.name}
                        </div>
                        <Badge variant="secondary">{s.status}</Badge>
                      </div>
                    ))}
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="schema">
                      <AccordionTrigger>View Data Contracts & Schemas</AccordionTrigger>
                      <AccordionContent>
                        <pre className="text-xs bg-white p-3 rounded-md overflow-auto border">
{`blocks(id, estate, geo, trees, ageYears)
drone_tiles(block_id, ts, ndvi, ndre, cbd_prob, ripeness)
mobile_reports(block_id, ts, task, photo_embed_vec, disease_flag)
soil_samples(block_id, ts, ph, n, p, k, moisture)
weather(ts, estate, rain_mm, temp_c, humidity)
yield_actual(block_id, season, kg)
yield_forecast(block_id, season, kg, model_version)
models(name, type, version, f1, mape, auroc, status)`}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-emerald-100">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <PlugZap className="w-4 h-4" />Drone Connector
                  </div>
                  <div className="text-sm">Stream edge summaries (counts, heatmaps, anomalies) and only upload keyframes on exception.</div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <Upload className="w-4 h-4" />Pair Drone
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <RefreshCcw className="w-4 h-4" />Sync Now
                    </Button>
                  </div>
                  <div className="text-xs text-slate-500">Edge AI reduces bandwidth; offline caching enabled.</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsSuite series={series} />
          </TabsContent>

          {/* SCENARIO STUDIO */}
          <TabsContent value="sim" className="mt-6">
            <ScenarioStudio sim={sim} setSim={setSim} series={series} runPrompt={runPrompt} />
          </TabsContent>

          {/* STAKEHOLDERS */}
          <TabsContent value="stakeholders" className="mt-6">
            <Tabs defaultValue="manager">
              <TabsList className="flex flex-wrap gap-2 bg-white rounded-xl p-1">
                <TabsTrigger value="manager">Farm Manager</TabsTrigger>
                <TabsTrigger value="agronomy">Agronomy</TabsTrigger>
                <TabsTrigger value="executive">Executive</TabsTrigger>
                <TabsTrigger value="investor">Investor</TabsTrigger>
                <TabsTrigger value="mobile">Mobile App Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="manager" className="mt-4">
                <StakeholderManager estateBlocks={estateBlocks} />
              </TabsContent>
              <TabsContent value="agronomy" className="mt-4">
                <StakeholderAgronomy series={series} />
              </TabsContent>
              <TabsContent value="executive" className="mt-4">
                <StakeholderExecutive series={series} />
              </TabsContent>
              <TabsContent value="investor" className="mt-4">
                <StakeholderInvestor />
              </TabsContent>
              <TabsContent value="mobile" className="mt-4">
                <MobilePreview />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ONBOARDING */}
          <TabsContent value="onboarding" className="mt-6">
            <OnboardingFlows />
          </TabsContent>

          {/* AI MODELS & TRAINING */}
          <TabsContent value="models" className="mt-6">
            <ModelsAndTraining />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-600 flex items-center gap-2">
          <Cpu className="w-3 h-3" /> Mother Engine • Edge–Cloud Hybrid • Demo UI (all data simulated)
        </div>
      </footer>
    </div>
  );
}

// -----------------------------
// RECOMMENDATIONS PANEL
// -----------------------------

function RecommendationsPanel(){
  return (
    <Card className="shadow-sm border-emerald-100">
      <CardContent className="p-4 grid md:grid-cols-3 gap-3">
        {[
          { title: "Harvest Plan", text: "Pull harvest forward by 1 week for Blocks C3/A2 to capture peak ripeness.", icon: Leaf, color: BRAND.green },
          { title: "CBD Mitigation", text: "Increase spray frequency in B7; prune infected branches; re-check in 7 days.", icon: ShieldCheck, color: BRAND.red },
          { title: "Nutrient Strategy", text: "Apply NPK 17-17-17 at 85% of prior cycle; add foliar feed during Dry Matter stage.", icon: Droplet, color: BRAND.greenSoft },
        ].map((r, i)=> (
          <div key={i} className="rounded-xl border p-3 bg-white">
            <div className="flex items-center gap-2 text-sm" style={{color: r.color}}>
              <r.icon className="w-4 h-4"/> {r.title}
            </div>
            <div className="text-sm mt-1 text-slate-700">{r.text}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// -----------------------------
// ANALYTICS SUITE (multi-visualization)
// -----------------------------

function AnalyticsSuite({ series }:{ series:any[] }){
  const treemapData = series.map((d,i)=>({ name: d.month, size: Math.max(20, d.yield/10), fill: i%3===0?BRAND.green: i%3===1?BRAND.greenSoft: BRAND.red }));
  return (
    <div className="grid xl:grid-cols-3 gap-4">
      <Card className="shadow-sm xl:col-span-2 border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><TrendingUp className="w-4 h-4"/>Yield / NDVI / CBD (Composed)</div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <YAxis yAxisId={1} orientation="right" />
                <RTooltip />
                <Area dataKey="yield" stroke={BRAND.green} fill={BRAND.green} fillOpacity={0.15} />
                <Line dataKey="cbd" stroke={BRAND.red} dot={false} yAxisId={1} />
                <Bar dataKey="ndvi" fill={BRAND.greenSoft} opacity={0.7} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><Factory className="w-4 h-4"/>Cost vs Yield (Treemap)</div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap data={treemapData} dataKey="size" stroke="#fff" fill={BRAND.green} />
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><Flame className="w-4 h-4"/>Risk Radar (CBD)</div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={series}>
                <PolarGrid />
                <PolarAngleAxis dataKey="month" />
                <PolarRadiusAxis />
                <Radar name="CBD Risk" dataKey="cbd" stroke={BRAND.red} fill={BRAND.red} fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm xl:col-span-3 border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><Gauge className="w-4 h-4"/>Predictive Forecasting (12M)</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Line type="monotone" dataKey="yield" stroke={BRAND.green} dot={false} />
                <Line type="monotone" dataKey="cbd" stroke={BRAND.red} dot={false} />
                <Line type="monotone" dataKey="ndvi" stroke={BRAND.greenSoft} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// -----------------------------
// SCENARIO STUDIO (expanded)
// -----------------------------

function ScenarioStudio({ sim, setSim, series, runPrompt }:{ sim:any; setSim:any; series:any[]; runPrompt:()=>void }){
  const total = series.reduce((a,b)=>a+b.yield,0);
  return (
    <Tabs defaultValue="overview">
      <TabsList className="bg-white rounded-xl p-1 mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="yield">Yield</TabsTrigger>
        <TabsTrigger value="disease">Disease</TabsTrigger>
        <TabsTrigger value="climate">Climate</TabsTrigger>
        <TabsTrigger value="economics">Economics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="shadow-sm lg:col-span-2 border-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><Workflow className="w-4 h-4"/>Scenario Flow</div>
              <div className="grid grid-cols-12 gap-2">
                {[
                  { label: "Weather Shock", kpi: `${sim.rainDelayWeeks}w delay`, color: BRAND.red, icon: Cloud },
                  { label: "Disease Spread", kpi: `${Math.round(sim.cbdSpread*100)}%`, color: BRAND.redSoft, icon: ShieldCheck },
                  { label: "Nutrient Strategy", kpi: `${Math.round(sim.fertAdj*10)}% adj`, color: BRAND.green, icon: Droplet },
                  { label: "Harvest Plan", kpi: `${sim.harvestWeekPullIn}w pull-in`, color: BRAND.greenSoft, icon: Leaf },
                  { label: "Yield Outcome", kpi: `${total} kg`, color: BRAND.green, icon: Sprout },
                ].map((n,i)=> (
                  <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-2">
                    <Card className="h-full border-emerald-100">
                      <CardContent className="p-3 h-full flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-sm" style={{color:n.color}}>
                          <n.icon className="w-4 h-4"/> {n.label}
                        </div>
                        <div className="text-lg font-semibold" style={{color:n.color}}>{n.kpi}</div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-emerald-100">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600"><Filter className="w-4 h-4"/>Scenario Controls</div>
              <div className="space-y-3">
                <Control label="Rainfall Delay (weeks)">
                  <Slider defaultValue={[0]} max={6} step={1} onValueChange={(v)=>setSim((s:any)=>({...s, rainDelayWeeks: v[0]}))}/>
                </Control>
                <Control label="CBD Spread Factor">
                  <Slider defaultValue={[15]} max={50} step={1} onValueChange={(v)=>setSim((s:any)=>({...s, cbdSpread: v[0]/100}))}/>
                </Control>
                <Control label="Fertilizer Adjustment (%)">
                  <Slider defaultValue={[0]} min={-20} max={20} step={1} onValueChange={(v)=>setSim((s:any)=>({...s, fertAdj: v[0]/10}))}/>
                </Control>
                <Control label="Harvest Pull-In (weeks)">
                  <Slider defaultValue={[0]} max={3} step={1} onValueChange={(v)=>setSim((s:any)=>({...s, harvestWeekPullIn: v[0]}))}/>
                </Control>
                <div className="flex gap-2">
                  <Button className="w-full" onClick={runPrompt} style={{ background: BRAND.green, color: BRAND.white }}>
                    <Sparkles className="w-4 h-4"/> Auto-Scenario
                  </Button>
                  <Button className="w-full" variant="outline" onClick={()=>window.location.reload()}>
                    <RefreshCcw className="w-4 h-4"/> Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="yield">
        <Card className="shadow-sm border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><Sprout className="w-4 h-4"/>Yield Forecast (What-if)</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RTooltip />
                  <Line dataKey="yield" stroke={BRAND.green} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="disease">
        <Card className="shadow-sm border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><ShieldCheck className="w-4 h-4"/>Disease Spread Forecast</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RTooltip />
                  <Area dataKey="cbd" stroke={BRAND.red} fill={BRAND.red} fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="climate">
        <Card className="shadow-sm border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><Cloud className="w-4 h-4"/>Climate Impact (Rain & NDVI)</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RTooltip />
                  <Bar dataKey="ndvi" fill={BRAND.greenSoft} />
                  <Line dataKey="yield" stroke={BRAND.green} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="economics">
        <Card className="shadow-sm border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><Factory className="w-4 h-4"/>Economics (Waterfall)</div>
            <div className="text-xs text-slate-500 mb-2">*Waterfall approximated with stacked bars for demo*</div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RTooltip />
                  <Bar dataKey="yield" stackId="a" fill={BRAND.green} />
                  <Bar dataKey="cbd" stackId="a" fill={BRAND.red} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function Control({label, children}:{label:string; children:any}){
  return (
    <div>
      <div className="text-xs mb-1">{label}</div>
      {children}
    </div>
  );
}

// -----------------------------
// STAKEHOLDER VIEWS
// -----------------------------

function StakeholderManager({ estateBlocks }: { estateBlocks: any[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Map className="w-4 h-4" />Blocks View
          </div>
          <div className="grid grid-cols-2 gap-3">
            {estateBlocks.map((b) => (
              <div key={b.id} className="border rounded-xl p-3 space-y-1 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Block {b.id}</div>
                  <Badge variant="outline">{b.stage}</Badge>
                </div>
                <div className="text-xs text-slate-600">Trees: {b.trees}</div>
                <div className="text-xs text-slate-600">
                  NDVI: {b.ndvi} • CBD: {Math.round(b.cbdRisk * 100)}% • Ripeness: {Math.round(b.ripeness * 100)}%
                </div>
                <div className="text-xs text-slate-600">Rain(7d): {b.rainfall7d}mm</div>
                <div className="text-xs text-slate-600">Est. Yield: {b.yieldKg} kg</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Bell className="w-3 h-3" /> Alerts
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Compass className="w-3 h-3" /> Route
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Activity className="w-4 h-4" />Tasks & Interventions
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {["Pruning", "Foliar Feed", "Fertilizer", "Weeding", "CBD Spray", "Harvest"].map((t, i) => (
              <Button key={i} variant="outline" className="justify-start">
                {t}
              </Button>
            ))}
          </div>
          <div className="text-xs text-slate-500">Click a task to log it; attach photo & GPS in Mobile App.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function StakeholderAgronomy({ series }: { series: any[] }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
            <Droplet className="w-4 h-4" />Fertilizer ROI
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Bar dataKey="yield" fill={BRAND.green} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
            <Leaf className="w-4 h-4" />Ripeness Distribution
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={series.map((d) => ({ name: d.month, value: Math.max(1, Math.round(d.ripeness * 100)) }))} dataKey="value" outerRadius={80}>
                  {series.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StakeholderExecutive({ series }: { series: any[] }) {
  const total = series.reduce((a, b) => a + b.yield, 0);
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {[
        { title: "Forecast Error (MAPE)", value: "11%", icon: Gauge },
        { title: "Yield (Season Total)", value: `${total} kg`, icon: Sprout },
        { title: "Cost/acre (est)", value: "$412", icon: Factory },
      ].map((k, i) => (
        <Card key={i} className="shadow-sm border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <k.icon className="w-4 h-4" />
              {k.title}
            </div>
            <div className="text-2xl font-semibold mt-1" style={{ color: BRAND.green }}>
              {k.value}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="md:col-span-2 shadow-sm border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
            <TrendingUp className="w-4 h-4" />Profitability Outlook
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RTooltip />
                <Line type="monotone" dataKey="yield" stroke={BRAND.greenSoft} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Building2 className="w-4 h-4" />Market & ESG
          </div>
          <div className="text-sm">
            • Price sensitivity: +1% price ↑ adds +$42k revenue
            <br />• ESG: Carbon intensity trending ↓ 6% YoY
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StakeholderInvestor() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ShieldCheck className="w-4 h-4" />Traceability Map
          </div>
          <div className="text-sm">End-to-end visibility from cherry to cup. Tile server overlay would render here; demo uses static heat tiles.</div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users className="w-4 h-4" />Sustainability KPIs
          </div>
          <ul className="text-sm list-disc pl-5">
            <li>Water use per kg</li>
            <li>Fertilizer efficiency index</li>
            <li>Worker safety compliance</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// -----------------------------
// ONBOARDING FLOWS
// -----------------------------

function OnboardingFlows() {
  const [step, setStep] = useState(1);
  return (
    <Card className="shadow-sm border-emerald-100">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Rocket className="w-4 h-4" />Onboarding Wizard
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`rounded-xl border p-3 ${step === s ? "bg-emerald-50 border-emerald-200" : "bg-white"}`}>
              <div className="text-xs text-slate-600">Step {s}</div>
              <div className="font-medium">{["Create Estates & Blocks", "Pair Drones & App", "Connect Soil/Weather", "Invite Team & Roles"][s - 1]}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2 bg-white rounded-xl p-3">
            <div className="text-sm font-medium">Configuration</div>
            <Input placeholder="Estate Name (e.g., Kahawa East)" />
            <Input placeholder="Block IDs (comma-separated)" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Drone Hardware" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jetson">NVIDIA Jetson</SelectItem>
                <SelectItem value="snapdragon">Qualcomm Snapdragon</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm">
              <Switch id="offline" />
              <label htmlFor="offline">Enable offline caching</label>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 text-sm border">
            <div className="font-medium mb-2">Results Preview</div>
            <div>
              • Blocks created: 8
              <br />• Drone paired: 1 (Edge AI active)
              <br />• Soil & weather: Connected
              <br />• Team invited: Manager + Agronomist
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))}>
            <ArrowRight className="w-4 h-4 rotate-180" />Back
          </Button>
          <Button onClick={() => setStep(Math.min(4, step + 1))} className="gap-2" style={{ background: BRAND.green, color: BRAND.white }}>
            Next<ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------
// MODELS & TRAINING
// -----------------------------

function ModelsAndTraining() {
  const [models, setModels] = useState(MOCK_MODELS);
  const [trainLog, setTrainLog] = useState<string[]>([
    "Ingested new drone tiles for Blocks A1–A2",
    "Retrained FlowerCount v1.2 (F1 +0.02)",
    "Updated DiseaseSpread priors (rainfall lag +1w)",
  ]);

  const retrain = () => {
    setTrainLog((l) => [
      `Training job ${new Date().toLocaleTimeString()} – Yield TFT v2.1 (mape -0.3%)`,
      ...l,
    ]);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="shadow-sm lg:col-span-2 border-emerald-100">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Bot className="w-4 h-4" />Model Registry
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {models.map((m, i) => (
              <div key={i} className="border rounded-xl p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{m.name}</div>
                  <Badge variant="outline">{m.status}</Badge>
                </div>
                <div className="text-xs text-slate-600">{m.type} • {m.device}</div>
                <div className="text-xs text-slate-600">{m.f1 ? `F1: ${m.f1}` : m.mape ? `MAPE: ${Math.round(m.mape * 100)}%` : `AUROC: ${m.auroc}`}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <GitBranch className="w-3 h-3" /> Canary
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Upload className="w-4 h-4" /> Rollout
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Cog className="w-4 h-4" />Training Pipeline
          </div>
          <ol className="text-sm list-decimal pl-5">
            <li>Ingest edge summaries (drone + mobile)</li>
            <li>Validate & enrich with soil + weather</li>
            <li>Feature store update</li>
            <li>Train/validate (TFT, XGB, CV models)</li>
            <li>Register model, canary deploy</li>
          </ol>
          <Button className="w-full gap-2 mt-2" onClick={retrain} style={{ background: BRAND.green, color: BRAND.white }}>
            <RefreshCcw className="w-4 h-4" /> Trigger Retraining
          </Button>
          <div className="text-xs bg-white rounded-md p-2 h-28 overflow-auto border">
            {trainLog.map((l, i) => (
              <div key={i}>• {l}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// -----------------------------
// MOBILE PREVIEW
// -----------------------------

function MobilePreview() {
  const [photoNote, setPhotoNote] = useState("");
  return (
    <div className="flex items-center justify-center">
      <div className="w-[320px] rounded-[2rem] border shadow-xl p-3 bg-white">
        <div className="rounded-xl bg-black h-8 mb-2 mx-auto w-40" />
        <div className="rounded-xl border p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Smartphone className="w-4 h-4" />Sasini Mobile – Field Scout
          </div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Block" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_BLOCKS.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.id} – {b.estate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full gap-2">
            <CameraIcon /> Capture Leaf/Flower
          </Button>
          <Textarea value={photoNote} onChange={(e) => setPhotoNote(e.target.value)} placeholder="Notes (auto OCR on upload)" />
          <div className="flex gap-2">
            <Button className="w-full" variant="outline">
              Save Offline
            </Button>
            <Button className="w-full" style={{ background: BRAND.green, color: BRAND.white }}>
              Sync
            </Button>
          </div>
          <div className="text-xs text-slate-500">On-device CV: YOLOv8n • TFLite • Offline embeddings</div>
        </div>
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M9.5 3a1 1 0 0 0-.832.445L7.382 5H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.382l-1.286-1.555A1 1 0 0 0 13.5 3h-4zM12 8a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
    </svg>
  );
}