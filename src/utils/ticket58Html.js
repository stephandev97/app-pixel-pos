import { formatPrice } from './formatPrice';

export function ticket58Html(ticketData, opts = {}) {
  const direccion = ticketData?.direccion || 'Retiro';
  const items = Array.isArray(ticketData?.items) ? ticketData.items : [];
  const total = Number(ticketData?.total || 0);

  const pago = ticketData?.pago;
  const ef = Number(ticketData?.pagoEfectivo || 0);
  const mp = Number(ticketData?.pagoMp || 0);
  const db = Number(ticketData?.pagoDebito || 0);

  const isMixto = pago === 'Mixto';
  const isTransfer = pago === 'Transferencia';
  const isDebito = pago === 'Debito' || pago === 'Débito';
  const isCash = !isNaN(Number(pago));

  const totalPagado = isMixto
    ? ef + mp + db
    : isTransfer
      ? total
      : isDebito
        ? db || total
        : Number(pago || 0);
  const cambio = Math.max(totalPagado - total, 0);

  const esc = (s) =>
    String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');

  // logoDataUrl: "data:image/png;base64,...."
  const logoDataUrl = opts?.logoDataUrl ? String(opts.logoDataUrl) : '';

  const itemsHtml = items
    .map((it, idx) => {
      const cantidad = Number(it?.quantity ?? it?.qty ?? 1);
      const nombre = esc(it?.name || it?.title || it?.label || '');
      const sabores = Array.isArray(it?.sabores) ? it.sabores.filter(Boolean) : [];

      return `
        <div style="margin-bottom:1mm">
          <div style="display:flex; font-size:3.4mm">
            <span style="width:6mm">${cantidad}</span>
            <span style="flex:1; text-align:left">${nombre}</span>
          </div>
          ${
            sabores.length
              ? `<div style="margin-left:6mm; margin-top:.6mm; font-size:3mm; font-weight:700; text-align:left">
                   ${sabores.map((s) => `<div>• ${esc(s)}</div>`).join('')}
                 </div>`
              : ''
          }
        </div>
      `;
    })
    .join('');

  const pagosHtml = isMixto
    ? `
      <div class="totrow"><div class="l">Efectivo</div><div class="r">${esc(formatPrice(ef))}</div></div>
      <div class="totrow"><div class="l">MercadoPago</div><div class="r">${esc(formatPrice(mp))}</div></div>
      ${db > 0 ? `<div class="totrow"><div class="l">Débito</div><div class="r">${esc(formatPrice(db))}</div></div>` : ''}
      ${cambio > 0 ? `<div class="totrow"><div class="l">Cambio</div><div class="r">${esc(formatPrice(cambio))}</div></div>` : ''}
    `
    : isTransfer
      ? `<div class="totrow"><div class="l">Transferencia</div><div class="r"></div></div>`
      : isDebito
        ? `<div class="totrow"><div class="l">Débito</div><div class="r">${esc(formatPrice(db || total))}</div></div>`
        : isCash
          ? `
            <div class="totrow">
              <div class="l">Paga</div>
              <div class="r">${Number(pago) === total ? 'JUSTO' : esc(formatPrice(pago))}</div>
            </div>
            ${cambio > 0 ? `<div class="totrow"><div class="l">Cambio</div><div class="r">${esc(formatPrice(cambio))}</div></div>` : ''}
          `
          : `<div class="totrow"><div class="l">Pago</div><div class="r">${esc(pago)}</div></div>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Ticket 58</title>
  <style>
    /* igual que el pageStyle de Orders/PrintTicket58 */
    @page { size: 58mm auto; margin: 0; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    html, body { margin:0; padding:0; background:#fff; }

    /* el ticket real en Orders es 40mm, no 58mm */
    .ticket {
      width: 40mm;
      max-width: 40mm;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      line-height: 1.25;
      font-size: 3.2mm;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "JetBrains Mono", monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }

    .hr { border-top: 1px dashed #000; margin: 12px 0; }

    .hdr {
      display:flex;
      font-weight:bold;
      margin-bottom:1mm;
      font-size:3.4mm;
    }

    .totrow{
      display:flex;
      justify-content:space-between;
      margin: .8mm 0;
      font-size: 3.4mm;
    }
    .l{ text-align:left; font-weight:bold; }
    .r{ text-align:right; font-weight:bold; }
  </style>
</head>
<body>
  <div class="ticket">
    <div style="text-align:center; margin-bottom:2mm">
      <div class="hr"></div>
      ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" style="width:30mm; height:auto; display:block; margin:0 auto" />` : ''}
    </div>

    <div style="width:100%; text-align:center; margin:1.5mm 0 .8mm">
      <div style="font-size:3.5mm; line-height:1.2; max-width:52mm; margin:0 auto; white-space:pre-wrap; word-break:break-word; font-weight:700;">
        ${esc(direccion || 'Retiro')}
      </div>
    </div>

    <div class="hr"></div>

    <div style="width:100%; margin:1.5mm 0">
      <div class="hdr">
        <span style="width:6mm">#</span>
        <span style="flex:1; text-align:left">Producto</span>
      </div>
      ${itemsHtml}
    </div>

    <div class="hr"></div>

    <div class="totrow"><div class="l">Total</div><div class="r">${esc(formatPrice(total))}</div></div>
    ${pagosHtml}

    <div class="hr" style="margin:24px 0"></div>
  </div>
</body>
</html>`;
}
