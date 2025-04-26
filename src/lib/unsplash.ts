import { NextApiRequest, NextApiResponse } from "next";
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=6&client_id=${UNSPLASH_ACCESS_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  const urls = data.results?.map((img: any) => img.urls.small) || [];
  res.status(200).json({ urls });
}
