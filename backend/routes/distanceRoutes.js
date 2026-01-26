const express = require('express');
const router = express.Router();

// Usar node-fetch si fetch no está disponible (Node < 18)
let fetch;
try {
  // Intentar usar fetch nativo (Node 18+)
  if (typeof globalThis.fetch === 'function') {
    fetch = globalThis.fetch;
  } else {
    // Fallback a node-fetch
    fetch = require('node-fetch');
  }
} catch (e) {
  // Si node-fetch no está instalado, usar https nativo
  const https = require('https');
  const http = require('http');
  
  fetch = (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const req = protocol.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {},
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => {
              try {
                return Promise.resolve(JSON.parse(data));
              } catch (e) {
                return Promise.reject(new Error(`Invalid JSON: ${e.message}. Data: ${data.substring(0, 200)}`));
              }
            },
            text: () => Promise.resolve(data),
          });
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  };
}

/**
 * Calcula la distancia entre dos direcciones usando OpenRouteService API
 * POST /api/distance/calculate
 * Body: { origin: string, destination: string }
 */
// Distancias aproximadas entre ciudades principales de Marruecos (en km)
// Lista completa de ciudades turísticas y principales
const CITY_DISTANCES = {
  'marrakech': {
    'casablanca': 240,
    'rabat': 330,
    'fez': 530,
    'fes': 530,
    'tanger': 560,
    'tánger': 560,
    'tangier': 560,
    'agadir': 235,
    'taghazout': 255,
    'aourir': 250,
    'tamraght': 253,
    'imsouane': 315,
    'biougra': 255,
    'aït melloul': 245,
    'ait melloul': 245,
    'inezgane': 243,
    'ouarzazate': 200,
    'ouarzazat': 200,
    'chefchaouen': 520,
    'chefchaouene': 520,
    'tetouan': 580,
    'tétouan': 580,
    'tetuan': 580,
    'asilah': 600,
    'asila': 600,
    'merzouga': 560,
    'agafay': 30,
    'essaouira': 180,
    'safi': 150,
    'el jadida': 200,
    'azilal': 150,
    'beni mellal': 200,
    'mdiq': 595,
    'm\'diq': 595,
    'marina smir': 600,
    'fnideq': 605,
    'fnidiq': 605,
    'ceuta': 610,
    'martil': 588,
    'cabonegro': 592,
    'cabo negro': 592,
    'akchour': 550,
    'alhucemas': 780,
    'al hoceima': 780,
    'nador': 900,
    'saidia': 960,
    'saïdia': 960,
    'oujda': 850,
    'ouejda': 850,
  },
  'casablanca': {
    'marrakech': 240,
    'rabat': 90,
    'fez': 290,
    'fes': 290,
    'tanger': 320,
    'tánger': 320,
    'tangier': 320,
    'agadir': 475,
    'taghazout': 495,
    'aourir': 490,
    'tamraght': 493,
    'imsouane': 555,
    'biougra': 495,
    'aït melloul': 485,
    'ait melloul': 485,
    'inezgane': 483,
    'chefchaouen': 350,
    'chefchaouene': 350,
    'tetouan': 380,
    'tétouan': 380,
    'tetuan': 380,
    'asilah': 400,
    'asila': 400,
    'essaouira': 360,
    'safi': 200,
    'el jadida': 100,
    'azemmour': 80,
    'mohammedia': 30,
    'mdiq': 395,
    'm\'diq': 395,
    'marina smir': 400,
    'fnideq': 405,
    'fnidiq': 405,
    'ceuta': 410,
    'martil': 388,
    'cabonegro': 392,
    'cabo negro': 392,
    'akchour': 380,
    'alhucemas': 560,
    'al hoceima': 560,
    'nador': 690,
    'saidia': 750,
    'saïdia': 750,
    'oujda': 640,
    'ouejda': 640,
  },
  'rabat': {
    'marrakech': 330,
    'casablanca': 90,
    'fez': 200,
    'fes': 200,
    'tanger': 230,
    'tánger': 230,
    'tangier': 230,
    'agadir': 565,
    'taghazout': 585,
    'aourir': 580,
    'tamraght': 583,
    'imsouane': 645,
    'biougra': 585,
    'aït melloul': 575,
    'ait melloul': 575,
    'inezgane': 573,
    'chefchaouen': 260,
    'chefchaouene': 260,
    'tetouan': 280,
    'tétouan': 280,
    'tetuan': 280,
    'asilah': 300,
    'asila': 300,
    'kenitra': 40,
    'meknes': 140,
    'meknès': 140,
    'mdiq': 295,
    'm\'diq': 295,
    'marina smir': 300,
    'fnideq': 305,
    'fnidiq': 305,
    'ceuta': 310,
    'martil': 288,
    'cabonegro': 292,
    'cabo negro': 292,
    'akchour': 290,
    'alhucemas': 470,
    'al hoceima': 470,
    'nador': 600,
    'saidia': 660,
    'saïdia': 660,
    'oujda': 550,
    'ouejda': 550,
  },
  'fez': {
    'marrakech': 530,
    'casablanca': 290,
    'rabat': 200,
    'tanger': 300,
    'tánger': 300,
    'tangier': 300,
    'chefchaouen': 200,
    'chefchaouene': 200,
    'tetouan': 250,
    'tétouan': 250,
    'tetuan': 250,
    'asilah': 270,
    'asila': 270,
    'agadir': 765,
    'taghazout': 785,
    'essaouira': 705,
    'safi': 675,
    'el jadida': 390,
    'ouarzazate': 730,
    'ouarzazat': 730,
    'meknes': 60,
    'meknès': 60,
    'ifrane': 60,
    'azrou': 80,
    'merzouga': 350,
    'erfoud': 320,
    'mdiq': 265,
    'm\'diq': 265,
    'marina smir': 270,
    'fnideq': 275,
    'fnidiq': 275,
    'ceuta': 280,
    'martil': 258,
    'cabonegro': 262,
    'cabo negro': 262,
    'akchour': 230,
    'alhucemas': 250,
    'al hoceima': 250,
    'nador': 370,
    'saidia': 430,
    'saïdia': 430,
    'oujda': 320,
    'ouejda': 320,
  },
  'fes': {
    'marrakech': 530,
    'casablanca': 290,
    'rabat': 200,
    'tanger': 300,
    'tánger': 300,
    'tangier': 300,
    'chefchaouen': 200,
    'chefchaouene': 200,
    'tetouan': 250,
    'tétouan': 250,
    'tetuan': 250,
    'agadir': 765,
    'taghazout': 785,
    'essaouira': 705,
    'safi': 675,
    'el jadida': 390,
    'ouarzazate': 730,
    'ouarzazat': 730,
    'meknes': 60,
    'meknès': 60,
    'ifrane': 60,
    'azrou': 80,
    'merzouga': 350,
    'erfoud': 320,
  },
  'tanger': {
    'marrakech': 560,
    'casablanca': 320,
    'rabat': 230,
    'fez': 300,
    'fes': 300,
    'chefchaouen': 110,
    'chefchaouene': 110,
    'tetouan': 60,
    'tétouan': 60,
    'tetuan': 60,
    'asilah': 45,
    'asila': 45,
    'agadir': 640,
    'taghazout': 660,
    'essaouira': 760,
    'safi': 730,
    'el jadida': 420,
    'ouarzazate': 780,
    'ouarzazat': 780,
    'merzouga': 920,
    'meknes': 360,
    'meknès': 360,
    'ifrane': 360,
    'azrou': 380,
    'larache': 85,
    'ksar el kebir': 100,
    'mdiq': 75,
    'm\'diq': 75,
    'marina smir': 80,
    'fnideq': 85,
    'fnidiq': 85,
    'ceuta': 90,
    'martil': 68,
    'cabonegro': 72,
    'cabo negro': 72,
    'akchour': 140,
    'alhucemas': 240,
    'al hoceima': 240,
    'nador': 310,
    'saidia': 370,
    'saïdia': 370,
    'oujda': 360,
    'ouejda': 360,
  },
  'tánger': {
    'marrakech': 560,
    'casablanca': 320,
    'rabat': 230,
    'fez': 300,
    'fes': 300,
    'chefchaouen': 110,
    'chefchaouene': 110,
    'tetouan': 60,
    'tétouan': 60,
    'tetuan': 60,
    'asilah': 45,
    'asila': 45,
    'agadir': 640,
    'taghazout': 660,
    'essaouira': 760,
    'safi': 730,
    'el jadida': 420,
    'ouarzazate': 780,
    'ouarzazat': 780,
    'merzouga': 920,
    'meknes': 360,
    'meknès': 360,
    'ifrane': 360,
    'azrou': 380,
  },
  'tangier': {
    'marrakech': 560,
    'casablanca': 320,
    'rabat': 230,
    'fez': 300,
    'fes': 300,
    'chefchaouen': 110,
    'chefchaouene': 110,
    'tetouan': 60,
    'tétouan': 60,
    'tetuan': 60,
    'asilah': 45,
    'asila': 45,
    'agadir': 640,
    'taghazout': 660,
    'essaouira': 760,
    'safi': 730,
    'el jadida': 420,
    'ouarzazate': 780,
    'ouarzazat': 780,
    'merzouga': 920,
    'meknes': 360,
    'meknès': 360,
    'ifrane': 360,
    'azrou': 380,
  },
  'chefchaouen': {
    'marrakech': 520,
    'casablanca': 350,
    'rabat': 260,
    'fez': 200,
    'fes': 200,
    'tanger': 110,
    'tánger': 110,
    'tangier': 110,
    'tetouan': 70,
    'tétouan': 70,
    'tetuan': 70,
    'asilah': 130,
    'asila': 130,
    'akchour': 30,
    'alhucemas': 250,
    'al hoceima': 250,
  },
  'chefchaouene': {
    'marrakech': 520,
    'casablanca': 350,
    'rabat': 260,
    'fez': 200,
    'fes': 200,
    'tanger': 110,
    'tánger': 110,
    'tangier': 110,
    'tetouan': 70,
    'tétouan': 70,
    'tetuan': 70,
    'agadir': 710,
    'taghazout': 730,
    'essaouira': 830,
    'safi': 800,
    'el jadida': 450,
    'ouarzazate': 850,
    'ouarzazat': 850,
    'merzouga': 990,
  },
  'tetouan': {
    'marrakech': 580,
    'casablanca': 380,
    'rabat': 280,
    'fez': 250,
    'fes': 250,
    'tanger': 60,
    'tánger': 60,
    'tangier': 60,
    'chefchaouen': 70,
    'chefchaouene': 70,
    'asilah': 40,
    'asila': 40,
    'agadir': 640,
    'taghazout': 660,
    'essaouira': 760,
    'safi': 730,
    'ouarzazate': 780,
    'merzouga': 920,
    'larache': 100,
    'mdiq': 15,
    'm\'diq': 15,
    'marina smir': 20,
    'fnideq': 25,
    'fnidiq': 25,
    'ceuta': 30,
    'martil': 8,
    'cabonegro': 12,
    'cabo negro': 12,
    'akchour': 50,
    'alhucemas': 180,
    'al hoceima': 180,
    'nador': 250,
    'saidia': 280,
    'saïdia': 280,
    'oujda': 320,
    'ouejda': 320,
  },
  'tétouan': {
    'marrakech': 580,
    'casablanca': 380,
    'rabat': 280,
    'fez': 250,
    'fes': 250,
    'tanger': 60,
    'tánger': 60,
    'tangier': 60,
    'chefchaouen': 70,
    'chefchaouene': 70,
    'asilah': 40,
    'asila': 40,
    'agadir': 640,
    'taghazout': 660,
    'essaouira': 760,
    'safi': 730,
    'ouarzazate': 780,
    'merzouga': 920,
  },
  'tetuan': {
    'marrakech': 580,
    'casablanca': 380,
    'rabat': 280,
    'fez': 250,
    'fes': 250,
    'tanger': 60,
    'tánger': 60,
    'tangier': 60,
    'chefchaouen': 70,
    'chefchaouene': 70,
    'asilah': 40,
    'asila': 40,
    'agadir': 640,
    'taghazout': 660,
    'essaouira': 760,
    'safi': 730,
    'ouarzazate': 780,
    'merzouga': 920,
  },
  'asilah': {
    'marrakech': 600,
    'casablanca': 400,
    'rabat': 300,
    'fez': 270,
    'fes': 270,
    'tanger': 45,
    'tánger': 45,
    'tangier': 45,
    'chefchaouen': 130,
    'chefchaouene': 130,
    'tetouan': 40,
    'tétouan': 40,
    'tetuan': 40,
    'larache': 50,
    'mdiq': 55,
    'm\'diq': 55,
    'marina smir': 60,
  },
  'asila': {
    'marrakech': 600,
    'casablanca': 400,
    'rabat': 300,
    'fez': 270,
    'fes': 270,
    'tanger': 45,
    'tánger': 45,
    'tangier': 45,
    'tetouan': 40,
    'tétouan': 40,
    'tetuan': 40,
  },
  'merzouga': {
    'marrakech': 560,
    'casablanca': 800,
    'rabat': 890,
    'fez': 350,
    'fes': 350,
    'tanger': 920,
    'tánger': 920,
    'tangier': 920,
    'chefchaouen': 990,
    'chefchaouene': 990,
    'tetouan': 920,
    'tétouan': 920,
    'tetuan': 920,
    'agadir': 840,
    'taghazout': 860,
    'essaouira': 720,
    'safi': 690,
    'el jadida': 820,
    'ouarzazate': 400,
    'ouarzazat': 400,
    'zagora': 350,
    'erfoud': 50,
    'tinghir': 150,
  },
  'ouarzazate': {
    'marrakech': 200,
    'casablanca': 440,
    'rabat': 530,
    'fez': 730,
    'fes': 730,
    'tanger': 780,
    'tánger': 780,
    'tangier': 780,
    'chefchaouen': 850,
    'chefchaouene': 850,
    'tetouan': 780,
    'tétouan': 780,
    'tetuan': 780,
    'agadir': 280,
    'taghazout': 300,
    'essaouira': 380,
    'safi': 350,
    'el jadida': 480,
    'merzouga': 400,
    'zagora': 100,
    'tinghir': 160,
    'skoura': 40,
    'ait ben haddou': 30,
  },
  'ouarzazat': {
    'marrakech': 200,
    'casablanca': 440,
    'rabat': 530,
    'fez': 730,
    'fes': 730,
    'tanger': 780,
    'tánger': 780,
    'tangier': 780,
    'chefchaouen': 850,
    'chefchaouene': 850,
    'tetouan': 780,
    'tétouan': 780,
    'tetuan': 780,
    'agadir': 280,
    'taghazout': 300,
    'essaouira': 380,
    'safi': 350,
    'el jadida': 480,
    'merzouga': 400,
    'zagora': 100,
    'tinghir': 160,
  },
  'agafay': {
    'marrakech': 30,
    'casablanca': 270,
    'rabat': 360,
  },
  'agadir': {
    'marrakech': 235,
    'casablanca': 475,
    'rabat': 565,
    'fez': 765,
    'fes': 765,
    'tanger': 640,
    'tánger': 640,
    'tangier': 640,
    'chefchaouen': 710,
    'chefchaouene': 710,
    'tetouan': 640,
    'tétouan': 640,
    'tetuan': 640,
    'asilah': 680,
    'asila': 680,
    'essaouira': 175,
    'safi': 325,
    'el jadida': 375,
    'meknes': 705,
    'meknès': 705,
    'merzouga': 840,
    'ouarzazate': 280,
    'ouarzazat': 280,
    'taghazout': 20,
    'aourir': 15,
    'tamraght': 18,
    'imsouane': 80,
    'biougra': 20,
    'aït melloul': 10,
    'ait melloul': 10,
    'inezgane': 8,
    'tiznit': 90,
    'taroudant': 80,
  },
  'taghazout': {
    'marrakech': 255,
    'casablanca': 495,
    'rabat': 585,
    'agadir': 20,
    'aourir': 5,
    'tamraght': 2,
    'imsouane': 60,
    'essaouira': 195,
  },
  'aourir': {
    'marrakech': 250,
    'casablanca': 490,
    'rabat': 580,
    'agadir': 15,
    'taghazout': 5,
    'tamraght': 3,
    'imsouane': 65,
    'essaouira': 190,
  },
  'tamraght': {
    'marrakech': 253,
    'casablanca': 493,
    'rabat': 583,
    'agadir': 18,
    'taghazout': 2,
    'aourir': 3,
    'imsouane': 62,
    'essaouira': 193,
  },
  'imsouane': {
    'marrakech': 315,
    'casablanca': 555,
    'rabat': 645,
    'agadir': 80,
    'taghazout': 60,
    'aourir': 65,
    'tamraght': 62,
    'essaouira': 95,
  },
  'biougra': {
    'marrakech': 255,
    'casablanca': 495,
    'rabat': 585,
    'agadir': 20,
    'taroudant': 60,
    'tiznit': 70,
  },
  'aït melloul': {
    'marrakech': 245,
    'casablanca': 485,
    'rabat': 575,
    'agadir': 10,
    'inezgane': 2,
    'tiznit': 80,
  },
  'ait melloul': {
    'marrakech': 245,
    'casablanca': 485,
    'rabat': 575,
    'agadir': 10,
    'inezgane': 2,
    'tiznit': 80,
  },
  'inezgane': {
    'marrakech': 243,
    'casablanca': 483,
    'rabat': 573,
    'agadir': 8,
    'aït melloul': 2,
    'ait melloul': 2,
    'tiznit': 82,
  },
  'essaouira': {
    'marrakech': 180,
    'casablanca': 360,
    'rabat': 450,
    'fez': 705,
    'fes': 705,
    'tanger': 760,
    'tánger': 760,
    'tangier': 760,
    'chefchaouen': 830,
    'chefchaouene': 830,
    'tetouan': 760,
    'tétouan': 760,
    'tetuan': 760,
    'agadir': 175,
    'taghazout': 195,
    'aourir': 190,
    'tamraght': 193,
    'imsouane': 95,
    'biougra': 195,
    'aït melloul': 185,
    'ait melloul': 185,
    'inezgane': 183,
    'safi': 120,
    'el jadida': 170,
    'ouarzazate': 380,
    'ouarzazat': 380,
    'merzouga': 720,
  },
  'safi': {
    'marrakech': 150,
    'casablanca': 200,
    'rabat': 290,
    'fez': 675,
    'fes': 675,
    'tanger': 730,
    'tánger': 730,
    'tangier': 730,
    'chefchaouen': 800,
    'chefchaouene': 800,
    'tetouan': 730,
    'tétouan': 730,
    'tetuan': 730,
    'agadir': 325,
    'taghazout': 345,
    'essaouira': 120,
    'el jadida': 50,
    'ouarzazate': 350,
    'ouarzazat': 350,
    'merzouga': 690,
  },
  'el jadida': {
    'marrakech': 200,
    'casablanca': 100,
    'rabat': 190,
    'fez': 390,
    'fes': 390,
    'tanger': 420,
    'tánger': 420,
    'tangier': 420,
    'chefchaouen': 450,
    'chefchaouene': 450,
    'tetouan': 380,
    'tétouan': 380,
    'tetuan': 380,
    'agadir': 375,
    'taghazout': 395,
    'essaouira': 170,
    'safi': 50,
    'ouarzazate': 480,
    'ouarzazat': 480,
    'merzouga': 820,
    'azemmour': 20,
  },
  'meknes': {
    'rabat': 140,
    'fez': 60,
    'fes': 60,
    'casablanca': 230,
    'marrakech': 470,
    'tanger': 360,
    'tánger': 360,
    'tangier': 360,
    'chefchaouen': 260,
    'chefchaouene': 260,
    'tetouan': 310,
    'tétouan': 310,
    'tetuan': 310,
    'agadir': 705,
    'taghazout': 725,
    'essaouira': 645,
    'safi': 615,
    'el jadida': 330,
    'ouarzazate': 670,
    'ouarzazat': 670,
    'merzouga': 410,
  },
  'meknès': {
    'rabat': 140,
    'fez': 60,
    'fes': 60,
    'casablanca': 230,
    'marrakech': 470,
    'tanger': 360,
    'tánger': 360,
    'tangier': 360,
    'chefchaouen': 260,
    'chefchaouene': 260,
    'tetouan': 310,
    'tétouan': 310,
    'tetuan': 310,
    'agadir': 705,
    'taghazout': 725,
    'essaouira': 645,
    'safi': 615,
    'el jadida': 330,
    'ouarzazate': 670,
    'ouarzazat': 670,
    'merzouga': 410,
  },
  'ifrane': {
    'marrakech': 590,
    'casablanca': 350,
    'rabat': 260,
    'fez': 60,
    'fes': 60,
    'tanger': 360,
    'tánger': 360,
    'tangier': 360,
    'chefchaouen': 260,
    'chefchaouene': 260,
    'tetouan': 310,
    'tétouan': 310,
    'tetuan': 310,
    'agadir': 825,
    'taghazout': 845,
    'essaouira': 765,
    'safi': 735,
    'el jadida': 450,
    'ouarzazate': 790,
    'ouarzazat': 790,
    'merzouga': 410,
    'meknes': 70,
    'meknès': 70,
    'azrou': 20,
  },
  'azrou': {
    'fez': 80,
    'fes': 80,
    'ifrane': 20,
    'meknes': 90,
    'meknès': 90,
  },
  'erfoud': {
    'fez': 320,
    'fes': 320,
    'merzouga': 50,
    'tinghir': 100,
    'ouarzazate': 350,
    'ouarzazat': 350,
  },
  'tinghir': {
    'ouarzazate': 160,
    'ouarzazat': 160,
    'merzouga': 150,
    'erfoud': 100,
  },
  'zagora': {
    'ouarzazate': 100,
    'ouarzazat': 100,
    'merzouga': 350,
  },
  'larache': {
    'tanger': 85,
    'tánger': 85,
    'tangier': 85,
    'rabat': 150,
    'asilah': 50,
    'asila': 50,
  },
  'kenitra': {
    'rabat': 40,
    'casablanca': 130,
    'fez': 160,
    'fes': 160,
  },
  // Ciudades del norte - Costa
  'mdiq': {
    'tetouan': 15,
    'tétouan': 15,
    'tetuan': 15,
    'tanger': 75,
    'tánger': 75,
    'tangier': 75,
    'marina smir': 5,
    'fnideq': 10,
    'fnidiq': 10,
    'ceuta': 20,
    'martil': 7,
    'cabonegro': 3,
    'cabo negro': 3,
    'chefchaouen': 85,
    'chefchaouene': 85,
    'asilah': 55,
    'asila': 55,
    'casablanca': 395,
    'rabat': 295,
  },
  'm\'diq': {
    'tetouan': 15,
    'tétouan': 15,
    'tetuan': 15,
    'tanger': 75,
    'tánger': 75,
    'tangier': 75,
    'marina smir': 5,
    'fnideq': 10,
    'fnidiq': 10,
    'ceuta': 20,
    'martil': 7,
    'cabonegro': 3,
    'cabo negro': 3,
  },
  'marina smir': {
    'mdiq': 5,
    'm\'diq': 5,
    'tetouan': 20,
    'tétouan': 20,
    'tetuan': 20,
    'tanger': 80,
    'tánger': 80,
    'tangier': 80,
    'fnideq': 15,
    'fnidiq': 15,
    'ceuta': 25,
    'martil': 12,
    'cabonegro': 8,
    'cabo negro': 8,
    'chefchaouen': 90,
    'chefchaouene': 90,
  },
  'fnideq': {
    'tetouan': 25,
    'tétouan': 25,
    'tetuan': 25,
    'mdiq': 10,
    'm\'diq': 10,
    'marina smir': 15,
    'ceuta': 5,
    'martil': 17,
    'cabonegro': 13,
    'cabo negro': 13,
    'tanger': 85,
    'tánger': 85,
    'tangier': 85,
  },
  'fnidiq': {
    'tetouan': 25,
    'tétouan': 25,
    'tetuan': 25,
    'mdiq': 10,
    'm\'diq': 10,
    'marina smir': 15,
    'ceuta': 5,
    'martil': 17,
    'cabonegro': 13,
    'cabo negro': 13,
  },
  'ceuta': {
    'fnideq': 5,
    'fnidiq': 5,
    'tetouan': 30,
    'tétouan': 30,
    'tetuan': 30,
    'mdiq': 20,
    'm\'diq': 20,
    'marina smir': 25,
    'martil': 22,
    'cabonegro': 18,
    'cabo negro': 18,
    'tanger': 90,
    'tánger': 90,
    'tangier': 90,
    'casablanca': 410,
    'rabat': 310,
  },
  'martil': {
    'tetouan': 8,
    'tétouan': 8,
    'tetuan': 8,
    'mdiq': 7,
    'm\'diq': 7,
    'marina smir': 12,
    'fnideq': 17,
    'fnidiq': 17,
    'ceuta': 22,
    'cabonegro': 4,
    'cabo negro': 4,
    'tanger': 68,
    'tánger': 68,
    'tangier': 68,
  },
  'cabonegro': {
    'martil': 4,
    'tetouan': 12,
    'tétouan': 12,
    'tetuan': 12,
    'mdiq': 3,
    'm\'diq': 3,
    'marina smir': 8,
    'fnideq': 13,
    'fnidiq': 13,
    'ceuta': 18,
    'tanger': 72,
    'tánger': 72,
    'tangier': 72,
  },
  'cabo negro': {
    'martil': 4,
    'tetouan': 12,
    'tétouan': 12,
    'tetuan': 12,
    'mdiq': 3,
    'm\'diq': 3,
    'marina smir': 8,
    'fnideq': 13,
    'fnidiq': 13,
    'ceuta': 18,
  },
  'akchour': {
    'chefchaouen': 30,
    'chefchaouene': 30,
    'tetouan': 100,
    'tétouan': 100,
    'tetuan': 100,
    'tanger': 140,
    'tánger': 140,
    'tangier': 140,
  },
  'alhucemas': {
    'fez': 250,
    'fes': 250,
    'nador': 120,
    'tetouan': 180,
    'tétouan': 180,
    'tetuan': 180,
    'chefchaouen': 250,
    'chefchaouene': 250,
    'oujda': 200,
    'ouejda': 200,
    'casablanca': 560,
    'rabat': 470,
  },
  'al hoceima': {
    'fez': 250,
    'fes': 250,
    'nador': 120,
    'tetouan': 180,
    'tétouan': 180,
    'tetuan': 180,
    'chefchaouen': 250,
    'chefchaouene': 250,
    'oujda': 200,
    'ouejda': 200,
  },
  'nador': {
    'alhucemas': 120,
    'al hoceima': 120,
    'oujda': 140,
    'ouejda': 140,
    'fez': 370,
    'fes': 370,
    'saidia': 60,
    'saïdia': 60,
    'melilla': 15,
    'casablanca': 690,
    'rabat': 600,
  },
  'saidia': {
    'nador': 60,
    'oujda': 80,
    'ouejda': 80,
    'alhucemas': 180,
    'al hoceima': 180,
    'fez': 430,
    'fes': 430,
  },
  'saïdia': {
    'nador': 60,
    'oujda': 80,
    'ouejda': 80,
    'alhucemas': 180,
    'al hoceima': 180,
  },
  'oujda': {
    'fez': 320,
    'fes': 320,
    'nador': 140,
    'saidia': 80,
    'saïdia': 80,
    'alhucemas': 200,
    'al hoceima': 200,
    'casablanca': 640,
    'rabat': 550,
    'meknes': 380,
    'meknès': 380,
  },
  'ouejda': {
    'fez': 320,
    'fes': 320,
    'nador': 140,
    'saidia': 80,
    'saïdia': 80,
    'alhucemas': 200,
    'al hoceima': 200,
  },
};

