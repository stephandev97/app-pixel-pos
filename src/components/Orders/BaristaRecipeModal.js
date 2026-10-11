// src/components/Orders/BaristaRecipeModal.js
import React, { useEffect, useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import { Coffee, CupSoda, Flame, Snowflake, Sparkles, X, CheckCircle2, Layers, Info, Edit2, RotateCcw } from 'lucide-react';
import {
  getBaristaRecipe,
  resetCustomBaristaRecipe,
  resetAllCustomBaristaRecipesForDrink,
  getCleanItemNote,
  getCleanSizeLabel,
  getSizeBadgeInfo,
} from './baristaRecipesData';
import BaristaRecipeEditor from './BaristaRecipeEditor';

export default function BaristaRecipeModal({ recipeModalData, onClose, onSelectSize, cafeteriaProducts = [] }) {
  const [isEditingRecipe, setIsEditingRecipe] = useState(false);
  const [recipeVersion, setRecipeVersion] = useState(0);

  const isAdmin = useSelector((s) => s.actions?.isAdmin);
  const isTestMode = useSelector((s) => s.actions?.isTestMode);
  const isDev = useMemo(() => {
    if (process.env.NODE_ENV === 'development') return true;
    if (Boolean(isAdmin) || Boolean(isTestMode)) return true;
    if (typeof window !== 'undefined') {
      if (
        localStorage.getItem('is_dev_mode') === 'true' ||
        localStorage.getItem('dev_mode') === 'true'
      ) {
        return true;
      }
    }
    return false;
  }, [isAdmin, isTestMode]);

  useEffect(() => {
    const handler = () => setRecipeVersion((v) => v + 1);
    window.addEventListener('barista-recipes-updated', handler);
    return () => window.removeEventListener('barista-recipes-updated', handler);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const activeData = useMemo(() => {
    if (!recipeModalData) return null;
    const isSinCafe = Boolean(
      recipeModalData.isSinCafe ||
      recipeModalData.sinCafe ||
      recipeModalData.withoutCoffee ||
      (Array.isArray(recipeModalData.extras) &&
        recipeModalData.extras.some((e) => /sin\s*caf/i.test(String(e))))
    );
    const hasAlmendras = Boolean(
      recipeModalData.hasAlmendras ||
      recipeModalData.leche_almendras ||
      recipeModalData.withAlmondMilk ||
      (Array.isArray(recipeModalData.extras) &&
        recipeModalData.extras.some((e) => /almendra/i.test(String(e))))
    );
    const orderSize = recipeModalData.isSmoothie
      ? '12oz'
      : (recipeModalData.activeSize || recipeModalData.size || recipeModalData.medida || '12oz');

    const dummyItem = {
      name: recipeModalData.productName || recipeModalData.name,
      size: orderSize,
      isCold: recipeModalData.isCold,
      extras: recipeModalData.extras,
      vaso: recipeModalData.vaso,
      note: recipeModalData.note,
      observaciones: recipeModalData.observaciones,
      listdetalle: recipeModalData.listdetalle,
      sabor: recipeModalData.flavor || recipeModalData.sabor,
      flavor: recipeModalData.flavor || recipeModalData.sabor,
      smoothieFlavor: recipeModalData.smoothieFlavor || recipeModalData.flavor || recipeModalData.sabor,
      sinCafe: isSinCafe,
      isSinCafe: isSinCafe,
      withoutCoffee: isSinCafe,
      leche_almendras: hasAlmendras,
      hasAlmendras: hasAlmendras,
      withAlmondMilk: hasAlmendras,
    };
    return getBaristaRecipe(dummyItem, cafeteriaProducts) || recipeModalData;
  }, [recipeModalData, cafeteriaProducts, recipeVersion]);

  if (!recipeModalData || !activeData) return null;

  const {
    productName = 'Producto',
    activeSize = '12oz',
    sizeLabel = '12oz',
    availableSizes = ['8oz', '12oz', '16oz'],
    isFrappe = false,
    isCold = false,
    isSmoothie = false,
    flavor = '',
    pumpRule = '',
    typeLabel = isSmoothie ? '🍓 Smoothie Frozen' : isFrappe ? '🍧 Frappé' : isCold ? '🧊 Frío' : '☕ Caliente',
    glass = 'Vaso según medida',
    ingredients = [],
    steps = [],
    extras = [],
    vaso = '',
    note = '',
  } = activeData;

  const cleanModalNote = getCleanItemNote(activeData);
  const cleanModalExtras = (extras || []).filter((ex) => {
    const s = String(ex).toLowerCase().trim();
    if (/sin\s*caf/i.test(s)) return false;
    if (/almendra/i.test(s)) return false;
    return true;
  });

  // Fallback para recetas clásicas si vinieran sólo en líneas de texto
  const legacyLines =
    ingredients.length === 0 && activeData.availableRecipes
      ? (activeData.availableRecipes[activeSize] || '')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.72)',
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
        {isEditingRecipe ? (
          <BaristaRecipeEditor
            recipeData={activeData}
            onClose={() => setIsEditingRecipe(false)}
          />
        ) : (
          <>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isDev && activeData.isCustom && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `¿Volver a la receta predeterminada de la IA para ${activeData.productName} (${activeData.activeSize})?`
                    )
                  ) {
                    resetCustomBaristaRecipe(
                      activeData.masterKey,
                      activeData.activeSize,
                      activeData.isCold
                    );
                  }
                }}
                style={{
                  background: '#fff1f2',
                  color: '#e11d48',
                  border: '1px solid #ffe4e6',
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.12s ease',
                }}
                title={`Volver a la receta predeterminada de la IA para ${activeData.activeSize}`}
              >
                <RotateCcw size={12} strokeWidth={2.4} />
                <span>Volver a IA ({activeData.activeSize})</span>
              </button>
            )}

            {isDev && (
              <button
                type="button"
                onClick={() => setIsEditingRecipe(true)}
                style={{
                  background: activeData.isCustom ? '#fef3c7' : '#f4f4f5',
                  color: activeData.isCustom ? '#b45309' : '#18181b',
                  border: activeData.isCustom
                    ? '1px solid #fde68a'
                    : '1px solid #e4e4e7',
                  borderRadius: 8,
                  padding: '5px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.12s ease',
                }}
                title="Editar receta (Dev Mode)"
              >
                <Edit2 size={12} strokeWidth={2.4} />
                <span>{activeData.isCustom ? '✏️ Editada' : 'Editar'}</span>
              </button>
            )}

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
        </div>

        {/* Medida y Personalizaciones del Pedido */}
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
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#52525b', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600 }}>Medida:</span>
            {(() => {
              const effectiveSize = isSmoothie ? '12oz' : (activeSize || '');
              const sizeBadge = getSizeBadgeInfo(effectiveSize);
              if (!sizeBadge) {
                return (
                  <span
                    style={{
                      fontWeight: 800,
                      color: '#ffffff',
                      background: '#09090b',
                      padding: '3px 10px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {isSmoothie ? '12oz' : getCleanSizeLabel(activeSize) || activeSize}
                  </span>
                );
              }
              return (
                <span
                  style={{
                    fontWeight: 900,
                    color: sizeBadge.color,
                    background: sizeBadge.bg,
                    border: sizeBadge.isLarge ? `2px solid ${sizeBadge.border}` : `1.5px solid ${sizeBadge.border}`,
                    padding: sizeBadge.isLarge ? '3px 10px' : '2.5px 9px',
                    borderRadius: 7,
                    fontSize: '0.8rem',
                    letterSpacing: '-0.01em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    boxShadow: sizeBadge.isLarge ? '0 2px 7px rgba(168, 85, 247, 0.3)' : 'none',
                  }}
                >
                  <CupSoda size={sizeBadge.isLarge ? 14 : 12.5} strokeWidth={2.6} />
                  <span>{sizeBadge.badgeText}</span>
                  {sizeBadge.isLarge && (
                    <span
                      style={{
                        background: sizeBadge.color,
                        color: '#ffffff',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: 4,
                        letterSpacing: '0.04em',
                      }}
                    >
                      MAXI
                    </span>
                  )}
                </span>
              );
            })()}

            {/* Badges de personalizaciones exactas del pedido */}
            {activeData.hasAlmendras && (
              <span
                style={{
                  fontWeight: 800,
                  color: '#92400e',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  padding: '3px 9px',
                  borderRadius: 6,
                  fontSize: '0.76rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                🥛 Leche de Almendras
              </span>
            )}

            {activeData.isSinCafe && (
              <span
                style={{
                  fontWeight: 800,
                  color: '#b91c1c',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '3px 9px',
                  borderRadius: 6,
                  fontSize: '0.76rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                🚫 Sin café
              </span>
            )}
          </div>
        </div>

        {/* Banner Sin Café cuando la receta está en modo sin café */}
        {activeData.isSinCafe && (
          <div
            style={{
              padding: '8px 18px',
              background: '#fef2f2',
              borderBottom: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <span>🚫 Preparación Sin Café: Se omitió el shot de espresso en ingredientes y pasos de licuado.</span>
          </div>
        )}

        {/* Banner Leche de Almendras cuando la receta especifica leche vegetal */}
        {activeData.hasAlmendras && (
          <div
            style={{
              padding: '8px 18px',
              background: '#fef3c7',
              borderBottom: '1px solid #fde68a',
              color: '#92400e',
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <span>🥛 Preparación con Leche de Almendras: Sustituir leche tradicional por leche vegetal de almendras en ingredientes y preparación.</span>
          </div>
        )}

        {/* Nota de Dosificación y Sabor para Smoothie */}
        {isSmoothie && (
          <div
            style={{
              padding: '8px 20px',
              background: '#fffbeb',
              borderBottom: '1px solid #fef3c7',
              color: '#92400e',
              fontSize: '0.76rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <Info size={14} strokeWidth={2.4} style={{ color: '#d97706', flexShrink: 0 }} />
            <span>
              <strong>Dosificación de Pulpa:</strong> 5 pumps aprox para 100gr de pulpa (1 disparo de pump ≈ 20g).
            </span>
          </div>
        )}

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
          {(cleanModalExtras.length > 0 || vaso || cleanModalNote) && (
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
                    <strong>Escribir en el vaso:</strong> "{vaso}"
                  </span>
                </div>
              )}

              {cleanModalExtras.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <Sparkles size={13} strokeWidth={2.4} style={{ color: '#b45309', marginTop: 2, flexShrink: 0 }} />
                  <span>
                    <strong>Adicionales seleccionados:</strong> {cleanModalExtras.join(', ')}
                  </span>
                </div>
              )}

              {cleanModalNote && (
                <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: 2 }}>
                  <strong>Nota:</strong> {cleanModalNote}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #f4f4f5',
            background: '#fafafa',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div>
            {isDev && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsEditingRecipe(true)}
                  style={{
                    background: '#ffffff',
                    color: '#18181b',
                    border: '1px solid #d4d4d8',
                    borderRadius: 8,
                    padding: '7px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.12s ease',
                  }}
                >
                  <Edit2 size={13} strokeWidth={2.2} />
                  <span>Editar receta</span>
                </button>

                {activeData.isCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Volver a la receta predeterminada de la IA para ${activeData.productName} (${activeData.activeSize})?`
                        )
                      ) {
                        resetCustomBaristaRecipe(
                          activeData.masterKey,
                          activeData.activeSize,
                          activeData.isCold
                        );
                      }
                    }}
                    style={{
                      background: '#fff1f2',
                      color: '#e11d48',
                      border: '1px solid #ffe4e6',
                      borderRadius: 8,
                      padding: '7px 11px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.12s ease',
                    }}
                    title={`Volver a la receta oficial de la IA para ${activeData.activeSize}`}
                  >
                    <RotateCcw size={12} strokeWidth={2.4} />
                    <span>Volver a IA ({activeData.activeSize})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#18181b',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.84rem',
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
      </>
    )}
  </div>
</div>
  );

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
}
