import mockApi from '@/data/mockApi'

export const consultApi = {
  // 获取创作者列表
  getCreatorList(params) {
    return mockApi.userConsult.getCreatorList(params)
  },

  // 获取创作者详情
  getCreatorDetail(creatorId) {
    return mockApi.userConsult.getCreatorDetail(creatorId)
  },

  // 获取创作者时间槽列表
  getCreatorSlots(params) {
    return mockApi.userConsult.getCreatorSlots(params)
  },

  // 获取时间槽详情
  getSlotDetail(slotId) {
    return mockApi.userConsult.getSlotDetail(slotId)
  },

  // 发起预约
  saveConsult(data) {
    return mockApi.userConsult.saveConsult(data)
  },

  // 查询我的预约
  getMyConsultPage(params) {
    return mockApi.userConsult.getMyConsultPage(params)
  },

  // 取消预约
  cancelConsult(id) {
    return mockApi.userConsult.cancelConsult(id)
  },

  // 申请退款
  applyRefund(id, reason) {
    return mockApi.userConsult.applyRefund(id, reason)
  },

  // 查询可用时间槽列表（听众视角）- 根据时间范围查询
  getAvailableSlots(params) {
    return mockApi.userConsult.getAvailableSlots(params)
  },
}