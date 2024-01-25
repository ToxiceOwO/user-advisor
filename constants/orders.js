const orderStatus = {
  PENDING : "pending",
  URGENT : "urgent",
  FINISHED : "finished",
  EXPIRED : "expired",
  CANCELLED : "cancelled",
}

const orderType = {
  TEXT : 0,
  VOICE : 1,
  VIDEO : 2,
  LIVE_TEXT: 3,
  LIVE_VIDEO : 4,
}

const orderTypeNum = {
  0 : "TEXT",
  1 : "VOICE",
  2 : "VIDEO",
  3 : "LIVE_TEXT",
  4 : "LIVE_VIDEO",
}

module.exports = 
{
  orderStatus,
  orderType,
  orderTypeNum
}