import mockApi from '@/data/mockApi'

export const favoriteApi = {
  saveAudioAction(data) {
    return mockApi.favorite.saveAudioAction(data)
  },

  saveFavoriteFolder(data) {
    return mockApi.favorite.saveFavoriteFolder(data)
  },

  getFolderList() {
    return mockApi.favorite.getFolderList()
  },

  getFavoritePage(params) {
    return mockApi.favorite.getFavoritePage(params)
  },

  deleteFavorite(data) {
    return mockApi.favorite.deleteFavorite(data)
  },

  deleteFavoriteFolder(folderId) {
    return mockApi.favorite.deleteFavoriteFolder(folderId)
  },
}
