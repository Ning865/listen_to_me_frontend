import mockApi from '@/data/mockApi'
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

    //return request('/comment/getCommentList', data)
  },

  deleteComment(commentId) {
    return mockApi.comment.deleteComment(commentId)
  },

  saveCommentLike(data) {
    return request({
      url: '/user/comment/like',
      method: 'post',
      data,
    })
    //return mockApi.comment.saveCommentLike(data)
  },
}
