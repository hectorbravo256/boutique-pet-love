export function normalizeCart(rows, liveStock) {
  const result = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || row.id == null || row.product_id == null || !Number.isFinite(Number(row.price)) || Number(row.price)<0) continue;
    const key=String(row.id);
    const stock=Number(liveStock ? (liveStock.get(key) ?? 0) : row.stock);
    const qty=Number(row.qty);
    if (!Number.isSafeInteger(stock)||stock<=0||!Number.isSafeInteger(qty)||qty<=0) continue;
    const previous=result.find(x=>String(x.id)===key);
    if(previous) previous.qty=Math.min(previous.stock,previous.qty+qty);
    else result.push({...row,price:Number(row.price),stock,qty:Math.min(stock,qty)});
  }
  return result;
}
export function readCart() {
  try { return normalizeCart(JSON.parse(localStorage.getItem("cart"))); } catch { return []; }
}
export function remainingStock(cart, variant) {
  if(!variant) return 0;
  return Math.max(0, Number(variant.stock||0)-cart.filter(x=>String(x.id)===String(variant.id)).reduce((n,x)=>n+x.qty,0));
}
