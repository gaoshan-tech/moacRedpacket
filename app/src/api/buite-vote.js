import request from '@/utils/request'

export function getVotePage(params) {
    return request({
        url:'/vote/app/queryVotePage',
        method:'get',
        params:params
    })
}

// 发起投票
export function createVote(data) {
    return request({
        url:'/vote/app/create',
        method:'post',
        data:data
    })
}

// 更新投票的上链Hash
export function updateVoteHash(data) {
    return request({
        url:'/vote/app/updateVoteHash',
        method:'post',
        data:data
    })
}

// 删除
export function delVote(data) {
    return request({
        url:'/vote/app/del',
        method:'delete',
        params:data
    })
}

// 用户投票后更新上链Hash
export function updateAppVoteHash(data) {
    return request({
        url:'/vote/app/updateAppVoteHash',
        method:'post',
        data:data
    })
}

// 用户投票
export function doVote(data) {
    return request({
        url:'/vote/app/doVote',
        method:'post',
        data:data
    })
}

export function showPic(params) {
    return request({
        url:'/vote/uploadImage',
        method:'get',
        params:params
    })
}

// 查询投票详情
export function getVoteDetail(params) {
    return request({
        url: '/vote/app/getVoteDetail',
        method: 'get',
        params: params
    })
}

// 查询选项
export function getVoteOptionDetail(params) {
    return request({
        url: '/vote/app/getVoteOptionDetail',
        method: 'get',
        params: params
    })
}