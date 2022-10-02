import * as dotenv from 'dotenv'
import nodeCron from 'node-cron'

dotenv.config()

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
  "cookie": process.env.COOKIE,
  "Referer": "https://paninistickeralbum.fifa.com/game/flash",
  "Referrer-Policy": "same-origin"
}

const getDailyPacksStatus = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/daily_packs_status.json", {
    headers,
    "body": "json=%7b%7d&locale=en",
    "method": "POST"
  })

  const response = request.json()

  return response
}

const getDailyPacks = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/receive_daily_packs.json", {
    headers,
    "body": "json=%7b%7d&locale=en",
    "method": "POST"
  })

  const response = request.json()

  return response
}

const getDailyPaniniScanPacks = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/receive_daily_packs.json", {
    headers,
    "body": "json=%7b%22object_uid%22%3a%22panini_covers-hard-FIL-LATAM%22%2c%22context%22%3a%22panini_covers%22%7d&locale=en",
    "method": "POST"
  })

  const response = request.json()

  return response
}

const getDailyCokeScanPacks = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/receive_daily_packs.json", {
    headers,
    "body": "json=%7b%22object_uid%22%3a%22coke-500ml-pet-promo%22%2c%22context%22%3a%22coke_products%22%7d&locale=en",
    "method": "POST"
  })

  const response = request.json()

  return response
}

const init = async () => {

  const dailyPacksStatus = await getDailyPacksStatus()

  const now = new Date()

  if(dailyPacksStatus[0].has_new_packs_waiting) {
    console.log('Please open your available packs before trying again.')
    return 0
  }

  const offset = dailyPacksStatus[0].new_packs_in_sec

  const offsetDate = new Date(now.getTime() + offset * 1000)

  const cronDate = new Date(offsetDate.setMinutes(offsetDate.getMinutes() + 1, 0, 0))

  const cronString = `${cronDate.getMinutes()} ${cronDate.getHours()} * * *`

  return cronString
}

const dailyCronScheduler = (cronString) => {
  nodeCron.schedule(cronString, async () => {
    const dailyPacks = await getDailyPacks()
    console.log('Asked for daily packs, response: ', dailyPacks)

    const dailyPaniniScanPacks = await getDailyPaniniScanPacks()
    console.log('Asked for daily panini scan packs, response: ', dailyPaniniScanPacks)

    const dailyCokeScanPacks = await getDailyCokeScanPacks()
    console.log('Asked for daily coke scan packs, response: ', dailyCokeScanPacks)
  })
}

const main = async () => {
  console.log('Starting Panini Bot')

  const cronString = await init()

  dailyCronScheduler(cronString)
}

main()