// Función para obtener distancia aproximada entre ciudades
function getApproximateDistance(origin, destination) {
  const originLower = origin.toLowerCase().trim();
  const destLower = destination.toLowerCase().trim();
  
  // Normalizar nombres de ciudades comunes (alias y variantes)
  const cityAliases = {
    // Tetouan (añadir primero para que tenga prioridad)
    'tetouan': 'tetouan',
    'tétouan': 'tetouan',
    'tetuan': 'tetouan',
    // Tanger
    'tanger': 'tanger',
    'tánger': 'tanger',
    'tangier': 'tanger',
    // Chefchaouen
    'chefchaouen': 'chefchaouen',
    'chefchaouene': 'chefchaouen',
    'chaouen': 'chefchaouen',
    // Marrakech
    'marrakech': 'marrakech',
    'marrakesh': 'marrakech',
    'marrakech': 'marrakech',
    // Casablanca
    'casablanca': 'casablanca',
    'casa': 'casablanca',
    // Rabat
    'rabat': 'rabat',
    // Fez
    'fez': 'fez',
    'fes': 'fez',
    // Tetouan
    'tetouan': 'tetouan',
    'tétouan': 'tetouan',
    'tetuan': 'tetouan',
    'tetuan': 'tetouan',
    // Asilah
    'asilah': 'asilah',
    'asila': 'asilah',
    // M'diq
    'mdiq': 'mdiq',
    'm\'diq': 'mdiq',
    'mdiq': 'mdiq',
    // Marina Smir
    'marina smir': 'marina smir',
    'marina smir': 'marina smir',
    // Akchour
    'akchour': 'akchour',
    'akchur': 'akchour',
    // Alhucemas
    'alhucemas': 'alhucemas',
    'al hoceima': 'alhucemas',
    'alhuceima': 'alhucemas',
    // Nador
    'nador': 'nador',
    // Saidia
    'saidia': 'saidia',
    'saïdia': 'saidia',
    // Oujda
    'oujda': 'oujda',
    'ouejda': 'oujda',
    // Fnideq
    'fnideq': 'fnideq',
    'fnidiq': 'fnideq',
    // Ceuta
    'ceuta': 'ceuta',
    // Martil
    'martil': 'martil',
    // Cabo Negro
    'cabonegro': 'cabonegro',
    'cabo negro': 'cabonegro',
    // Ouarzazate
    'ouarzazate': 'ouarzazate',
    'ouarzazat': 'ouarzazate',
    'warzazat': 'ouarzazate',
    // Merzouga
    'merzouga': 'merzouga',
    'merzuga': 'merzouga',
    // Agafay
    'agafay': 'agafay',
    'agafai': 'agafay',
    // Essaouira
    'essaouira': 'essaouira',
    'essawira': 'essaouira',
    'mogador': 'essaouira',
    // Agadir
    'agadir': 'agadir',
    // Taghazout
    'taghazout': 'taghazout',
    'taghazoute': 'taghazout',
    'taghazut': 'taghazout',
    // Aourir
    'aourir': 'aourir',
    'awrir': 'aourir',
    // Tamraght
    'tamraght': 'tamraght',
    'tamragt': 'tamraght',
    // Imsouane
    'imsouane': 'imsouane',
    'imsouan': 'imsouane',
    // Biougra
    'biougra': 'biougra',
    'biogra': 'biougra',
    // Aït Melloul
    'aït melloul': 'aït melloul',
    'ait melloul': 'aït melloul',
    'ait mellul': 'aït melloul',
    'ayt melloul': 'aït melloul',
    // Inezgane
    'inezgane': 'inezgane',
    'inezgan': 'inezgane',
    // Meknes
    'meknes': 'meknes',
    'meknès': 'meknes',
    // Ifrane
    'ifrane': 'ifrane',
    'ifran': 'ifrane',
    'ifran': 'ifrane',
  };
  
  // Normalizar origen y destino
  let normalizedOrigin = originLower;
  let normalizedDest = destLower;
  
  // Buscar alias más largo primero (para evitar coincidencias parciales incorrectas)
  const sortedAliases = Object.entries(cityAliases).sort((a, b) => b[0].length - a[0].length);
  
  for (const [alias, normalized] of sortedAliases) {
    if (originLower.includes(alias)) {
      normalizedOrigin = normalized;
      break;
    }
  }
  
  for (const [alias, normalized] of sortedAliases) {
    if (destLower.includes(alias)) {
      normalizedDest = normalized;
      break;
    }
  }
  
  // Buscar coincidencias exactas primero
  if (CITY_DISTANCES[normalizedOrigin] && CITY_DISTANCES[normalizedOrigin][normalizedDest]) {
    console.log(`✅ Distancia encontrada (exacta): ${normalizedOrigin} → ${normalizedDest}`);
    return CITY_DISTANCES[normalizedOrigin][normalizedDest];
  }
  
  // Buscar coincidencias parciales (buscar en ambas direcciones)
  for (const [city1, distances] of Object.entries(CITY_DISTANCES)) {
    if (normalizedOrigin === city1 || normalizedOrigin.includes(city1) || city1.includes(normalizedOrigin.split(' ')[0])) {
      for (const [city2, distance] of Object.entries(distances)) {
        if (normalizedDest === city2 || normalizedDest.includes(city2) || city2.includes(normalizedDest.split(' ')[0])) {
          console.log(`✅ Distancia encontrada (parcial): ${city1} → ${city2}`);
          return distance;
        }
      }
    }
  }
  
  // Intentar búsqueda inversa (destino -> origen)
  for (const [city1, distances] of Object.entries(CITY_DISTANCES)) {
    if (normalizedDest === city1 || normalizedDest.includes(city1) || city1.includes(normalizedDest.split(' ')[0])) {
      for (const [city2, distance] of Object.entries(distances)) {
        if (normalizedOrigin === city2 || normalizedOrigin.includes(city2) || city2.includes(normalizedOrigin.split(' ')[0])) {
          console.log(`✅ Distancia encontrada (inversa): ${city1} → ${city2}`);
          return distance;
        }
      }
    }
  }
  
  console.log(`⚠️ No se encontró distancia aproximada para: ${originLower} → ${destLower} (normalizado: ${normalizedOrigin} → ${normalizedDest})`);
  return null;
}

