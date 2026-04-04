import mockApi from '@/data/mockApi'

export const likeApi = {
  saveAudioLike(data) {
    return mockApi.like.saveAudioLike(data)
  },

  getLikePage(params) {
    return mockApi.like.getLikePage(params)
  },
}
