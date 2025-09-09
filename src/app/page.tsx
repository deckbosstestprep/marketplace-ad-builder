import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Download, Check, Mail, LogOut, Save, Clipboard, Lock } from "lucide-react";

/**
 * Marketplace Ad Builder — Single‑User Web App (Fixed)
 * --------------------------------------------------
 * Fixes applied:
 *  - Removed stray comma/"0" from CATALOG end.
 *  - Corrected mismatched quotes in strings (e.g., 36"x80").
 *  - Closed all JSX tags (previous Unterminated JSX error around Items list).
 *  - Added lightweight runtime self‑tests to catch future regressions.
 *
 * Features:
 *  - Single-user login gate (simple passcode). Change ADMIN_PASSCODE below.
 *  - Select an item, fill in measurements / price / qty / photos link.
 *  - Preview Facebook Marketplace ad copy.
 *  - "Approve & Forward" opens an email draft to judsonspence1@gmail.com (mailto) with the ad body.
 *  - Auto-saves to localStorage; export all ads to CSV.
 */

// ====== CONFIG ======
// ====== CONFIG ======
const ADMIN_PASSCODE =
  (process.env.NEXT_PUBLIC_ADMIN_PASSCODE as string) ?? "JUDDISTHEMAN"; 
const DEFAULT_PICKUP = "Near The Villages, FL. Cash/Zelle. Can help load.";


