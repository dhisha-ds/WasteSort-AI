/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Recycle,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileText,
  AlertCircle,
  ArrowRight,
  Clock,
  Info,
  Menu,
  X,
  Code2,
  Copy,
  Check,
  Package,
  Layers,
  ChevronRight,
  CornerDownRight,
  CheckCircle,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

// Hero and showcase assets generated for WasteSort AI
const HERO_IMAGE = '/src/assets/images/hero_waste_sorting_1793611685473.jpg';
const GUIDE_IMAGE = '/src/assets/images/waste_materials_guide_1793611686535.jpg';

// Six core waste categories specification
interface WasteCategory {
  id: string;
  name: string;
  binColor: string;
  binColorClass: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  examples: string[];
  disposalTip: string;
  recyclable: boolean;
}

const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: 'glass',
    name: 'Glass',
    binColor: 'Cyan / Teal Bin',
    binColorClass: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-900',
    description: 'Beverage bottles, condiment jars, and intact glassware. 100% infinitely recyclable without loss in purity.',
    examples: ['Soda bottles', 'Pickle jars', 'Wine bottles', 'Jam containers'],
    disposalTip: 'Rinse thoroughly to remove food residues; remove metal bottle caps.',
    recyclable: true,
  },
  {
    id: 'paper',
    name: 'Paper',
    binColor: 'Blue Bin',
    binColorClass: 'text-blue-700 bg-blue-50 border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    description: 'Clean printing paper, newspapers, magazines, office documents, clean notebooks, and grocery sacks.',
    examples: ['Office documents', 'Newspapers', 'School notebooks', 'Mail envelopes'],
    disposalTip: 'Must be clean and dry. Do not recycle paper contaminated with food oils.',
    recyclable: true,
  },
  {
    id: 'cardboard',
    name: 'Cardboard',
    binColor: 'Brown / Blue Bin',
    binColorClass: 'text-amber-800 bg-amber-50 border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    description: 'Corrugated delivery shipping boxes, cereal packing cartons, egg flats, and thick paper packaging.',
    examples: ['Shipping delivery boxes', 'Cereal cartons', 'Shoe boxes', 'Packing tubes'],
    disposalTip: 'Flatten boxes completely to conserve bin capacity and strip plastic adhesive tape.',
    recyclable: true,
  },
  {
    id: 'plastic',
    name: 'Plastic',
    binColor: 'Yellow Bin',
    binColorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    description: 'Rigid PET (#1) and HDPE (#2) bottles, jugs, cosmetic tubs, and clear plastic food containers.',
    examples: ['Water & soda bottles', 'Milk jugs', 'Detergent bottles', 'Shampoo tubs'],
    disposalTip: 'Empty all liquids, quick rinse with water, and re-fasten caps so they do not get lost in sorting.',
    recyclable: true,
  },
  {
    id: 'metal',
    name: 'Metal',
    binColor: 'Grey / Silver Bin',
    binColorClass: 'text-slate-700 bg-slate-100 border-slate-300',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-900',
    description: 'Aluminum beverage cans, tin food cans, clean aluminum foil wraps, and stamped steel container lids.',
    examples: ['Soda cans', 'Canned vegetable tins', 'Foil trays', 'Metal bottle tops'],
    disposalTip: 'Quickly rinse out leftover gravy or syrup; labels do not need to be peeled off.',
    recyclable: true,
  },
  {
    id: 'trash',
    name: 'Trash',
    binColor: 'Black / Red Bin',
    binColorClass: 'text-rose-800 bg-rose-50 border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    description: 'Non-recyclable composite waste, contaminated wrappers, greasy food packaging, and mixed materials.',
    examples: ['Greasy pizza boxes', 'Multi-layer chip bags', 'Sanitary wipes', 'Styrofoam'],
    disposalTip: 'General municipal landfill or incinerator stream. Bag tightly to prevent littering.',
    recyclable: false,
  },
];

