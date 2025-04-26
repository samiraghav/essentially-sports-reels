import fetch from 'node-fetch';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;

type PexelsPhoto = {
	src: {
		portrait: string;
	};
};
  
type PexelsResponse = {
	photos: PexelsPhoto[];
};

export async function fetchImages(query: string, count = 5): Promise<string[]> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`;

  const res = await fetch(url, {
    headers: {
      Authorization: PEXELS_API_KEY
    }
  });

  const data = (await res.json()) as PexelsResponse;
  const imageUrls = data.photos.map((p) => p.src.portrait);

  return imageUrls;
}
