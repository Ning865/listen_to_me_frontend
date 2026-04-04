import mockApi from '@/data/mockApi'

export const paymentApi = {
  getBalance() {
    return mockApi.payment.getBalance()
  },

  recharge(data) {
    return mockApi.payment.recharge(data)
  },

  createOrder(audioId) {
    return mockApi.payment.createOrder(audioId)
  },

  getOrder(sn) {
    return mockApi.payment.getOrder(sn)
  },

  getOrderPage(params) {
    return mockApi.payment.getOrderPage(params)
  },
}
