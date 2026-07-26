/**
 * Generuje zdjęcia WebP (nowoczesne) + JPEG (iOS 9, max 150 kB).
 * Run: npm run process-images
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'assets', 'images');
const GRADE = { brightness: 1.07, saturation: 0.97, hue: 3 };

const catalog = [
  { out: 'backgrounds/screen-home.webp', jpg: 'backgrounds/screen-home.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1600&fit=crop', theme: 'green rolling hills' },
  { out: 'backgrounds/category_all.webp', jpg: 'backgrounds/category_all.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=1200&fit=crop', theme: 'green cultivated fields panorama farm' },
  { out: 'backgrounds/category_farmers.webp', jpg: 'backgrounds/category_farmers.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1131458/pexels-photo-1131458.jpeg?auto=compress&cs=tinysrgb&w=1200&fit=crop', theme: 'golden rapeseed fields farm' },
  { out: 'backgrounds/category_bakeries.webp', jpg: 'backgrounds/category_bakeries.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1200&fit=crop', theme: 'wheat field village bakery barn warm sun', locked: true },
  { out: 'backgrounds/category_meat.webp', jpg: 'backgrounds/category_meat.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1200&fit=crop', theme: 'cattle green pasture farm' },
  { out: 'backgrounds/category_restaurants.webp', jpg: 'backgrounds/category_restaurants.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=1200&fit=crop', theme: 'farm field warm light rural dining atmosphere', locked: true },
  { out: 'backgrounds/category_shops.webp', jpg: 'backgrounds/category_shops.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1656666/pexels-photo-1656666.jpeg?auto=compress&cs=tinysrgb&w=1200&fit=crop', theme: 'outdoor village farmers market trees sun', locked: true },
  { out: 'backgrounds/category_vending.webp', jpg: 'backgrounds/category_vending.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/264537/pexels-photo-264537.jpeg?auto=compress&cs=tinysrgb&w=1200&fit=crop', theme: 'outdoor farm produce stand' },
  { out: 'backgrounds/category_favorites.webp', jpg: 'backgrounds/category_favorites.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&cs=tinysrgb&w=1200&fit=crop', theme: 'farm barn sunset warm light' },
  { out: 'backgrounds/category_fastFood.webp', jpg: 'backgrounds/category_fastFood.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85', theme: 'outdoor village food stand meadow trees', locked: true },
  { out: 'backgrounds/category_honey.webp', jpg: 'backgrounds/category_honey.jpg', w: 1200, h: 750, jpgW: 768, jpgH: 480, maxKb: 280, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=85', theme: 'apiary beehives flower meadow warm sun', locked: true },
  { out: 'backgrounds/screen-profile.webp', jpg: 'backgrounds/screen-profile.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1459495/pexels-photo-1459495.jpeg?auto=compress&cs=tinysrgb&w=1600&fit=crop', theme: 'orchard trees sunlight' },
  { out: 'backgrounds/screen-premium.webp', jpg: 'backgrounds/screen-premium.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1131458/pexels-photo-1131458.jpeg?auto=compress&cs=tinysrgb&w=1600&fit=crop', theme: 'golden rapeseed fields' },
  { out: 'backgrounds/screen-favorites.webp', jpg: 'backgrounds/screen-favorites.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1600&q=82', theme: 'meadow flowers warm light' },
  { out: 'backgrounds/screen-cart.webp', jpg: 'backgrounds/screen-cart.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1600&q=82', theme: 'garden vegetables' },
  { out: 'backgrounds/screen-articles.webp', jpg: 'backgrounds/screen-articles.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1465146633011-14f8e0781093?auto=format&fit=crop&w=1600&q=82', theme: 'garden meadow orchard' },
  { out: 'backgrounds/screen-settings.webp', jpg: 'backgrounds/screen-settings.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=1600&fit=crop', theme: 'forest clearing sunshine' },
  { out: 'backgrounds/screen-about.webp', jpg: 'backgrounds/screen-about.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=82', theme: 'panorama green hills' },
  { out: 'backgrounds/screen-help.webp', jpg: 'backgrounds/screen-help.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/533923/pexels-photo-533923.jpeg?auto=compress&cs=tinysrgb&w=1600&fit=crop', theme: 'country road sunshine' },
  { out: 'hero/hero-background.webp', jpg: 'hero/hero-background.jpg', w: 1600, h: 1000, jpgW: 1024, jpgH: 640, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1131458/pexels-photo-1131458.jpeg?auto=compress&cs=tinysrgb&w=1600&fit=crop', theme: 'golden rapeseed fields rolling hills farm' },
  // v2.0 – zdjęcia produktów (Unsplash, WebP max 350 kB)
  { out: 'products/bread.webp', jpg: 'products/bread.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85', theme: 'rustic bread loaf', productId: 'bread' },
  { out: 'products/strawberries.webp', jpg: 'products/strawberries.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1200&q=85', theme: 'fresh strawberries', productId: 'strawberries' },
  { out: 'products/cheese.webp', jpg: 'products/cheese.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1681582214458-b06142c48409?auto=format&fit=crop&w=1200&q=85', theme: 'regional cheese', productId: 'cheese' },
  { out: 'products/steak.webp', jpg: 'products/steak.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=85', theme: 'grilled beef steak board', productId: 'steak', locked: true },
  { out: 'products/daily-dish.webp', jpg: 'products/daily-dish.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85', theme: 'schnitzel daily lunch plate', productId: 'daily-dish', locked: true },
  { out: 'products/vegetables.webp', jpg: 'products/vegetables.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85', theme: 'raw mixed vegetables crate', productId: 'vegetables', locked: true },
  { out: 'products/lidl-regional.webp', jpg: 'products/lidl-regional.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85', theme: 'outdoor farm market crates', productId: 'lidl-regional', locked: true },
  // v2.1 – dedykowane zdjęcia produktów (Unsplash)
  { out: 'products/burger.webp', jpg: 'products/burger.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85', theme: 'beef burger', productId: 'burger' },
  { out: 'products/salad.webp', jpg: 'products/salad.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85', theme: 'fresh salad bowl', productId: 'salad' },
  { out: 'products/soup.webp', jpg: 'products/soup.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=85', theme: 'homemade soup', productId: 'soup' },
  { out: 'products/potatoes.webp', jpg: 'products/potatoes.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=85', theme: 'raw potatoes close-up', productId: 'potatoes' },
  { out: 'products/apples.webp', jpg: 'products/apples.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1685967836586-aaefdda7b517?auto=format&fit=crop&w=1200&q=85', theme: 'pile of fresh red apples', productId: 'apples', locked: true },
  { out: 'products/carrots.webp', jpg: 'products/carrots.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=1200&q=85', theme: 'fresh carrots', productId: 'carrots' },
  { out: 'products/eggs.webp', jpg: 'products/eggs.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=1200&q=85', theme: 'farm eggs', productId: 'eggs' },
  { out: 'products/croissant.webp', jpg: 'products/croissant.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=85', theme: 'butter croissants', productId: 'croissant' },
  { out: 'products/cake.webp', jpg: 'products/cake.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85', theme: 'yeast cake', productId: 'cake' },
  { out: 'products/rolls.webp', jpg: 'products/rolls.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'fresh bread rolls brötchen', productId: 'rolls' },
  { out: 'products/sausage.webp', jpg: 'products/sausage.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/929137/pexels-photo-929137.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'bratwurst sausage grill', productId: 'sausage' },
  { out: 'products/pork.webp', jpg: 'products/pork.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=85', theme: 'roasted pork loin slices', productId: 'pork', locked: true },
  { out: 'products/milk.webp', jpg: 'products/milk.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=1200&q=85', theme: 'fresh milk bottle', productId: 'milk' },
  { out: 'products/coffee.webp', jpg: 'products/coffee.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85', theme: 'espresso coffee', productId: 'coffee' },
  { out: 'products/chocolate.webp', jpg: 'products/chocolate.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'dark chocolate bar pieces', productId: 'chocolate' },
  { out: 'products/juice.webp', jpg: 'products/juice.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1200&q=85', theme: 'fresh orange juice', productId: 'juice' },
  { out: 'products/honey.webp', jpg: 'products/honey.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=85', theme: 'jar of honey warm light', productId: 'honey' },
  { out: 'products/yogurt.webp', jpg: 'products/yogurt.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=85', theme: 'natural yogurt bowl', productId: 'yogurt' },
  { out: 'products/pastries.webp', jpg: 'products/pastries.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'sweet yeast bakery pastries', productId: 'pastries', locked: true },
  // v2.3 – rozszerzony zestaw zgodny z kategorią produktu
  { out: 'products/onion.webp', jpg: 'products/onion.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/533342/pexels-photo-533342.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'fresh onions', productId: 'onion' },
  { out: 'products/tomato.webp', jpg: 'products/tomato.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'ripe tomatoes', productId: 'tomato' },
  { out: 'products/cucumber.webp', jpg: 'products/cucumber.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'fresh cucumbers', productId: 'cucumber' },
  { out: 'products/pear.webp', jpg: 'products/pear.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?auto=format&fit=crop&w=1200&q=85', theme: 'fresh pears', productId: 'pear' },
  { out: 'products/plum.webp', jpg: 'products/plum.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Plums.jpg/1280px-Plums.jpg', theme: 'fresh purple plums', productId: 'plum', locked: true },
  { out: 'products/asparagus.webp', jpg: 'products/asparagus.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/351679/pexels-photo-351679.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'fresh asparagus', productId: 'asparagus' },
  { out: 'products/poultry.webp', jpg: 'products/poultry.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=1200&q=85', theme: 'raw chicken breast', productId: 'poultry' },
  { out: 'products/baguette.webp', jpg: 'products/baguette.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/1387070/pexels-photo-1387070.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'long fresh baguette', productId: 'baguette' },
  { out: 'products/pretzel.webp', jpg: 'products/pretzel.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Brezel_Sesam.jpg/1280px-Brezel_Sesam.jpg', theme: 'soft pretzel brezel salted', productId: 'pretzel', locked: true },
  { out: 'products/jam.webp', jpg: 'products/jam.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Homemade_jam.jpg/1280px-Homemade_jam.jpg', theme: 'jar of homemade jam', productId: 'jam', locked: true },
  { out: 'products/preserves.webp', jpg: 'products/preserves.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Preserves.jpg/1280px-Preserves.jpg', theme: 'preserved vegetables jars', productId: 'preserves', locked: true },
  { out: 'products/breakfast.webp', jpg: 'products/breakfast.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=85', theme: 'farmers breakfast plate', productId: 'breakfast' },
  { out: 'products/dessert.webp', jpg: 'products/dessert.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=85', theme: 'dessert plate', productId: 'dessert' },
  { out: 'products/soft-drink.webp', jpg: 'products/soft-drink.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://images.pexels.com/photos/2789328/pexels-photo-2789328.jpeg?auto=compress&cs=tinysrgb&w=1200', theme: 'lemonade bottles soft drink garden', productId: 'soft-drink', locked: true },
  { out: 'products/butter.webp', jpg: 'products/butter.jpg', w: 800, h: 600, jpgW: 512, jpgH: 384, maxKb: 350, jpgMaxKb: 150, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Butter.jpg/1280px-Butter.jpg', theme: 'farm butter block', productId: 'butter', locked: true },
];

const productsOnly = process.argv.includes('--products-only');
const onlyArg = process.argv.find((arg) => String(arg).startsWith('--only='));
const onlyIds = onlyArg
  ? new Set(onlyArg.slice('--only='.length).split(',').map((id) => id.trim()).filter(Boolean))
  : null;

let catalogToProcess = productsOnly
  ? catalog.filter((item) => String(item.out).startsWith('products/'))
  : catalog;

if (onlyIds?.size) {
  catalogToProcess = catalogToProcess.filter((item) => {
    const base = path.basename(item.out, path.extname(item.out));
    return (item.productId && onlyIds.has(item.productId)) || onlyIds.has(base);
  });
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'RegionalerGeschmack/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function saveWebp(buf, item) {
  let quality = item.w <= 1200 ? 86 : 84;
  let outBuf;
  for (let i = 0; i < 12; i++) {
    outBuf = await sharp(buf)
      .resize(item.w, item.h, { fit: 'cover', position: 'centre' })
      .modulate(GRADE)
      .gamma(1.02)
      .webp({ quality, effort: 6 })
      .toBuffer();
    if (outBuf.length <= item.maxKb * 1024) break;
    quality -= 6;
  }
  const outPath = path.join(root, item.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outBuf);
  const meta = await sharp(outPath).metadata();
  return { format: 'webp', out: item.out, kb: Math.round(outBuf.length / 1024), w: meta.width, h: meta.height };
}

async function saveJpeg(buf, item) {
  let quality = 82;
  let outBuf;
  for (let i = 0; i < 14; i++) {
    outBuf = await sharp(buf)
      .resize(item.jpgW, item.jpgH, { fit: 'cover', position: 'centre' })
      .modulate(GRADE)
      .gamma(1.02)
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (outBuf.length <= item.jpgMaxKb * 1024) break;
    quality -= 5;
  }
  const outPath = path.join(root, item.jpg);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outBuf);
  const meta = await sharp(outPath).metadata();
  return { format: 'jpeg', out: item.jpg, kb: Math.round(outBuf.length / 1024), w: meta.width, h: meta.height, ios9: true };
}

const forceLocked = process.argv.includes('--force-locked');
const results = [];
for (const item of catalogToProcess) {
  try {
    if (item.locked && !forceLocked) {
      console.log('SKIP locked (ETAP 10B)', item.out);
      results.push({ out: item.out, jpg: item.jpg, theme: item.theme, skipped: 'locked' });
      continue;
    }
    const buf = await fetchBuffer(item.url);
    results.push({ ...await saveWebp(buf, item), theme: item.theme });
    results.push({ ...await saveJpeg(buf, item), theme: item.theme });
    console.log('OK', item.out, item.jpg);
  } catch (e) {
    console.error('FAIL', item.out, e.message);
    results.push({ out: item.out, jpg: item.jpg, error: e.message });
  }
}

const manifest = {
  etap: 'ios9-compat',
  script: 'scripts/process-images.mjs',
  licenses: ['Unsplash License', 'Pexels License'],
  unified_grade: { brightness: 1.07, saturation: 0.97, hue: 3, gamma: 1.02 },
  formats: {
    webp: 'nowoczesne przeglądarki',
    jpeg: 'iOS 9 / iPad A1416 A1432 – max 150 kB'
  },
  assets: results.filter((r) => !r.error),
};

const backgroundsManifestPath = path.join(root, 'backgrounds', 'sources.json');
let backgroundAssets = results.filter((r) => !r.error && r.out && (
  String(r.out).startsWith('backgrounds/') || String(r.out).startsWith('hero/')
));
if (onlyIds?.size && fs.existsSync(backgroundsManifestPath)) {
  try {
    const prev = JSON.parse(fs.readFileSync(backgroundsManifestPath, 'utf8'));
    const prevAssets = Array.isArray(prev.assets) ? prev.assets : [];
    const replaced = new Set(backgroundAssets.map((a) => a.out));
    backgroundAssets = [
      ...prevAssets.filter((a) => a?.out && !replaced.has(a.out)),
      ...backgroundAssets
    ];
  } catch (_) { /* keep fresh */ }
}
fs.writeFileSync(
  backgroundsManifestPath,
  JSON.stringify({
    ...manifest,
    assets: onlyIds?.size ? backgroundAssets : manifest.assets
  }, null, 2)
);

