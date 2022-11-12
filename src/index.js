import * as dotenv from 'dotenv'
import nodeCron from 'node-cron'

dotenv.config()

const SHOULD_SWAP_REPEATED_STICKERS = process.env.SWAP_REPEATED_STICKERS === 'true'

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

const getConfigData = async () => {
  const manifestRequest = await fetch("https://paninistickeralbum.fifa.com/manifest_update.json")
  const manifest = await manifestRequest.json()

  const configUrl = manifest["config/config.json"]
  const configRequest = await fetch(`https://paninistickeralbum.fifa.com/assets/${configUrl}`)

  return configRequest.json()
}

const getInitData = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/init.json", {
    headers,
    body: {
      json: {},
      locale: "en"
    },
    method: "POST"
  })

  return request.json()
}

const getDailyPacksStatus = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/daily_packs_status.json", {
    headers,
    body: {
      json: {},
      locale: "en"
    },
    method: "POST"
  })

  return request.json()
}

const getDailyPacks = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/receive_daily_packs.json", {
    headers,
    body: {
      json: {},
      locale: "en"
    },
    method: "POST"
  })

  return request.json()
}

const getDailyPaniniScanPacks = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/receive_daily_packs.json", {
    headers,
    body: {
      json: {
        object_uid: "panini_covers-hard-FIL-LATAM",
        context: "panini_covers"
      },
      locale: "en"
    },
    method: "POST"
  })

  return request.json()
}

const getDailyCokeScanPacks = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/receive_daily_packs.json", {
    headers,
    body: {
      json: {
        object_uid: "coke-500ml-pet-promo",
        context: "coke_products"
      },
      locale: "en"
    },
    method: "POST"
  })

  return request.json()
}

const openPack = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/open_pack.json", {
    headers,
    body: {
      json: {},
      locale: "en"
    },
    method: "POST"
  })

  return request.json()
}

const pollSwaps = async () => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/poll.json", {
    headers,
    body: {
      json: {},
      locale: "en"
    },
    method: "POST"
  })

  return request.json()
}

const executeSwap = async (id) => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/execute_received_swap.json", {
    headers,
    body: {
      json: { id },
      locale: "en"
    },
    method: "POST"
  })

  return request.json()
}

const moveStickers = async (stickerIds) => {
  const request = await fetch("https://paninistickeralbum.fifa.com/api/move_stickers.json", {
    headers,
    body: {
      json: {
        from: "temp",
        to: {
          swap: JSON.stringify(stickerIds)
        }
      },
      locale: "en"
    },
    method: "POST"
  })

  return request.json()
}

let config = {}
let initData = {}

const isRepeated = (id) => initData[1].stacks.album.some(([stickerId]) => stickerId === id)

const init = async () => {
  config = await getConfigData()
  console.log(config.stickers.length)

  initData = await getInitData()
  if(SHOULD_SWAP_REPEATED_STICKERS) {
    const swappableStickers = initData[1].stacks.temp.filter(stickerId => {
      const repeatedSticker = isRepeated(stickerId);
      console.log(`Is sticker ${stickerId} repeated?: ${repeatedSticker}`)
      return repeatedSticker
    })
    await moveStickers(swappableStickers)
  }


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

    let openPackIntent = {}

    do {
      openPackIntent = await openPack();
      console.log(openPackIntent)
    } while (!openPackIntent[0].wait);

  })
}

const swapCronScheduler = () => {
  nodeCron.schedule('*/5 * * * *', async () => {
    const pollResponse = await pollSwaps()

    const openSwaps = pollResponse.slice(0,-1)

    const swappedStickers = await openSwaps.map(async swap => {
      await executeSwap(swap.id).then(response => {
        console.log(`Asked for swap execution on id: ${swap.id}, response: ${response}`)
      })

      return swap.id
    })

    if(SHOULD_SWAP_REPEATED_STICKERS) {
      const retradeableStickerIds = swappedStickers.filter(swap => {
        const stickerId = swap.received.id
        const repeatedSticker = isRepeated(stickerId)
        console.log(`Is sticker ${stickerId} repeated?: ${repeatedSticker}`)
        return repeatedSticker
      })
      moveStickers(retradeableStickerIds)
    }
  })
}

const main = async () => {
  console.log('Starting Panini Bot')

  const cronString = await init()

  dailyCronScheduler(cronString)

  swapCronScheduler()
}

main()