// Tarifas por tipo de vehículo (MAD por km)
// Ajustadas para ser más competitivas en el mercado marroquí
const VEHICLE_RATES = {
  'vito': {
    ratePerKm: 7, // 7 MAD/km
    maxCapacity: 7,
    returnTripSupplement: 0.4, // 40% suplemento obligatorio trayecto de vuelta
  },
  'v-class': {
    ratePerKm: 9, // 9 MAD/km
    maxCapacity: 6,
    returnTripSupplement: 0.4, // 40% suplemento obligatorio trayecto de vuelta
  },
  'sprinter': {
    ratePerKm: 9, // 9 MAD/km
    maxCapacity: 18,
    returnTripSupplement: 0.4, // 40% suplemento obligatorio trayecto de vuelta
  },
};

// Función para calcular precio según tipo de vehículo y pasajeros
function calculateVehiclePrice(distance, vehicleType, passengers) {
  // Validar parámetros
  if (!distance || distance <= 0) {
    return 0;
  }
  
  const vehicleConfig = VEHICLE_RATES[vehicleType];
  
  if (!vehicleConfig) {
    // Si no hay tipo de vehículo, usar tarifa base (1.5 MAD/km)
    return Math.round(distance * 1.5 * 100) / 100;
  }
  
  let basePrice = distance * vehicleConfig.ratePerKm;
  
  // Aplicar suplemento obligatorio del 40% para trayecto de vuelta (siempre aplicado)
  basePrice = basePrice * (1 + vehicleConfig.returnTripSupplement);
  
  // Aplicar descuento del 35% si distancia > 220 km y pasajeros < 5
  const passengersNum = passengers ? (typeof passengers === 'string' ? parseInt(passengers, 10) : passengers) : null;
  if (distance > 220 && passengersNum && passengersNum < 5) {
    basePrice = basePrice * 0.65; // Descuento del 35% (multiplicar por 0.65)
  }
  
  return Math.round(basePrice * 100) / 100;
}

