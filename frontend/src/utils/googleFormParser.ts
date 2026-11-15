/**
 * Google Form & Google Sheets Response Ingestion Utility for Admin
 * 
 * Parses responses copied from Google Forms (CSV, TSV from Google Sheets, key:value pairs, or JSON)
 * and normalizes them into bicycle details, pricing, warranty, and specification boxes.
 */

export interface ParsedGoogleFormBicycle {
  name: string;
  brandName?: string;
  categoryName?: string;
  sellingPrice?: string;
  mrp?: string;
  stockQuantity?: number;
  warrantyInfo?: string;
  description?: string;
  specBoxes: Array<{ label: string; value: string }>;
}

export function parseGoogleFormResponseText(text: string): ParsedGoogleFormBicycle | null {
  if (!text || !text.trim()) return null;
  const trimmed = text.trim();

  const rowMap: Record<string, string> = {};

  // 1. Try parsing as JSON first
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const obj = JSON.parse(trimmed);
      Object.entries(obj).forEach(([k, v]) => {
        if (v !== null && v !== undefined) rowMap[k] = String(v);
      });
    } catch {}
  }

  // 2. Try parsing key: value lines (e.g. copied from Google Form summary or email)
  if (Object.keys(rowMap).length === 0 && trimmed.includes(':')) {
    const lines = trimmed.split(/[\r\n]+/);
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const k = line.slice(0, colonIdx).trim();
        const v = line.slice(colonIdx + 1).trim();
        if (k && v) rowMap[k] = v;
      }
    }
  }

  // 3. Try parsing Tab-separated row (copied from Google Sheets)
  if (Object.keys(rowMap).length === 0 && trimmed.includes('\t')) {
    const lines = trimmed.split(/[\r\n]+/);
    if (lines.length >= 2) {
      // Line 1 is headers, Line 2 is values
      const headers = lines[0].split('\t').map(h => h.trim());
      const values = lines[1].split('\t').map(v => v.trim());
      headers.forEach((h, i) => {
        if (h && values[i]) rowMap[h] = values[i];
      });
    }
  }

  // 4. Try parsing CSV line or comma-separated pairs
  if (Object.keys(rowMap).length === 0 && trimmed.includes(',')) {
    // Check if it's "Key: Val, Key: Val"
    const pairs = trimmed.split(',');
    for (const pair of pairs) {
      const colonIdx = pair.indexOf(':');
      if (colonIdx > 0) {
        const k = pair.slice(0, colonIdx).trim();
        const v = pair.slice(colonIdx + 1).trim();
        if (k && v) rowMap[k] = v;
      }
    }
  }

  // Helper to find value by matching normalized keys (English & Hindi)
  const findVal = (candidates: string[]): string => {
    for (const c of candidates) {
      const cNorm = c.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '');
      for (const [rKey, rVal] of Object.entries(rowMap)) {
        const rNorm = rKey.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '');
        if (cNorm && (cNorm === rNorm || cNorm.includes(rNorm) || rNorm.includes(cNorm))) {
          if (rVal && rVal.trim()) return rVal.trim();
        }
      }
    }
    return '';
  };

  // Clean currency like ₹ 11,500, Rs. 8999 -> 11500
  const cleanPrice = (valStr: string): string => {
    if (!valStr) return '';
    const s = valStr.replace(/\b(rs\.?|inr)\b/gi, '').replace(/[^\d.]/g, '');
    const num = parseFloat(s);
    return isNaN(num) ? '' : String(num);
  };

  const name = findVal(['bicycle name', 'model name', 'product name', 'cycle name', 'name', 'साइकिल का नाम', 'नाम']);
  const brandName = findVal(['brand', 'manufacturer', 'make', 'ब्रांड', 'कंपनी']);
  const categoryName = findVal(['category', 'type', 'bicycle type', 'segment', 'श्रेणी', 'प्रकार']);
  const rawSellingPrice = findVal(['selling price', 'offer price', 'deal price', 'price', 'बिक्री कीमत', 'कीमत', 'मूल्य']);
  const rawMrp = findVal(['mrp', 'maximum retail price', 'original price', 'खुदरा मूल्य', 'एमआरपी']);
  const rawStock = findVal(['stock', 'quantity', 'available stock', 'स्टॉक', 'उपलब्ध संख्या']);
  const warranty = findVal(['warranty', 'guarantee', 'वारंटी', 'वारंटी विवरण']);
  const description = findVal(['description', 'features', 'details', 'notes', 'विवरण', 'विशेषताएं']);

  // Extract Specifications
  const specFields = [
    { label: 'Wheel Size', candidates: ['wheel size', 'tyre size', 'tire size', 'पहिया', 'पहिए का आकार'] },
    { label: 'Gear Count', candidates: ['gear count', 'gears', 'speed', 'गियर', 'गियर संख्या'] },
    { label: 'Brake Type', candidates: ['brake type', 'brakes', 'ब्रेक', 'ब्रेक का प्रकार'] },
    { label: 'Frame Material', candidates: ['frame material', 'material', 'बॉडी', 'फ्रेम सामग्री'] },
    { label: 'Frame Size', candidates: ['frame size', 'फ्रेम आकार', 'साइज'] },
    { label: 'Suspension', candidates: ['suspension', 'सस्पेंशन'] },
    { label: 'Colour', candidates: ['colour', 'color', 'रंग'] },
    { label: 'Rider Age / Height', candidates: ['rider age', 'height', 'उम्र', 'लंबाई'] },
    { label: 'Carrier', candidates: ['carrier', 'luggage carrier', 'कैरियर'] },
    { label: 'Battery / Motor', candidates: ['battery', 'motor', 'बैटरी'] },
    { label: 'Weight', candidates: ['weight', 'वजन'] },
  ];

  const specBoxes: Array<{ label: string; value: string }> = [];
  const handledKeys = new Set<string>();

  for (const sf of specFields) {
    const val = findVal(sf.candidates);
    if (val) {
      specBoxes.push({ label: sf.label, value: val });
      sf.candidates.forEach(c => handledKeys.add(c.toLowerCase().replace(/[^a-z0-9]/g, '')));
    }
  }

  // Also catch any custom fields in rowMap that were not standard fields
  const standardFields = [
    'bicyclename', 'modelname', 'productname', 'cyclename', 'name', 'brand', 'category',
    'sellingprice', 'price', 'mrp', 'stock', 'quantity', 'stockquantity', 'warranty',
    'description', 'features', 'details', 'timestamp'
  ];

  for (const [rKey, rVal] of Object.entries(rowMap)) {
    const norm = rKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm && !standardFields.some(sf => norm.includes(sf)) && !handledKeys.has(norm)) {
      if (rVal && rVal.trim() && !specBoxes.some(b => b.label.toLowerCase() === rKey.toLowerCase())) {
        specBoxes.push({ label: rKey.trim(), value: rVal.trim() });
      }
    }
  }

  return {
    name: name || (rowMap[Object.keys(rowMap)[0]] || 'Imported Bicycle'),
    brandName,
    categoryName,
    sellingPrice: cleanPrice(rawSellingPrice),
    mrp: cleanPrice(rawMrp),
    stockQuantity: rawStock ? parseInt(rawStock, 10) || 5 : 5,
    warrantyInfo: warranty || '1 Year Manufacturer Frame Warranty',
    description,
    specBoxes,
  };
}
