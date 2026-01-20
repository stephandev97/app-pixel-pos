// PrintTicket58.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import logo from '../../styles/img/logoprint.png'; // igual que en Orders.js :contentReference[oaicite:1]{index=1}
import { formatPrice } from '../../utils/formatPrice';
import { Print, TotalPrint } from '../../pages/Orders/OrdersStyles'; // ajustá este path según tu proyecto :contentReference[oaicite:2]{index=2}

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
    typeof order?.pagoDetalle === 'string'
  ) {
    const m = order.pagoDetalle.match(/EF\s*\$?\s*([\d.,]+)\s*\+\s*MP\s*\$?\s*([\d.,]+)/i);
    if (m) {
      const toNum = (s) => Number(String(s).replace(/[^\d.-]/g, '')) || 0;
      ef = toNum(m[1]);
      mp = toNum(m[2]);
    }
  }

  const totalPagado =
    methodNorm === 'mixto'
      ? ef + mp
      : methodNorm === 'transferencia'
        ? total
        : methodNorm === 'debito'
          ? Number(order?.pagoDebito) || total
          : Number(pagoRaw || 0);

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
    { direccion, itemsNorm, total, pago, ef, mp, totalPagado, logo },
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
          fontSize: '3.2mm',
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
              fontSize: '3.5mm',
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
                <div style={{ display: 'flex', fontSize: '3.4mm' }}>
                  <span style={{ width: '6mm' }}>{cantidad}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{nombre}</span>
                </div>
                {!!sabores.length && (
                  <div
                    style={{
                      marginLeft: '6mm',
                      marginTop: '.6mm',
                      fontSize: '3mm',
                      fontWeight: 700,
                      textAlign: 'left',
                    }}
                  >
                    {sabores.map((s, i) => (
                      <div key={i}>• {s}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '12px 0' }} />

        <TotalPrint>
          <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Total</a>
          <a style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(total)}</a>
        </TotalPrint>

        {pago === 'Mixto' ? (
          <>
            <TotalPrint>
              <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Efectivo</a>
              <a style={{ textAlign: 'right' }}>{formatPrice(ef)}</a>
            </TotalPrint>
            <TotalPrint>
              <a style={{ textAlign: 'left', fontWeight: 'bold' }}>MercadoPago</a>
              <a style={{ textAlign: 'right' }}>{formatPrice(mp)}</a>
            </TotalPrint>
            {totalPagado > total && (
              <TotalPrint>
                <a style={{ textAlign: 'left', fontWeight: 'bold' }}>Cambio</a>
                <a style={{ textAlign: 'right' }}>{formatPrice(totalPagado - total)}</a>
              </TotalPrint>
            )}
          </>
        ) : (
          <TotalPrint>
            <a style={{ textAlign: 'left', fontWeight: 'bold' }}>
              {pago === 'Transferencia' ? 'Transferencia' : 'Paga'}
            </a>
            <a style={{ textAlign: 'right' }}>
              {pago === 'Transferencia'
                ? ''
                : Number(pagoRaw) === total
                  ? 'JUSTO'
                  : formatPrice(pagoRaw)}
            </a>
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
            totalPagado={totalPagado}
            logo={logo}
          />
        </div>
      )}
    </>
  );
}
