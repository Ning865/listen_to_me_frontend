import mockApi from '@/data/mockApi'

export const recommendApi = {
  getHotList() {
    return mockApi.recommend.getHotList()
  },

  getRecommendList(params) {
    return mockApi.recommend.getRecommendList(params)
  },
}
