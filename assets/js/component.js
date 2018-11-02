// 寄生组合式继承
function object(o) {
    function F() { }
    F.prototype = o;
    return new F();
}
function inheritPrototype(subType, superType) {
    var prototype = object(superType.prototype); // 创建对象
    prototype.constructor = subType; // 增强对象
    subType.prototype = prototype; // 指定对象
}

// 所有“弹出”动作的父类方法
function Pop(options) {
    if (Object.prototype.toString.call(options) === '[object Object]') {
        this.name = "Pop";
    } else {
        console.error("应用Pop父类时传递的参数有误！");
    }
}
Pop.prototype.getPosition = function (trigger) {
    var width = Math.round($("#" + trigger).outerWidth());
    var height = Math.round($("#" + trigger).outerHeight());
    var offsetX = Math.round($("#" + trigger).offset().left);
    var offsetY = Math.round($("#" + trigger).offset().top);
    return { // 返回触发元素的左上角(x1, y1)和右上角(x2, y2)坐标对象
        x1: offsetX,
        y1: offsetY,
        x2: offsetX + width,
        y2: offsetY + height
    };
}
Pop.prototype.show = function () {
    console.log("From Pop Show!");
}
Pop.prototype.hide = function () {
    console.log("From Pop Hide!");
}

/**
 * Menu
 * Extend From Pop
 *
 * @param {Object} options
 * @param {String} options.triggerId - menu triggerId
 * @param {String} [options.name] - menu name
 * @param {String} [options.data] - menu data
 */
function Menu(options) {
    Pop.call(this, { type: "pop-menu" }); // 先在即将创建的实例对象环境中执行Pop方法，实现子类对父类的覆盖
    var self = this;
    var name = (options.name || "Menu");
    var data = (options.data || ["空"]);
    var $menu = $("<ul id='" + options.triggerId + "-menu' class='pop-menu'></ul>");
    this._class = "pop-menu";
    this.name = name;
    this.triggerId = options.triggerId;
    this.data = data;
    this.$menu = $menu;
    $menu.css("display", "none");
    $("body").append($menu);
    this.addItems(data);
    $("#" + options.triggerId).click(function (e) {
        e.stopPropagation();
        self.show();
    });
    $(document).click(function () {
        self.hide();
    });
}
inheritPrototype(Menu, Pop); // 先指定原型后向其注入方法
Menu.prototype._creatItem = function (item) {
    var html = "";
    if ((typeof item == "string") || (typeof item == "number")) {
        html += "<li class='pop-menu-item'><span class='item-icon-l'></span><span class='item-title'>" + (item || "(空)") + "</span><span class='item-icon-r'></span></li>";
    } else if (typeof item == "object") {
        html += "<li data-value='" + item.value + "' class='pop-menu-item " + (item.header || "") + "'><span class='item-icon-l " + (item.icon || "") + "'></span><span class='item-title'>" + (item.title || "(空)") + "</span>" + (item.children ? "<span class='item-icon-r fa fa-caret-right'></span>" : "") + "</li>";
    } else {
        console.error("数据项格式须为对象或字符串！");
        return "";
    }
    return html;
}
Menu.prototype.addItem = function (item) {
    var ele = $("#" + this.triggerId + "-menu");
    ele.append(this._creatItem(item));
}
Menu.prototype.addItems = function (items) {
    var ele = $("#" + this.triggerId + "-menu");
    var self = this;
    if (ele.length > 0) {
        if (Object.prototype.toString.call(items) !== "[object Array]") {
            console.error("尝试添加的数据格式不为数组！");
            return
        }
        var html = "";
        $.each(items, function (i, item) {
            html += self._creatItem(item);
        });
        ele.append(html);
    } else {
        console.error("未找到根组件！");
    }
}
Menu.prototype.show = function () {
    var p = this.getPosition(this.triggerId);
    var l = p.x1;
    var t = p.y2;
    var ele = $("#" + this.triggerId + "-menu");
    ele.css({
        position: "absolute",
        left: l + "px",
        top: t + "px",
        zIndex: 100
    });
    ele.slideToggle("fast");
    // 订制处理
    $("#" + this.triggerId).parents(".tool-commonuse").toggleClass("active");
    $("#" + this.triggerId).toggleClass("active");
}
Menu.prototype.hide = function () {
    var ele = $("#" + this.triggerId + "-menu");
    ele.slideUp("fast");
    // 订制处理
    $("#" + this.triggerId).parents(".tool-commonuse").removeClass("active");
    $("#" + this.triggerId).removeClass("active");
}

