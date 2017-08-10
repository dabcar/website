function ScrollSpy(wrapper, opt) {
  this.doc = document
  this.wrapper =
    typeof wrapper === "string" ? this.doc.querySelector(wrapper) : wrapper
  this.nav = this.wrapper.querySelectorAll(opt.nav)

  this.contents = []
  this.win = window

  this.winH = this.win.innerHeight

  this.className = opt.className

  this.callback = opt.callback

  this.init()
}

ScrollSpy.prototype.init = function() {
  this.contents = this.getContents()
  this.attachEvent()
}

ScrollSpy.prototype.getContents = function() {
  var targetList = []

  for (var i = 0, max = this.nav.length; i < max; i++) {
    var href = this.nav[i].href

    targetList.push(this.doc.getElementById(href.split("#")[1]))
  }

  return targetList
}

ScrollSpy.prototype.attachEvent = function() {
  this.win.addEventListener(
    "load",
    function() {
      this.spy(this.callback)
    }.bind(this)
  )

  var scrollingTimer

  this.win.addEventListener(
    "scroll",
    function() {
      if (scrollingTimer) {
        clearTimeout(scrollingTimer)
      }

      var _this = this

      scrollingTimer = setTimeout(function() {
        _this.spy(_this.callback)
      }, 10)
    }.bind(this)
  )

  var resizingTimer

  this.win.addEventListener(
    "resize",
    function() {
      if (resizingTimer) {
        clearTimeout(resizingTimer)
      }

      var _this = this

      resizingTimer = setTimeout(function() {
        _this.spy(_this.callback)
      }, 10)
    }.bind(this)
  )
}

ScrollSpy.prototype.spy = function(cb) {
  var elems = this.getElemsViewState()

  this.markNav(elems)

  if (typeof cb === "function") {
    cb(elems)
  }
}

ScrollSpy.prototype.getElemsViewState = function() {
  var elemsInView = [],
    elemsOutView = [],
    viewStatusList = []

  for (var i = 0, max = this.contents.length; i < max; i++) {
    var currentContent = this.contents[i],
      isInView = this.isInView(currentContent)

    if (isInView) {
      elemsInView.push(currentContent)
    } else {
      elemsOutView.push(currentContent)
    }
    viewStatusList.push(isInView)
  }

  return {
    inView: elemsInView,
    outView: elemsOutView,
    viewStatusList: viewStatusList
  }
}

ScrollSpy.prototype.isInView = function(el) {
  var winH = this.winH,
    scrollTop = this.doc.documentElement.scrollTop || this.doc.body.scrollTop,
    scrollBottom = scrollTop + winH,
    rect = el.getBoundingClientRect(),
    elTop = rect.top + scrollTop,
    elBottom = elTop + el.offsetHeight

  return elTop < scrollBottom && elBottom > scrollTop + innerHeight / 2
}

ScrollSpy.prototype.markNav = function(elems) {
  var navItems = this.nav,
    isAlreadyMarked = false

  for (var i = 0, max = navItems.length; i < max; i++) {
    if (elems.viewStatusList[i] && !isAlreadyMarked) {
      isAlreadyMarked = true
      navItems[i].classList.add(this.className)
    } else {
      navItems[i].classList.remove(this.className)
    }
  }
}

window.$ = document.querySelector.bind(document)
window.$$ = document.querySelectorAll.bind(document)

Node.prototype.on = window.on = function(eventsString, fn, config = false) {
  let supportsPassive = false

  try {
    document.addEventListener("test", null, {
      get passive() {
        supportsPassive = true
      }
    })
  } catch (e) {}

  if (typeof config === "object" && config.hasOwnProperty("passive")) {
    config = supportsPassive ? config : false
  }

  eventsString.trim().split(", ").forEach(eventDeclaration => {
    const [event, key] = eventDeclaration.trim().split(":")

    if (key) {
      this._listeners = this._listeners || {}
      this._listeners[key] = { event, fn, config }
    }

    this.addEventListener(event, fn, config)
  })
}