fs.writeFileSync(
  path.join(root, 'hero', 'sources.json'),
  JSON.stringify({
    file: 'hero-background.webp',
    legacy_file: 'hero-background.jpg',
    generated_by: 'scripts/process-images.mjs',
    grade: 'brightness 1.07, saturation 0.97, hue +3, gamma 1.02',
    ios9_max_kb: 150,
  }, null, 2)
);

const productAssets = results.filter((r) => !r.error && r.out && String(r.out).startsWith('products/'));
fs.mkdirSync(path.join(root, 'products'), { recursive: true });
const productsManifestPath = path.join(root, 'products', 'sources.json');
let mergedProductAssets = productAssets;
if (onlyIds?.size && fs.existsSync(productsManifestPath)) {
  try {
    const prev = JSON.parse(fs.readFileSync(productsManifestPath, 'utf8'));
    const prevAssets = Array.isArray(prev.assets) ? prev.assets : [];
    const replaced = new Set(productAssets.map((a) => a.out));
    mergedProductAssets = [
      ...prevAssets.filter((a) => a?.out && !replaced.has(a.out)),
      ...productAssets
    ];
  } catch (_) { /* keep fresh list */ }
}
fs.writeFileSync(
  productsManifestPath,
  JSON.stringify({
    version: '2.2',
    script: 'scripts/process-images.mjs',
    licenses: ['Unsplash License'],
    fallback_products: [],
    formats: { webp: 'max 350 kB', jpeg: 'iOS 9 legacy max 150 kB' },
    assets: mergedProductAssets,
  }, null, 2)
);

console.log(JSON.stringify(results, null, 2));
