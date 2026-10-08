import { AlertCircle, Check, Globe, Plus, RefreshCw, Sparkles, X } from 'lucide-react';
import React, { useState } from 'react';

import { pb } from '../../lib/pb';
import { searchBeverageRecipeOnline } from './aiRecipeSearch';
import {
  ActionButton,
  CatChip,
  CategoryFilter,
  FormGroup,
  InputNumber,
  ModalBodyScroll,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from './CafeCostsStyles';

const DRINK_CATEGORIES = [
  { id: 'frappe', label: '🍧 Frappé' },
  { id: 'clasico', label: '☕ Café Clásico' },
  { id: 'cold', label: '🧊 Frío / Iced' },
  { id: 'smoothie', label: '🍓 Smoothie' },
  { id: 'pasteleria', label: '🥐 Pastelería' },
  { id: 'extra', label: '✨ Extra / Adicional' },
  { id: 'otros', label: '📦 Otros' },
];

export default function AddDrinkModal({ isOpen, onClose, config, onCreated, formatRecipeForPb }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('frappe');
  const [hasSizes, setHasSizes] = useState(true);
  const [p8, setP8] = useState('');
  const [p12, setP12] = useState('7100');
  const [p16, setP16] = useState('7700');
  const [pStandard, setPStandard] = useState('');

  const [searching, setSearching] = useState(false);
  const [discoveredData, setDiscoveredData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSearchOnline = async () => {
    if (!name.trim()) {
      setErrorMsg('Por favor escribe el nombre de la bebida para buscar su receta.');
      return;
    }
    setErrorMsg(null);
    setSearching(true);
    try {
      const res = await searchBeverageRecipeOnline(name.trim(), category, config);
      setDiscoveredData(res);
    } catch (err) {
      console.error('Error buscando receta con IA:', err);
      setErrorMsg('Error al conectar con la búsqueda online. Intenta nuevamente.');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('El nombre de la bebida es obligatorio.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      // Si el usuario aún no buscó, ejecutamos la búsqueda para tener la receta lista
      let recData = discoveredData;
      if (!recData) {
        recData = await searchBeverageRecipeOnline(name.trim(), category, config);
      }

      const recipesObj = recData?.recipes || {};
      const r8 = recipesObj['8oz'];
      const r12 = recipesObj['12oz'];
      const r16 = recipesObj['16oz'];
      const _rStd = recipesObj['standard'];

      const numP8 = hasSizes ? Math.max(0, Number(p8) || 0) : 0;
      const numP12 = hasSizes ? Math.max(0, Number(p12) || 0) : 0;
      const numP16 = hasSizes ? Math.max(0, Number(p16) || 0) : 0;
      const numPStd = !hasSizes ? Math.max(0, Number(pStandard) || 0) : 0;

      const pbPayload = {
        name: name.trim(),
        category,
        price_8oz: numP8,
        price_12oz: numP12,
        price_16oz: numP16,
        price: numPStd,
        price_extra: category === 'extra' ? numPStd : 0,
        recipes: recipesObj,
        recipe8oz: formatRecipeForPb ? formatRecipeForPb(r8, config) : '',
        recipe12oz: formatRecipeForPb ? formatRecipeForPb(r12, config) : '',
        recipe16oz: formatRecipeForPb ? formatRecipeForPb(r16, config) : '',
        crema: true,
        extra_shot: true,
        leche_almendras: true,
      };

      const record = await pb.collection('products_cafeteria').create(pbPayload);

      if (onCreated) {
        onCreated(record, recipesObj);
      }

      onClose();
    } catch (err) {
      console.error('Error al guardar bebida en PocketBase:', err);
      setErrorMsg(err?.message || 'Error al guardar la bebida en el servidor');
    } finally {
      setSaving(false);
    }
  };

  const previewRecipe = discoveredData?.recipes?.['12oz'] || discoveredData?.recipes?.['standard'];

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <ModalHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  background: 'rgba(76, 205, 153, 0.2)',
                  borderRadius: 8,
                  padding: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={18} color="#4ccd99" />
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>
                Nueva Bebida de Cafetería
              </h3>
            </div>
            <button
              style={{ all: 'unset', cursor: 'pointer', color: '#B4B6C9', padding: 4 }}
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#B4B6C9' }}>
            Agrega una nueva bebida y la IA buscará su receta profesional en internet
            automáticamente.
          </div>
        </ModalHeader>

        <ModalBodyScroll>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 8,
                padding: '9px 12px',
                color: '#ef4444',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nombre y Búsqueda IA */}
          <FormGroup>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              Nombre de la Bebida / Producto
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Ej: Frappé Oreo, Iced Pistacho Latte, Flat White..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (discoveredData) setDiscoveredData(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchOnline();
                  }
                }}
                style={{
                  flex: 1,
                  background: '#0d1522',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={handleSearchOnline}
                disabled={searching || !name.trim()}
                title="Buscar receta en internet con IA"
                style={{
                  all: 'unset',
                  cursor: searching || !name.trim() ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  color: '#fff',
                  padding: '0 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  opacity: searching || !name.trim() ? 0.6 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {searching ? <RefreshCw className="animate-spin" size={14} /> : <Globe size={14} />}
                <span>{searching ? 'Buscando...' : 'Buscar con IA'}</span>
              </button>
            </div>
          </FormGroup>

          {/* Categoría */}
          <FormGroup>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Categoría</label>
            <CategoryFilter style={{ margin: 0, gap: 6, flexWrap: 'wrap' }}>
              {DRINK_CATEGORIES.map((cat) => (
                <CatChip
                  key={cat.id}
                  type="button"
                  $active={category === cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{ fontSize: 11.5, padding: '5px 10px' }}
                >
                  {cat.label}
                </CatChip>
              ))}
            </CategoryFilter>
          </FormGroup>

          {/* Tarjeta de Receta Descubierta por la IA */}
          {discoveredData && previewRecipe && (
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(76, 205, 153, 0.08) 100%)',
                border: '1px solid rgba(76, 205, 153, 0.35)',
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#4ccd99',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  <Sparkles size={14} />
                  <span>Receta Detectada con IA</span>
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    color: '#93c5fd',
                    background: 'rgba(37, 99, 235, 0.2)',
                    padding: '2px 7px',
                    borderRadius: 5,
                  }}
                >
                  {discoveredData.source || 'Estándar Barista'}
                </span>
              </div>

              <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.4 }}>
                {discoveredData.summary}
              </div>

              {/* Dosis de ingredientes detectadas (vista 12oz) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {previewRecipe.coffeeGrams > 0 && (
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#f59e0b',
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 6,
                    }}
                  >
                    ☕ {previewRecipe.coffeeGrams}g espresso
                  </span>
                )}
                {previewRecipe.milkMl > 0 && (
                  <span
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 6,
                    }}
                  >
                    🥛 {previewRecipe.milkMl}ml leche
                  </span>
                )}
                {previewRecipe.iceGrams > 0 && (
                  <span
                    style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 6,
                    }}
                  >
                    🧊 {previewRecipe.iceGrams}g hielo
                  </span>
                )}
                {previewRecipe.rawRecipeText &&
                  (previewRecipe.rawRecipeText.toLowerCase().includes('oreo') ||
                    previewRecipe.rawRecipeText.toLowerCase().includes('galleta')) && (
                    <span
                      style={{
                        background: 'rgba(236, 72, 153, 0.15)',
                        border: '1px solid rgba(236, 72, 153, 0.3)',
                        color: '#f472b6',
                        fontSize: 11,
                        padding: '2px 7px',
                        borderRadius: 6,
                      }}
                    >
                      🍪 Galletitas Oreo trituradas
                    </span>
                  )}
                {previewRecipe.sauceGrams > 0 && (
                  <span
                    style={{
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      color: '#c084fc',
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 6,
                    }}
                  >
                    🍫 {previewRecipe.sauceGrams}g salsa {previewRecipe.sauceFlavor}
                  </span>
                )}
                {previewRecipe.syrupMl > 0 && (
                  <span
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      color: '#facc15',
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 6,
                    }}
                  >
                    🍯 {previewRecipe.syrupMl}ml syrup {previewRecipe.syrupFlavor}
                  </span>
                )}
                {previewRecipe.whippedCreamGrams > 0 && (
                  <span
                    style={{
                      background: 'rgba(244, 114, 182, 0.15)',
                      border: '1px solid rgba(244, 114, 182, 0.3)',
                      color: '#f472b6',
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 6,
                    }}
                  >
                    🧁 {previewRecipe.whippedCreamGrams}g crema chantilly
                  </span>
                )}
                <span
                  style={{
                    background: 'rgba(148, 163, 184, 0.15)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    color: '#cbd5e1',
                    fontSize: 11,
                    padding: '2px 7px',
                    borderRadius: 6,
                  }}
                >
                  🥤 Vaso{' '}
                  {previewRecipe.cupType === 'milkshake' ? 'milkshake (domo)' : 'café caliente'}
                </span>
              </div>
            </div>
          )}

          {/* Precios de venta */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#4ccd99' }}>
                Precios de Venta Sugeridos
              </span>
              <label
                style={{
                  fontSize: 11.5,
                  color: '#B4B6C9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={hasSizes}
                  onChange={(e) => setHasSizes(e.target.checked)}
                />
                Múltiples tamaños (8oz / 12oz / 16oz)
              </label>
            </div>

            {hasSizes ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div>
                  <label
                    style={{ fontSize: 11, color: '#B4B6C9', marginBottom: 4, display: 'block' }}
                  >
                    8oz (Chico)
                  </label>
                  <InputNumber style={{ padding: '6px 8px', background: '#0b1320' }}>
                    <span className="prefix" style={{ color: '#4ccd99' }}>
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={p8}
                      onChange={(e) => setP8(e.target.value)}
                    />
                  </InputNumber>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: '#4ccd99',
                      fontWeight: 700,
                      marginBottom: 4,
                      display: 'block',
                    }}
                  >
                    12oz (Mediano)
                  </label>
                  <InputNumber
                    style={{
                      padding: '6px 8px',
                      background: '#0b1320',
                      borderColor: 'rgba(76, 205, 153, 0.4)',
                    }}
                  >
                    <span className="prefix" style={{ color: '#4ccd99' }}>
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="7100"
                      value={p12}
                      onChange={(e) => setP12(e.target.value)}
                    />
                  </InputNumber>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      color: '#a855f7',
                      fontWeight: 700,
                      marginBottom: 4,
                      display: 'block',
                    }}
                  >
                    16oz (Grande)
                  </label>
                  <InputNumber
                    style={{
                      padding: '6px 8px',
                      background: '#0b1320',
                      borderColor: 'rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    <span className="prefix" style={{ color: '#a855f7' }}>
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="7700"
                      value={p16}
                      onChange={(e) => setP16(e.target.value)}
                    />
                  </InputNumber>
                </div>
              </div>
            ) : (
              <div>
                <label
                  style={{ fontSize: 11, color: '#B4B6C9', marginBottom: 4, display: 'block' }}
                >
                  Precio Único Estándar
                </label>
                <InputNumber style={{ padding: '6px 8px', background: '#0b1320' }}>
                  <span className="prefix" style={{ color: '#4ccd99' }}>
                    $
                  </span>
                  <input
                    type="number"
                    placeholder="7100"
                    value={pStandard}
                    onChange={(e) => setPStandard(e.target.value)}
                  />
                </InputNumber>
              </div>
            )}
          </div>
        </ModalBodyScroll>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            style={{
              all: 'unset',
              cursor: 'pointer',
              color: '#B4B6C9',
              padding: '8px 16px',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <ActionButton
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              opacity: saving || !name.trim() ? 0.6 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {saving ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
            <span>{saving ? 'Guardando en PocketBase...' : 'Guardar Bebida'}</span>
          </ActionButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}
