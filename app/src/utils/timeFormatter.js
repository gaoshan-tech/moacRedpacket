// 对时间的处理——刚刚，一小时前，两小时前等等
export function formatTime(time, option = '{y}-{m}-{d}') {
    // time = +time * 1000
    const d = new Date(time)
    const now = Date.now()

    const diff = (now - d) / 1000

    if (diff < 30) {
        return '刚刚'
    } else if (diff < 3600) { // less 1 hour
        return Math.ceil(diff / 60) + '分钟前'
    } else if (diff < 3600 * 24) {
        return Math.ceil(diff / 3600) + '小时前'
    } else if (diff < 3600 * 24 * 2) {
        return '1天前'
    } else if (diff < 3600 * 24 * 3) {
        return '2天前'
    } else if (diff < 3600 * 24 * 4) {
        return '3天前'
    } else if (diff < 3600 * 24 * 5) {
        return '4天前'
    } else if (diff < 3600 * 24 * 6) {
        return '5天前'
    } else if (diff < 3600 * 24 * 7) {
        return '6天前'
    } else if (diff < 3600 * 24 * 8) {
        return '一周前'
    }
    if (!option) {
        return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
    }
}

export function offsetTime(time) {
     const _time = new Date(time.replace(/-/g,'/')).getTime();
    const curOffset = new Date().getTimezoneOffset();
    const targetTime = new Date(_time - curOffset * 60 * 1000 - 8 * 60 * 60 * 1000);
    return this.$moment(targetTime).format('YYYY-MM-DD HH:mm:ss');
}