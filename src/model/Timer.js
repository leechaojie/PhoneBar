import EventEmitter from "eventemitter3";

/**
 * 定时器
 */
class Timer extends EventEmitter {
    constructor(seconds = 0) {
        super();
        this.seconds = seconds;
        this.intervalId = null;
    }

    /**
     * 开始计时任务
     *
     * @returns {Timer} 当前对象
     */
    start() {
        this._clearInterval(); // 避免重复启动
        const startTime = Date.now() - this.seconds * 1000; // 基于当前秒数修正时间

        // 立即触发一次 change 事件，推送当前时间
        this.emit('change', this.seconds, this.format());

        // 然后每秒触发更新
        this.intervalId = setInterval(() => {
            const currentTime = Date.now();
            this.seconds = Math.floor((currentTime - startTime) / 1000);
            this.emit('change', this.seconds, this.format()); // 更新 UI
        }, 1000); // 每秒触发一次
        return this;
    }

    /**
     * 停止计时任务
     *
     * @returns {Timer} 当前对象
     */
    stop() {
        this._clearInterval();
        this.seconds = 0;
        return this;
    }

    /**
     * 重启任务
     */
    restart(seconds = 0) {
        this.stop();
        this.seconds = seconds;
        this.start();
    }

    /**
     * 清除定时器
     *
     * @private
     */
    _clearInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * 格式化时间
     *
     * @param {Array} separator 分隔符 ['小时:','分钟:','秒']
     * @returns {string} 格式化后的时间
     */
    format(separator = [':', ':', '']) {
        let secondTime = this.seconds;
        const hours = Math.floor(secondTime / 3600);
        secondTime %= 3600;
        const minutes = Math.floor(secondTime / 60);
        const seconds = secondTime % 60;

        // 格式化为 HH:MM:SS 的格式
        return [
            hours > 0 ? String(hours).padStart(2, '0') + separator[0] : '',
            String(minutes).padStart(2, '0') + separator[1],
            String(seconds).padStart(2, '0') + separator[2],
        ].join('');
    }
}

export default Timer;
