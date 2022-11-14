import {store} from "./store.js";

export const isRepeated = (id) => store.data.stacks.album.some(([stickerId]) => stickerId === id)
