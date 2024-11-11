import EventEmitter from "eventemitter3";

/**
 * 定时器
 */
class Timer extends EventEmitter {
    constructor(seconds = 0) {
        super();
        this.seconds = seconds;
        this.worker = null;
    }

    /**
     * 开始计时任务
     *
     * @returns {Timer} 当前对象
     */
    start() {
        this._initializeWorker(this.seconds);
        return this;
    }

    /**
     * 停止计时任务
     *
     * @returns {Timer} 当前对象
     */
    stop() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.seconds = 0;
        return this;
    }

    /**
     * 重启任务
     *
     * @param {number} seconds - 重新开始的秒数
     * @returns {Timer} 当前对象
     */
    restart(seconds = 0) {
        this.stop(); // 停止当前 Worker
        this.seconds = seconds;
        this.start(); // 重新启动 Worker
        return this;
    }

    /**
     * 初始化 Worker 并设置事件监听
     *
     * @param {number} seconds - 起始秒数
     * @private
     */
    _initializeWorker(seconds) {
        // 定义 Worker 的内容（相当于 timerWorker.js 的内容）
        const workerCode = `
            let seconds = 0;
            let startTime = Date.now();

            function updateTimer() {
                const currentTime = Date.now();
                seconds = Math.floor((currentTime - startTime) / 1000);
                postMessage(seconds); // 向主线程发送秒数
            }

            // 监听主线程的重置命令
            self.onmessage = (event) => {
                if (event.data.action === 'restart') {
                    seconds = event.data.seconds || 0;
                    startTime = Date.now() - seconds * 1000; // 重设起始时间
                }
            };

            setInterval(updateTimer, 1000); // 每秒发送一次更新
        `;

        // 创建 Blob URL
        const blob = new Blob([workerCode], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(blob);

        // 创建 Worker 实例
        this.worker = new Worker(workerUrl);

        // 监听 Worker 发送的时间更新消息
        this.worker.onmessage = (event) => {
            this.seconds = event.data;
            this.emit('change', this.seconds, this.format()); // 每次更新时触发 'change' 事件
        };

        // 向 Worker 发送初始秒数和重启指令
        this.worker.postMessage({ action: 'restart', seconds });
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
