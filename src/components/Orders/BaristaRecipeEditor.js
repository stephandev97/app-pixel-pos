// src/components/Orders/BaristaRecipeEditor.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  X,
  CupSoda,
  AlertCircle,
  Sparkles,
  Scale,
  ChevronDown,
} from 'lucide-react';
import {
  saveCustomBaristaRecipe,
  resetCustomBaristaRecipe,
  hasCustomBaristaRecipe,
  hasAnyCustomBaristaRecipeForDrink,
  resetAllCustomBaristaRecipesForDrink,
  getMasterAIRecipe,
  adaptRecipeFromSize,
  getVolumeRatio,
} from './baristaRecipesData';

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  font-family: 'Inter', -apple-system, sans-serif;
  box-sizing: border-box;
`;

const EditorHeader = styled.div`
  padding: 14px 18px;
  border-bottom: 1px solid #f4f4f5;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  box-sizing: border-box;
`;

const DevTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 800;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 2px 7px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const EditorBody = styled.div`
  padding: 16px 18px;
  overflow-y: auto;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e4e4e7;
    border-radius: 4px;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.78rem;
  font-weight: 800;
  color: #09090b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const StyledInput = styled.input`
  padding: 8px 10px;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #18181b;
  background: #ffffff;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #09090b;
    box-shadow: 0 0 0 2px rgba(9, 9, 11, 0.08);
  }

  &::placeholder {
    color: #a1a1aa;
    font-weight: 500;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #18181b;
  background: #ffffff;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 48px;
  box-sizing: border-box;
  line-height: 1.4;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #09090b;
    box-shadow: 0 0 0 2px rgba(9, 9, 11, 0.08);
  }

  &::placeholder {
    color: #a1a1aa;
  }
`;

const IconButton = styled.button`
  background: ${(props) => (props.$danger ? '#fef2f2' : '#f4f4f5')};
  color: ${(props) => (props.$danger ? '#ef4444' : '#71717a')};
  border: 1px solid ${(props) => (props.$danger ? '#fee2e2' : '#e4e4e7')};
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.12s ease;

  &:hover {
    background: ${(props) => (props.$danger ? '#fee2e2' : '#e4e4e7')};
    color: ${(props) => (props.$danger ? '#dc2626' : '#09090b')};
  }
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f4f4f5;
  color: #18181b;
  border: 1px solid #e4e4e7;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    background: #e4e4e7;
  }
`;

const EditorFooter = styled.div`
  padding: 12px 18px;
  border-top: 1px solid #f4f4f5;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
  box-sizing: border-box;
