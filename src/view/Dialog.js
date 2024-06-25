import '../css/dialog.css';
import EventEmitter from 'eventemitter3';

const rootNodeClassName = 'cc-dialog';
let autoIncrementId = 0;

/**
 * 弹框组件
 */
class Dialog extends EventEmitter {

    constructor({
                    title = ''
                }) {
        super();
        this.id = `dialog-${autoIncrementId++}`;
        this._title = title;

        this.diffX = 0;
        this.diffY = 0;

        this.create();
    }

    create() {
        if (!this.rootNode) {
            let rootNode = this.rootNode = document.createElement('div');
            rootNode.id = this.id;
            rootNode.className = rootNodeClassName;

            let contentNode = this.contentNode = document.createElement('div');

            rootNode.appendChild(this._generateTitleNode());
            rootNode.appendChild(this._generateWindowControllerNode());
            rootNode.appendChild(contentNode);

            this.hide();
            document.body.appendChild(rootNode);
        }
    }

    /**
     * 生成头部节点
     * @private
     */
    _generateTitleNode() {
        let titleNode = this._titleNode = document.createElement('div');
        titleNode.className = 'cc-dialog__header';
        titleNode.innerText = this._title;
        titleNode.addEventListener('mousedown', this.mouseHandler.bind(this));
        return titleNode;
    }

    setTitle(title) {
        this._title = title;
        this._titleNode.innerText = title;
        return this;
    }

    /**
     * 生成窗口控制节点
     * @private
     */
    _generateWindowControllerNode() {
        const ctlWinNode = document.createElement('div');
        ctlWinNode.className = 'cc-dialog__close';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        ctlWinNode.onclick = this.onClose.bind(this);

        ctlWinNode.appendChild(closeBtn);
        return ctlWinNode;
    }

    mouseHandler(e) {
        if (e.type === 'mousedown') {
            this.draggingObj = e.target.closest(`.${rootNodeClassName}`);
            if (this.draggingObj) {
                this.diffX = e.clientX - this.draggingObj.offsetLeft;
                this.diffY = e.clientY - this.draggingObj.offsetTop;
                document.addEventListener('mousemove', this.titleMouseMoveHandler = this.mouseMoveHandler.bind(this));
                document.addEventListener('mouseup', this.titleMouseUpHandler = this.mouseUpHandler.bind(this));
                
                e.preventDefault();
                e.stopPropagation(); 
            }
        }
    }

    mouseMoveHandler(e) {
        if (this.draggingObj) {
            requestAnimationFrame(() => {
                if (this.draggingObj) {  // 再次检查，确保在动画帧执行时对象仍然存在
                    this.draggingObj.style.left = `${e.clientX - this.diffX}px`;
                    this.draggingObj.style.top = `${e.clientY - this.diffY}px`;
                }
            });
        }
    }

    mouseUpHandler(e) {
        document.removeEventListener('mousemove', this.titleMouseMoveHandler);
        document.removeEventListener('mouseup', this.titleMouseUpHandler);
        this.draggingObj = null;
        this.diffX = 0;
        this.diffY = 0;
    }

    /**
     * 默认调用destroy方法，子类可以覆盖此方法用于定制自己的关闭事件。
     */
    onClose(){
        this.destroy();
    }

    setContent(content) {
        if (content instanceof String) {
            this.contentNode.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            this.contentNode.innerHTML = '';
            this.contentNode.appendChild(content);
        }
    }

    destroy() {
        if (this.rootNode && this.rootNode.parentNode) {
            this.rootNode.parentNode.removeChild(this.rootNode);
        }
    }

    show() {
        this.rootNode.style.display = 'block';
        return this;
    }

    hide() {
        this.rootNode.style.display = 'none';
        return this;
    }
}

export default Dialog;
