import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFeed } from '../netlify/functions/google-shopping.js';
const product = {id:1,active:true,slug:'traje',name:'Traje & gala',category:'Gala',discount_active:true,discount_percent:20,discount_start:'2026-11-24T10:00:00',discount_end:'2026-11-24T12:00:00',product_images:[{url:'https://example.com/photo.jpg'}],product_variants:[{id:11,size:'S',price:5000,stock:2},{id:12,size:'M',price:6000,stock:0}]};
test('variant prices, stock, links and XML escaping',()=>{const xml=buildFeed([product],new Date('2026-11-24T14:00:00Z'));assert.match(xml,/Traje &amp; gala/);assert.match(xml,/5000 CLP/);assert.match(xml,/6000 CLP/);assert.match(xml,/4000 CLP/);assert.match(xml,/4800 CLP/);assert.match(xml,/variant=11/);assert.match(xml,/variant=12/);assert.match(xml,/in_stock/);assert.match(xml,/out_of_stock/);assert.equal((xml.match(/<item>/g)||[]).length,2);});
test('scheduled discounts outside Santiago window',()=>{for(const date of ['2026-11-24T12:59:59Z','2026-11-24T15:00:01Z'])assert.doesNotMatch(buildFeed([product],new Date(date)),/sale_price/);});
test('exclude inactive products and invalid prices',()=>{assert.doesNotMatch(buildFeed([{...product,active:false},{...product,product_variants:[{id:13,size:'L',price:0,stock:1}]}]),/<item>/);});
