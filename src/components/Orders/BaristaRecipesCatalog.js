// src/components/Orders/BaristaRecipesCatalog.js
import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  Coffee,
  Snowflake,
  Sparkles,
  Search,
  BookOpen,
  Info,
  CheckCircle2,
  ChevronRight,
  Layers,
  X,
  Edit2,
  RotateCcw,
} from 'lucide-react';
import {
  MASTER_RECIPES,
  getBaristaRecipe,
  resetCustomBaristaRecipe,
  resetAllCustomBaristaRecipes,
  hasAnyCustomBaristaRecipeForDrink,
} from './baristaRecipesData';
import BaristaRecipeEditor from './BaristaRecipeEditor';
import { pb } from '../../lib/pb';

const SMOOTHIE_FLAVORS = [
  'Frutos del Bosque',
  'Frutilla',
  'Mango-Maracuyá',
  'Frutilla-Naranja',
];

// 4 Categorías que ocupan el 100% del ancho de la pantalla (se quitó 'Todas')
const CATEGORIES = [
  { id: 'clasico', label: '☕ Cafetería', icon: Coffee },
  { id: 'frappe', label: '🍧 Frappés', icon: Sparkles },
  { id: 'smoothie', label: '🍓 Smoothies', icon: Sparkles },
  { id: 'frio', label: '🧊 Fríos / Iced', icon: Snowflake },
];

const CatalogWrapper = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 4px 6px 30px;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow-x: hidden;

  @media (max-width: 640px) {
    padding: 2px 2px 20px;
  }
`;

const CatalogBanner = styled.div`
  background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
  color: #ffffff;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  width: 100%;
`;

const CategoryTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  box-sizing: border-box;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }
`;

const CategoryButton = styled.button`
  width: 100%;
  padding: 8px 10px;
  border-radius: 9px;
  border: ${(props) => (props.$active ? '1.5px solid #09090b' : '1px solid #e4e4e7')};
  background: ${(props) => (props.$active ? '#09090b' : '#ffffff')};
  color: ${(props) => (props.$active ? '#ffffff' : '#52525b')};
  font-weight: ${(props) => (props.$active ? 750 : 600)};
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.12s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: ${(props) => (props.$active ? '0 2px 6px rgba(0,0,0,0.1)' : 'none')};
  box-sizing: border-box;
  text-align: center;

  &:hover {
    background: ${(props) => (props.$active ? '#09090b' : '#f4f4f5')};
    color: ${(props) => (props.$active ? '#ffffff' : '#18181b')};
  }
`;

const DrinkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 8px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const DrinkCard = styled.div`
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
  transition: all 0.14s ease;
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: #09090b;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function BaristaRecipesCatalog({ cafeteriaProducts = [] }) {
  // Pestaña inicial 'clasico' (Cafetería)
  const [selectedCategory, setSelectedCategory] = useState('clasico');
  const [searchQuery, setSearchQuery] = useState('');

  // Detección de entorno Dev / Admin
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

  // Estado para el modal de receta y modo edición
  const [modalDrinkKey, setModalDrinkKey] = useState(null);
  const [modalSize, setModalSize] = useState('12oz');
  const [modalSmoothieFlavor, setModalSmoothieFlavor] = useState('Frutos del Bosque');
  const [modalSinCafe, setModalSinCafe] = useState(false);
  const [isEditingRecipe, setIsEditingRecipe] = useState(false);
  const [recipeVersion, setRecipeVersion] = useState(0);

  // Escuchar actualizaciones de recetas para refrescar reactivamente
  useEffect(() => {
    const handler = () => setRecipeVersion((v) => v + 1);
    window.addEventListener('barista-recipes-updated', handler);
    return () => window.removeEventListener('barista-recipes-updated', handler);
  }, []);

  // Carga fallback de productos de cafetería desde PocketBase si no se pasan por prop
  const [internalProducts, setInternalProducts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pb_cafeteria_products_v1') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (cafeteriaProducts && cafeteriaProducts.length > 0) return;
    let cancelled = false;
    pb.collection('products_cafeteria')
      .getFullList({ sort: 'name' })
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          setInternalProducts(list);
          try {
            localStorage.setItem('pb_cafeteria_products_v1', JSON.stringify(list));
          } catch {}
        }
      })
      .catch((err) => console.log('PB cafeteria products fallback load:', err));

    return () => {
      cancelled = true;
    };
  }, [cafeteriaProducts]);

  const effectiveCafeteriaProducts =
    cafeteriaProducts && cafeteriaProducts.length > 0 ? cafeteriaProducts : internalProducts;

  // Lista de bebidas catalogadas calculando únicamente los tamaños disponibles
  const recipeList = useMemo(() => {
    const list = [];

    Object.entries(MASTER_RECIPES).forEach(([key, data]) => {
      let cat = data.category || 'clasico';
      if (key.includes('smoothie')) cat = 'smoothie';
      else if (data.isFrappe) cat = 'frappe';
      else if (data.isCold) cat = 'frio';
      else if (cat === 'caliente') cat = 'clasico';

      // Filtrar y determinar tamaños que REALMENTE se usan y están disponibles
      let availableSizes = [];

      if (key.includes('smoothie')) {
        availableSizes = ['12oz'];
      } else if (key === 'espresso') {
        availableSizes = ['8oz'];
      } else if (key === 'flat white') {
        availableSizes = ['8oz', '12oz'];
      } else if (data.isFrappe) {
        // Frappés en Pixel únicamente se sirven en 12oz y 16oz (vaso domo)
        availableSizes = ['12oz', '16oz'];
      } else {
        const normKey = key.toLowerCase();
        const dbProd = effectiveCafeteriaProducts.find((p) => {
          const pn = (p.name || '').toLowerCase().trim();
          return pn === normKey || normKey.includes(pn) || pn.includes(normKey);
        });

        if (dbProd) {
          if (Number(dbProd.price_8oz) > 0 || (dbProd.recipe8oz && dbProd.recipe8oz.trim())) {
            availableSizes.push('8oz');
          }
          if (Number(dbProd.price_12oz) > 0 || (dbProd.recipe12oz && dbProd.recipe12oz.trim())) {
            availableSizes.push('12oz');
          }
          if (Number(dbProd.price_16oz) > 0 || (dbProd.recipe16oz && dbProd.recipe16oz.trim())) {
            availableSizes.push('16oz');
          }
        }

        if (availableSizes.length === 0) {
          availableSizes = Object.keys(data.sizes || {});
        }
      }

      if (availableSizes.length === 0) {
        availableSizes = ['12oz'];
      }

      list.push({
        key,
        name: data.name,
        category: cat,
        isFrappe: Boolean(data.isFrappe),
        isCold: Boolean(data.isCold),
        isSmoothie: key.includes('smoothie'),
        glass: data.glass,
        sizes: availableSizes,
        pumpRule: data.pumpRule,
      });

      // Si el café tiene versión fría oficial (coldOverride), agregarlo a la categoría 'frio'
      if (data.coldOverride) {
        const coldSizes = ['12oz', '16oz'];
        list.push({
          key: `iced-${key}`,
          baseKey: key,
          name: `Iced ${data.name}`,
          category: 'frio',
          isFrappe: false,
          isCold: true,
          isSmoothie: false,
          glass: 'Vaso Domo / Copa con hielo',
          sizes: coldSizes,
          pumpRule: data.pumpRule,
        });
      }
    });

    return list;
  }, [effectiveCafeteriaProducts]);

  // Filtrado por categoría y buscador
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return recipeList.filter((item) => {
      // Si el usuario escribe una búsqueda, busca globalmente en todas las recetas
      if (q) {
        return item.name.toLowerCase().includes(q) || item.key.toLowerCase().includes(q);
      }
      // Sin búsqueda de texto, respeta estrictamente la pestaña de categoría activa
      return item.category === selectedCategory;
    });
  }, [recipeList, selectedCategory, searchQuery]);

  // Al abrir el modal de una bebida (soporta iniciar en edición si es dev)
  const handleOpenDrink = (drink, startInEdit = false) => {
    setModalDrinkKey(drink.key);
    setIsEditingRecipe(Boolean(startInEdit));
    setModalSinCafe(false);
    if (drink.isSmoothie) {
      setModalSize('12oz');
    } else {
      const defaultSz = drink.sizes.includes('12oz')
        ? '12oz'
        : drink.sizes[0] || '12oz';
      setModalSize(defaultSz);
    }
  };

  const handleCloseModal = () => {
    setModalDrinkKey(null);
    setIsEditingRecipe(false);
    setModalSinCafe(false);
  };

  // Manejo de tecla Escape para cerrar el modal
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };
    if (modalDrinkKey) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalDrinkKey]);

  // Obtener la receta técnica activa para el modal
  const modalRecipeData = useMemo(() => {
    if (!modalDrinkKey) return null;
    const activeItem = recipeList.find((r) => r.key === modalDrinkKey);
    if (!activeItem) return null;

    const dummyItem = {
      name: activeItem.name,
      size: activeItem.isSmoothie ? '12oz' : modalSize,
      sabor: activeItem.isSmoothie ? modalSmoothieFlavor : undefined,
      flavor: activeItem.isSmoothie ? modalSmoothieFlavor : undefined,
      isCold: activeItem.isCold,
      sinCafe: modalSinCafe,
      isSinCafe: modalSinCafe,
      withoutCoffee: modalSinCafe,
    };

    const rec = getBaristaRecipe(dummyItem, effectiveCafeteriaProducts);
    if (!rec) return null;

    // Asegurar que availableSizes respete los tamaños activos de activeItem
    return {
      ...rec,
      availableSizes: activeItem.sizes || rec.availableSizes || ['12oz'],
    };
  }, [
    modalDrinkKey,
    modalSize,
    modalSmoothieFlavor,
    modalSinCafe,
    recipeList,
    effectiveCafeteriaProducts,
    recipeVersion,
  ]);

  const isModalSmoothie = modalDrinkKey && modalDrinkKey.includes('smoothie');

  return (
    <CatalogWrapper>
      {/* Banner Superior: Título arriba + Barra de Búsqueda al 100% de ancho */}
      <CatalogBanner>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#ffffff',
                color: '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                flexShrink: 0,
              }}
            >
              <BookOpen size={16} strokeWidth={2.4} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  wordBreak: 'break-word',
                  lineHeight: 1.2,
                }}
              >
                Recetario Técnico Barista
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: 1 }}>
                Click en cualquier bebida para abrir su receta técnica y proporciones de barra.
              </div>
            </div>
          </div>

          {isDev && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span
                style={{
                  fontSize: '0.67rem',
                  fontWeight: 800,
                  background: '#fef3c7',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                  padding: '2px 7px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}
              >
                Dev Mode
              </span>
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Restablecer TODAS las recetas personalizadas del catálogo a las predeterminadas originales de la IA?'
                    )
                  ) {
                    resetAllCustomBaristaRecipes();
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 0.15s ease',
                }}
                title="Restablecer todas las recetas del catálogo a las recetas originales de la IA"
              >
                <RotateCcw size={11} strokeWidth={2.4} />
                <span>Restablecer todo a IA</span>
              </button>
            </div>
          )}
        </div>

        {/* Buscador al 100% del ancho del contenedor */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar bebida (ej. frappé oreo, latte, cappuccino, smoothie...)"
            style={{
              width: '100%',
              padding: '8px 32px 8px 36px',
              borderRadius: 8,
              border: '1px solid #3f3f46',
              background: '#27272a',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#a1a1aa',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </CatalogBanner>

      {/* Pestañas de Categoría: 4 botones que ocupan el 100% del ancho total */}
      <CategoryTabs>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <CategoryButton
              key={cat.id}
              type="button"
              $active={isActive}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.label}</span>
            </CategoryButton>
          );
        })}
      </CategoryTabs>

      {/* Grilla de Bebidas (Tarjetas compactas en alto) */}
      <DrinkGrid>
        {filteredList.map((item) => {
          const isSmoothie = item.isSmoothie;
          const isFrappe = item.isFrappe;
          const isCold = item.isCold;

          const avatarBg = isSmoothie
            ? '#fdf2f8'
            : isFrappe
            ? '#eff6ff'
            : isCold
            ? '#f0f9ff'
            : '#fef2f2';

          const avatarColor = isSmoothie
            ? '#be185d'
            : isFrappe
            ? '#1d4ed8'
            : isCold
            ? '#0284c7'
            : '#b91c1c';

          const categoryPillBg = isSmoothie
            ? '#fdf2f8'
            : isFrappe
            ? '#eff6ff'
            : isCold
            ? '#f0f9ff'
            : '#f4f4f5';

          const categoryPillColor = isSmoothie
            ? '#be185d'
            : isFrappe
            ? '#1d4ed8'
            : isCold
            ? '#0284c7'
            : '#52525b';

          const categoryLabel = isSmoothie
            ? '🍓 Smoothie'
            : isFrappe
            ? '🍧 Frappé'
            : isCold
            ? '🧊 Frío'
            : '☕ Cafetería';

          return (
            <DrinkCard
              key={item.key}
              onClick={() => handleOpenDrink(item)}
              role="button"
              tabIndex={0}
              aria-label={`Ver receta de ${item.name}`}
            >
              {/* Fila Superior: Icono + Nombre + Etiqueta Categoría */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: avatarBg,
                      color: avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isSmoothie ? (
                      <Sparkles size={14} strokeWidth={2.4} />
                    ) : isFrappe ? (
                      <Sparkles size={14} strokeWidth={2.4} />
                    ) : isCold ? (
                      <Snowflake size={14} strokeWidth={2.4} />
                    ) : (
                      <Coffee size={14} strokeWidth={2.2} />
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 750,
                      color: '#09090b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: categoryPillBg,
                    color: categoryPillColor,
                    border: '1px solid rgba(0,0,0,0.06)',
                    flexShrink: 0,
                  }}
                >
                  {categoryLabel}
                </span>
              </div>

              {/* Fila Inferior: Medidas disponibles (filtradas) + Ver Receta */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                  paddingTop: 2,
                }}
              >
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                  {item.sizes.length === 1 ? (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: '#f4f4f5',
                        color: '#3f3f46',
                        padding: '1px 5px',
                        borderRadius: 4,
                      }}
                    >
                      {item.sizes[0]} única
                    </span>
                  ) : (
                    item.sizes.map((sz) => (
                      <span
                        key={sz}
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: '#f4f4f5',
                          color: '#3f3f46',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        {sz}
                      </span>
                    ))
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  {isDev && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDrink(item, true);
                      }}
                      style={{
                        background: hasAnyCustomBaristaRecipeForDrink(item.baseKey || item.key)
                          ? '#fef3c7'
                          : '#f4f4f5',
                        border: hasAnyCustomBaristaRecipeForDrink(item.baseKey || item.key)
                          ? '1px solid #fde68a'
                          : '1px solid #e4e4e7',
                        color: hasAnyCustomBaristaRecipeForDrink(item.baseKey || item.key)
                          ? '#b45309'
                          : '#52525b',
                        padding: '2px 5px',
                        borderRadius: 5,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        fontSize: '0.67rem',
                        fontWeight: 700,
                        transition: 'all 0.12s ease',
                      }}
                      title="Editar receta (Dev)"
                    >
                      <Edit2 size={10} strokeWidth={2.4} />
                      <span>
                        {hasAnyCustomBaristaRecipeForDrink(item.baseKey || item.key)
                          ? '✏️ Editada'
                          : 'Editar'}
                      </span>
                    </button>
                  )}
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#09090b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <span>Ver receta</span>
                    <ChevronRight size={13} strokeWidth={2.4} />
                  </div>
                </div>
              </div>
            </DrinkCard>
          );
        })}
      </DrinkGrid>

      {filteredList.length === 0 && (
        <div
          style={{
            padding: '28px 14px',
            textAlign: 'center',
            color: '#71717a',
            fontSize: '0.84rem',
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e4e4e7',
            marginTop: 8,
          }}
        >
          No se encontraron recetas con "{searchQuery}"
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETALLADO DE LA RECETA CON PORTAL (ENCIMA DE TODO)                  */}
      {/* ========================================================================= */}
      {modalDrinkKey && modalRecipeData && typeof document !== 'undefined'
        ? ReactDOM.createPortal(
            <div
              onClick={handleCloseModal}
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
                boxSizing: 'border-box',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  borderRadius: 18,
                  width: '100%',
                  maxWidth: 520,
                  maxHeight: '90vh',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.45)',
                  border: '1px solid #e4e4e7',
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  boxSizing: 'border-box',
                }}
              >
                {isEditingRecipe ? (
                  <BaristaRecipeEditor
                    recipeData={modalRecipeData}
                    onClose={() => setIsEditingRecipe(false)}
                    onSelectSize={(sz) => setModalSize(sz)}
                  />
                ) : (
                  <>
                    {/* Header del Modal */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #f4f4f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#fafafa',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: modalRecipeData.isSmoothie
                          ? 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
                          : modalRecipeData.isFrappe
                          ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                          : modalRecipeData.isCold
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
                      {modalRecipeData.isSmoothie ? (
                        <Sparkles size={18} strokeWidth={2.4} />
                      ) : modalRecipeData.isFrappe ? (
                        <Sparkles size={18} strokeWidth={2.4} />
                      ) : modalRecipeData.isCold ? (
                        <Snowflake size={18} strokeWidth={2.4} />
                      ) : (
                        <Coffee size={18} strokeWidth={2.2} />
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '1.12rem',
                          fontWeight: 800,
                          color: '#09090b',
                          wordBreak: 'break-word',
                          lineHeight: 1.2,
                        }}
                      >
                        {modalRecipeData.productName}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 999,
                            background: modalRecipeData.isSmoothie
                              ? '#fdf2f8'
                              : modalRecipeData.isFrappe
                              ? '#eff6ff'
                              : modalRecipeData.isCold
                              ? '#f0f9ff'
                              : '#fef2f2',
                            color: modalRecipeData.isSmoothie
                              ? '#be185d'
                              : modalRecipeData.isFrappe
                              ? '#1d4ed8'
                              : modalRecipeData.isCold
                              ? '#0284c7'
                              : '#b91c1c',
                            border: '1px solid rgba(0,0,0,0.06)',
                          }}
                        >
                          {modalRecipeData.typeLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {isDev && modalRecipeData.isCustom && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Volver a la receta predeterminada de la IA para ${modalRecipeData.productName} (${modalRecipeData.activeSize})?`
                            )
                          ) {
                            resetCustomBaristaRecipe(
                              modalRecipeData.masterKey,
                              modalRecipeData.activeSize,
                              modalRecipeData.isCold
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
                        title={`Volver a la receta predeterminada de la IA para ${modalRecipeData.activeSize}`}
                      >
                        <RotateCcw size={12} strokeWidth={2.4} />
                        <span>Volver a IA ({modalRecipeData.activeSize})</span>
                      </button>
                    )}

                    {isDev && (
                      <button
                        type="button"
                        onClick={() => setIsEditingRecipe(true)}
                        style={{
                          background: modalRecipeData.isCustom ? '#fef3c7' : '#f4f4f5',
                          color: modalRecipeData.isCustom ? '#b45309' : '#18181b',
                          border: modalRecipeData.isCustom
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
                        <span>{modalRecipeData.isCustom ? '✏️ Editada' : 'Editar'}</span>
                      </button>
                    )}

                    {/* Botón Cerrar (X) */}
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      aria-label="Cerrar modal de receta"
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
                        flexShrink: 0,
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

                {/* Barra de Medidas: SOLO muestra medidas activas/disponibles */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f4f4f5',
                    padding: '8px 18px',
                    background: '#ffffff',
                    flexShrink: 0,
                    gap: 10,
                    flexWrap: 'wrap',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.76rem', color: '#71717a', fontWeight: 600 }}>
                      Medida:
                    </span>
                    {modalRecipeData.availableSizes && modalRecipeData.availableSizes.length === 1 ? (
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          background: '#09090b',
                          color: '#ffffff',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {modalRecipeData.availableSizes[0]} (Única medida)
                      </span>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          background: '#f4f4f5',
                          padding: 2,
                          borderRadius: 7,
                          border: '1px solid #e4e4e7',
                          gap: 2,
                        }}
                      >
                        {(modalRecipeData.availableSizes || ['12oz', '16oz']).map((sz) => {
                          const isSzActive = (modalRecipeData.activeSize || modalSize) === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setModalSize(sz)}
                              style={{
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: 5,
                                fontSize: '0.74rem',
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
                    )}

                    {/* Selector Con Café / Sin Café para Frappés */}
                    {modalRecipeData.isFrappe && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#f4f4f5',
                          padding: 2,
                          borderRadius: 7,
                          border: '1px solid #e4e4e7',
                          gap: 2,
                          marginLeft: 6,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setModalSinCafe(false)}
                          style={{
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: 5,
                            fontSize: '0.74rem',
                            fontWeight: !modalSinCafe ? 800 : 600,
                            background: !modalSinCafe ? '#09090b' : 'transparent',
                            color: !modalSinCafe ? '#ffffff' : '#71717a',
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          ☕ Con café
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalSinCafe(true)}
                          style={{
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: 5,
                            fontSize: '0.74rem',
                            fontWeight: modalSinCafe ? 800 : 600,
                            background: modalSinCafe ? '#dc2626' : 'transparent',
                            color: modalSinCafe ? '#ffffff' : '#71717a',
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          🚫 Sin café
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner Sin Café cuando la receta está en modo sin café */}
                {modalRecipeData.isSinCafe && (
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

                {/* Selector de Sabores si es Smoothie */}
                {isModalSmoothie && (
                  <div
                    style={{
                      padding: '8px 18px',
                      background: '#fdf2f8',
                      borderBottom: '1px solid #fbcfe8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 6,
                      boxSizing: 'border-box',
                    }}
                  >
                    <span style={{ color: '#be185d', fontWeight: 700, fontSize: '0.76rem' }}>
                      🍓 Sabor:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {SMOOTHIE_FLAVORS.map((fav) => {
                        const isFavActive = modalSmoothieFlavor === fav;
                        return (
                          <button
                            key={fav}
                            type="button"
                            onClick={() => setModalSmoothieFlavor(fav)}
                            style={{
                              border: isFavActive ? '1.5px solid #be185d' : '1px solid #fbcfe8',
                              background: isFavActive ? '#be185d' : '#ffffff',
                              color: isFavActive ? '#ffffff' : '#9d174d',
                              padding: '2px 8px',
                              borderRadius: 999,
                              fontSize: '0.72rem',
                              fontWeight: isFavActive ? 800 : 600,
                              cursor: 'pointer',
                              transition: 'all 0.12s ease',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fav}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dosificación de Pumps para Smoothie */}
                {isModalSmoothie && (
                  <div
                    style={{
                      padding: '8px 18px',
                      background: '#fffbeb',
                      borderBottom: '1px solid #fef3c7',
                      color: '#92400e',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      boxSizing: 'border-box',
                      lineHeight: 1.35,
                    }}
                  >
                    <Info size={14} strokeWidth={2.4} style={{ color: '#d97706', flexShrink: 0 }} />
                    <span>
                      <strong>Dosificación:</strong> 5 pumps aprox para 100gr de pulpa (1 pump ≈ 20g).
                    </span>
                  </div>
                )}

                {/* Contenido Scrolleable: Ingredientes y Pasos */}
                <div
                  style={{
                    padding: '14px 18px',
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Sección Ingredientes */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 7,
                        color: '#09090b',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <Layers size={13} strokeWidth={2.4} />
                      <span>Ingredientes para {modalRecipeData.activeSize || '12oz'}</span>
                    </div>

                    <div
                      style={{
                        background: '#fafafa',
                        border: '1px solid #e4e4e7',
                        borderRadius: 10,
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                      }}
                    >
                      {modalRecipeData.ingredients.map((ing, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '7px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom:
                              idx === modalRecipeData.ingredients.length - 1
                                ? 'none'
                                : '1px solid #f0f0f2',
                            background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                            gap: 8,
                            boxSizing: 'border-box',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              minWidth: 0,
                              flex: '1 1 auto',
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: ing.name.toLowerCase().includes('pulpa')
                                  ? '#ec4899'
                                  : ing.name.toLowerCase().includes('café')
                                  ? '#854d0e'
                                  : ing.name.toLowerCase().includes('leche')
                                  ? '#3b82f6'
                                  : ing.name.toLowerCase().includes('hielo')
                                  ? '#0284c7'
                                  : '#71717a',
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#18181b',
                                wordBreak: 'break-word',
                              }}
                            >
                              {ing.name}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              color: '#09090b',
                              background: ing.amount.includes('pump') ? '#fef3c7' : '#f4f4f5',
                              border: ing.amount.includes('pump')
                                ? '1px solid #fde68a'
                                : '1px solid #e4e4e7',
                              padding: '2px 7px',
                              borderRadius: 5,
                              whiteSpace: 'nowrap',
                              fontVariantNumeric: 'tabular-nums',
                              flexShrink: 0,
                            }}
                          >
                            {ing.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sección Pasos de Elaboración */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 7,
                        color: '#09090b',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <CheckCircle2 size={13} strokeWidth={2.4} />
                      <span>Pasos de preparación</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        boxSizing: 'border-box',
                      }}
                    >
                      {modalRecipeData.steps.map((st, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                            background: '#ffffff',
                            border: '1px solid #f0f0f2',
                            borderRadius: 8,
                            padding: '7px 10px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: '#09090b',
                              color: '#ffffff',
                              display: 'grid',
                              placeItems: 'center',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              color: '#27272a',
                              fontWeight: 500,
                              lineHeight: 1.4,
                              minWidth: 0,
                              wordBreak: 'break-word',
                            }}
                          >
                            {st}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer con Botón Cerrar y Editar si es Dev */}
                <div
                  style={{
                    padding: '10px 18px',
                    borderTop: '1px solid #f4f4f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#fafafa',
                    flexShrink: 0,
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
                            padding: '6px 12px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Edit2 size={13} strokeWidth={2.2} />
                          <span>Editar receta</span>
                        </button>

                        {modalRecipeData.isCustom && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `¿Volver a la receta predeterminada de la IA para ${modalRecipeData.productName} (${modalRecipeData.activeSize})?`
                                )
                              ) {
                                resetCustomBaristaRecipe(
                                  modalRecipeData.masterKey,
                                  modalRecipeData.activeSize,
                                  modalRecipeData.isCold
                                );
                              }
                            }}
                            style={{
                              background: '#fff1f2',
                              color: '#e11d48',
                              border: '1px solid #ffe4e6',
                              borderRadius: 8,
                              padding: '6px 11px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title={`Volver a la receta predeterminada de la IA para ${modalRecipeData.activeSize}`}
                          >
                            <RotateCcw size={12} strokeWidth={2.4} />
                            <span>Volver a IA ({modalRecipeData.activeSize})</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      background: '#09090b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '7px 16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'opacity 0.15s ease',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Cerrar receta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
            document.body
          )
        : null}
    </CatalogWrapper>
  );
}