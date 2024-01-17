const ORDER_STATUS = {
  PENDING : "pending",
  URGENT : "urgent",
  FINISHED : "finished",
  EXPIRED : "expired",
  CANCELLED : "cancelled",
}

const ORDER_TYPE = {
  TEXT : 0,
  VOICE : 1,
  VIDEO : 2,
  LIVE_TEXT: 3,
  LIVE_VIDEO : 4,
}

const ORDER_TYPE_NUM = {
  0 : "TEXT",
  1 : "VOICE",
  2 : "VIDEO",
  3 : "LIVE_TEXT",
  4 : "LIVE_VIDEO",
}

module.exports = ORDER_STATUS;
module.exports = ORDER_TYPE;
module.exports = ORDER_TYPE_NUM;
