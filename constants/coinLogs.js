const coinAction = {
  createOrder: 0,
  cancelOrder: 1,
  orderExpired: 2,  
  putOrderUrgent: 3,
  urgentExpired: 4,
  respondOrder: 5,
  reward: 6,
}

const accountType = {
  USER: 0,
  ADVISOR: 1,
}

module.exports = {
  coinAction,
  accountType,
}

