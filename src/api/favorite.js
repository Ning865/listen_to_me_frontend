import mockApi from '@/data/mockApi'
import request from '@/utils/request'

export const favoriteApi = {
  saveAudioAction(data) {
    return mockApi.favorite.saveAudioAction(data)
  },

  saveFavoriteFolder(data) {
    return request({
      url: '/user/favorite/folder',
      method: 'post',
      data,
    })
  },

  getFolderList() {
    return request({
      url: '/user/favorite/folder/list',
      method: 'get',
    })
  },

  getFavoritePage(params) {
    return mockApi.favorite.getFavoritePage(params)
  },

  deleteFavorite(data) {
    return mockApi.favorite.deleteFavorite(data)
  },

  deleteFavoriteFolder(folderId) {
    return request({
      url: `/user/favorite/folder/${folderId}`,
      method: 'delete',
    })
  },
}
