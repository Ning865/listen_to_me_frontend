import mockApi from '@/data/mockApi'

export const audioApi = {
  getStreamSign(audioId) {
    return mockApi.audio.getStreamSign(audioId)
  },

  getAudioDetail(id) {
    return mockApi.audio.getAudioDetail(id)
  },

  updateHistory(data) {
    return mockApi.audio.updateHistory(data)
  },

  saveHistory(audioId) {
    return mockApi.audio.saveHistory(audioId)
  },

  getHistoryPage(params) {
    return mockApi.audio.getHistoryPage(params)
  },
}