Node.prototype.off = window.off = function(eventsString, fn, config = false) {
  if (fn) {
    eventsString
      .trim()
      .split(", ")
      .forEach(event => this.removeEventListener(event, fn, config))
  } else {
    if (!this._listeners) return

    const listenerKeys = String(eventsString).trim().split(", ")

    listenerKeys.forEach(key => {
      if (!this._listeners[key]) return

      const { event, fn, config } = this._listeners[key]
      this.removeEventListener(event, fn, config)
      delete this._listeners[key]
    })
  }
}

Node.prototype.once = window.once = function(events, fn, config = false) {
  const listener = function(e) {
    fn.call(this, e)
    this.off(events, listener)
  }
  this.on(events, listener, config)
}

NodeList.prototype.__proto__ = Array.prototype

NodeList.prototype.on = NodeList.prototype.addEventListener = function(
  events,
  fn,
  config = false
) {
  this.forEach(el => el.on(events, fn, config))
}

NodeList.prototype.off = NodeList.prototype.removeEventListener = function(
  events,
  fn
) {
  this.forEach(el => el.off(events, fn))
}

NodeList.prototype.once = function(events, fn) {
  this.forEach(el => el.once(events, fn))
}

class SideNav {
  constructor() {
    this.sideNav = $(".sidebar__container")
    this.backdrop = $(".sidebar__backdrop")
    this.menuButton = $(".navbar__btn")
    this.menuButtonTopLine = $(".navbar__btn .navbar__btn__line--top")
    this.menuButtonBottomLine = $(".navbar__btn .navbar__btn__line--bottom")

    this._startX = 0
    this._currentX = 0
    this._sideNavX = 0
    this._shift = 0
    this._startSideNavX = undefined
    this._touching = false
    this._supportsPassive = undefined
    this.__opened = false

    this._update = this._update.bind(this)
    this._onPointerStart = this._onPointerStart.bind(this)
    this._onPointerMove = this._onPointerMove.bind(this)
    this._onPointerEnd = this._onPointerEnd.bind(this)
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
    this.toggle = this.toggle.bind(this)

    this._addEventListeners()
  }

  set opened(val) {
    // IE doesn't support the second argument for el.classList.toggle()
    this.sideNav.classList[val ? "add" : "remove"]("is-opened")
    this.menuButton.classList[val ? "add" : "remove"]("is-active")
    this.backdrop.classList[val ? "add" : "remove"]("is-visible")

    this.__opened = val
  }

  get opened() {
    return this.__opened
  }

  _addEventListeners() {
    document.on("touchstart", this._onPointerStart, { passive: true })
    document.on("mousedown", this._onPointerStart)
    document.on("touchmove", this._onPointerMove, { passive: true })
    document.on("mousemove", this._onPointerMove)
    document.on("touchend, mouseup, mouseleave", this._onPointerEnd)

    this.sideNav.on("click", this.close)
    this.backdrop.on("click", this.close)
    this.menuButton.on("click", this.toggle)
  }

  _removeEventListeners() {
    document.off("touchstart", this._onPointerStart, { passive: true })
    document.off("mousedown", this._onPointerStart)
    document.off("touchmove", this._onPointerMove, { passive: true })
    document.off("mousemove", this._onPointerMove)
    document.off("touchend, mouseup, mouseleave", this._onPointerEnd)

    this.backdrop.off("click", this.close)
    this.menuButton.off("click", this.toggle)
  }

  _onPointerStart(e) {
    this._startX = e.pageX || e.touches[0].pageX
    this._currentX = this.startX

    if (this._startX >= 100 && !this.opened) return

    this._sideNavX = this.sideNav.getBoundingClientRect().left
    if (this._startSideNavX === undefined) {
      this._startSideNavX = this._sideNavX
    }

    this._touching = true
    requestAnimationFrame(this._update)
  }