router.post('/calculate', async (req, res) => {
  try {
    const { origin, destination, vehicleType, passengers } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren origen y destino'
      });
    }

    // Convertir passengers a número si viene como string
    let passengersNum = null;
    if (passengers !== undefined && passengers !== null) {
      passengersNum = typeof passengers === 'string' ? parseInt(passengers, 10) : parseInt(passengers, 10);
      if (isNaN(passengersNum)) {
        passengersNum = null;
      }
    }

    console.log(`📍 Calculando distancia: ${origin} → ${destination}`);
    if (vehicleType) {
      console.log(`🚗 Tipo de vehículo: ${vehicleType}, Pasajeros: ${passengersNum || 'N/A'}`);
    }
    
    // Intentar primero con distancia aproximada (fallback rápido)
    const approximateDistance = getApproximateDistance(origin, destination);
    if (approximateDistance) {
      console.log(`✅ Usando distancia aproximada: ${approximateDistance} km`);
      
      // Calcular precio si hay tipo de vehículo
      let price = approximateDistance * 1.5; // Precio base por defecto
      if (vehicleType && VEHICLE_RATES[vehicleType]) {
        price = calculateVehiclePrice(approximateDistance, vehicleType, passengersNum);
      }
      
      return res.json({
        success: true,
        data: {
          distance: approximateDistance,
          origin: origin,
          destination: destination,
          method: 'approximate',
          price: price,
          vehicleType: vehicleType || null,
          passengers: passengersNum || null,
        }
      });
    }

    // Usar OpenRouteService API
    // Nota: Necesitas una API key válida de https://openrouteservice.org/
    const API_KEY = process.env.OPENROUTESERVICE_API_KEY || '5b3ce3597851110001cf6248e8b5e0b4c8e2444bbbd1f55a76c4c2e6';
    const geocodeUrl = (address) =>
      `https://api.openrouteservice.org/geocoding/search?api_key=${API_KEY}&text=${encodeURIComponent(address)}&boundary.country=MA`;
    
    console.log('🔑 Usando API key:', API_KEY.substring(0, 10) + '...');

    // Geocodificar ambas direcciones
    console.log('🔍 Geocodificando direcciones...');
    const [originResponse, destResponse] = await Promise.all([
      fetch(geocodeUrl(origin)),
      fetch(geocodeUrl(destination)),
    ]);

    if (!originResponse.ok || !destResponse.ok) {
      console.error('Error en geocodificación:', {
        originStatus: originResponse.status,
        destStatus: destResponse.status
      });
      
      // Si la API falla, intentar usar distancia aproximada como fallback
      const fallbackDistance = getApproximateDistance(origin, destination);
      if (fallbackDistance) {
        console.log(`⚠️ API falló, usando distancia aproximada: ${fallbackDistance} km`);
        let price = fallbackDistance * 1.5;
        if (vehicleType && VEHICLE_RATES[vehicleType]) {
          price = calculateVehiclePrice(fallbackDistance, vehicleType, passengersNum);
        }
        return res.json({
          success: true,
          data: {
            distance: fallbackDistance,
            origin: origin,
            destination: destination,
            method: 'approximate-fallback',
            price: price,
            vehicleType: vehicleType || null,
            passengers: passengersNum || null,
          }
        });
      }
      
      // Si no hay fallback, devolver error
      return res.status(500).json({
        success: false,
        error: 'Error al geocodificar las direcciones y no se encontró distancia aproximada',
        details: `Origin: ${originResponse.status}, Dest: ${destResponse.status}`,
        suggestion: 'Intenta usar nombres de ciudades más comunes como "Marrakech", "Casablanca", "Rabat", "Fez", "Tanger", "Chefchaouen"'
      });
    }

    let originData, destData;
    try {
      originData = await originResponse.json();
      destData = await destResponse.json();
      console.log('✅ Geocodificación exitosa');
    } catch (e) {
      console.error('❌ Error parseando respuestas de geocodificación:', e.message);
      console.error('Stack:', e.stack);
      return res.status(500).json({
        success: false,
        error: 'Error al parsear las respuestas de geocodificación',
        details: e.message
      });
    }

    if (
      !originData.features ||
      originData.features.length === 0 ||
      !destData.features ||
      destData.features.length === 0
    ) {
      return res.status(404).json({
        success: false,
        error: 'No se pudieron encontrar las coordenadas de las direcciones'
      });
    }

    const originCoords = originData.features[0].geometry.coordinates; // [lng, lat]
    const destCoords = destData.features[0].geometry.coordinates; // [lng, lat]

    // Calcular distancia usando la API de direcciones
    const directionsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${originCoords[0]},${originCoords[1]}&end=${destCoords[0]},${destCoords[1]}`;

    const directionsResponse = await fetch(directionsUrl);
    const directionsData = await directionsResponse.json();

    if (
      !directionsData.routes ||
      directionsData.routes.length === 0 ||
      !directionsData.routes[0].summary
    ) {
      return res.status(404).json({
        success: false,
        error: 'No se pudo calcular la ruta'
      });
    }

    // La distancia viene en metros, convertir a kilómetros
    const distanceInMeters = directionsData.routes[0].summary.distance;
    const distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10; // Redondear a 1 decimal

    // Calcular precio si hay tipo de vehículo
    let price = distanceInKm * 1.5; // Precio base por defecto
    if (vehicleType && VEHICLE_RATES[vehicleType]) {
      price = calculateVehiclePrice(distanceInKm, vehicleType, passengersNum);
    }

    res.json({
      success: true,
      data: {
        distance: distanceInKm,
        origin: originData.features[0].properties.label || origin,
        destination: destData.features[0].properties.label || destination,
        method: 'api',
        price: price,
        vehicleType: vehicleType || null,
        passengers: passengersNum || null,
      }
    });
  } catch (error) {
    console.error('❌ Error calculando distancia:', error);
    console.error('Stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({
      success: false,
      error: 'Error al calcular la distancia',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
