import {COOKIES} from "./constants.js";

const headers = {
  "accept": "*/*",
  "accept-language": "en-MX,en;q=0.9,es-MX;q=0.8,es;q=0.7,en-US;q=0.6",
  "content-type": "application/x-www-form-urlencoded",
  "sec-ch-ua": "\"Google Chrome\";v=\"105\", \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"105\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"macOS\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  "x-user-agent": "Unity/3.0.0 (MacOS 10.15.7) Unity/2020.3.35f1 webgl_hires",
  "cookie": COOKIES,
  "Referer": "https://paninistickeralbum.fifa.com/game/flash",
  "Referrer-Policy": "same-origin"
}

export const getConfigData = async () => {
  const manifestRequest = await fetch("https://paninistickeralbum.fifa.com/manifest_update.json")
  const manifest = await manifestRequest.json()

  const configUrl = manifest["config/config.json"]
  const configRequest = await fetch(`https://paninistickeralbum.fifa.com/assets/${configUrl}`)

  return configRequest.json()
}

export const getInitData = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/init.json", {
    headers,
    body: "json=%7b%7d&locale=en",
    method: "POST"
  })

  return request.json()
}

export const getDailyPacksStatus = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/daily_packs_status.json", {
    headers,
    body: "json=%7b%7d&locale=en",
    method: "POST"
  })

  return request.json()
}

export const getDailyPacks = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/receive_daily_packs.json", {
    headers,
    body: "json=%7b%7d&locale=en",
    method: "POST"
  })

  return request.json()
}

export const getDailyPaniniScanPacks = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/scan_object.json", {
    headers,
    body: "json=%7b%22object_uid%22%3a%22panini_covers-hard-FIL-LATAM%22%2c%22context%22%3a%22panini_covers%22%7d&locale=en",
    method: "POST"
  })

  return request.json()
}

export const getDailyCokeScanPacks = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/scan_object.json", {
    headers,
    body: "json=%7b%22object_uid%22%3a%22coke-500ml-pet-promo%22%2c%22context%22%3a%22coke_products%22%7d&locale=en",
    method: "POST"
  })

  return request.json()
}

export const openPack = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/open_pack.json", {
    headers,
    body: "json=%7b%7d&locale=en",
    method: "POST"
  })

  return request.json()
}

export const pollSwaps = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/poll.json", {
    headers,
    body: "json=%7b%7d&locale=en",
    method: "POST"
  })

  return request.json()
}

export const executeSwap = async (id) => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/execute_received_swap.json", {
    headers,
    "body": `json=%7b%22id%22%3a%22${id}%22%7d&locale=en`,
    method: "POST"
  })

  return request.json()
}

export const moveStickers = async (stickerIds) => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/move_stickers.json", {
    headers,
    body: `json=%7b%22from%22%3a%22temp%22%2c%22to%22%3a%7b%22swap%22%3a${JSON.stringify(stickerIds)}%7d%7d&locale=en`,
    method: "POST"
  })

  return request.json()
}
