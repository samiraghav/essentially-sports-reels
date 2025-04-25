import fetch from 'node-fetch';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;

export async function fetchImages(query: string, count = 5) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`;

  const res = await fetch(url, {
    headers: {
      Authorization: PEXELS_API_KEY
    }
  });
  
//   const data = (await res.json()) as {
//     photos: Array<{ src: { portrait: string } }>
//   };

  const data = await res.json() as any;
  const imageUrls = data.photos.map((p: any) => p.src.portrait);

  return imageUrls;
}