  _onPointerMove(e) {
    if (!this._touching) return

    // e.pageX || e.touches[0].pageX
    // ^ when pageX === 0 then accessing e.touches[0] throws an error
    this._currentX = e.touches ? e.touches[0].pageX : e.pageX
  }

  _onPointerEnd(evt) {
    if (!this._touching) return

    this._touching = false

    // Reset values set by touch
    this.sideNav.style.transform = ""
    this.backdrop.style.opacity = ""
    this.menuButtonTopLine.style.transform = ""
    this.menuButtonBottomLine.style.transform = ""

    // Set animatable if shift by touch is more than 1px
    if (Math.abs(this._currentX - this._startX) > 10) {
      this._setAnimatable()
    }

    const bcr = this.sideNav.getBoundingClientRect()
    const openedPercent = (bcr.width + bcr.left) / bcr.width

    if (!this.opened) {
      if (openedPercent >= 0.1) this.opened = true
    } else {
      if (openedPercent <= 0.8) this.opened = false
    }
  }

  _update() {
    if (!this._touching) return

    requestAnimationFrame(this._update)

    this._calculateShift()

    const translate = this._getValueForCurrentShift(this._startSideNavX, false)
    this.sideNav.style.transform = `translate(${translate}px)`

    const opacity = this._getValueForCurrentShift(0.6)
    this.backdrop.style.opacity = opacity

    const translateY = this._getValueForCurrentShift(4, false)
    const rotate = this._getValueForCurrentShift(45)

    this.menuButtonTopLine.style.transform = `translateY(${-translateY}px) rotate(${-rotate}deg)`
    this.menuButtonBottomLine.style.transform = `translateY(${translateY}px) rotate(${rotate}deg)`
  }

  _calculateShift() {
    const distance = Math.abs(this._startSideNavX)
    let shift = this._currentX - this._startX

    if (this.opened) {
      // If swiping left
      shift = Math.max(shift, -distance)
      shift = Math.min(shift, 0)
    } else {
      // If swiping right
      shift = Math.min(shift, distance)
      shift = Math.max(shift, 0)
    }
    this._shift = shift / distance
  }

  _getValueForCurrentShift(endValue, toEndValue = true) {
    let value = this._shift * endValue

    if (toEndValue) {
      value = this.opened
        ? endValue + value // Swiping left
        : value // Swiping right
    } else {
      // From endValue
      value = this.opened
        ? -value // Swiping left
        : endValue - value // Swiping right
    }

    return value
  }

  _setAnimatable(slow = false) {
    const className = slow ? "is-animatable--slow" : "is-animatable"
    const elements = [
      this.sideNav,
      this.backdrop,
      this.menuButtonTopLine,
      this.menuButtonBottomLine
    ]

    elements.forEach(el => {
      el.classList.add(className)
      el.once("transitionend", () => el.classList.remove(className))
    })
  }

  open() {
    this._setAnimatable(true)
    this.opened = true
  }

  close() {
    this._setAnimatable(true)
    this.opened = false
  }

  toggle() {
    this.opened ? this.close() : this.open()
  }

  init() {
    this._addEventListeners()
  }

  destroy() {
    this._removeEventListeners()
  }
}

const links = document.querySelectorAll(".js-scroll-to")

links.forEach(link =>
  link.addEventListener("click", function(e) {
    const href = this.getAttribute("href")

    if (!href.startsWith("#")) return
    e.preventDefault()

    if (href === "#") {
      scroll({ y: 0, behavior: "smooth" })
    } else {
      document
        .getElementById(href.slice(1))
        .scrollIntoView({ behavior: "smooth" })
    }

    history.replaceState(null, null, href)
  })
)

new ScrollSpy("#js-scrollspy", {
  nav: "#js-scrollspy a",
  className: "is-active"
})

new SideNav()

// const cl = cloudinary.Cloudinary.new({ cloud_name: "asista-dabcar" })
// cl.responsive()