`;

export default function BaristaRecipeEditor({
  recipeData,
  onClose,
  onSelectSize,
}) {
  const [glass, setGlass] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [pumpRule, setPumpRule] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showAdaptPanel, setShowAdaptPanel] = useState(false);

  // Cargar los valores de la receta actual en el formulario de edición
  useEffect(() => {
    if (recipeData) {
      setGlass(recipeData.glass || '');
      setIngredients(
        (recipeData.ingredients || []).map((i) => ({
          name: i.name || '',
          amount: i.amount || '',
        }))
      );
      setSteps(
        (recipeData.steps || []).map((s) => (typeof s === 'string' ? s : ''))
      );
      setPumpRule(recipeData.pumpRule || '');
      setShowAdaptPanel(false);
    }
  }, [
    recipeData?.masterKey,
    recipeData?.activeSize,
    recipeData?.isCold,
    recipeData?.isCustom,
  ]);

  if (!recipeData) return null;

  const activeSize = recipeData.activeSize || '12oz';
  const availableSizes = recipeData.availableSizes || ['12oz'];
  const otherSizes = availableSizes.filter((sz) => sz !== activeSize);
  const hasCustomCurrentSize = hasCustomBaristaRecipe(
    recipeData.masterKey,
    activeSize,
    recipeData.isCold
  );
  const hasAnyCustom = hasAnyCustomBaristaRecipeForDrink(recipeData.masterKey);

  // Manejadores de Ingredientes
  const handleIngredientChange = (idx, field, value) => {
    setIngredients((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleAddIngredient = () => {
    setIngredients((prev) => [...prev, { name: '', amount: '' }]);
  };

  const handleRemoveIngredient = (idx) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  // Manejadores de Pasos
  const handleStepChange = (idx, value) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const handleAddStep = () => {
    setSteps((prev) => [...prev, '']);
  };

  const handleRemoveStep = (idx) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  // Guardar Cambios exclusivamente para la medida activa
  const handleSave = async () => {
    setIsSaving(true);
    const validIngredients = ingredients.filter(
      (i) => i.name.trim() || i.amount.trim()
    );
    const validSteps = steps.filter((s) => s.trim());

    const ok = saveCustomBaristaRecipe({
      masterKey: recipeData.masterKey,
      size: activeSize,
      glass: glass.trim(),
      ingredients: validIngredients,
      steps: validSteps,
      pumpRule: pumpRule.trim() || undefined,
      isCold: recipeData.isCold,
      dbProdId: recipeData.dbProdId,
    });

    setIsSaving(false);
    if (ok) {
      setMsg({ type: 'success', text: `✅ ¡Receta de ${activeSize} guardada con éxito!` });
      setTimeout(() => {
        setMsg(null);
        onClose?.();
      }, 1000);
    } else {
      setMsg({ type: 'error', text: '❌ Error al guardar la receta' });
    }
  };

  // Restaurar a la receta predeterminada de la IA
  const handleResetToAI = (resetAll = false) => {
    const confirmPrompt = resetAll
      ? `¿Restaurar la receta predeterminada de la IA para TODAS las medidas de ${recipeData.productName}?`
      : `¿Restaurar la receta predeterminada de la IA para ${recipeData.productName} (${activeSize})?`;

    if (window.confirm(confirmPrompt)) {
      if (resetAll) {
        resetAllCustomBaristaRecipesForDrink(recipeData.masterKey);
      } else {
        resetCustomBaristaRecipe(
          recipeData.masterKey,
          activeSize,
          recipeData.isCold
        );
      }

      // Repoblar inmediatamente los campos del editor con la receta maestra de la IA
      const aiMaster = getMasterAIRecipe(
        recipeData.masterKey,
        activeSize,
        recipeData.isCold
      );

      if (aiMaster) {
        setGlass(aiMaster.glass || '');
        setIngredients(
          (aiMaster.ingredients || []).map((i) => ({
            name: i.name || '',
            amount: i.amount || '',
          }))
        );
        setSteps(
          (aiMaster.steps || []).map((s) => (typeof s === 'string' ? s : ''))
        );
        setPumpRule(aiMaster.pumpRule || '');
      }

      setMsg({
        type: 'info',
        text: resetAll
          ? `↺ Todas las medidas restauradas a la receta oficial de la IA`
          : `↺ Medida ${activeSize} restaurada a la receta predeterminada de la IA`,
      });

      setTimeout(() => {
        setMsg(null);
      }, 2500);
    }
  };

  // Adaptar proporcionalmente desde otra medida considerando cantidad y volumen comparativo
  const handleAdaptFrom = (sourceSize) => {
    const ratioInfo = getVolumeRatio(sourceSize, activeSize);
    const confirmMsg = `¿Adaptar la receta de ${activeSize} tomando como base la medida de ${sourceSize} (${ratioInfo.label})?\n\nEsto reemplazará los ingredientes actuales del formulario con los valores calculados proporcionalmente según la diferencia de volumen.`;
    if (!window.confirm(confirmMsg)) return;

    const adapted = adaptRecipeFromSize({
      masterKey: recipeData.masterKey,
      productName: recipeData.productName,
      sourceSize,
      targetSize: activeSize,
      isCold: recipeData.isCold,
    });

    if (!adapted) {
      setMsg({ type: 'error', text: `❌ No se pudo adaptar la receta desde ${sourceSize}` });
      return;
    }

    setGlass(adapted.glass || '');
    setIngredients(
      (adapted.ingredients || []).map((i) => ({
        name: i.name || '',
        amount: i.amount || '',
      }))
    );
    setSteps((adapted.steps || []).map((s) => (typeof s === 'string' ? s : '')));
    if (adapted.pumpRule) {
      setPumpRule(adapted.pumpRule);
    }

    setShowAdaptPanel(false);
    setMsg({
      type: 'success',
      text: `📐 ¡Receta de ${activeSize} adaptada desde ${sourceSize} (${ratioInfo.label})! Revisa los ingredientes y pulsa 'Guardar ${activeSize}'.`,
    });
    setTimeout(() => {
      setMsg(null);
    }, 4500);
  };

  return (
    <EditorContainer onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <EditorHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <DevTag>
                <Sparkles size={11} /> Dev Mode
              </DevTag>
              {hasCustomCurrentSize ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '0.67rem',
                    fontWeight: 750,
                    background: '#fef3c7',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    padding: '2px 7px',
                    borderRadius: 999,
                  }}
                >
                  ✏️ {activeSize} Editada
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '0.67rem',
                    fontWeight: 750,
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    padding: '2px 7px',
                    borderRadius: 999,
                  }}
                >
                  ✨ {activeSize} Original IA
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#09090b',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Editar Receta: {recipeData.productName}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#71717a' }}>
              Edita proporciones de {activeSize}. Las demás medidas se mantienen independientes.
            </div>
          </div>
        </div>

        <IconButton onClick={onClose} title="Cerrar editor" aria-label="Cerrar">
          <X size={16} strokeWidth={2.4} />
        </IconButton>
      </EditorHeader>

      {/* Selector de Medida en Edición y Adaptación Proporcional */}
      {availableSizes.length > 1 && (
        <div
          style={{
            padding: '8px 18px',
            borderBottom: '1px solid #f4f4f5',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            boxSizing: 'border-box',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#71717a' }}>
              Medida a editar:
            </span>
            <div
              style={{
                display: 'flex',
                background: '#f4f4f5',
                padding: 2,
                borderRadius: 8,
                gap: 3,
              }}
            >
              {availableSizes.map((sz) => {
                const isSzActive = activeSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      setShowAdaptPanel(false);
                      onSelectSize?.(sz);
                    }}
                    style={{
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: isSzActive ? 800 : 600,
                      background: isSzActive ? '#09090b' : 'transparent',
                      color: isSzActive ? '#ffffff' : '#71717a',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón para abrir el panel de adaptación de medida */}
          {otherSizes.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAdaptPanel((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: showAdaptPanel ? '#09090b' : '#f4f4f5',
                color: showAdaptPanel ? '#ffffff' : '#18181b',
                border: '1px solid',
                borderColor: showAdaptPanel ? '#09090b' : '#e4e4e7',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.14s ease',
              }}
              title={`Adaptar y escalar proporcionalmente la receta de ${activeSize} usando otra medida`}
            >
              <Scale size={12} strokeWidth={2.4} />
              <span>Adaptar desde otra medida</span>
              <ChevronDown
                size={12}
                style={{
                  transform: showAdaptPanel ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>
          )}
        </div>
      )}

      {/* Panel Desplegable: Adaptar Receta Proporcionalmente */}
      {showAdaptPanel && otherSizes.length > 0 && (
        <div
          style={{
            padding: '10px 18px',
            background: '#fafafa',
            borderBottom: '1px solid #e4e4e7',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#09090b' }}>
              📐 Adaptar receta de {activeSize} tomando como base:
            </div>
            <button
              type="button"
              onClick={() => setShowAdaptPanel(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
                padding: 2,
              }}
              title="Cerrar panel de adaptación"
            >
              <X size={13} />
            </button>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#71717a', lineHeight: 1.3 }}>
            Escala automáticamente las cantidades de ingredientes (líquidos, hielo, jarabes y gramajes) según la proporción comparativa de volumen:
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {otherSizes.map((srcSize) => {
              const ratio = getVolumeRatio(srcSize, activeSize);
              return (
                <button
                  key={srcSize}
                  type="button"
                  onClick={() => handleAdaptFrom(srcSize)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#ffffff',
                    border: '1px solid #d4d4d8',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#09090b',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#09090b';
                    e.currentTarget.style.background = '#f4f4f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d4d4d8';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  title={`Adaptar receta desde ${srcSize} aplicando factor ${ratio.factor.toFixed(2)}x`}
                >
                  <Scale size={12} strokeWidth={2.4} style={{ color: '#2563eb' }} />
                  <span>
                    Tomar de <strong>{srcSize}</strong>
                  </span>
                  <span
                    style={{
                      fontSize: '0.67rem',
                      fontWeight: 800,
                      background:
                        ratio.percentDiff > 0
                          ? '#eff6ff'
                          : ratio.percentDiff < 0
                          ? '#fef2f2'
                          : '#f4f4f5',
                      color:
                        ratio.percentDiff > 0
                          ? '#1d4ed8'
                          : ratio.percentDiff < 0
                          ? '#b91c1c'
                          : '#52525b',
                      padding: '1px 5px',
                      borderRadius: 4,
                    }}
                  >
                    {ratio.percentDiff > 0 ? `+${ratio.percentDiff}%` : `${ratio.percentDiff}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensaje de feedback */}
      {msg && (
        <div
          style={{
            padding: '8px 18px',
            background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: msg.type === 'error' ? '#b91c1c' : '#15803d',
            fontSize: '0.78rem',
            fontWeight: 700,
            borderBottom:
              msg.type === 'error' ? '1px solid #fee2e2' : '1px solid #dcfce7',
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Cuerpo del Editor */}
      <EditorBody>
        {/* Tipo de Vaso */}
        <div>
          <SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CupSoda size={13} strokeWidth={2.4} />
              <span>Tipo de Vaso / Presentación</span>
            </div>
          </SectionTitle>
          <StyledInput
            style={{ width: '100%' }}
            value={glass}
            onChange={(e) => setGlass(e.target.value)}
            placeholder="Ej: Vaso Domo 12oz, Vaso Térmico 8oz..."
          />
        </div>

        {/* Ingredientes */}
        <div>
          <SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={13} strokeWidth={2.4} />
              <span>Ingredientes ({activeSize})</span>
            </div>
            <AddButton type="button" onClick={handleAddIngredient}>
              <Plus size={12} strokeWidth={2.6} /> Agregar ingrediente
            </AddButton>
          </SectionTitle>

          {ingredients.length === 0 ? (
            <div
              style={{
                padding: '12px',
                textAlign: 'center',
                color: '#a1a1aa',
                fontSize: '0.78rem',
                border: '1px dashed #e4e4e7',
                borderRadius: 8,
              }}
            >
              No hay ingredientes cargados. Haz clic en "+ Agregar ingrediente".
            </div>
          ) : (
            ingredients.map((ing, idx) => (
              <InputRow key={idx}>
                <StyledInput
                  style={{ flex: '1 1 auto', minWidth: 120 }}
                  value={ing.name}
                  onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  placeholder="Ingrediente (ej: Café Espresso)"
                />
                <StyledInput
                  style={{ width: 140, flexShrink: 0 }}
                  value={ing.amount}
                  onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                  placeholder="Cantidad (ej: 18g)"
                />
                <IconButton
                  type="button"
                  $danger
                  onClick={() => handleRemoveIngredient(idx)}
                  title="Eliminar ingrediente"
                >
                  <Trash2 size={13} />
                </IconButton>
              </InputRow>
            ))
          )}
        </div>

        {/* Pasos de Preparación */}
        <div>
          <SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={13} strokeWidth={2.4} />
              <span>Pasos de Preparación</span>
            </div>
            <AddButton type="button" onClick={handleAddStep}>
              <Plus size={12} strokeWidth={2.6} /> Agregar paso
            </AddButton>
          </SectionTitle>

          {steps.length === 0 ? (
            <div
              style={{
                padding: '12px',
                textAlign: 'center',
                color: '#a1a1aa',
                fontSize: '0.78rem',
                border: '1px dashed #e4e4e7',
                borderRadius: 8,
              }}
            >
              No hay pasos cargados. Haz clic en "+ Agregar paso".
            </div>
          ) : (
            steps.map((st, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#09090b',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                >
                  {idx + 1}
                </span>
                <StyledTextarea
                  value={st}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  placeholder={`Instrucción para el paso ${idx + 1}...`}
                />
                <IconButton
                  type="button"
                  $danger
                  onClick={() => handleRemoveStep(idx)}
                  title="Eliminar paso"
                  style={{ marginTop: 6 }}
                >
                  <Trash2 size={13} />
                </IconButton>
              </div>
            ))
          )}
        </div>

        {/* Regla / Tip / Dosificación */}
        <div>
          <SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={13} strokeWidth={2.4} />
              <span>Regla de Dosificación o Tip (Opcional)</span>
            </div>
          </SectionTitle>
          <StyledInput
            style={{ width: '100%' }}
            value={pumpRule}
            onChange={(e) => setPumpRule(e.target.value)}
            placeholder="Ej: 5 pumps aprox para 100gr (~20g por disparo)"
          />
        </div>
      </EditorBody>

      {/* Footer con Acciones */}
      <EditorFooter>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {(hasCustomCurrentSize || hasAnyCustom) && (
            <button
              type="button"
              onClick={() => handleResetToAI(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#fff1f2',
                color: '#e11d48',
                border: '1px solid #ffe4e6',
                borderRadius: 8,
                padding: '7px 11px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              title={`Volver a la receta predeterminada de la IA para ${activeSize}`}
            >
              <RotateCcw size={12} strokeWidth={2.6} />
              Volver a IA ({activeSize})
            </button>
          )}

          {hasAnyCustom && availableSizes.length > 1 && (
            <button
              type="button"
              onClick={() => handleResetToAI(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#f4f4f5',
                color: '#52525b',
                border: '1px solid #e4e4e7',
                borderRadius: 8,
                padding: '7px 10px',
                fontSize: '0.72rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
              title="Restaurar todas las medidas de esta bebida a las recetas oficiales de la IA"
            >
              <RotateCcw size={11} strokeWidth={2.4} />
              Todas las medidas a IA
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f4f4f5',
              color: '#3f3f46',
              border: '1px solid #e4e4e7',
              borderRadius: 8,
              padding: '7px 14px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#09090b',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '7px 16px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: isSaving ? 'wait' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Save size={13} strokeWidth={2.4} />
            {isSaving ? 'Guardando...' : `Guardar ${activeSize}`}
          </button>
        </div>
      </EditorFooter>
    </EditorContainer>
  );
}
