import {store} from "./store.js";

export const isRepeated = (id) => store.initData[1].stacks.album.some(([stickerId]) => stickerId === id)
