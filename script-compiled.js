"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var links = document.querySelectorAll(".js-scroll-to");

links.forEach(function (link) {
  return link.addEventListener("click", function (e) {
    var href = this.getAttribute("href");

    if (!href.startsWith("#")) return;
    e.preventDefault();

    if (href === "#") {
      scroll({ y: 0, behavior: "smooth" });
    } else {
      document.getElementById(href.slice(1)).scrollIntoView({ behavior: "smooth" });
    }

    history.replaceState(null, null, href);
  });
});

function ScrollSpy(wrapper, opt) {
  this.doc = document;
  this.wrapper = typeof wrapper === "string" ? this.doc.querySelector(wrapper) : wrapper;
  this.nav = this.wrapper.querySelectorAll(opt.nav);

  this.contents = [];
  this.win = window;

  this.winH = this.win.innerHeight;

  this.className = opt.className;

  this.callback = opt.callback;

  this.init();
}

ScrollSpy.prototype.init = function () {
  this.contents = this.getContents();
  this.attachEvent();
};

ScrollSpy.prototype.getContents = function () {
  var targetList = [];

  for (var i = 0, max = this.nav.length; i < max; i++) {
    var href = this.nav[i].href;

    targetList.push(this.doc.getElementById(href.split("#")[1]));
  }

  return targetList;
};

ScrollSpy.prototype.attachEvent = function () {
  this.win.addEventListener("load", function () {
    this.spy(this.callback);
  }.bind(this));

  var scrollingTimer;

  this.win.addEventListener("scroll", function () {
    if (scrollingTimer) {
      clearTimeout(scrollingTimer);
    }

    var _this = this;

    scrollingTimer = setTimeout(function () {
      _this.spy(_this.callback);
    }, 10);
  }.bind(this));

  var resizingTimer;

  this.win.addEventListener("resize", function () {
    if (resizingTimer) {
      clearTimeout(resizingTimer);
    }

    var _this = this;

    resizingTimer = setTimeout(function () {
      _this.spy(_this.callback);
    }, 10);
  }.bind(this));
};

ScrollSpy.prototype.spy = function (cb) {
  var elems = this.getElemsViewState();

  this.markNav(elems);

  if (typeof cb === "function") {
    cb(elems);
  }
};

ScrollSpy.prototype.getElemsViewState = function () {
  var elemsInView = [],
      elemsOutView = [],
      viewStatusList = [];

  for (var i = 0, max = this.contents.length; i < max; i++) {
    var currentContent = this.contents[i],
        isInView = this.isInView(currentContent);

    if (isInView) {
      elemsInView.push(currentContent);
    } else {
      elemsOutView.push(currentContent);
    }
    viewStatusList.push(isInView);
  }

  return {
    inView: elemsInView,
    outView: elemsOutView,
    viewStatusList: viewStatusList
  };
};

ScrollSpy.prototype.isInView = function (el) {
  var winH = this.winH,
      scrollTop = this.doc.documentElement.scrollTop || this.doc.body.scrollTop,
      scrollBottom = scrollTop + winH,
      rect = el.getBoundingClientRect(),
      elTop = rect.top + scrollTop,
      elBottom = elTop + el.offsetHeight;

  return elTop < scrollBottom && elBottom > scrollTop + innerHeight / 2;
};

ScrollSpy.prototype.markNav = function (elems) {
  var navItems = this.nav,
      isAlreadyMarked = false;

  for (var i = 0, max = navItems.length; i < max; i++) {
    if (elems.viewStatusList[i] && !isAlreadyMarked) {
      isAlreadyMarked = true;
      navItems[i].classList.add(this.className);
    } else {
      navItems[i].classList.remove(this.className);
    }
  }
};

new ScrollSpy("#js-scrollspy", {
  nav: "#js-scrollspy a",
  className: "is-active"
});

window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

