const { ccclass, property, executeInEditMode } = cc._decorator;

enum InputType {
    TEXT,
    PASSWORD,
    NUMBER,
    EMAIL,
    TEL,
}

@ccclass
export default class CustomInputBox extends cc.Component {
    @property(cc.Label)
    displayLabel: cc.Label = null;

    @property
    placeholder: string = "請輸入文字";

    @property
    maxLength: number = 10;

    @property({ tooltip: "開發模式下會顯示真正的 HTML 輸入框" })
    devMode: boolean = true;

    @property({ type: cc.Enum(InputType) })
    inputType: InputType = InputType.TEXT;

    private _inputEl: HTMLInputElement = null;
    private _value: string = "";
    private _cursorEl: HTMLDivElement = null;
    private _originalViewport: string = "";
    private _keyboardVisible: boolean = false;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this._onClick, this);
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this._onClick, this);
        this._updateLabel(this.placeholder);
        this._setupViewportHandling();
    }

    private _setupViewportHandling() {
        // 儲存原始的 viewport 設定
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            this._originalViewport = viewportMeta.getAttribute('content') || '';
        }

        // 監聽 visual viewport 變化（現代瀏覽器支援）
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', this._onViewportResize.bind(this));
        }

        // 監聽窗口大小變化（備用方案）
        window.addEventListener('resize', this._onWindowResize.bind(this));
    }

    private _onViewportResize() {
        if (window.visualViewport) {
            const heightDifference = window.innerHeight - window.visualViewport.height;
            this._keyboardVisible = heightDifference > 150; // 鍵盤通常會讓視窗高度減少超過150px
            
            if (this._keyboardVisible) {
                this._handleKeyboardShow();
            } else {
                this._handleKeyboardHide();
            }
        }
    }

    private _onWindowResize() {
        // 備用的鍵盤檢測方法
        if (!window.visualViewport) {
            const currentHeight = window.innerHeight;
            const screenHeight = window.screen.height;
            const heightRatio = currentHeight / screenHeight;
            
            this._keyboardVisible = heightRatio < 0.75; // 當視窗高度小於螢幕高度的75%時認為鍵盤彈出
            
            if (this._keyboardVisible) {
                this._handleKeyboardShow();
            } else {
                this._handleKeyboardHide();
            }
        }
    }

    private _handleKeyboardShow() {
        // 當鍵盤顯示時，設定 viewport 以防止縮放
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
            );
        }
        
        // 防止頁面滾動
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
    }

    private _handleKeyboardHide() {
        // 當鍵盤隱藏時，恢復原始設定
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta && this._originalViewport) {
            viewportMeta.setAttribute('content', this._originalViewport);
        }
        
        // 恢復頁面滾動
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
    }

    _onClick() {
        this._createInput();
        this._inputEl.value = this._value;
        this._inputEl.focus();
        this._showCursor();
    }

    _createInput() {
        if (this._inputEl) return;

        const input = document.createElement("input");
        const inputTypeMap = {
            [InputType.TEXT]: "text",
            [InputType.PASSWORD]: "password",
            [InputType.NUMBER]: "number",
            [InputType.EMAIL]: "email",
            [InputType.TEL]: "tel",
        };
        input.type = inputTypeMap[this.inputType];
        input.maxLength = this.maxLength;
        input.autocapitalize = "off";
        input.autocomplete = "off";
        input.setAttribute("autocorrect", "off");
        input.spellcheck = false;
        
        // 防止輸入框影響佈局的關鍵設定
        input.style.position = "fixed";
        input.style.zIndex = "9999";
        input.style.pointerEvents = "auto";
        input.style.fontSize = "16px"; // 防止iOS縮放
        input.style.border = "none";
        input.style.outline = "none";
        input.style.background = "transparent";
        input.style.color = "transparent";
        input.style.caretColor = "transparent";
        
        if (this.devMode) {
            // 開發模式下可見輸入框
            input.style.top = "-100px";
            input.style.left = "-100px";
            input.style.opacity = "1";
            input.style.border = "1px solid #ccc";
            input.style.padding = "5px";
            input.style.background = "#fff";
            input.style.color = "#000";
            input.style.caretColor = "#000";
        } else {
            // 生產模式下隱藏輸入框
            input.style.top = "0";
            input.style.left = "-9999px";
            input.style.opacity = "0";
            input.style.width = "1px";
            input.style.height = "1px";
        }

        document.body.appendChild(input);
        this._inputEl = input;

        input.addEventListener("input", (e) => {
            this._value = input.value;
            this._updateLabel(this._value);
        });

        input.addEventListener("focus", () => {
            console.log("[輸入框獲得焦點]");
        });

        input.addEventListener("blur", () => {
            console.log("[輸入框失去焦點]", this._value);
            this._hideCursor();
            this._destroyInput();
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                console.log("[輸入完成]", this._value);
                input.blur();
            }
        });

        // 防止輸入框獲得焦點時頁面滾動
        input.addEventListener("touchstart", (e) => {
            e.preventDefault();
        });
    }

    _updateLabel(text: string) {
        if (!this.displayLabel) return;
        // 若是密碼類型則不顯示原文
        if (this.inputType === InputType.PASSWORD) {
            this.displayLabel.string = "*".repeat(text.length) || this.placeholder;
        } else {
            this.displayLabel.string = text.length > 0 ? text : this.placeholder;
        }
    }

    _destroyInput() {
        if (this._inputEl) {
            this._inputEl.remove();
            this._inputEl = null;
        }
    }

    _showCursor() {
        if (this.devMode) return;

        if (!this._cursorEl) {
            this._cursorEl = document.createElement("div");
            this._cursorEl.style.position = "fixed";
            this._cursorEl.style.width = "1px";
            this._cursorEl.style.height = "1em";
            this._cursorEl.style.backgroundColor = "black";
            this._cursorEl.style.zIndex = "9999";
            this._cursorEl.style.animation = "blink 1s step-end infinite";
            document.body.appendChild(this._cursorEl);

            const style = document.createElement("style");
            style.innerHTML = `@keyframes blink { 50% { opacity: 0; } }`;
            document.head.appendChild(style);
        }

        const worldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const scale = window.innerWidth / cc.view.getCanvasSize().width;

        this._cursorEl.style.left = `${worldPos.x * scale + this.displayLabel.node.width / 2}px`;
        this._cursorEl.style.top = `${worldPos.y * scale}px`;
    }

    _hideCursor() {
        if (this._cursorEl) {
            this._cursorEl.remove();
            this._cursorEl = null;
        }
    }

    getText(): string {
        return this._value;
    }

    setText(value: string): void {
        this._value = value;
        this._updateLabel(this._value);
        if (this._inputEl) {
            this._inputEl.value = this._value;
        }
    }

    onDestroy() {
        this._destroyInput();
        this._hideCursor();
        
        // 清理事件監聽
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', this._onViewportResize.bind(this));
        }
        window.removeEventListener('resize', this._onWindowResize.bind(this));
        
        // 恢復原始設定
        this._handleKeyboardHide();
    }
}
