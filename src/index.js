import nodeCron from 'node-cron'
import {SHOULD_SWAP_REPEATED_STICKERS} from './constants.js'
import {
  executeSwap,
  getConfigData, getDailyCokeScanPacks,
  getDailyPacks,
  getDailyPacksStatus,
  getDailyPaniniScanPacks,
  getInitData,
  moveStickers, openPack, pollSwaps
} from './api.js'
import {isRepeated} from './utils.js'
import {store} from './store.js'

const getInitialData = async () => {
  console.log('Loading initial config and data')
  store.config = await getConfigData()
  const initialData = await getInitData()
  store.data = initialData[1]
  store.user = initialData[4].user_info
  console.log(store.user)
  console.log(`
  Loaded data for ${store.user.label}
  Album completion: ${store.user.album_completion_perc}% (${store.user.album_collected_stickers}/${store.user.album_total_stickers})
  Golden stickers completion: ${store.user.golden_album_completion_perc}% (${store.user.golden_album_collected_stickers}/${store.user.golden_album_total_stickers})
  `)
}

const init = async () => {
  await getInitialData()
  if(SHOULD_SWAP_REPEATED_STICKERS) {
    const swappableStickers = store.data.stacks.temp.filter(stickerId => {
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
      const response = await executeSwap(swap.id)
      console.log(`Asked for swap execution on id: ${swap.id}, response: ${JSON.stringify(response)}`)
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
