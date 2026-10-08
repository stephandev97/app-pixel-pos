import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

import { pb } from '../../lib/pb';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  padding: 28px 24px 48px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;

  .title-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    h1 {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
    }

    p {
      margin: 4px 0 0;
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 500;
    }
  }

  .stats-badges {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  background: ${(p) => (p.$type === 'active' ? '#ecfdf5' : '#f1f5f9')};
  color: ${(p) => (p.$type === 'active' ? '#059669' : '#64748b')};
  border: 1px solid ${(p) => (p.$type === 'active' ? '#a7f3d0' : '#e2e8f0')};

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) => (p.$type === 'active' ? '#10b981' : '#94a3b8')};
  }
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .search-box {
    position: relative;
    flex: 1;
    min-width: 220px;

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 36px 10px 40px;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      background: #ffffff;
      font-size: 14px;
      font-family: inherit;
      color: #0f172a;
      outline: none;
      transition: all 0.15s ease;

      &:focus {
        border-color: #4d0012;
        box-shadow: 0 0 0 3px rgba(77, 0, 18, 0.08);
      }

      &::placeholder {
        color: #94a3b8;
      }
    }

    .clear-search-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: #f1f5f9;
      border: none;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      cursor: pointer;
      padding: 0;
      transition: all 0.15s ease;

      &:hover {
        background: #e2e8f0;
        color: #0f172a;
      }
    }
  }

  .toggle-all-btn {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    color: #475569;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s ease;

    &:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #0f172a;
    }
  }
`;

const CategoryCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
  }
`;

const CategoryHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #ffffff;
  border: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.15s ease;

  &:hover {
    background: #f8fafc;
  }

  .cat-left {
    display: flex;
    align-items: center;
    gap: 10px;

    .cat-name {
      font-size: 15.5px;
      font-weight: 800;
      color: #0f172a;
      text-transform: capitalize;
    }

    .cat-badge {
      font-size: 12px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 8px;
      background: #f1f5f9;
      color: #475569;
    }

    .cat-active-pill {
      font-size: 12px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 8px;
      background: ${(p) => (p.$allActive ? '#ecfdf5' : '#fff7ed')};
      color: ${(p) => (p.$allActive ? '#059669' : '#c2410c')};
      border: 1px solid ${(p) => (p.$allActive ? '#a7f3d0' : '#fed7aa')};
    }
  }

  .cat-right {
    display: flex;
    align-items: center;
    color: #64748b;
  }
`;

const FlavorsGrid = styled.div`
  padding: 10px 14px 14px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
`;

const FlavorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: ${(p) => (p.$isActive ? '#ffffff' : '#fffafb')};
  border-radius: 12px;
  border: 1.5px solid ${(p) => (p.$isActive ? '#e2e8f0' : '#fecaca')};
  transition: all 0.15s ease;
  user-select: none;
  cursor: pointer;

  &:hover {
    border-color: ${(p) => (p.$isActive ? '#cbd5e1' : '#f87171')};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .flavor-info {
    display: flex;
    align-items: center;
    text-align: left;
    min-width: 0;
    flex: 1;
    padding-right: 12px;

    .name {
      font-size: 14.5px;
      font-weight: 700;
      color: ${(p) => (p.$isActive ? '#0f172a' : '#94a3b8')};
      text-decoration: ${(p) => (p.$isActive ? 'none' : 'line-through')};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
      width: 100%;
    }
  }
`;

const SwitchToggle = styled.div`
  position: relative;
  width: 44px;
  height: 24px;
  background: ${(p) => (p.$checked ? '#10b981' : '#e2e8f0')};
  border-radius: 999px;
  transition: background 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  margin-left: 10px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);

  .thumb {
    position: absolute;
    top: 2px;
    left: ${(p) => (p.$checked ? '22px' : '2px')};
    width: 20px;
    height: 20px;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: left 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      color: #10b981;
    }

    .spinner {
      animation: ${spin} 0.8s linear infinite;
      color: #64748b;
    }
  }
`;

const EmptySearch = styled.div`
  text-align: center;
  padding: 48px 16px;
  color: #64748b;

  p {
    margin: 8px 0 0;
    font-size: 15px;
    font-weight: 600;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  gap: 12px;

  .spinner {
    animation: ${spin} 1s linear infinite;
    color: #4d0012;
  }
`;

function groupByCategory(items) {
  const map = new Map();
  for (const it of items) {
    const cat = (it.category || 'Sin categoría').trim();
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(it);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'es'))
    .map(([category, list]) => ({
      category,
      list: list.sort((x, y) => (x.name || '').localeCompare(y.name || '', 'es')),
    }));
}