Node.prototype.on = window.on = function (eventsString, fn) {
  var _this2 = this;

  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var supportsPassive = false;

  try {
    document.addEventListener("test", null, {
      get passive() {
        supportsPassive = true;
      }
    });
  } catch (e) {}

  if ((typeof config === "undefined" ? "undefined" : _typeof(config)) === "object" && config.hasOwnProperty("passive")) {
    config = supportsPassive ? config : false;
  }

  eventsString.trim().split(", ").forEach(function (eventDeclaration) {
    var _eventDeclaration$tri = eventDeclaration.trim().split(":"),
        _eventDeclaration$tri2 = _slicedToArray(_eventDeclaration$tri, 2),
        event = _eventDeclaration$tri2[0],
        key = _eventDeclaration$tri2[1];

    if (key) {
      _this2._listeners = _this2._listeners || {};
      _this2._listeners[key] = { event: event, fn: fn, config: config };
    }

    _this2.addEventListener(event, fn, config);
  });
};

Node.prototype.off = window.off = function (eventsString, fn) {
  var _this3 = this;

  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (fn) {
    eventsString.trim().split(", ").forEach(function (event) {
      return _this3.removeEventListener(event, fn, config);
    });
  } else {
    if (!this._listeners) return;

    var listenerKeys = String(eventsString).trim().split(", ");

    listenerKeys.forEach(function (key) {
      if (!_this3._listeners[key]) return;

      var _listeners$key = _this3._listeners[key],
          event = _listeners$key.event,
          fn = _listeners$key.fn,
          config = _listeners$key.config;

      _this3.removeEventListener(event, fn, config);
      delete _this3._listeners[key];
    });
  }
};

Node.prototype.once = window.once = function (events, fn) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var listener = function listener(e) {
    fn.call(this, e);
    this.off(events, listener);
  };
  this.on(events, listener, config);
};

NodeList.prototype.__proto__ = Array.prototype;

NodeList.prototype.on = NodeList.prototype.addEventListener = function (events, fn) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  this.forEach(function (el) {
    return el.on(events, fn, config);
  });
};

NodeList.prototype.off = NodeList.prototype.removeEventListener = function (events, fn) {
  this.forEach(function (el) {
    return el.off(events, fn);
  });
};

NodeList.prototype.once = function (events, fn) {
  this.forEach(function (el) {
    return el.once(events, fn);
  });
};

