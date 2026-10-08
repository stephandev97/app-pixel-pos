// PrintTicket58.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Print, TotalPrint } from '../../pages/Orders/OrdersStyles'; // ajustá este path según tu proyecto :contentReference[oaicite:2]{index=2}
import { logoBase64 as logo } from '../../utils/logoBase64';
import { formatPrice } from '../../utils/formatPrice';

/**
 * Props:
 * - order: { direccion, items, total, method, pago, pagoEfectivo, pagoMp, pagoDebito, pagoDetalle, ... }
 * - autoPrint?: boolean (default true)
 * - onAfterPrint?: () => void
 * - onError?: (err) => void
 * - debugPreview?: boolean (default false) -> muestra el ticket en pantalla
 */
export default function PrintTicket58({
  order,
  autoPrint = true,
  onAfterPrint,
  onError,
  debugPreview = false,
}) {
  const contentRef = useRef(null);
  const [printedOnce, setPrintedOnce] = useState(false);

  const direccion = order?.direccion || 'Retiro';
  const total = Number(order?.total || 0);

  const methodNorm = String(order?.method ?? '').toLowerCase();

  // Normaliza items como en Orders.js (agrega "Envío" si corresponde) :contentReference[oaicite:3]{index=3}
  const itemsNorm = useMemo(() => {
    const items = Array.isArray(order?.items) ? order.items : [];
    const hasEnvio = items.some((it) => /envio/i.test(String(it?.name || '')));
    const base = items.map((it) => ({
      ...it,
      name: String(it?.name || '').replace(/^\s*envio\s*\d*/i, 'Envío'),
    }));

    if (
      String(direccion || '')
        .trim()
        .toLowerCase() !== 'retiro' &&
      !hasEnvio
    ) {
      base.push({ name: 'Envío', quantity: 1, category: 'Envio' });
    }
    return base;
  }, [order?.items, direccion]);

  // Ticket "pago" como en Orders.js (Mixto / Transferencia / Débito o monto) :contentReference[oaicite:4]{index=4}
  let ef = Number(order?.pagoEfectivo || 0);
  let mp = Number(order?.pagoMp || 0);
  let db = Number(order?.pagoDebito || 0);
  const pagoRaw = order?.pago;

  const ticketPago =
    methodNorm === 'mixto'
      ? 'Mixto'
      : methodNorm === 'transferencia'
        ? 'Transferencia'
        : methodNorm === 'debito'
          ? 'Débito'
          : pagoRaw;

  // Fallback por si vino pagoDetalle tipo "EF $... + MP $..." :contentReference[oaicite:5]{index=5}
  if (
    (pagoRaw === 'Mixto' || ticketPago === 'Mixto') &&
    ef === 0 &&
    mp === 0 &&
    db === 0 &&
    typeof order?.pagoDetalle === 'string'
  ) {
    const toNum = (s) => Number(String(s).replace(/[^\d.-]/g, '')) || 0;
    const mEf = order.pagoDetalle.match(/EF\s*\$?\s*([\d.,]+)/i);
    const mMp = order.pagoDetalle.match(/MP\s*\$?\s*([\d.,]+)/i);
    const mDb = order.pagoDetalle.match(/(?:DÉB|DEB)\s*\$?\s*([\d.,]+)/i);
    if (mEf) ef = toNum(mEf[1]);
    if (mMp) mp = toNum(mMp[1]);
    if (mDb) db = toNum(mDb[1]);
  }

  const toNum = (s) => {
    if (typeof s === 'number') return Number.isFinite(s) ? s : 0;
    const str = String(s || '').trim();
    if (!str) return 0;
    const normalized = str.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  };
  const pagoParsed = toNum(pagoRaw);
  const totalPagado =
    methodNorm === 'mixto'
      ? ef + mp + db
      : methodNorm === 'transferencia'
        ? total
        : methodNorm === 'debito'
          ? Number(order?.pagoDebito) || total
          : pagoParsed;

  const pageStyle = `
    @page { size: 58mm auto; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;

  const [isPrinting, setIsPrinting] = useState(false);

  const reactToPrintFn = useReactToPrint({
    contentRef,
    pageStyle,
    removeAfterPrint: true, // <- mejor para evitar refs/DOM stale
    onBeforePrint: async () => {
      setIsPrinting(true);

      // 1) Esperar fuentes (si el navegador las soporta)
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // 2) Esperar imágenes dentro del ticket (logo)
      const root = contentRef.current;
      if (root) {
        const imgs = Array.from(root.querySelectorAll('img'));
        await Promise.all(
          imgs.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((res) => {
                img.onload = res;
                img.onerror = res;
              })
          )
        );
      }

      // 3) Forzar un frame de layout
      await new Promise((r) => requestAnimationFrame(r));
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    onPrintError: () => {
      setIsPrinting(false);
    },
  });

  // Auto print 1 sola vez cuando monta
  useEffect(() => {
    if (!autoPrint) return;
    if (printedOnce) return;
    if (!order) return;

    // micro-delay para asegurar que el ref está listo
    const t = setTimeout(() => {
      try {
        reactToPrintFn?.();
      } catch (e) {
        onError?.(e);
      }
    }, 120);

    return () => clearTimeout(t);
  }, [autoPrint, printedOnce, order, reactToPrintFn, onError]);

  const Ticket58 = React.forwardRef(function Ticket58Inner(
    { direccion, itemsNorm, total, pago, ef, mp, db, totalPagado, logo },
    ref
  ) {
    return (
      <Print
        ref={ref}
        className="ticket58"
        style={{
          width: '40mm',
          maxWidth: '40mm',
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
          lineHeight: 1.25,
          fontSize: '3.8mm',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
          <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />
          <img
            src={logo}
            alt="Logo"
            style={{ width: '30mm', height: 'auto', display: 'block', margin: '0 auto' }}
          />
        </div>

        <div style={{ width: '100%', textAlign: 'center', margin: '1.5mm 0 .8mm' }}>
          <div
            style={{
              fontSize: '4mm',
              lineHeight: 1.2,
              maxWidth: '52mm',
              margin: '0 auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontWeight: 700,
            }}
          >
            {direccion || 'Retiro'}
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />

        <div style={{ width: '100%', margin: '1.5mm 0' }}>
          <div
            style={{
              display: 'flex',
              fontWeight: 'bold',
              marginBottom: '1mm',
              fontSize: '3.4mm',
            }}
          >
            <span style={{ width: '6mm' }}>#</span>
            <span style={{ flex: 1, textAlign: 'left' }}>Producto</span>
          </div>

          {itemsNorm.map((it, idx) => {
            const cantidad = Number(it?.quantity ?? it?.qty ?? 1);
            const nombre = it?.name || it?.title || it?.label || '';
            const sabores = Array.isArray(it?.sabores) ? it.sabores.filter(Boolean) : [];
            return (
              <div key={idx} style={{ marginBottom: '1mm' }}>
                <div style={{ display: 'flex', fontSize: '3.5mm' }}>
                  <span style={{ width: '6mm' }}>{cantidad}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{nombre}</span>
                </div>
                {!!sabores.length && (
                  <div
                    style={{
                      marginLeft: '6mm',
                      marginTop: '.6mm',
                      fontSize: '3.3mm',
                      fontWeight: 700,
                      textAlign: 'left',
                    }}
                  >
                    {sabores.map((s, i) => (
                      <div key={i}>• {s}</div>
                    ))}
                  </div>
                )}

                {/* Detalles (Cafetería, notas, etc.) */}
                {(it?.size || (it?.extras && it.extras.length > 0) || it?.vaso || it?.note || it?.listdetalle) && (
                  <div
                    style={{
                      marginLeft: '6mm',
                      marginTop: '.6mm',
                      fontSize: '3.1mm',
                      color: '#333',
                      fontWeight: 700,
                      textAlign: 'left',
                    }}
                  >
                    {it.size && <div>• Medida: {it.size}</div>}
                    {it.extras && it.extras.map((ex, i) => (
                      <div key={i}>• Adicional: {ex}</div>
                    ))}
                    {it.vaso && <div>• Vaso: "{it.vaso}"</div>}
                    {(it?.note || it?.listdetalle) && <div>• Nota: "{it.note || it.listdetalle}"</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />

        <TotalPrint style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2mm 0' }}>
          <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Total</a>
          <a style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(total)}</a>
        </TotalPrint>

        {pago === 'Mixto' ? (
          <>
            {ef > 0 && (
              <TotalPrint style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2mm 0' }}>
                <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Efectivo</a>
                <a style={{ textAlign: 'right' }}>{formatPrice(ef)}</a>
              </TotalPrint>
            )}
            {mp > 0 && (
              <TotalPrint style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2mm 0' }}>
                <a style={{ textAlign: 'left', fontWeight: 'bold' }}>MercadoPago</a>
                <a style={{ textAlign: 'right' }}>{formatPrice(mp)}</a>
              </TotalPrint>
            )}
            {db > 0 && (
              <TotalPrint style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2mm 0' }}>
                <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Débito</a>
                <a style={{ textAlign: 'right' }}>{formatPrice(db)}</a>
              </TotalPrint>
            )}
            {totalPagado > total && (
              <TotalPrint style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2mm 0' }}>
                <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Cambio</a>
                <a style={{ textAlign: 'right' }}>{formatPrice(totalPagado - total)}</a>
              </TotalPrint>
            )}
          </>
        ) : (
          <TotalPrint style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2mm 0' }}>
            <a style={{ textAlign: 'left', fontWeight: 'bold' }}>
              {pago === 'Transferencia' ? 'Transferencia' : 'Paga'}
            </a>
            <a style={{ textAlign: 'right' }}>
              {pago === 'Transferencia'
                ? ''
                : pagoParsed === total
                  ? 'JUSTO'
                  : formatPrice(pagoParsed)}
            </a>
          </TotalPrint>
        )}
        {pago !== 'Mixto' && pago !== 'Transferencia' && totalPagado > total && (
          <TotalPrint style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2mm 0' }}>
            <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Cambio</a>
            <a style={{ textAlign: 'right' }}>{formatPrice(totalPagado - total)}</a>
          </TotalPrint>
        )}

        <div style={{ borderTop: '1px dashed #000', margin: '24px 0' }} />
      </Print>
    );
  });

  return (
    <>
      {/* oculto para imprimir */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '-10000px',
          zIndex: -1,
          background: '#fff',
        }}
      >
        <Ticket58
          ref={contentRef}
          direccion={direccion}
          itemsNorm={itemsNorm}
          total={total}
          pago={ticketPago}
          ef={ef}
          mp={mp}
          db={db}
          totalPagado={totalPagado}
          logo={logo}
        />
      </div>

      {/* preview opcional */}
      {debugPreview && (
        <div style={{ border: '1px solid #ccc', marginTop: 10, padding: 8, background: '#fff' }}>
          <h4>Vista previa ticket (58mm)</h4>
          <Ticket58
            direccion={direccion}
            itemsNorm={itemsNorm}
            total={total}
            pago={ticketPago}
            ef={ef}
            mp={mp}
            db={db}
            totalPagado={totalPagado}
            logo={logo}
          />
        </div>
      )}
    </>
  );
}