export default function TvSaboresPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState({});

  const load = async () => {
    try {
      const data = await pb.collection('tv_sabores').getFullList({
        sort: 'category,name',
      });
      setItems(data);
    } catch (err) {
      console.error('Error cargando tv_sabores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    let unsub = null;
    (async () => {
      try {
        unsub = await pb.collection('tv_sabores').subscribe('*', () => load());
      } catch (e) {
        console.error('Error suscribiendo a tv_sabores', e);
      }
    })();

    return () => {
      unsub?.();
    };
  }, []);

  // Filtrado por búsqueda
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        (it.name || '').toLowerCase().includes(q) ||
        (it.category || '').toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const grouped = useMemo(() => groupByCategory(filteredItems), [filteredItems]);

  // Expandir todas automáticamente si hay una búsqueda activa, colapsar al limpiar
  useEffect(() => {
    if (searchQuery.trim()) {
      const allOpen = {};
      grouped.forEach((g) => {
        allOpen[g.category] = true;
      });
      setOpenCategories(allOpen);
    } else {
      setOpenCategories({});
    }
  }, [searchQuery]);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const expandAll = () => {
    const allOpen = {};
    grouped.forEach((g) => {
      allOpen[g.category] = true;
    });
    setOpenCategories(allOpen);
  };

  const collapseAll = () => {
    setOpenCategories({});
  };

  const totalFlavors = items.length;
  const activeFlavors = items.filter((it) => !it.spent).length;
  const disabledFlavors = totalFlavors - activeFlavors;

  const toggleSpent = async (record) => {
    const nextSpent = !record.spent;
    setSavingId(record.id);

    setItems((prev) =>
      prev.map((x) => (x.id === record.id ? { ...x, spent: nextSpent } : x))
    );

    try {
      await pb.collection('tv_sabores').update(record.id, { spent: nextSpent });
    } catch (err) {
      setItems((prev) =>
        prev.map((x) => (x.id === record.id ? { ...x, spent: record.spent } : x))
      );
      console.error('Error actualizando sabor en PB', err);
      alert('No se pudo actualizar el sabor en la TV.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Loader2 size={36} className="spinner" />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Cargando sabores de TV…</span>
      </LoadingContainer>
    );
  }

  const allAreOpen = grouped.length > 0 && grouped.every((g) => openCategories[g.category]);

  return (
    <Container>
      <HeaderSection>
        <TitleRow>
          <div className="title-group">
            <h1>Sabores en TV</h1>
            <p>Activá o desactivá los sabores visibles en las pantallas</p>
          </div>

          <div className="stats-badges">
            <StatBadge $type="active">
              <span className="dot" />
              <span>{activeFlavors} disponibles</span>
            </StatBadge>
            {disabledFlavors > 0 && (
              <StatBadge $type="disabled">
                <span className="dot" />
                <span>{disabledFlavors} agotados</span>
              </StatBadge>
            )}
          </div>
        </TitleRow>

        <ControlsRow>
          <div className="search-box">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar sabor o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            className="toggle-all-btn"
            onClick={allAreOpen ? collapseAll : expandAll}
          >
            {allAreOpen ? 'Colapsar todas' : 'Expandir todas'}
          </button>
        </ControlsRow>
      </HeaderSection>

      {grouped.length === 0 ? (
        <EmptySearch>
          <Search size={36} style={{ opacity: 0.3 }} />
          <p>No se encontraron sabores con "{searchQuery}"</p>
        </EmptySearch>
      ) : (
        grouped.map(({ category, list }) => {
          const isOpen = openCategories[category] ?? false;
          const activeInCat = list.filter((it) => !it.spent).length;
          const allActive = activeInCat === list.length;

          return (
            <CategoryCard key={category}>
              <CategoryHeader
                type="button"
                $allActive={allActive}
                onClick={() => toggleCategory(category)}
              >
                <div className="cat-left">
                  <span className="cat-name">{category}</span>
                  <span className="cat-badge">{list.length}</span>
                  <span className="cat-active-pill">
                    {activeInCat} de {list.length} activos
                  </span>
                </div>

                <div className="cat-right">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </CategoryHeader>

              {isOpen && (
                <FlavorsGrid>
                  {list.map((it) => {
                    const isActive = !it.spent;
                    const busy = savingId === it.id;

                    return (
                      <FlavorRow
                        key={it.id}
                        $isActive={isActive}
                        onClick={() => !busy && toggleSpent(it)}
                        title={`Hacé clic para ${isActive ? 'desactivar' : 'activar'} en la TV`}
                      >
                        <div className="flavor-info">
                          <span className="name">{it.name}</span>
                        </div>

                        <SwitchToggle $checked={isActive}>
                          <div className="thumb">
                            {busy ? (
                              <Loader2 size={12} className="spinner" />
                            ) : isActive ? (
                              <Check size={12} strokeWidth={3} />
                            ) : null}
                          </div>
                        </SwitchToggle>
                      </FlavorRow>
                    );
                  })}
                </FlavorsGrid>
              )}
            </CategoryCard>
          );
        })
      )}
    </Container>
  );
}
