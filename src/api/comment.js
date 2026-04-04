import request from '@/utils/request'

export const commentApi = {
  saveComment(data) {
    return request({
      url: '/user/comment',
      method: 'post',
      data,
    })
  },

  getCommentList(data) {
    return request({
      url: '/user/comment/page',
      method: 'get',
      params: data,
    })
  },


  saveCommentLike(data) {
    return request({
      url: '/user/comment/like',
      method: 'post',
      data,
    })
  },
}