/**
 * Prompt
 * Simulate window.prompt
 *
 * @param {Object} options
 * @param {String} [options.id] - prompt id
 * @param {String} [options.name] - prompt name
 * @param {String} [options.title] - prompt title
 * @param {Array} [options.items] - prompt input item
 * @param {Array} [options.buttons] - prompt operate button
 * @param {Object} [options.style] - prompt style
 */
function Prompt(options) {
    if (Object.prototype.toString.call(options) !== "[object Object]") {
        options = {};
    }
    var _id = (options.id || "simple-prompt");
    var _name = (options.name || "Prompt");
    var _title = (options.title || "请输入");
    var _items = (options.items || []);
    var _buttons = (options.buttons || [{ text: "确定", value: "ok", callback: "confirm" }, { text: "取消", value: "cancel", callback: "cancel" }]);
    var _mask = (options.mask || true);
    this.options = options;
    this.id = _id;
    this.name = _name;
    this.title = _title;
    this.items = _items;
    this.buttons = _buttons;
    this.mask = _mask;
    this.$prompt = $("#" + _id);
    this.result = null;
    this.init();
}
Prompt.prototype._creat = function (key) {
    var _html = "";
    var _items = this.items;
    var _buttons = this.buttons;
    if (typeof key === "string") {
        switch (key) {
            case "title":
                _html += "<div class='prompt-title-value'>" + this.title + "</div><div class='prompt-close'><span class='fa fa-times'></span></div>";
                break;
            case "items":
                if ((Object.prototype.toString.call(_items) === "[object Array]") && (_items.length > 0)) {
                    $.each(_items, function (i, item) {
                        _html += "<div class='prompt-item'><div class='prompt-item-label'>" + (item.label || "") + "</div><div class='prompt-item-control'><input name=" + (item.name || ('item-' + i)) + " /></div><div class='prompt-item-state'>" + (item.state || "") + "</div></div>";
                    });
                }
                break;
            case "buttons":
                if ((Object.prototype.toString.call(_buttons) === "[object Array]") && (_buttons.length > 0)) {
                    // _buttons = _buttons.reverse();
                    $.each(_buttons, function (i, button) {
                        _html += "<div class='prompt-button' data-value='" + button.value + "' data-callback='" + button.callback + "'>" + button.text + "</div>";
                    });
                }
                break;
            case "mask":
                _html += "<div class='simple-mask'></div>";
                break;
        }
    } else {
        console.error("缺少参数或参数不为字符串");
    }
    return _html;
}
Prompt.prototype.refresh = function () {
    var _title = this._creat("title");
    var _items = this._creat("items");
    var _buttons = this._creat("buttons");
    this.$prompt.children("div.prompt-title").html(_title);
    this.$prompt.children("div.prompt-items").html(_items);
    this.$prompt.children("div.prompt-buttons").html(_buttons);
}
Prompt.prototype.init = function () {
    var self = this;
    if (this.$prompt.length === 0) {
        var html = "<div id='" + this.id + "' class='simple-prompt " + this.name + "'><div class='prompt-content'>" +
            "<div class='prompt-title'>" + this._creat('title') + "</div>" +
            "<div class='prompt-items'>" + this._creat('items') + "</div>" +
            "<div class='prompt-buttons'>" + this._creat('buttons') + "</div>" +
            "</div></div>";
        var $prompt = $(html);
        $prompt.css("display", "none");
        $("body").append($prompt);
        this.$prompt = $("#" + self.id);
        this.$input = $("#" + self.id + " .prompt-items input");
        this.$prompt.on("click", ".prompt-close", function () {
            self.hide();
        });
        this.$prompt.on("click", ".prompt-button", function () {
            var callback = $(this).attr("data-callback");
            (typeof self[callback] == "function") && self[callback]();
        });
    } else {
        this.refresh();
    }
}
Prompt.prototype.extend = function (key, value) {
    this[key] = value;
}
Prompt.prototype.show = function () {
    if ($(".simple-mask").length === 0) {
        var $mask = $(this._creat("mask"));
        $mask.css("display", "none");
        $("body").append($mask);
    }
    if (this.mask) {
        $(".simple-mask").show();
    }
    this.$prompt.slideDown("fast");
}
Prompt.prototype.hide = function () {
    $(".simple-mask").fadeOut("fast");
    this.$prompt.slideUp("fast");
}
Prompt.prototype.confirm = function () {
    var items = this.$input
    var result = {};
    $.each(items, function (i, input) {
        result[$(input).attr("name")] = $(input).val()
    });
    this.result = result;
    this.hide();
}
Prompt.prototype.cancel = function () {
    this.hide();
}