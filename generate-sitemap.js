import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import fs from 'fs';

const BASE_URL = 'https://ayatku.netlify.app';

async function generateSitemap() {
  try {
    const links = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/doa', changefreq: 'weekly', priority: 0.8 },
      { url: '/surat', changefreq: 'weekly', priority: 0.8 },
      { url: '/tafsir', changefreq: 'weekly', priority: 0.8 },
    ];

    // 1. Ambil Data Surat untuk Dynamic Routes
    const resSurat = await fetch('https://equran.id/api/v2/surat');
    const { data: suratList } = await resSurat.json();
    suratList.forEach(s => {
      links.push({ url: `/surat/${s.nomor}`, changefreq: 'monthly', priority: 0.7 });
      links.push({ url: `/tafsir/${s.nomor}`, changefreq: 'monthly', priority: 0.6 });
    });

    // 2. Ambil Data Doa untuk Dynamic Routes
    const resDoa = await fetch('https://equran.id/api/doa');
    const { data: doaList } = await resDoa.json();
    doaList.forEach(d => {
      links.push({ url: `/doa/${d.id}`, changefreq: 'monthly', priority: 0.6 });
    });

    // Buat Stream Sitemap
    const stream = new SitemapStream({ hostname: BASE_URL });
    const xmlString = await streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
      data.toString()
    );

    // Tulis ke folder public (agar saat build ikut ter-copy ke dist)
    fs.writeFileSync('./public/sitemap.xml', xmlString);
    console.log('✅ sitemap.xml berhasil dibuat di /public');
  } catch (error) {
    console.error('❌ Gagal membuat sitemap:', error);
  }
}

generateSitemap();