// Item catalog with base templates (from your message). Each has a fixed Title + Base Description + Keywords.
const CATALOG = [
  {
    id: 1,
    name: "Weber Genesis/Spirit 4-Burner Stainless Gas Grill (no grates)",
    title: "Weber 4-Burner Stainless Gas Grill – Fires up, needs grates – priced to move",
    keywords: "Weber Genesis, Weber Spirit, stainless grill, propane BBQ, 4 burner, outdoor kitchen",
    base: `Weber stainless 4-burner with side shelves.\nIgnition and burners present; needs cooking grates + flavorizer bars (cheap online).\nHood thermometer intact. Grease tray included.\nGreat flip for tailgates / backyard.\n\nCondition: Used; cosmetic scuffs; inside needs a scrape.`,
    notes: `Auto-reply: "Still available. Fires up but needs grates/bars. Price is $150 cash today. Pickup near The Villages. When can you come by?"`,
  },
  {
    id: 2,
    name: "Weber 3-Burner Black-Lid Gas Grill",
    title: "Weber 3-Burner Gas Grill – runs, needs cleanup – bargain",
    keywords: "Weber grill, 3 burner, propane BBQ",
    base: `Same as the 4-burner, but with 3 burners and a black porcelain lid.\nCondition: Used; needs cleanup.`,
    notes: "",
  },
  {
    id: 3,
    name: "Exterior Door w/ Built-In Blinds (2 available)",
    title: "Exterior Door w/ Built-In Blinds (internal mini-blinds) – prehung slab",
    keywords: "patio door, full lite, door with blinds inside glass, prehung exterior door, 36x80",
    base: `Full-lite insulated glass w/ internal blinds (sealed – no dust).\nStandard approx. 36\" x 80\" right-hand inswing (verify).\nSteel/fiberglass skin; white. Some rust at lower edge—cosmetic.\n\nCondition: Good overall; wipe down and install.\nNote: Add handing once measured: “hinges on ___ when viewed from outside.”`,
    notes: "",
  },
  {
    id: 4,
    name: "Decorative Beveled/Leaded Glass Entry Door",
    title: "Leaded Glass Entry Door – beveled insert, brass caming – 36x80",
    keywords: "leaded glass door, decorative entry door, 36 x 80 exterior door",
    base: `Steel/fiberglass entry door with beveled/leaded glass center panel.\nDouble bore for knob/deadbolt.\nExcellent for front door upgrade or DIY project.\n\nCondition: Good glass, typical scuffs.`,
    notes: "",
  },
  {
    id: 5,
    name: "Blue/Grey 6-Panel Exterior Steel Doors (multiples)",
    title: "6-Panel Exterior Steel Door – solid & heavy – cheap",
    keywords: "steel door, exterior slab, rental flip, contractor special",
    base: `Standard approx. 36\"x80\" slabs; double bored.\nPerfect for sheds, rentals, garages.\nFresh coat of paint and you’re done.\n\nCondition: Structurally solid; cosmetic scratches.`,
    notes: "",
  },
  {
    id: 6,
    name: "Solid Oak Interior Doors – Multiple Styles (French, Raised-Panel, 20-panel)",
    title: "Solid Oak Interior Doors – French & Raised Panel – upgrade your house",
    keywords: "solid wood door, oak door, French door, interior door 30x80 32x80",
    base: `Real oak, not hollow-core. Several designs: 6-panel, multi-panel, 15-lite glass, and ornate grid panel.\nMost approx. 30\"–36\" x 80\" (measure to confirm).\nBrass hinges/locks included on some.\n\nCondition: Good; a few small dings; glass clean.\nNotes: put exact widths & handing per door in bullets (ex: “Door #DR-03: 32x80 RH”).`,
    notes: "",
  },
  {
    id: 7,
    name: "Decorative Door/Window Glass Inserts – STACK (various patterns)",
    title: "Decorative Glass Door Inserts / Sidelights – sold individually",
    keywords: "door insert glass, beveled glass, sidelight, transom, cabinet glass",
    base: `Mixed beveled, textured, clear doorlites & sidelites.\nFor door rebuilds, bars, cabinets, DIY wall art.\n\nCondition: Mixed; most good; some frames need repaint.`,
    notes: "",
  },
  {
    id: 8,
    name: "Tempered Glass Panels w/ Stainless Pulls (Shower/Storefront)",
    title: "Tempered Glass Panels w/ Handles – shower/storefront – 3/8\" thick",
    keywords: "frameless shower glass, tempered panel, glass partition, commercial handle",
    base: `Heavy tempered sheets with polished stainless pulls; wavy top edge on one style.\nGreat for walk-in shower, office divider, retail sneeze guard projects.\n\nCondition: Clear; minor water spots. No cracks.`,
    notes: "",
  },
  {
    id: 9,
    name: "Pressed Tin/Copper-Tone Ceiling & Crown Trim – Architectural Salvage",
    title: "Vintage Pressed-Tin Ceiling Panels + Ornate Crown Trim – salvage lot",
    keywords: "tin ceiling, pressed metal, antique salvage, copper ceiling tiles, wainscot",
    base: `Authentic pressed metal sheets and matching decorative crown.\nFantastic for feature walls, bars, ceilings, photo backdrops, art projects.\n\nCondition: Aged patina; some bends/rust—exactly the look people pay for.`,
    notes: "",
  },
  {
    id: 10,
    name: "Wood Cubby / Mail Sorter (modular)",
    title: "Wood Mail Sorter / Paper Organizer – craft room or shop storage",
    keywords: "mail sorter, cubby shelves, craft storage, office organizer",
    base: `Heavy modular cubbies; perfect for paper, vinyl, tools, craft supplies.\nOak finish. Sits on a workbench or mounts to a wall.\n\nCondition: Good.`,
    notes: "",
  },
  {
    id: 11,
    name: "Metal Lateral File Cabinet – 4 Drawer (locking)",
    title: "4-Drawer Lateral File Cabinet – metal – solid & clean",
    keywords: "file cabinet, lateral filing, office storage, metal cabinet",
    base: `Commercial-grade lateral file; beige.\nDrawers open/close; includes rails. Lock present (key not verified).\n\nCondition: Used; scuffs; very sturdy.`,
    notes: "",
  },
  {
    id: 12,
    name: "Industrial Steel Cabinets/Lockers (grey, mixed pieces)",
    title: "Industrial Steel Storage Cabinets – shop/garage – heavy duty",
    keywords: "steel cabinet, shop storage, metal locker, industrial cabinet",
    base: `Grey steel cabinet top with two lower lockable boxes (great for tools/parts).\nA little surface rust = easy wire-wheel + paint.`,
    notes: "",
  },
  {
    id: 13,
    name: "Wood Veneer Flat Doors (hollow-core, 2 pcs) + Matching Trim Lot",
    title: "Woodgrain Flat Doors + Matching Trim – cheap DIY",
    keywords: "hollow core door, interior slab, casing, moulding",
    base: `Two hollow-core woodgrain interior slabs.\nMatching trim/casing lengths for a cohesive look.`,
    notes: "",
  },
  {
    id: 14,
    name: "Bulk Lot – Wooden Venetian Blinds (New Old Stock)",
    title: "Bulk Lot – NEW Wood Blinds (multiple widths) – contractor special",
    keywords: "wood blinds, window shades, NOS blinds, home remodel",
    base: `New old stock wood blinds; warm nutmeg/teak tone.\nSeveral widths; most around 30–48\" (verify). Hardware included.\n\nCondition: Unused; boxes dusty.`,
    notes: "",
  },
  {
    id: 15,
    name: "Misc. Lumber & Finished Wood Trim (oak look)",
    title: "Reclaimed Wood Trim/Casing – assorted lengths – cheap",
    keywords: "wood trim, casing, baseboard, reclaimed lumber",
    base: `Mixed casing/crown/base pieces, mostly oak finish.\nPerfect for patch work, accent walls, builds.`,
    notes: "",
  },
  {
    id: 16,
    name: "HVAC Electric Heat Strip / Duct Heater (parts/repair)",
    title: "HVAC Electric Heat Strip Assembly – for air handler – parts",
    keywords: "heat strip, duct heater, HVAC parts, air handler heater",
    base: `Electric resistance coil pack pulled from duct.\nFor parts/repair or shop projects. No guarantees; priced accordingly.`,
    notes: "",
  },
];