var SideNav = function () {
  function SideNav() {
    _classCallCheck(this, SideNav);

    this.sideNav = $(".sidebar__container");
    this.backdrop = $(".sidebar__backdrop");
    this.menuButton = $(".navbar__btn");
    this.menuButtonTopLine = $(".navbar__btn .navbar__btn__line--top");
    this.menuButtonBottomLine = $(".navbar__btn .navbar__btn__line--bottom");

    this._startX = 0;
    this._currentX = 0;
    this._sideNavX = 0;
    this._shift = 0;
    this._startSideNavX = undefined;
    this._touching = false;
    this._supportsPassive = undefined;
    this.__opened = false;

    this._update = this._update.bind(this);
    this._onPointerStart = this._onPointerStart.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerEnd = this._onPointerEnd.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);

    this._addEventListeners();
  }

  _createClass(SideNav, [{
    key: "_addEventListeners",
    value: function _addEventListeners() {
      document.on("touchstart", this._onPointerStart, { passive: true });
      document.on("mousedown", this._onPointerStart);
      document.on("touchmove", this._onPointerMove, { passive: true });
      document.on("mousemove", this._onPointerMove);
      document.on("touchend, mouseup, mouseleave", this._onPointerEnd);

      this.sideNav.on("click", this.close);
      this.backdrop.on("click", this.close);
      this.menuButton.on("click", this.toggle);
    }
  }, {
    key: "_removeEventListeners",
    value: function _removeEventListeners() {
      document.off("touchstart", this._onPointerStart, { passive: true });
      document.off("mousedown", this._onPointerStart);
      document.off("touchmove", this._onPointerMove, { passive: true });
      document.off("mousemove", this._onPointerMove);
      document.off("touchend, mouseup, mouseleave", this._onPointerEnd);

      this.backdrop.off("click", this.close);
      this.menuButton.off("click", this.toggle);
    }
  }, {
    key: "_onPointerStart",
    value: function _onPointerStart(e) {
      this._startX = e.pageX || e.touches[0].pageX;
      this._currentX = this.startX;

      if (this._startX >= 100 && !this.opened) return;

      this._sideNavX = this.sideNav.getBoundingClientRect().left;
      if (this._startSideNavX === undefined) {
        this._startSideNavX = this._sideNavX;
      }

      this._touching = true;
      requestAnimationFrame(this._update);
    }
  }, {
    key: "_onPointerMove",
    value: function _onPointerMove(e) {
      if (!this._touching) return;

      // e.pageX || e.touches[0].pageX
      // ^ when pageX === 0 then accessing e.touches[0] throws an error
      this._currentX = e.touches ? e.touches[0].pageX : e.pageX;
    }
  }, {
    key: "_onPointerEnd",
    value: function _onPointerEnd(evt) {
      if (!this._touching) return;

      this._touching = false;

      // Reset values set by touch
      this.sideNav.style.transform = "";
      this.backdrop.style.opacity = "";
      this.menuButtonTopLine.style.transform = "";
      this.menuButtonBottomLine.style.transform = "";

      // Set animatable if shift by touch is more than 1px
      if (Math.abs(this._currentX - this._startX) > 10) {
        this._setAnimatable();
      }

      var bcr = this.sideNav.getBoundingClientRect();
      var openedPercent = (bcr.width + bcr.left) / bcr.width;

      if (!this.opened) {
        if (openedPercent >= 0.1) this.opened = true;
      } else {
        if (openedPercent <= 0.8) this.opened = false;
      }
    }
  }, {
    key: "_update",
    value: function _update() {
      if (!this._touching) return;

      requestAnimationFrame(this._update);

      this._calculateShift();

      var translate = this._getValueForCurrentShift(this._startSideNavX, false);
      this.sideNav.style.transform = "translate(" + translate + "px)";

      var opacity = this._getValueForCurrentShift(0.6);
      this.backdrop.style.opacity = opacity;

      var translateY = this._getValueForCurrentShift(4, false);
      var rotate = this._getValueForCurrentShift(45);

      this.menuButtonTopLine.style.transform = "translateY(" + -translateY + "px) rotate(" + -rotate + "deg)";
      this.menuButtonBottomLine.style.transform = "translateY(" + translateY + "px) rotate(" + rotate + "deg)";
    }
  }, {
    key: "_calculateShift",
    value: function _calculateShift() {
      var distance = Math.abs(this._startSideNavX);
      var shift = this._currentX - this._startX;

      if (this.opened) {
        // If swiping left
        shift = Math.max(shift, -distance);
        shift = Math.min(shift, 0);
      } else {
        // If swiping right
        shift = Math.min(shift, distance);
        shift = Math.max(shift, 0);
      }
      this._shift = shift / distance;
    }
  }, {
    key: "_getValueForCurrentShift",
    value: function _getValueForCurrentShift(endValue) {
      var toEndValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var value = this._shift * endValue;

      if (toEndValue) {
        value = this.opened ? endValue + value // Swiping left
        : value; // Swiping right
      } else {
        // From endValue
        value = this.opened ? -value // Swiping left
        : endValue - value; // Swiping right
      }

      return value;
    }
  }, {
    key: "_setAnimatable",
    value: function _setAnimatable() {
      var slow = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var className = slow ? "is-animatable--slow" : "is-animatable";
      var elements = [this.sideNav, this.backdrop, this.menuButtonTopLine, this.menuButtonBottomLine];

      elements.forEach(function (el) {
        el.classList.add(className);
        el.once("transitionend", function () {
          return el.classList.remove(className);
        });
      });
    }
  }, {
    key: "open",
    value: function open() {
      this._setAnimatable(true);
      this.opened = true;
    }
  }, {
    key: "close",
    value: function close() {
      this._setAnimatable(true);
      this.opened = false;
    }
  }, {
    key: "toggle",
    value: function toggle() {
      this.opened ? this.close() : this.open();
    }
  }, {
    key: "init",
    value: function init() {
      this._addEventListeners();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this._removeEventListeners();
    }
  }, {
    key: "opened",
    set: function set(val) {
      // IE doesn't support the second argument for el.classList.toggle()
      this.sideNav.classList[val ? "add" : "remove"]("is-opened");
      this.menuButton.classList[val ? "add" : "remove"]("is-active");
      this.backdrop.classList[val ? "add" : "remove"]("is-visible");

      this.__opened = val;
    },
    get: function get() {
      return this.__opened;
    }
  }]);

  return SideNav;
}();

var sideNav = new SideNav();

// API:

// sideNav.destroy()
// sideNav.init()

// sideNav.open()
// sideNav.close()
// sideNav.toggle()

// if (sideNav.opened) {}