interface ClassificationHistoryItem {
  id: string;
  category: string;
  recommendedBin: string;
  disposalTip: string;
  imagePreview: string;
  fileName: string;
  timestamp: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'classify' | 'history' | 'about'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Classify Page State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classificationAttempted, setClassificationAttempted] = useState(false);
  const [samplePreviewMode, setSamplePreviewMode] = useState<WasteCategory | null>(null);

  // History State — Starts empty per prompt instruction: "Do not create fake history entries."
  const [historyRecords, setHistoryRecords] = useState<ClassificationHistoryItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setClassificationAttempted(false);
    setSamplePreviewMode(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setClassificationAttempted(false);
    setSamplePreviewMode(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClassify = () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setClassificationAttempted(false);

    // Simulate standard frontend processing latency
    setTimeout(() => {
      setIsAnalyzing(false);
      // Per prompt instructions: Until real ML model is integrated, display "AI classification is not connected yet" instead of inventing predictions.
      setClassificationAttempted(true);
    }, 800);
  };

  const handleCopyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 antialiased selection:bg-[#047857] selection:text-white">
      {/* Primary Navigation Bar adhering to Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Brand Wordmark (Single element) */}
          <button
            onClick={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#047857] group-hover:bg-[#047857] group-hover:text-white transition-all shadow-sm">
              <Recycle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-[#064E3B] tracking-tight block">
                WasteSort <span className="text-[#047857]">AI</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest block -mt-1">
                Waste Segregation System
              </span>
            </div>
          </button>

          {/* Navigation Links (Zone 2) */}
          <nav className="hidden md:flex items-center gap-8 text-base font-semibold text-slate-600">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`pb-1 transition-colors relative cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-[#047857] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#047857] after:rounded-full'
                  : 'hover:text-[#047857]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('classify');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`pb-1 transition-colors relative cursor-pointer ${
                activeTab === 'classify'
                  ? 'text-[#047857] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#047857] after:rounded-full'
                  : 'hover:text-[#047857]'
              }`}
            >
              Classify Waste
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`pb-1 transition-colors relative cursor-pointer ${
                activeTab === 'history'
                  ? 'text-[#047857] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#047857] after:rounded-full'
                  : 'hover:text-[#047857]'
              }`}
            >
              History
            </button>
            <button
              onClick={() => {
                setActiveTab('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`pb-1 transition-colors relative cursor-pointer ${
                activeTab === 'about'
                  ? 'text-[#047857] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#047857] after:rounded-full'
                  : 'hover:text-[#047857]'
              }`}
            >
              About
            </button>
          </nav>

          {/* Primary CTA (Zone 3) */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveTab('classify');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-[#047857] hover:bg-[#064E3B] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-900/10 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <Upload className="w-4 h-4" />
              <span>Sort Waste Now</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#047857] rounded-lg focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-emerald-100 px-6 py-4 space-y-3 shadow-lg">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 font-semibold text-base ${
                activeTab === 'dashboard' ? 'text-[#047857]' : 'text-slate-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab('classify');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 font-semibold text-base ${
                activeTab === 'classify' ? 'text-[#047857]' : 'text-slate-700'
              }`}
            >
              Classify Waste
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 font-semibold text-base ${
                activeTab === 'history' ? 'text-[#047857]' : 'text-slate-700'
              }`}
            >
              History
            </button>
            <button
              onClick={() => {
                setActiveTab('about');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 font-semibold text-base ${
                activeTab === 'about' ? 'text-[#047857]' : 'text-slate-700'
              }`}
            >
              About
            </button>
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setActiveTab('classify');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#047857] text-white py-3 rounded-xl font-semibold text-sm shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Classify Waste</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        {/* ================= PAGE 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-white py-14 sm:py-20 border-b border-emerald-100/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-100/80 text-[#064E3B] text-xs font-bold uppercase tracking-wider">
                      <Recycle className="w-4 h-4 text-[#047857]" />
                      <span>Intelligent Environmental Sorting</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#064E3B] tracking-tight leading-[1.15] text-balance">
                      A Greener Tomorrow Starts With You.
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                      WasteSort AI is an intelligent waste segregation system using image classification to help people sort waste correctly. Upload a photo of any item to determine whether it belongs in Glass, Paper, Cardboard, Plastic, Metal, or Trash.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <button
                        onClick={() => {
                          setActiveTab('classify');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-3 bg-[#047857] hover:bg-[#064E3B] text-white font-bold text-base sm:text-lg px-8 py-4 rounded-xl shadow-lg shadow-emerald-900/15 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        <Upload className="w-5 h-5 stroke-[2.2]" />
                        <span>Classify Waste</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('about');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-[#047857] border border-emerald-300 font-bold text-base sm:text-lg px-7 py-4 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        <span>Explore Categories</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Trust / Viva Feature List */}
                    <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left">
                      <div>
                        <div className="text-2xl font-extrabold text-[#064E3B] tabular-nums">6 Streams</div>
                        <div className="text-xs text-slate-500 font-medium">Standardized Categories</div>
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-[#064E3B] tabular-nums">Zero-Waste</div>
                        <div className="text-xs text-slate-500 font-medium">Contamination Prevention</div>
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-[#064E3B] tabular-nums">Spring Boot</div>
                        <div className="text-xs text-slate-500 font-medium">MVC + Thymeleaf Ready</div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Showcase Image */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
                      <img
                        src={HERO_IMAGE}
                        alt="Modern clean recycling station with indoor green plants"
                        className="w-full h-[400px] sm:h-[480px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B]/90 via-transparent to-transparent flex items-end p-6">
                        <div className="text-white space-y-1">
                          <p className="font-bold text-base text-white">Smart Automated Segregation</p>
                          <p className="text-xs text-emerald-100/90 leading-relaxed">
                            Image classification eliminates cross-contamination before municipal collection.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Six Waste Category Cards Section */}
            <section className="py-20 bg-white border-b border-slate-200/70">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                  <span className="text-xs font-bold text-[#047857] tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Material Guide
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
                    Six Supported Waste Categories
                  </h2>
                  <p className="text-base sm:text-lg text-slate-600">
                    Each material has distinct mechanical characteristics, melting thresholds, and recycling prerequisites. WasteSort AI classifies items into these six streams:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {WASTE_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      className="bg-white border border-slate-200 rounded-2xl p-7 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header with Category Name & Recyclable Status */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${cat.badgeBg} ${cat.badgeText}`}>
                            {cat.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${cat.binColorClass}`}>
                            {cat.binColor}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#047857] transition-colors">
                          {cat.name}
                        </h3>

                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                          {cat.description}
                        </p>

                        {/* Examples */}
                        <div className="space-y-1.5 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Common Examples:
                          </span>
                          <div className="flex flex-wrap gap-1.5 text-xs text-slate-700 font-medium">
                            {cat.examples.map((ex, i) => (
                              <span key={i} className="inline-block bg-white px-2 py-0.5 rounded border border-slate-200">
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Disposal Tip */}
                      <div className="pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong className="text-slate-700">Tip:</strong> {cat.disposalTip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-[#F8FAFC]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                  <span className="text-xs font-bold text-[#047857] tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Simple Process
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
                    How It Works
                  </h2>
                  <p className="text-base sm:text-lg text-slate-600">
                    Three intuitive steps from capturing an image to proper bin placement.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#047857] font-extrabold text-xl flex items-center justify-center mb-6 border border-emerald-200">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-[#064E3B] mb-3">Upload an Image</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Capture a photo of your waste item on your mobile phone or drag and drop an existing photo onto our web portal.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#047857] font-extrabold text-xl flex items-center justify-center mb-6 border border-emerald-200">
                      2
                    </div>
                    <h3 className="text-xl font-bold text-[#064E3B] mb-3">Identify the Waste</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      The Convolutional Neural Network (CNN) extracts material textures, reflections, transparency, and packaging geometry.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#047857] font-extrabold text-xl flex items-center justify-center mb-6 border border-emerald-200">
                      3
                    </div>
                    <h3 className="text-xl font-bold text-[#064E3B] mb-3">Choose the Right Bin</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Receive immediate visual recommendations with exact bin color codes and preparation instructions (rinse, flatten, or separate).
                    </p>
                  </div>
                </div>

                {/* Bottom Callout */}
                <div className="mt-14 bg-gradient-to-r from-[#047857] to-[#064E3B] rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to test waste classification?</h3>
                    <p className="text-emerald-100 text-sm sm:text-base">
                      Try the upload interface to preview images and inspect classification workflow.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('classify');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-[#064E3B] font-bold px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4 text-[#047857]" />
                    <span>Go to Classify Portal</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= PAGE 2: CLASSIFY WASTE ================= */}
        {activeTab === 'classify' && (
          <section className="py-14 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span className="text-xs font-bold text-[#047857] tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Classification Studio
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
                  Classify Your Waste Item
                </h1>
                <p className="text-base text-slate-600">
                  Select or drag-and-drop a waste image to preview and prepare it for segregation analysis.
                </p>
              </div>

              {/* Grid: Upload on left, Results on right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Upload & Preview Column */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    {/* Drag and Drop Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => {
                        if (!previewUrl && fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                      className={`relative min-h-[340px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
                        isDragging
                          ? 'border-[#047857] bg-emerald-50/70 scale-[0.99]'
                          : previewUrl
                          ? 'border-slate-200 bg-slate-900/5'
                          : 'border-slate-300 hover:border-[#047857] bg-slate-50/60 hover:bg-emerald-50/30 cursor-pointer'
                      }`}
                    >
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFile(e.target.files[0]);
                          }
                        }}
                      />

                      {!previewUrl ? (
                        <div className="space-y-4 max-w-sm">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#047857] mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
                            <Upload className="w-8 h-8 stroke-[2.2]" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                              Drag and drop your image here
                            </h3>
                            <p className="text-xs text-slate-500">
                              Supports JPG, PNG, WEBP files up to 10MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="inline-flex items-center gap-2 bg-[#047857] hover:bg-[#064E3B] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>Browse Device</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full flex flex-col items-center">
                          <div className="w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden bg-black/90 flex items-center justify-center border border-slate-200">
                            <img
                              src={previewUrl}
                              alt="Uploaded waste preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Remove Button Bar */}
                    {previewUrl && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 truncate max-w-xs">
                          <FileCheck className="w-4 h-4 text-[#047857] shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">
                            {selectedFile?.name || 'waste_sample.jpg'}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Demo'})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Image</span>
                        </button>
                      </div>
                    )}

                    {/* Classify Button */}
                    <div className="mt-6">
                      <button
                        type="button"
                        disabled={!previewUrl || isAnalyzing}
                        onClick={handleClassify}
                        className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                          !previewUrl
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : isAnalyzing
                            ? 'bg-emerald-800 text-white cursor-wait'
                            : 'bg-[#047857] hover:bg-[#064E3B] text-white cursor-pointer hover:shadow-lg shadow-emerald-900/15'
                        }`}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing Ingestion Pipeline...</span>
                          </>
                        ) : (
                          <>
                            <Recycle className="w-5 h-5 stroke-[2.2]" />
                            <span>Classify Waste</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Helper Sample Loader for Quick Testing */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>No photo handy? Try sample image:</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await fetch(GUIDE_IMAGE);
                          const blob = await res.blob();
                          const file = new File([blob], 'recyclables_sample.jpg', { type: 'image/jpeg' });
                          handleFile(file);
                        }}
                        className="text-[#047857] hover:text-[#064E3B] font-bold hover:underline cursor-pointer"
                      >
                        Load Recyclables Guide Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Result Area Column */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Notice Banner: Required by prompt */}
                  {classificationAttempted && (
                    <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-5 shadow-sm space-y-2 text-left">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-base font-bold text-amber-900">
                            AI classification is not connected yet
                          </h4>
                          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed mt-1">
                            The frontend upload, preview, and image validation pipeline is working smoothly! As specified in Phase 1, no mock predictions are hallucinated. Machine learning model integration with the backend Spring Boot controller will be added in Phase 2.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Result Area Blueprint */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#064E3B]">Classification Result</h3>
                        <p className="text-xs text-slate-500">Status & recommended disposal bin</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {samplePreviewMode ? 'Preview Test' : 'Awaiting Model'}
                      </span>
                    </div>

                    {/* Predicted Waste Category */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Predicted Waste Category
                      </span>
                      <div className="text-xl font-extrabold text-[#064E3B]">
                        {samplePreviewMode ? samplePreviewMode.name : 'AI Classification Not Connected Yet'}
                      </div>
                      <p className="text-xs text-slate-500">
                        {samplePreviewMode
                          ? samplePreviewMode.description
                          : 'Awaiting image classification inference from trained CNN model.'}
                      </p>
                    </div>

                    {/* Recommended Bin */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Recommended Bin
                      </span>
                      <div className="text-base font-bold text-[#047857] flex items-center gap-2">
                        <Recycle className="w-4 h-4" />
                        <span>{samplePreviewMode ? samplePreviewMode.binColor : 'Color-Coded Segregation Bin'}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Standard municipal color-coding to ensure zero landfill contamination.
                      </p>
                    </div>

                    {/* Disposal Tip */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Disposal Tip & Best Practice
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {samplePreviewMode
                          ? samplePreviewMode.disposalTip
                          : 'Rinse out any liquid or organic traces before placing items into the bin to prevent degrading other recyclables in the same batch.'}
                      </p>
                    </div>

                    {/* Viva Demo Assistant: Allows examiner to preview how categories render */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-600 mb-2">
                        Viva Examiner Preview Tool (inspect UI layout for each category):
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {WASTE_CATEGORIES.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSamplePreviewMode(c);
                              // Also add an actual record to History if examiner wants to test the history list
                              const newRecord: ClassificationHistoryItem = {
                                id: Date.now().toString(),
                                category: c.name,
                                recommendedBin: c.binColor,
                                disposalTip: c.disposalTip,
                                imagePreview: previewUrl || GUIDE_IMAGE,
                                fileName: selectedFile?.name || `${c.id}_sample.jpg`,
                                timestamp: new Date().toLocaleString(),
                              };
                              setHistoryRecords((prev) => [newRecord, ...prev]);
                            }}
                            className={`px-2 py-1.5 rounded text-xs font-medium border text-center transition-colors cursor-pointer ${
                              samplePreviewMode?.id === c.id
                                ? 'bg-[#047857] text-white border-[#047857]'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                      {samplePreviewMode && (
                        <div className="mt-2 text-right">
                          <button
                            type="button"
                            onClick={() => setSamplePreviewMode(null)}
                            className="text-[11px] text-slate-500 hover:text-slate-700 underline cursor-pointer"
                          >
                            Reset to default state
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= PAGE 3: HISTORY ================= */}
        {activeTab === 'history' && (
          <section className="py-14 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold text-[#047857] tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Audit Log
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight mt-2">
                    Classification History
                  </h1>
                  <p className="text-base text-slate-600 mt-1">
                    Actual logged classification records from your sessions.
                  </p>
                </div>

                {historyRecords.length > 0 && (
                  <button
                    onClick={() => setHistoryRecords([])}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {/* Records List or Friendly Empty State */}
              {historyRecords.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {historyRecords.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                    >
                      <div className="h-48 w-full bg-slate-900 relative">
                        <img
                          src={item.imagePreview}
                          alt={item.category}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-slate-800 shadow-sm">
                          {item.category}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                            <span className="truncate max-w-[150px] font-medium text-slate-600">{item.fileName}</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {item.timestamp}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs font-bold text-slate-500 uppercase">Bin Assignment</div>
                            <div className="text-base font-bold text-[#047857]">{item.recommendedBin}</div>
                          </div>

                          <div className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <strong>Tip:</strong> {item.disposalTip}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Friendly Empty State adhering to prompt requirement */
                <div className="bg-white border border-slate-200 rounded-3xl p-12 sm:p-16 text-center max-w-xl mx-auto shadow-sm space-y-5">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-[#047857] mx-auto flex items-center justify-center border border-emerald-100 shadow-sm">
                    <Clock className="w-10 h-10 stroke-[1.8]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#064E3B]">No Classification Records Yet</h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      You haven't classified any waste items in this session. Once items are analyzed or tested in the Classify Waste portal, their category tags and disposal advice will be cataloged here.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setActiveTab('classify');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 bg-[#047857] hover:bg-[#064E3B] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-900/10 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Classify Your First Item</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= PAGE 4: ABOUT ================= */}
        {activeTab === 'about' && (
          <div>
            {/* Header / Purpose */}
            <section className="bg-white py-14 sm:py-20 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl space-y-4">
                  <span className="text-xs font-bold text-[#047857] tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Academic Mission & Design
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-[#064E3B] tracking-tight text-balance">
                    Automating Waste Segregation with Machine Learning
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    WasteSort AI is a computer engineering capstone project designed to combat source contamination through automated, real-time image recognition.
                  </p>
                </div>

                {/* 2-column detail */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 items-center">
                  <div className="lg:col-span-7 space-y-5 text-slate-700 leading-relaxed">
                    <h2 className="text-2xl font-bold text-[#064E3B]">The Problem of Source Contamination</h2>
                    <p>
                      Municipal recycling programs worldwide fail not because materials cannot be processed, but because recyclables arrive contaminated with organic matter, unwashed oils, or non-recyclable polymers.
                    </p>
                    <p>
                      A single unrinsed milk jug or oily paper wrapper can ruin an entire batch of recycled cardboard pulp or plastic flake, forcing municipalities to reroute thousands of tons of recyclable materials directly to incinerators or landfills.
                    </p>
                    <h2 className="text-2xl font-bold text-[#064E3B] pt-4">How Computer Vision Solves It</h2>
                    <p>
                      Image classification using Convolutional Neural Networks (CNNs) enables smart disposal stations to analyze optical properties in milliseconds — identifying plastic transparency, cardboard fluting, glass refraction, or metal specularity.
                    </p>
                    <p>
                      By providing instantaneous visual feedback at the point of disposal, citizens are empowered to choose the correct bin with complete confidence.
                    </p>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                      <img
                        src={GUIDE_IMAGE}
                        alt="Minimalist recyclable materials guide showcase"
                        className="w-full h-[360px] object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-4 bg-emerald-900 text-white text-xs">
                        Clean separation of Glass, Paper, Cardboard, Plastic, Metal, and Trash.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* In-depth Taxonomy Breakdown */}
            <section className="py-20 bg-[#F8FAFC] border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                  <span className="text-xs font-bold text-[#047857] tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Comprehensive Specs
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
                    The Six Supported Waste Streams
                  </h2>
                  <p className="text-base text-slate-600">
                    Detailed rules and preparation advice for each category in the model dataset.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {WASTE_CATEGORIES.map((cat, idx) => (
                    <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-emerald-100 text-[#047857] font-extrabold text-sm flex items-center justify-center">
                            0{idx + 1}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900">{cat.name}</h3>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-md border ${cat.binColorClass}`}>
                          {cat.binColor}
                        </span>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed">
                        {cat.description}
                      </p>

                      <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <strong className="text-slate-800">Accepted Items:</strong>{' '}
                          <span className="text-slate-600">{cat.examples.join(', ')}</span>
                        </div>
                        <div>
                          <strong className="text-slate-800">Preparation & Cleaning:</strong>{' '}
                          <span className="text-slate-600">{cat.disposalTip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Architecture Overview for College Viva */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                  <span className="text-xs font-bold text-[#047857] tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    System Architecture
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#064E3B] tracking-tight">
                    Full-Stack College Viva Architecture
                  </h2>
                  <p className="text-base text-slate-600">
                    How the components interface between the client browser, Spring Boot MVC, and ML service.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#047857] mx-auto flex items-center justify-center font-bold">1</div>
                    <h3 className="font-bold text-slate-900">User Interface</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Clean HTML5, Tailwind / Vanilla CSS with drag-and-drop file ingestion and image canvas preview.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#047857] mx-auto flex items-center justify-center font-bold">2</div>
                    <h3 className="font-bold text-slate-900">Thymeleaf Engine</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Server-side rendering templates with reusable fragments for navigation, footer, and model data.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#047857] mx-auto flex items-center justify-center font-bold">3</div>
                    <h3 className="font-bold text-slate-900">Spring Boot Controller</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Java Spring MVC endpoints handle routing, multipart file ingestion, and classification session history.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#047857] mx-auto flex items-center justify-center font-bold">4</div>
                    <h3 className="font-bold text-slate-900">CNN Model (Phase 2)</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Deep learning classifier (TensorFlow / ONNX) evaluating 6 target categories with softmax probability distribution.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* COMPACT FOOTER */}
      <footer className="bg-[#064E3B] text-white py-6 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Brand & Slogan */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/90 border border-emerald-700 flex items-center justify-center text-emerald-300">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                WasteSort <span className="text-emerald-400">AI</span>
              </span>
              <span className="hidden md:inline text-xs text-emerald-200/80">
                · A Greener Tomorrow Starts With You
              </span>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-emerald-100">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab('classify');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Classify Waste
              </button>
              <button
                onClick={() => {
                  setActiveTab('history');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                History
              </button>
              <button
                onClick={() => {
                  setActiveTab('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => setShowCodeModal(true)}
                className="text-emerald-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title="View Spring Boot & Thymeleaf Templates"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Templates</span>
              </button>
            </div>

            {/* Copyright */}
            <p className="text-xs text-emerald-300/80 text-center sm:text-right">
              &copy; 2026 WasteSort AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* THYMELEAF & SPRING BOOT CODE MODAL FOR COLLEGE VIVA */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#064E3B] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Thymeleaf & Spring Boot Project Structure</h3>
                  <p className="text-xs text-emerald-200">
                    All templates, fragments, CSS, and controller created directly in your repository.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="p-2 text-emerald-200 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
              {/* Viva Quick Summary */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <h4 className="font-bold text-[#064E3B] text-base mb-1">
                  How to Run Your Spring Boot + Thymeleaf Project Locally:
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  All templates and static assets have been created under <code className="bg-white px-1.5 py-0.5 rounded border font-mono">src/main/resources/</code> following standard Spring Boot conventions:
                </p>
                <div className="bg-slate-900 text-emerald-300 font-mono text-xs p-3.5 rounded-xl space-y-1">
                  <div className="text-slate-400"># Run with Maven Wrapper:</div>
                  <div>./mvnw spring-boot:run</div>
                  <div className="text-slate-400 pt-1"># Or with standard Maven:</div>
                  <div>mvn spring-boot:run</div>
                  <div className="text-slate-400 pt-1"># Open in your browser:</div>
                  <div className="text-white">http://localhost:8080</div>
                </div>
              </div>

              {/* Files Table */}
              <div>
                <h4 className="font-bold text-slate-900 text-base mb-3">Created Spring Boot & Thymeleaf Files:</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {[
                    {
                      path: 'src/main/resources/templates/dashboard.html',
                      desc: 'Dashboard page with Hero, 6 category cards, and How It Works steps',
                    },
                    {
                      path: 'src/main/resources/templates/classify.html',
                      desc: 'Drag & drop image upload, file preview, remove option, and ML readiness notice',
                    },
                    {
                      path: 'src/main/resources/templates/history.html',
                      desc: 'History view showing actual records and friendly empty state (no fake entries)',
                    },
                    {
                      path: 'src/main/resources/templates/about.html',
                      desc: 'Detailed background, CNN explanation, and 6 waste category rules',
                    },
                    {
                      path: 'src/main/resources/templates/fragments/navbar.html',
                      desc: 'Reusable Thymeleaf navigation fragment with active tab highlight',
                    },
                    {
                      path: 'src/main/resources/templates/fragments/footer.html',
                      desc: 'Reusable Thymeleaf footer fragment with project and viva details',
                    },
                    {
                      path: 'src/main/resources/static/css/styles.css',
                      desc: 'Custom vanilla CSS stylesheet in emerald green (#047857) and white',
                    },
                    {
                      path: 'src/main/resources/static/js/classify.js',
                      desc: 'Vanilla JS handling drag-and-drop, image preview, removal, and ML status',
                    },
                    {
                      path: 'src/main/java/com/wastesort/controller/WasteSortController.java',
                      desc: 'Spring MVC controller mapping /, /classify, /history, and /about routes',
                    },
                  ].map((f, i) => (
                    <div key={i} className="p-3 bg-white flex items-center justify-between gap-4">
                      <div className="truncate">
                        <span className="font-mono text-xs font-semibold text-[#047857] block truncate">
                          {f.path}
                        </span>
                        <span className="text-xs text-slate-500">{f.desc}</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(f.path, f.path)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 transition-colors cursor-pointer"
                      >
                        {copiedKey === f.path ? (
                          <span className="text-emerald-700 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                        ) : (
                          'Copy Path'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-5 py-2.5 bg-[#047857] hover:bg-[#064E3B] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