// ====== Helpers ======
const storageKey = (k: string) => `mpb:${k}`;
const saveLS = (k: string, v: unknown) => localStorage.setItem(storageKey(k), JSON.stringify(v));
const loadLS = <T,>(k: string, d: T): T => {
  try { return (JSON.parse(localStorage.getItem(storageKey(k)) as string) as T) ?? d; } catch { return d; }
};

function csvEscape(v: unknown = "") { return String(v).replaceAll('"', '""'); }
function toCSV(rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] || {});
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => `"${csvEscape((r as any)[h] ?? '')}"`).join(','));
  }
  return lines.join('\n');
}

function extractCondition(base: string) {
  const lines = base.split(/\n+/).map(l=>l.trim());
  const hit = lines.find(l => /^Condition:/i.test(l));
  return hit ? hit.replace(/^Condition:\s*/i, '') : '';
}

function inferDefaultPrice(name: string) {
  const map: [RegExp, number][] = [
    [/4-Burner/i, 150],
    [/3-Burner/i, 120],
    [/Built-In Blinds/i, 150],
    [/Leaded Glass/i, 200],
    [/6-Panel Exterior Steel/i, 60],
    [/Solid Oak Interior/i, 120],
    [/Glass Inserts/i, 60],
    [/Tempered Glass Panels/i, 125],
    [/Pressed Tin/i, 25],
    [/Mail Sorter/i, 75],
    [/Lateral File/i, 120],
    [/Industrial Steel Storage/i, 120],
    [/Woodgrain Flat Doors/i, 25],
    [/Wooden Venetian Blinds/i, 25],
    [/Wood Trim\/Casing/i, 60],
    [/Heat Strip/i, 40],
  ];
  for (const [re, val] of map) if (re.test(name)) return val;
  return 100;
}

function seedFromCatalog(c: any) {
  return {
    id: c.id,
    name: c.name,
    title: c.title,
    base: c.base,
    keywords: c.keywords,
    notes: c.notes || "",
    price: inferDefaultPrice(c.name),
    priceType: "OBO",
    qty: 1,
    measurements: "",
    condition: extractCondition(c.base) || "",
    pickup: DEFAULT_PICKUP,
    photos: "",
    approved: false,
  } as any;
}

