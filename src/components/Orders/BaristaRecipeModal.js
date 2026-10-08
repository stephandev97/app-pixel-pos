// src/components/Orders/BaristaRecipeModal.js
import React, { useEffect } from 'react';
import { Coffee, CupSoda, Flame, Snowflake, Sparkles, X, CheckCircle2, Layers } from 'lucide-react';

export default function BaristaRecipeModal({ recipeModalData, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!recipeModalData) return null;

  const {
    productName = 'Producto',
    activeSize = '12oz',
    sizeLabel = '12oz',
    isFrappe = false,
    isCold = false,
    typeLabel = isFrappe ? '🍧 Frappé' : isCold ? '🧊 Frío' : '☕ Caliente',
    glass = 'Vaso según medida',
    ingredients = [],
    steps = [],
    extras = [],
    vaso = '',
    note = '',
  } = recipeModalData;

  // Fallback para recetas clásicas si vinieran sólo en líneas de texto
  const legacyLines =
    ingredients.length === 0 && recipeModalData.availableRecipes
      ? (recipeModalData.availableRecipes[activeSize] || '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 18,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', -apple-system, sans-serif",
          animation: 'baristaBtnIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid #e4e4e7',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f4f4f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: isFrappe
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : isCold
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                  : 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                flexShrink: 0,
              }}
            >
              {isFrappe ? (
                <Sparkles size={20} strokeWidth={2.4} />
              ) : isCold ? (
                <Snowflake size={20} strokeWidth={2.4} />
              ) : (
                <Coffee size={20} strokeWidth={2.2} />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '1.18rem',
                    fontWeight: 800,
                    color: '#09090b',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {productName}
                </span>

                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: isFrappe ? '#eff6ff' : isCold ? '#f0f9ff' : '#fef2f2',
                    color: isFrappe ? '#1d4ed8' : isCold ? '#0284c7' : '#b91c1c',
                    border: `1px solid ${isFrappe ? '#bfdbfe' : isCold ? '#bae6fd' : '#fecaca'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {isFrappe ? (
                    <Sparkles size={10} strokeWidth={2.5} />
                  ) : isCold ? (
                    <Snowflake size={10} strokeWidth={2.5} />
                  ) : (
                    <Flame size={10} strokeWidth={2.5} />
                  )}
                  {typeLabel}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500, marginTop: 2 }}>
                Receta técnica oficial y proporciones de barra
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar receta"
            style={{
              background: '#f4f4f5',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e4e4e7';
              e.currentTarget.style.color = '#09090b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f4f4f5';
              e.currentTarget.style.color = '#71717a';
            }}
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        {/* Medida y Vaso requerido */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f4f4f5',
            padding: '10px 20px',
            background: '#fafafa',
            flexShrink: 0,
            gap: 12,
            fontSize: '0.8rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#52525b' }}>
            <span style={{ fontWeight: 600 }}>Medida:</span>
            <span
              style={{
                fontWeight: 800,
                color: '#09090b',
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                padding: '2px 8px',
                borderRadius: 6,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              {sizeLabel}
            </span>
          </div>

          {glass && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                color: '#3f3f46',
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            >
              <CupSoda size={13} strokeWidth={2.2} style={{ color: '#09090b' }} />
              <span>{glass}</span>
            </div>
          )}
        </div>

        {/* Contenido scrolleable */}
        <div
          style={{
            padding: '18px 20px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {/* SECCIÓN 1: INGREDIENTES Y MEDIDAS EXACTAS */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 10,
                color: '#09090b',
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Layers size={14} strokeWidth={2.4} style={{ color: '#09090b' }} />
              <span>Ingredientes y medidas</span>
            </div>

            {ingredients.length > 0 ? (
              <div
                style={{
                  background: '#fafafa',
                  border: '1px solid #e4e4e7',
                  borderRadius: 12,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: idx === ingredients.length - 1 ? 'none' : '1px solid #f0f0f2',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: '#71717a',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#18181b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {ing.name}
                      </span>
                    </div>

                    {ing.amount && (
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#09090b',
                          background: '#f4f4f5',
                          border: '1px solid #e4e4e7',
                          padding: '2px 8px',
                          borderRadius: 6,
                          whiteSpace: 'nowrap',
                          fontVariantNumeric: 'tabular-nums',
                          flexShrink: 0,
                        }}
                      >
                        {ing.amount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : legacyLines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {legacyLines.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#fbfbfb',
                      border: '1px solid #f0f0f2',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: '#27272a',
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '14px',
                  textAlign: 'center',
                  color: '#a1a1aa',
                  fontSize: '0.82rem',
                  background: '#fafafa',
                  borderRadius: 8,
                  border: '1px dashed #e4e4e7',
                }}
              >
                Sin especificaciones de ingredientes registradas.
              </div>
            )}
          </div>

          {/* SECCIÓN 2: PASOS A SEGUIR (PREPARACIÓN PASO A PASO) */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 10,
                color: '#09090b',
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <CheckCircle2 size={14} strokeWidth={2.4} style={{ color: '#09090b' }} />
              <span>Pasos a seguir (Preparación paso a paso)</span>
            </div>

            {steps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '10px 14px',
                      background: '#ffffff',
                      border: '1px solid #e4e4e7',
                      borderRadius: 10,
                      fontSize: '0.86rem',
                      color: '#18181b',
                      lineHeight: 1.45,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#18181b',
                        color: '#ffffff',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 500 }}>{step}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#a1a1aa',
                  fontSize: '0.82rem',
                  background: '#fafafa',
                  borderRadius: 8,
                  border: '1px dashed #e4e4e7',
                }}
              >
                No hay pasos de preparación cargados para esta bebida.
              </div>
            )}
          </div>

          {/* SECCIÓN 3: PERSONALIZACIONES DEL PEDIDO (Vaso, Extras, Notas) */}
          {((extras && extras.length > 0) || vaso || note) && (
            <div
              style={{
                padding: '12px 14px',
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 12,
                fontSize: '0.8rem',
                color: '#92400e',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em', color: '#b45309' }}>
                Personalizaciones del pedido en curso
              </div>

              {vaso && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CupSoda size={13} strokeWidth={2.4} style={{ color: '#b45309', flexShrink: 0 }} />
                  <span>
                    <strong>Escribir en el vaso:</strong> \"{vaso}\"
                  </span>
                </div>
              )}

              {extras && extras.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <Sparkles size={13} strokeWidth={2.4} style={{ color: '#b45309', marginTop: 2, flexShrink: 0 }} />
                  <span>
                    <strong>Adicionales seleccionados:</strong> {extras.join(', ')}
                  </span>
                </div>
              )}

              {note && (
                <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: 2 }}>
                  <strong>Nota:</strong> {note}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f4f4f5', background: '#fafafa', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              background: '#18181b',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#09090b')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#18181b')}
          >
            Cerrar receta
          </button>
        </div>
      </div>
    </div>
  );
}
