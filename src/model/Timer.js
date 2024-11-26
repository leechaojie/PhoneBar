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

        // 立即触发更新事件，将时间显示为 `00:00`
        this.emit('change', this.seconds, this.format());

        this.start(); // 重新启动 Worker，从零开始计时
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
     * @param {Array<string>} separator 分隔符，按照时分秒顺序 例如 ['小时', '分钟', '秒'] 或 ['小时', '分钟'] 或 ['小时']
     * @returns {string} 格式化后的时间
     */
    format(separator = []) {
        let secondTime = this.seconds;
        const hours = Math.floor(secondTime / 3600);
        secondTime %= 3600;
        const minutes = Math.floor(secondTime / 60);
        const seconds = secondTime % 60;


        // 如果没有传入分隔符，使用默认的格式
        // 当没有传入分隔符时，使用默认格式，并应用 hours>0 的规则
        if (separator.length === 0) {
            if (hours > 0) {
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        const timeValues = [hours, minutes, seconds];
        let result = '';

        // 只处理传入的分隔符数量对应的时间位数
        for (let i = 0; i < separator.length; i++) {
            result += String(timeValues[i]).padStart(2, '0');
            result += separator[i];
        }

        return result;
    }
}

export default Timer;
