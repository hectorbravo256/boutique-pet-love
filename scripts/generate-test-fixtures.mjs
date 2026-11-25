import {mkdirSync,writeFileSync} from 'node:fs';
const groups=[["Otoño - Invierno","Fiestas Patrias","Halloween","Navidad","Primavera - Verano","Gala","Accesorios"],["Abrigo escocés","Polar azul","Parka impermeable","Huasa elegante","Traje huaso","Disfraz mago","Disfraz calabaza","Disfraz vaquero","Vestido navideño","Traje reno","Polar navideño","Camiseta verano","Vestido floral","Polera ligera","Vestido gala","Esmoquin","Vestido princesa","Arnés","Pañuelo","Collar"]];
mkdirSync('public/test-fixtures',{recursive:true});
for(const [g,items] of groups.entries()) for(const [i,name] of items.entries()){
 const hue=(i*47+g*90)%360;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="hsl(${hue},35%,92%)"/><path d="M210 150 L270 120 Q300 175 330 120 L390 150 L460 235 L390 290 L365 250 V390 H235 V250 L210 290 L140 235 Z" fill="hsl(${hue},40%,48%)"/><text x="300" y="465" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#222">${name}</text><text x="300" y="520" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="#222">TEST · IMAGEN FICTICIA</text></svg>`;
 writeFileSync(`public/test-fixtures/${g?'product':'category'}-${i+1}.svg`,svg);
}
