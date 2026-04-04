import mockApi from '@/data/mockApi'

export const creatorApi = {
  uploadAudio(file) {
    return mockApi.creator.uploadAudio(file)
  },

  uploadCover(file) {
    return mockApi.creator.uploadCover(file)
  },

  saveAudio(data) {
    return mockApi.creator.saveAudio(data)
  },

  getAudioPage(params) {
    return mockApi.creator.getAudioPage(params)
  },

  getAudio(id) {
    return mockApi.creator.getAudio(id)
  },

  getAudioStatus(id) {
    return mockApi.creator.getAudioStatus(id)
  },

  updateAudio(data) {
    return mockApi.creator.updateAudio(data)
  },

  removeAudio(id) {
    return mockApi.creator.removeAudio(id)
  },

  // 时间槽管理
  saveSlotBatch(slots) {
    return mockApi.creator.saveSlotBatch(slots)
  },

  getSlotPage(params) {
    return mockApi.creator.getSlotPage(params)
  },

  updateSlot(id, status) {
    return mockApi.creator.updateSlot(id, status)
  },

  // 预约订单管理
  getConsultPage(params) {
    return mockApi.creator.getConsultPage(params)
  },

  confirmConsult(id, address) {
    return mockApi.creator.confirmConsult(id, address)
  },

  rejectConsult(id) {
    return mockApi.creator.rejectConsult(id)
  },

  completeConsult(id) {
    return mockApi.creator.completeConsult(id)
  },
}