function buildAdBody(it: any, includeKeywords: boolean) {
  const priceLine = it.price ? `$${it.price} ${it.priceType || ''}`.trim() : `Price: message me`;
  const qtyLine = it.qty && it.qty>1 ? `Quantity available: ${it.qty}` : ``;
  const measureLine = it.measurements ? `\n\nMeasurements: ${it.measurements}` : '';
  const photosLine = it.photos ? `\nPhotos: ${it.photos}` : '';
  const cond = it.condition || extractCondition(it.base) || '';
  const condLine = cond ? `\n\nCondition: ${cond}` : '';

  const body = `${it.title}\n\n${it.base}${measureLine}${condLine}\n\n${qtyLine}\nPickup: ${it.pickup}${photosLine}\n\nPrice: ${priceLine}${includeKeywords? `\n\nKeywords: ${it.keywords}`: ''}`
    .replace(/\n\n\n+/g, '\n\n');

  return body.trim();
}

// ====== Main App ======
export default function App() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [selectedId, setSelectedId] = useState<number>(loadLS('selectedId', 1));
  const [items, setItems] = useState<any[]>(loadLS('items', CATALOG.map(seedFromCatalog)));
  const [includeKeywords, setIncludeKeywords] = useState<boolean>(loadLS('includeKeywords', true));

  useEffect(() => saveLS('selectedId', selectedId), [selectedId]);
  useEffect(() => saveLS('items', items), [items]);
  useEffect(() => saveLS('includeKeywords', includeKeywords), [includeKeywords]);

  // ---- Self-tests (runtime) ----
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { runSelfTests(); } catch (e) { console.error('Self-tests failed:', e); }
  }, []);

  const current = items.find(i => i.id === selectedId) || items[0];
  const adBody = useMemo(() => buildAdBody(current, includeKeywords), [current, includeKeywords]);

  function handleField(k: string, v: any) {
    setItems(prev => prev.map(it => it.id === current.id ? { ...it, [k]: v } : it));
  }

  function approveAndEmail() {
    const subject = encodeURIComponent(`[APPROVED] ${current.title} — Qty ${current.qty ?? 1}`);
    const body = encodeURIComponent(adBody);
    const href = `mailto:judsonspence1@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = href;
    handleField('approved', true);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(adBody);
  }

  function downloadCSV() {
    const rows = items.map(i => ({
      id: i.id,
      name: i.name,
      title: i.title,
      measurements: i.measurements,
      price: i.price,
      qty: i.qty,
      condition: i.condition,
      pickup: i.pickup,
      photos: i.photos,
      keywords: i.keywords,
      approved: i.approved ? 'yes' : 'no',
    }));
    const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'marketplace_ads.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function logout() { setAuthed(false); setPass(""); }

  if (!authed) return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5" />
            <h1 className="text-xl font-semibold">Marketplace Ad Builder — Login</h1>
          </div>
          <div className="space-y-2">
            <label className="text-sm">Passcode</label>
            <Input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter admin passcode" />
          </div>
          <Button className="w-full" onClick={()=> setAuthed(pass === ADMIN_PASSCODE)}>Enter</Button>
          <p className="text-xs text-muted-foreground">Change the passcode in code: <code>ADMIN_PASSCODE</code>.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Left: Catalog */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={downloadCSV}><Download className="w-4 h-4 mr-2"/>Export CSV</Button>
              <Button variant="outline" onClick={logout}><LogOut className="w-4 h-4 mr-2"/>Logout</Button>
            </div>
          </div>
          <div className="space-y-2">
            {items.map((it) => (
              <motion.button key={it.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedId(it.id)}
                className={`w-full text-left p-3 rounded-2xl shadow bg-white border ${selectedId===it.id? 'border-slate-900' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium line-clamp-1">{it.name}</div>
                  {it.approved && <Badge><Check className="w-3 h-3 mr-1"/>Approved</Badge>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Qty: {it.qty ?? 1} • ${it.price ?? '—'} • {it.measurements || 'measurements?'}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Middle: Editor */}
        <div className="md:col-span-1 space-y-4">
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Edit Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm">Title</label>
                  <Input value={current.title} onChange={(e)=>handleField('title', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm">Measurements (W x H x T)</label>
                  <Input placeholder="e.g., 36x80x1.75 — RH inswing" value={current.measurements || ''} onChange={(e)=>handleField('measurements', e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm">Ask Price ($)</label>
                    <Input type="number" min={0} value={current.price ?? ''} onChange={(e)=>handleField('price', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-sm">Quantity</label>
                    <Input type="number" min={1} value={current.qty ?? 1} onChange={(e)=>handleField('qty', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-sm">OBO / Firm</label>
                    <Select value={current.priceType || 'OBO'} onValueChange={(v)=>handleField('priceType', v)}>
                      <SelectTrigger><SelectValue placeholder="OBO / Firm" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OBO">OBO</SelectItem>
                        <SelectItem value="Firm">Firm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm">Condition</label>
                  <Input value={current.condition || ''} onChange={(e)=>handleField('condition', e.target.value)} placeholder="e.g., Used; cosmetic scuffs; glass clean." />
                </div>
                <div>
                  <label className="text-sm">Pickup / Location</label>
                  <Input value={current.pickup || DEFAULT_PICKUP} onChange={(e)=>handleField('pickup', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm">Photo link (album or folder)</label>
                  <Input value={current.photos || ''} onChange={(e)=>handleField('photos', e.target.value)} placeholder="Paste Google Photos / Drive / Imgur link" />
                </div>
                <div>
                  <label className="text-sm">Base Description</label>
                  <Textarea rows={6} value={current.base} onChange={(e)=>handleField('base', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm">Extra Notes (private)</label>
                  <Textarea rows={3} value={current.notes || ''} onChange={(e)=>handleField('notes', e.target.value)} placeholder="Not shown in ad" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={includeKeywords} onCheckedChange={setIncludeKeywords} />
                  <span className="text-sm">Include SEO keywords block</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={copyToClipboard}><Clipboard className="w-4 h-4 mr-2"/>Copy Ad Text</Button>
            <Button onClick={approveAndEmail}><Mail className="w-4 h-4 mr-2"/>Approve & Forward</Button>
            <Button variant="secondary" onClick={()=>handleField('approved', true)}><Check className="w-4 h-4 mr-2"/>Mark Approved</Button>
            <Button variant="outline" onClick={()=>saveLS('items', items)}><Save className="w-4 h-4 mr-2"/>Save</Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="md:col-span-1">
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Preview (Facebook Marketplace)</h3>
              <div className="text-sm whitespace-pre-wrap bg-white rounded-2xl p-4 border">
                {adBody}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ====== Self Tests (runtime) ======
function runSelfTests() {
  // Test 1: Catalog shape
  console.assert(Array.isArray(CATALOG) && CATALOG.length === 16, 'CATALOG must contain 16 items');
  console.assert(CATALOG.every(it => !!it.title && !!it.base && !!it.keywords), 'Every catalog item needs title/base/keywords');

  // Test 2: Default seeding & price inference
  const seeded = CATALOG.map(seedFromCatalog);
  console.assert(seeded.every(s => typeof s.price === 'number'), 'Each seeded item should get a numeric default price');

  // Test 3: Ad body generation
  const sample = seeded[0];
  const ad = buildAdBody(sample, true);
  console.assert(typeof ad === 'string' && ad.includes(sample.title) && ad.includes('Keywords:'), 'Ad body should include title and keywords block');

  // Test 4: CSV export shape
  const rows = seeded.map(s => ({ id: s.id, name: s.name }));
  const csv = toCSV(rows as any);
  console.assert(csv.split('\n').length === rows.length + 1, 'CSV should have header + one line per row');
}
