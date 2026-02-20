"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Sparkles, 
  Home, 
  RefreshCw, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  Building,
  Compass,
  Layers,
  Share2,
  Eye,
  Box,
  Palette,
  Layout
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ColorizeResult {
  imageUrl: string;
  analysis: string;
}

const architecturalStyles = [
  { id: 'Modern Minimalist', name: 'Modern', icon: '🏢' },
  { id: 'Warm Professional', name: 'Warm', icon: '🏠' },
  { id: 'Industrial Loft', name: 'Industrial', icon: '🏭' },
  { id: 'Eco-Green', name: 'Natural', icon: '🌿' },
  { id: 'Classic Blueprint', name: 'Blueprint', icon: '🗺️' },
];

export default function ArchitectAI() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ColorizeResult | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(architecturalStyles[0].id);
  const [customInstructions, setCustomInstructions] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewImage) return;

    setLoading(true);
    try {
      const response = await fetch('/api/colorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: previewImage,
          style: selectedStyle,
          customInstructions: customInstructions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Colorization failed');
      }

      const data = await response.json();
      setResult(data);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#3b82f6', '#1d4ed8']
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to colorize blueprint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `colored-blueprint-${selectedStyle.toLowerCase().replace(' ', '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.05), transparent)' }}>
      <div className="container" style={{ padding: '4rem 2rem' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              background: 'var(--accent)',
              borderRadius: '20px',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 800
            }}>
              <Layout size={16} />
              2D BLUEPRINT COLORIZER
            </div>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--foreground)' }}>
              Render <span className="premium-gradient">Blueprint</span>
            </h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
              Instantly transform black-and-white drawings into professionally colored 
              architectural floor plans.
            </p>
          </motion.div>
        </header>

        <div className="grid-layout">
          {/* Left: Design Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card" 
            style={{ padding: '2.5rem' }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Blueprint Upload */}
              <div>
                <label className="input-label">Blueprint (B&W Floor Plan)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: '2px dashed var(--border)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    aspectRatio: previewImage ? 'auto' : '1.5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    background: 'rgba(37, 99, 235, 0.02)'
                  }}
                  className="hover-trigger"
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Blueprint Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', filter: 'grayscale(1)' }} />
                  ) : (
                    <div>
                      <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 700 }}>Click to Upload</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>SVG, PNG, JPG (Top-down plan view only)</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Rendering Styles */}
              <div>
                <label className="input-label">Palette Theme</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {architecturalStyles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyle(style.id)}
                      style={{ 
                        padding: '1rem',
                        borderRadius: '12px',
                        border: selectedStyle === style.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: selectedStyle === style.id ? 'var(--accent)' : 'var(--background)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{style.icon}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, textAlign: 'center', color: selectedStyle === style.id ? 'var(--primary)' : 'inherit' }}>{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Details */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Coloring Notes (Optional)</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '80px', resize: 'none' }}
                  placeholder="e.g. Use dark wood flooring in bedrooms, keep the kitchen tiles white..."
                  value={customInstructions}
                  onChange={e => setCustomInstructions(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', paddingTop: '1.2rem', paddingBottom: '1.2rem', gap: '0.75rem' }}
                disabled={loading || !previewImage}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing Drawing...
                  </>
                ) : (
                  <>
                    <Palette size={20} />
                    Apply Color Palette
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right: Visualization */}
          <div style={{ position: 'sticky', top: '2rem' }}>
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card"
                  style={{ 
                    height: '100%', 
                    minHeight: '520px',
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center',
                    borderStyle: 'dashed',
                    borderWidth: '2px'
                  }}
                >
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    background: 'var(--accent)', 
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    marginBottom: '1.5rem',
                  }}>
                    <Home size={32} />
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Awaiting Colorization</h3>
                  <p style={{ color: 'var(--muted-foreground)' }}>
                    Your colored 2D floor plan will appear here.
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card"
                  style={{ 
                    height: '100%', 
                    minHeight: '520px',
                    padding: '2rem'
                  }}
                >
                  <div className="logo-preview-container loading-shimmer" style={{ width: '100%', height: '350px', marginBottom: '2rem', border: 'none', background: 'var(--accent)' }}>
                    <Layers size={64} className="animate-spin" style={{ color: 'var(--primary)', opacity: 0.2 }} />
                  </div>
                  <div style={{ height: '20px', width: '40%', marginBottom: '1rem', borderRadius: '4px' }} className="loading-shimmer" />
                  <div style={{ height: '60px', width: '100%', borderRadius: '4px' }} className="loading-shimmer" />
                </motion.div>
              )}

              {result && !loading && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid var(--primary-rgb)' }}>
                    <div style={{ position: 'relative', aspectRatio: '1' }}>
                      <img 
                        src={result.imageUrl} 
                        alt="Colored Blueprint" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '1rem', 
                        left: '1rem', 
                        background: 'rgba(255,255,255,0.95)', 
                        backdropFilter: 'blur(10px)',
                        color: 'var(--primary)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}>
                        <Eye size={12} /> COLORED RENDERING
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
                      <button onClick={handleDownload} className="btn" style={{ borderRadius: 0, background: 'white', gap: '0.5rem', padding: '1.25rem', color: 'var(--primary)' }}>
                        <Download size={18} /> Export PDF/PNG
                      </button>
                      <button className="btn" style={{ borderRadius: 0, background: 'white', gap: '0.5rem', padding: '1.25rem', color: 'var(--primary)' }}>
                        <Share2 size={18} /> Client Link
                      </button>
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Building size={18} style={{ color: 'var(--primary)' }} />
                      <h4 style={{ fontWeight: 800 }}>Blueprint AI Analysis</h4>
                    </div>
                    <div style={{ background: 'var(--accent)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)', lineHeight: 1.6 }}>
                        {result.analysis}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Benefits */}
        <div style={{ 
          marginTop: '6rem', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '2rem',
          paddingBottom: '4rem'
        }}>
          {[
            { icon: <Compass size={24} />, title: '2D Fidelity', desc: 'Maintains zero-perspective distortion for accurate site measurements.' },
            { icon: <Layout size={24} />, title: 'Texture Mapping', desc: 'AI-generated material textures for flooring, tiling, and landscape.' },
            { icon: <CheckCircle2 size={24} />, title: 'Real-time Approval', desc: 'Get client sign-off on color schemes in minutes, not days.' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="glass-card" 
              style={{ padding: '2rem', borderBottom: '4px solid rgba(37, 99, 235, 0.1)' }}
            >
              <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{feature.icon}</div>
              <h4 style={{ marginBottom: '0.5rem' }}>{feature.title}</h4>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hover-trigger:hover {
          border-color: var(--primary) !important;
          background: rgba(var(--primary-rgb), 0.05) !important;
        }
        .premium-gradient {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </main>
  );
}
