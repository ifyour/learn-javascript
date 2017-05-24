var canvasImgUpload = (function() {
    //DOM容器
    var DOMTree = {};
    //数据容器
    DOMTree.data = {};

    //resultURL回显图片的地址,cb回调，deflautPicURL默认出现的图片地址，radius大圆半径，smallRadius小圆半径
    function initPicShow(cb, resultURL, deflautPicURL, radius, smallRadius) {
        if (!deflautPicURL) {
            deflautPicURL = "./img/nopic.png";
        }
        if (!radius) DOMTree.data.radius = 90;
        if (!smallRadius) DOMTree.data.smallRadius = 5;

        var html = '<div class="sl-pic-box" id="sl-pic-box">\
			<a class="sl-pic-btn" id="imgupload-sl-pic-btn"><span>+</span>选择图片</a>\
			<p class="gray_c tip" id="tip">只支持JPG/PNG/GIF，大小不超过5M</p>\
			<input type="file" name="" id="imgupload-input-file"  style="visibility: hidden;"/>\
			<img src="' + deflautPicURL + '" id="imgupload-picshow" class=""/>\
			<canvas id="canvas" width="330" height="330">您的浏览器不支持，请下载高版本浏览器</canvas>\
			<a class="sl-again-btn hide" id="sl-again-btn">重新选择</a>\
		</div>\
		<div class="lookpic" id="lookPic">\
			<p style="text-align:center;margin-bottom:10px;">预览</p>\
			<div class="lookpic-box">\
				<canvas id="canvas-result" width="180" height="180">您的浏览器不支持，请下载高版本浏览器</canvas>\
			</div>\
		</div>';

        var container = document.getElementById("canvas-img-upload");
        container.innerHTML = html;

        //获取预览图片的框,选择图片的框,选择图片的按钮，input框，以及图片显示框,再次选择图片的按钮
        DOMTree.lookPic = document.getElementById("lookPic");
        DOMTree.slPicBox = document.getElementById("sl-pic-box");
        DOMTree.showpicBtn = document.getElementById("imgupload-sl-pic-btn");
        DOMTree.inputFile = document.getElementById("imgupload-input-file");
        DOMTree.picshow = document.getElementById("imgupload-picshow");
        DOMTree.slAgainBtn = document.getElementById("sl-again-btn");
        DOMTree.tip = document.getElementById("tip");
        DOMTree.canvas = document.getElementById("canvas");
        DOMTree.canvasResult = document.getElementById("canvas-result");

        //设置canvas宽高
        DOMTree.canvas.style.width = DOMTree.slPicBox.clientWidth;
        DOMTree.canvas.style.height = DOMTree.slPicBox.clientHeight;
        DOMTree.canvasResult.style.width = DOMTree.lookPic.clientWidth;
        DOMTree.canvasResult.style.height = DOMTree.lookPic.clientHeight;

        //此处有ajax做回显,如果调用ajax的时候有图片信息就调用slPicBoxState_1()转换样式。
        if (resultURL) {
            DOMTree.picshow.src = resultURL;
            //图片加载错误时，加载默认的提示图片，加载成功，执行转换样式函数。
            var tag = true; //控制样式

            DOMTree.picshow.onerror = function() {
                tag = false;
                this.src = deflautPicURL;
                slPicBoxState_2()
            }

            DOMTree.picshow.onload = function() {
                if (tag) {
                    slPicBoxState_1()
                }
            }
        }

        DOMTree.inputFile.onchange = function() {
            handleChange(cb)
        };
        DOMTree.showpicBtn.onclick = function() {
            DOMTree.inputFile.click();
        }
        DOMTree.slAgainBtn.onclick = function() {
            DOMTree.inputFile.click();
        }
    }

    function handleChange(cb) {
        var file = DOMTree.inputFile.files[0]
        var fr = new FileReader();
        fr.onloadend = function(e) {
            var src = e.target.result;
            var num = src.search(",");
            var describesrc = src.slice(0, num);
            var type = describesrc.match(/png|jpg|jpeg|gif|bmp|swf|wmf/);
            if (type.length == 1) {
                DOMTree.picshow.src = src;
                slPicBoxState_1()
                    //此处去调用绘图，此处的src为base64字符串

                var imgUPChild = new imgUp(DOMTree.canvas, DOMTree.canvasResult, DOMTree.picshow, src, DOMTree.data.radius, DOMTree.data.smallRadius);
                //url就是截取后的图片base64
                imgUPChild.init(cb);
            }
        }
        fr.readAsDataURL(file);
    }

    //状态1 转换选择图片框里的样式：出现再次选择的按钮
    function slPicBoxState_1() {
        DOMTree.slAgainBtn.className = DOMTree.slAgainBtn.className.replace("hide", "");
        if (DOMTree.showpicBtn.className.search("hide") == -1) {
            DOMTree.showpicBtn.className += " hide";
        }
        DOMTree.tip.className += " hide";
    }

    //状态2 转换选择图片框里的样式:隐藏再次选择的按钮,出现tip和选择图片按钮
    function slPicBoxState_2() {
        DOMTree.slAgainBtn.className += " hide";
        DOMTree.tip.className = DOMTree.tip.className.replace("hide", "");
        DOMTree.showpicBtn.className = DOMTree.showpicBtn.className.replace("hide", "");
    }



    function imgUp(canvas, canvasResult, imgDOM, imgURL, radius, smallRadius) {
        this.canvas = canvas;
        this.canvasResult = {};
        this.canvasResult.dom = canvasResult;
        this.canvas.w = imgDOM.width;
        this.canvas.h = imgDOM.height;
        this.currentX = this.canvas.w / 2;
        this.currentY = this.canvas.h / 2;
        this.canvas.cx = null;
        this.smallCurrentX = 0;
        this.smallCurrentY = 0;
        this.imgURL = imgURL;
        this.prevMousePosition = {};
        this.callback = null;
        this.radius = radius;
        this.smallRadius = smallRadius;
    }

    imgUp.prototype.init = function(callback) {
        this.callback = callback;
        this.initCanvas();
        this.drawCircle(this.currentX, this.currentY, this.radius);
        this.changePosition();
        this.initCanvasResult();
        this.toBase64();
    }

    imgUp.prototype.initCanvasResult = function() {
        this.canvasResult.cx = this.canvasResult.dom.getContext("2d");
        this.canvasResult.w = this.canvasResult.dom.clientWidth;
        this.canvasResult.h = this.canvasResult.dom.clientHeight;
        drawImage(this.currentX, this.currentY, this.radius, this)
    }

    imgUp.prototype.initCanvas = function() {
        this.canvas.style.width = this.canvas.w;
        this.canvas.style.height = this.canvas.h;
        this.canvas.cx = this.canvas.getContext("2d");
    }

    imgUp.prototype.drawCircle = function(x, y, r) {
        this.canvas.cx.clearRect(0, 0, this.canvas.w, this.canvas.h)
        this.canvas.cx.beginPath();
        this.canvas.cx.save();
        this.canvas.cx.arc(x, y, r, 0, 2 * Math.PI * 360 / 360, false);
        this.canvas.cx.lineWidth = 2;
        this.canvas.cx.strokeStyle = "#fff";
        this.canvas.cx.stroke();
        this.canvas.cx.restore();
        this.canvas.cx.beginPath();
        //小圈定位
        this.smallCurrentY = ((Math.sqrt(3) / 2) * this.radius + y);
        this.smallCurrentX = x + this.radius / 2;
        this.canvas.cx.save();
        this.canvas.cx.arc(this.smallCurrentX, this.smallCurrentY, this.smallRadius, 0, Math.PI * 2, false);
        this.canvas.cx.fillStyle = "#fff";
        this.canvas.cx.fill();
        this.canvas.cx.stroke();
        this.canvas.cx.restore()
    }


    imgUp.prototype.changePosition = function() {
        var _this = this;
        this.canvas.onmousedown = function() {
            handleMousedown(event, _this)
        };
    }

    imgUp.prototype.toBase64 = function() {
        var dataObj = {};
        var dataURL = this.canvasResult.dom.toDataURL("image/png");
        var num = dataURL.search(",");
        dataObj.base64 = dataURL.slice(num + 1);
        var describesrc = dataURL.slice(0, num);
        var type = describesrc.match(/png|jpg|jpeg|gif|bmp|swf|wmf/);
        if (type.length == 1) dataObj.type = type[0];
        if (this.callback) {
            this.callback(dataObj);
        }

    }

    function handleMousedown(e, _this) {
        var judge = {};
        judge.tag = isClickBigCircle(e.offsetX, e.offsetY, _this);
        judge.flag = isClickSmallCircle(e.offsetX, e.offsetY, _this);
        //如果鼠标点击的是圈内则监听鼠标移动事件，否则移除。
        if (judge.tag) {
            _this.prevMousePosition.x = e.offsetX;
            _this.prevMousePosition.y = e.offsetY;
            _this.canvas.onmousemove = function(e) {
                e.stopPropagation();
                e.preventDefault();
                handleMousemove(event, _this)
            }
            _this.canvas.onmouseup = function() {
                handleMouseup(_this, judge);
            }
        }
        if (judge.flag) {
            _this.canvas.onmousemove = function(e) {
                e.stopPropagation();
                e.preventDefault();
                circleBigger(event, _this);
            }
            _this.canvas.onmouseup = function() {
                handleMouseup(_this, judge);
            }
        }

    }

    function handleMouseup(_this, judge) {
        judge.tag = false;
        judge.flag = false;
        _this.canvas.onmousemove = null;
    }

    function circleBigger(e, _this) {
        var mouseCircleCenterDisrance = Math.sqrt(Math.pow((e.offsetX - _this.currentX), 2) + Math.pow((e.offsetY - _this.currentY), 2));
        _this.radius += (mouseCircleCenterDisrance - _this.radius);

        if (!isOverLimit(_this.currentX, _this.currentY, _this.radius)) {
            _this.drawCircle(_this.currentX, _this.currentY, _this.radius);
            drawImage(_this.currentX, _this.currentY, _this.radius, _this);
        }
    }

    function handleMousemove(e, _this) {
        var nextX = _this.currentX + (e.offsetX - _this.prevMousePosition.x);
        var nextY = _this.currentY + (e.offsetY - _this.prevMousePosition.y);

        if (!isOverLimit(nextX, nextY, _this.radius)) {
            _this.drawCircle(nextX, nextY, _this.radius);
            drawImage(nextX, nextY, _this.radius, _this);
        }

    }

    function drawImage(x, y, r, _this) {
        var img = new Image();
        img.src = _this.imgURL;
        img.onload = function() {

            _this.canvasResult.cx.clearRect(0, 0, _this.canvasResult.w, _this.canvasResult.h);

            //获取原图片和dom上显示的宽高比例
            var Wscale = img.width / _this.canvas.w;
            var Hscale = img.height / _this.canvas.h;
            _this.canvasResult.cx.drawImage(img, (x - r) * Wscale, (y - r) * Hscale, 2 * r * Wscale, 2 * r * Hscale, 0, 0, _this.canvasResult.w, _this.canvasResult.h);
            _this.toBase64(_this);
        }
    }

    function isClickBigCircle(x, y, _this) {
        var distance = Math.sqrt(Math.pow(x - _this.currentX, 2) + Math.pow(y - _this.currentY, 2));
        return distance < _this.radius ? true : false;
    }

    function isClickSmallCircle(x, y, _this) {
        var distance = Math.sqrt(Math.pow(x - _this.smallCurrentX, 2) + Math.pow(y - _this.smallCurrentY, 2));
        return distance < _this.smallRadius ? true : false;
    }

    function isOverLimit(x, y, r) {
        var tag = false;
        var w = DOMTree.slPicBox.clientWidth;
        var h = DOMTree.slPicBox.clientHeight;
        if (x + r > w || x - r < 0 || y + r > h || y - r < 0) {
            tag = true;
        }
        return tag;
    }

    return initPicShow;
})()
