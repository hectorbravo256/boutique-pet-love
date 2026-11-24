import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFeed } from '../netlify/functions/google-shopping.js';
const product = {id:1,active:true,slug:'traje',name:'Traje & gala',category:'Gala',discount_active:true,discount_percent:20,discount_start:'2026-11-24T10:00:00',discount_end:'2026-11-24T12:00:00',product_images:[{url:'https://example.com/photo.jpg'}],product_variants:[{id:11,size:'S',price:5000,stock:2},{id:12,size:'M',price:6000,stock:0}]};
test('variant prices, stock, links and XML escaping',()=>{const xml=buildFeed([product],new Date('2026-11-24T14:00:00Z'));assert.match(xml,/Traje &amp; gala/);assert.match(xml,/5000 CLP/);assert.match(xml,/6000 CLP/);assert.match(xml,/4000 CLP/);assert.match(xml,/4800 CLP/);assert.match(xml,/variant=11/);assert.match(xml,/variant=12/);assert.match(xml,/in_stock/);assert.match(xml,/out_of_stock/);assert.equal((xml.match(/<item>/g)||[]).length,2);});
test('scheduled discounts outside Santiago window',()=>{for(const date of ['2026-11-24T12:59:59Z','2026-11-24T15:00:01Z'])assert.doesNotMatch(buildFeed([product],new Date(date)),/sale_price/);});
test('exclude inactive products and invalid prices',()=>{assert.doesNotMatch(buildFeed([{...product,active:false},{...product,product_variants:[{id:13,size:'L',price:0,stock:1}]}]),/<item>/);});

import {buildProductSchema,categorySlug} from '../src/productSchema.js';
test('ProductGroup matches feed for each variant and promotion window',()=>{
 for(const date of ['2026-11-24T12:59:59Z','2026-11-24T14:00:00Z','2026-11-24T15:00:01Z']){
 const now=new Date(date),schema=buildProductSchema(product,now),xml=buildFeed([product],now);
 assert.equal(schema.productGroupID,'bpl-product-1');
 assert.equal(schema.hasVariant.length,2);
 for(const v of schema.hasVariant){
 const item=xml.split('<item>').find(x=>x.includes('<g:id>'+v.sku+'</g:id>'));
 assert.ok(item);
 const price=(item.match(/<g:sale_price>(\d+) CLP/)||item.match(/<g:price>(\d+) CLP/))[1];
 assert.equal(v.offers.price,Number(price));
 assert.ok(item.includes('<g:link>'+v.offers.url+'</g:link>'));
 assert.ok(item.includes('<g:size>'+v.size+'</g:size>'));
 assert.ok(item.includes('<g:availability>'+(v.offers.availability.endsWith('/InStock')?'in_stock':'out_of_stock')+'</g:availability>'));
 assert.equal(v.brand,undefined);assert.equal(v.gtin,undefined);
 }
 }
 assert.equal(buildProductSchema({...product,active:false}),null);
 assert.equal(buildProductSchema({...product,product_images:[]}),null);
 assert.equal(categorySlug('Otoño - Invierno'),'otono-invierno');
});

test('variant offers reference the shared return policy',()=>{
 const schema=buildProductSchema(product);
 for(const v of schema.hasVariant) assert.equal(v.offers.hasMerchantReturnPolicy['@id'],'https://boutiquepetlove.cl/#return-policy');
});
