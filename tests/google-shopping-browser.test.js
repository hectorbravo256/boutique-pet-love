import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { buildFeed } from '../netlify/functions/google-shopping.js';

const product = {id:999001,active:true,slug:'prueba-aislada',name:'Abrigo prueba aislada',description:'Prueba',category:'otono-invierno',discount_active:true,discount_percent:10,discount_start:'2026-11-24T09:00:00',discount_end:'2026-11-24T18:00:00',product_images:[{url:'https://example.com/test.webp'}],product_variants:[{id:999002,size:'Talla 1',price:8990,stock:5},{id:999009,size:'Talla 8',price:15990,stock:5}]};
test('browser, cart storage and XML agree for active and expired promotions', async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 for(const [date,prices] of [['2026-11-24T15:00:00Z',[8091,14391]],['2026-11-24T22:00:00Z',[8990,15990]]]){
 const context=await browser.newContext({serviceWorkers:'block'});
 try {
 const page=await context.newPage();
 await page.clock.install({time:new Date(date)});
 await context.route('**/*',async route=>{
 const url=new URL(route.request().url());
 if(url.origin==='http://127.0.0.1:4173') return route.continue();
 if(route.request().method()==='GET' && url.pathname==='/rest/v1/products' && url.searchParams.get('slug')==='eq.prueba-aislada') return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(product)});
 if(route.request().method()==='OPTIONS') return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET, OPTIONS','access-control-allow-headers':'*'}});
 return route.abort();
 });
 const xml=buildFeed([product],new Date(date));
 await page.goto('http://127.0.0.1:4173/producto/prueba-aislada?variant=999002');
 await page.getByRole('heading',{name:product.name,exact:true}).waitFor();
 for(let i=0;i<2;i++){
 const v=product.product_variants[i];
 if(i) await page.getByRole('button',{name:v.size,exact:true}).click();
 const amount='$'+prices[i].toLocaleString('es-CL');
 await page.getByText(amount,{exact:true}).first().waitFor();
 assert.equal(new URL(page.url()).searchParams.get('variant'),String(v.id));
 const item=xml.split('<item>').find(s=>s.includes('<g:id>bpl-'+v.id+'</g:id>'));
 assert.ok(item);
 assert.ok(item.includes('<g:price>'+v.price+' CLP</g:price>'));
 if(prices[i]!==v.price) assert.ok(item.includes('<g:sale_price>'+prices[i]+' CLP</g:sale_price>'));
 else assert.ok(!item.includes('<g:sale_price>'));
 if(i===1) await page.getByRole('button',{name:'+',exact:true}).click();
 await page.getByRole('button',{name:/Agregar/}).first().click();
 const cart=await page.evaluate(()=>JSON.parse(localStorage.getItem('cart')));
 const line=cart.find(x=>x.id===v.id);
 assert.equal(line.price,prices[i]);assert.equal(line.qty,i+1);
 assert.equal(line.originalPrice,v.price);
 // Reload to close any cart drawer without changing its contents.
 if(i===0) {await page.reload();await page.getByRole('heading',{name:product.name,exact:true}).waitFor();}
 }
 const cart=await page.evaluate(()=>JSON.parse(localStorage.getItem('cart')));
 assert.equal(cart.reduce((sum,x)=>sum+x.price*x.qty,0),prices[0]+2*prices[1]);
 } finally {await context.close();}
 }
 } finally {await browser.close();}
});
