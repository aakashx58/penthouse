export interface MediaUrls {
  doors: string;
  aerial: string;
  back: string;
  mid: string;
  front: string;
  tiltVideo: string;
  rainVideo: string;
}

const RAW_ASSETS = {
  doors:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_063048_97fd9a70-adbe-46bd-bfce-ec1004f6c7d8.png',
  aerial:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_063055_ee1debcd-d200-484f-b94f-fad6dcffd4eb.png',
  back:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_063251_24fbd7cc-00df-49ec-8fbf-d8a0349b1e98.png',
  mid:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_063252_b9f2fecf-9be0-485f-842f-3aa6bbc251f2.png',
  front:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_063151_7804d758-a2eb-4499-9b56-8f493edbb206.png',
  tiltVideo:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_063355_a600befc-45d6-4a32-9db6-9d6565a89609.mp4',
  rainVideo:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261117_063703_04e54df7-2236-4dff-b95b-a9a34c1f78ec.mp4',
} as const;

export function computeImageWidth(vw: number, vh: number, dpr: number): number {
  const heroH = Math.max(vh, 520);
  const stageW = Math.max(vw, heroH * (16 / 9));
  // 2000 is enough for a 1600-wide stage (1.25x scale), and for 1x screens round up to the next hundred.
  const effectiveScale = dpr > 1 ? 1.25 : 1;
  const needed = stageW * effectiveScale;
  const rounded = Math.ceil(needed / 100) * 100;
  return Math.max(800, Math.min(2600, rounded));
}

function buildHiggsUrl(rawUrl: string, w: number): string {
  return `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(rawUrl)}&w=${w}&q=85`;
}

export function getMediaUrls(w: number): MediaUrls {
  return {
    doors: buildHiggsUrl(RAW_ASSETS.doors, w),
    aerial: buildHiggsUrl(RAW_ASSETS.aerial, w),
    back: buildHiggsUrl(RAW_ASSETS.back, w),
    mid: buildHiggsUrl(RAW_ASSETS.mid, w),
    front: buildHiggsUrl(RAW_ASSETS.front, w),
    tiltVideo: RAW_ASSETS.tiltVideo,
    rainVideo: RAW_ASSETS.rainVideo,
  };
}
