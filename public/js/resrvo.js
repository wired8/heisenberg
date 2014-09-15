/* ========================================================================
 * Bootstrap: transition.js v3.2.0
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.2.0
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.2.0'

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);


/* ========================================================================
 * Bootstrap: carousel.js v3.2.0
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element).on('keydown.bs.carousel', $.proxy(this.keydown, this))
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.2.0'

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }

  Carousel.prototype.keydown = function (e) {
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);


/* ========================================================================
 * Bootstrap: dropdown.js v3.2.0
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.2.0'

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.trigger('focus')

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $parent = getParent($(this))
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role="menu"], [role="listbox"]', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.2.0
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options        = options
    this.$body          = $(document.body)
    this.$element       = $(element)
    this.$backdrop      =
    this.isShown        = null
    this.scrollbarWidth = 0

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.2.0'

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.$body.addClass('modal-open')

    this.setScrollbar()
    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.$body.removeClass('modal-open')

    this.resetScrollbar()
    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(150) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  Modal.prototype.checkScrollbar = function () {
    if (document.body.clientWidth >= window.innerWidth) return
    this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', '')
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.2.0
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.2.0'

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var $parent      = this.$element.parent()
        var parentDim    = this.getPosition($parent)

        placement = placement == 'bottom' && pos.top   + pos.height       + actualHeight - parentDim.scroll > parentDim.height ? 'top'    :
                    placement == 'top'    && pos.top   - parentDim.scroll - actualHeight < 0                                   ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth      > parentDim.width                                    ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth      < parentDim.left                                     ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(150) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var arrowDelta          = delta.left ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowPosition       = delta.left ? 'left'        : 'top'
    var arrowOffsetPosition = delta.left ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], arrowPosition)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    this.$element.removeAttr('aria-describedby')

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element.trigger('hidden.bs.' + that.type)
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof ($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element
    var el     = $element[0]
    var isBody = el.tagName == 'BODY'
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width:  isBody ? $(window).width()  : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? { top: 0, left: 0 } : $element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template))
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    clearTimeout(this.timeout)
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.2.0
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.2.0'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').empty()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.2.0
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.VERSION = '3.2.0'

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  })

}(jQuery);

//! moment.js
//! version : 2.7.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function(a){function b(a,b,c){switch(arguments.length){case 2:return null!=a?a:b;case 3:return null!=a?a:null!=b?b:c;default:throw new Error("Implement me")}}function c(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function d(a,b){function c(){mb.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+a)}var d=!0;return j(function(){return d&&(c(),d=!1),b.apply(this,arguments)},b)}function e(a,b){return function(c){return m(a.call(this,c),b)}}function f(a,b){return function(c){return this.lang().ordinal(a.call(this,c),b)}}function g(){}function h(a){z(a),j(this,a)}function i(a){var b=s(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._milliseconds=+k+1e3*j+6e4*i+36e5*h,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._bubble()}function j(a,b){for(var c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return b.hasOwnProperty("toString")&&(a.toString=b.toString),b.hasOwnProperty("valueOf")&&(a.valueOf=b.valueOf),a}function k(a){var b,c={};for(b in a)a.hasOwnProperty(b)&&Ab.hasOwnProperty(b)&&(c[b]=a[b]);return c}function l(a){return 0>a?Math.ceil(a):Math.floor(a)}function m(a,b,c){for(var d=""+Math.abs(a),e=a>=0;d.length<b;)d="0"+d;return(e?c?"+":"":"-")+d}function n(a,b,c,d){var e=b._milliseconds,f=b._days,g=b._months;d=null==d?!0:d,e&&a._d.setTime(+a._d+e*c),f&&hb(a,"Date",gb(a,"Date")+f*c),g&&fb(a,gb(a,"Month")+g*c),d&&mb.updateOffset(a,f||g)}function o(a){return"[object Array]"===Object.prototype.toString.call(a)}function p(a){return"[object Date]"===Object.prototype.toString.call(a)||a instanceof Date}function q(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&u(a[d])!==u(b[d]))&&g++;return g+f}function r(a){if(a){var b=a.toLowerCase().replace(/(.)s$/,"$1");a=bc[a]||cc[b]||b}return a}function s(a){var b,c,d={};for(c in a)a.hasOwnProperty(c)&&(b=r(c),b&&(d[b]=a[c]));return d}function t(b){var c,d;if(0===b.indexOf("week"))c=7,d="day";else{if(0!==b.indexOf("month"))return;c=12,d="month"}mb[b]=function(e,f){var g,h,i=mb.fn._lang[b],j=[];if("number"==typeof e&&(f=e,e=a),h=function(a){var b=mb().utc().set(d,a);return i.call(mb.fn._lang,b,e||"")},null!=f)return h(f);for(g=0;c>g;g++)j.push(h(g));return j}}function u(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=b>=0?Math.floor(b):Math.ceil(b)),c}function v(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function w(a,b,c){return bb(mb([a,11,31+b-c]),b,c).week}function x(a){return y(a)?366:365}function y(a){return a%4===0&&a%100!==0||a%400===0}function z(a){var b;a._a&&-2===a._pf.overflow&&(b=a._a[tb]<0||a._a[tb]>11?tb:a._a[ub]<1||a._a[ub]>v(a._a[sb],a._a[tb])?ub:a._a[vb]<0||a._a[vb]>23?vb:a._a[wb]<0||a._a[wb]>59?wb:a._a[xb]<0||a._a[xb]>59?xb:a._a[yb]<0||a._a[yb]>999?yb:-1,a._pf._overflowDayOfYear&&(sb>b||b>ub)&&(b=ub),a._pf.overflow=b)}function A(a){return null==a._isValid&&(a._isValid=!isNaN(a._d.getTime())&&a._pf.overflow<0&&!a._pf.empty&&!a._pf.invalidMonth&&!a._pf.nullInput&&!a._pf.invalidFormat&&!a._pf.userInvalidated,a._strict&&(a._isValid=a._isValid&&0===a._pf.charsLeftOver&&0===a._pf.unusedTokens.length)),a._isValid}function B(a){return a?a.toLowerCase().replace("_","-"):a}function C(a,b){return b._isUTC?mb(a).zone(b._offset||0):mb(a).local()}function D(a,b){return b.abbr=a,zb[a]||(zb[a]=new g),zb[a].set(b),zb[a]}function E(a){delete zb[a]}function F(a){var b,c,d,e,f=0,g=function(a){if(!zb[a]&&Bb)try{require("./lang/"+a)}catch(b){}return zb[a]};if(!a)return mb.fn._lang;if(!o(a)){if(c=g(a))return c;a=[a]}for(;f<a.length;){for(e=B(a[f]).split("-"),b=e.length,d=B(a[f+1]),d=d?d.split("-"):null;b>0;){if(c=g(e.slice(0,b).join("-")))return c;if(d&&d.length>=b&&q(e,d,!0)>=b-1)break;b--}f++}return mb.fn._lang}function G(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function H(a){var b,c,d=a.match(Fb);for(b=0,c=d.length;c>b;b++)d[b]=hc[d[b]]?hc[d[b]]:G(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function I(a,b){return a.isValid()?(b=J(b,a.lang()),dc[b]||(dc[b]=H(b)),dc[b](a)):a.lang().invalidDate()}function J(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Gb.lastIndex=0;d>=0&&Gb.test(a);)a=a.replace(Gb,c),Gb.lastIndex=0,d-=1;return a}function K(a,b){var c,d=b._strict;switch(a){case"Q":return Rb;case"DDDD":return Tb;case"YYYY":case"GGGG":case"gggg":return d?Ub:Jb;case"Y":case"G":case"g":return Wb;case"YYYYYY":case"YYYYY":case"GGGGG":case"ggggg":return d?Vb:Kb;case"S":if(d)return Rb;case"SS":if(d)return Sb;case"SSS":if(d)return Tb;case"DDD":return Ib;case"MMM":case"MMMM":case"dd":case"ddd":case"dddd":return Mb;case"a":case"A":return F(b._l)._meridiemParse;case"X":return Pb;case"Z":case"ZZ":return Nb;case"T":return Ob;case"SSSS":return Lb;case"MM":case"DD":case"YY":case"GG":case"gg":case"HH":case"hh":case"mm":case"ss":case"ww":case"WW":return d?Sb:Hb;case"M":case"D":case"d":case"H":case"h":case"m":case"s":case"w":case"W":case"e":case"E":return Hb;case"Do":return Qb;default:return c=new RegExp(T(S(a.replace("\\","")),"i"))}}function L(a){a=a||"";var b=a.match(Nb)||[],c=b[b.length-1]||[],d=(c+"").match(_b)||["-",0,0],e=+(60*d[1])+u(d[2]);return"+"===d[0]?-e:e}function M(a,b,c){var d,e=c._a;switch(a){case"Q":null!=b&&(e[tb]=3*(u(b)-1));break;case"M":case"MM":null!=b&&(e[tb]=u(b)-1);break;case"MMM":case"MMMM":d=F(c._l).monthsParse(b),null!=d?e[tb]=d:c._pf.invalidMonth=b;break;case"D":case"DD":null!=b&&(e[ub]=u(b));break;case"Do":null!=b&&(e[ub]=u(parseInt(b,10)));break;case"DDD":case"DDDD":null!=b&&(c._dayOfYear=u(b));break;case"YY":e[sb]=mb.parseTwoDigitYear(b);break;case"YYYY":case"YYYYY":case"YYYYYY":e[sb]=u(b);break;case"a":case"A":c._isPm=F(c._l).isPM(b);break;case"H":case"HH":case"h":case"hh":e[vb]=u(b);break;case"m":case"mm":e[wb]=u(b);break;case"s":case"ss":e[xb]=u(b);break;case"S":case"SS":case"SSS":case"SSSS":e[yb]=u(1e3*("0."+b));break;case"X":c._d=new Date(1e3*parseFloat(b));break;case"Z":case"ZZ":c._useUTC=!0,c._tzm=L(b);break;case"dd":case"ddd":case"dddd":d=F(c._l).weekdaysParse(b),null!=d?(c._w=c._w||{},c._w.d=d):c._pf.invalidWeekday=b;break;case"w":case"ww":case"W":case"WW":case"d":case"e":case"E":a=a.substr(0,1);case"gggg":case"GGGG":case"GGGGG":a=a.substr(0,2),b&&(c._w=c._w||{},c._w[a]=u(b));break;case"gg":case"GG":c._w=c._w||{},c._w[a]=mb.parseTwoDigitYear(b)}}function N(a){var c,d,e,f,g,h,i,j;c=a._w,null!=c.GG||null!=c.W||null!=c.E?(g=1,h=4,d=b(c.GG,a._a[sb],bb(mb(),1,4).year),e=b(c.W,1),f=b(c.E,1)):(j=F(a._l),g=j._week.dow,h=j._week.doy,d=b(c.gg,a._a[sb],bb(mb(),g,h).year),e=b(c.w,1),null!=c.d?(f=c.d,g>f&&++e):f=null!=c.e?c.e+g:g),i=cb(d,e,f,h,g),a._a[sb]=i.year,a._dayOfYear=i.dayOfYear}function O(a){var c,d,e,f,g=[];if(!a._d){for(e=Q(a),a._w&&null==a._a[ub]&&null==a._a[tb]&&N(a),a._dayOfYear&&(f=b(a._a[sb],e[sb]),a._dayOfYear>x(f)&&(a._pf._overflowDayOfYear=!0),d=Z(f,0,a._dayOfYear),a._a[tb]=d.getUTCMonth(),a._a[ub]=d.getUTCDate()),c=0;3>c&&null==a._a[c];++c)a._a[c]=g[c]=e[c];for(;7>c;c++)a._a[c]=g[c]=null==a._a[c]?2===c?1:0:a._a[c];a._d=(a._useUTC?Z:Y).apply(null,g),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()+a._tzm)}}function P(a){var b;a._d||(b=s(a._i),a._a=[b.year,b.month,b.day,b.hour,b.minute,b.second,b.millisecond],O(a))}function Q(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function R(a){if(a._f===mb.ISO_8601)return void V(a);a._a=[],a._pf.empty=!0;var b,c,d,e,f,g=F(a._l),h=""+a._i,i=h.length,j=0;for(d=J(a._f,g).match(Fb)||[],b=0;b<d.length;b++)e=d[b],c=(h.match(K(e,a))||[])[0],c&&(f=h.substr(0,h.indexOf(c)),f.length>0&&a._pf.unusedInput.push(f),h=h.slice(h.indexOf(c)+c.length),j+=c.length),hc[e]?(c?a._pf.empty=!1:a._pf.unusedTokens.push(e),M(e,c,a)):a._strict&&!c&&a._pf.unusedTokens.push(e);a._pf.charsLeftOver=i-j,h.length>0&&a._pf.unusedInput.push(h),a._isPm&&a._a[vb]<12&&(a._a[vb]+=12),a._isPm===!1&&12===a._a[vb]&&(a._a[vb]=0),O(a),z(a)}function S(a){return a.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e})}function T(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function U(a){var b,d,e,f,g;if(0===a._f.length)return a._pf.invalidFormat=!0,void(a._d=new Date(0/0));for(f=0;f<a._f.length;f++)g=0,b=j({},a),b._pf=c(),b._f=a._f[f],R(b),A(b)&&(g+=b._pf.charsLeftOver,g+=10*b._pf.unusedTokens.length,b._pf.score=g,(null==e||e>g)&&(e=g,d=b));j(a,d||b)}function V(a){var b,c,d=a._i,e=Xb.exec(d);if(e){for(a._pf.iso=!0,b=0,c=Zb.length;c>b;b++)if(Zb[b][1].exec(d)){a._f=Zb[b][0]+(e[6]||" ");break}for(b=0,c=$b.length;c>b;b++)if($b[b][1].exec(d)){a._f+=$b[b][0];break}d.match(Nb)&&(a._f+="Z"),R(a)}else a._isValid=!1}function W(a){V(a),a._isValid===!1&&(delete a._isValid,mb.createFromInputFallback(a))}function X(b){var c=b._i,d=Cb.exec(c);c===a?b._d=new Date:d?b._d=new Date(+d[1]):"string"==typeof c?W(b):o(c)?(b._a=c.slice(0),O(b)):p(c)?b._d=new Date(+c):"object"==typeof c?P(b):"number"==typeof c?b._d=new Date(c):mb.createFromInputFallback(b)}function Y(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function Z(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function $(a,b){if("string"==typeof a)if(isNaN(a)){if(a=b.weekdaysParse(a),"number"!=typeof a)return null}else a=parseInt(a,10);return a}function _(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function ab(a,b,c){var d=rb(Math.abs(a)/1e3),e=rb(d/60),f=rb(e/60),g=rb(f/24),h=rb(g/365),i=d<ec.s&&["s",d]||1===e&&["m"]||e<ec.m&&["mm",e]||1===f&&["h"]||f<ec.h&&["hh",f]||1===g&&["d"]||g<=ec.dd&&["dd",g]||g<=ec.dm&&["M"]||g<ec.dy&&["MM",rb(g/30)]||1===h&&["y"]||["yy",h];return i[2]=b,i[3]=a>0,i[4]=c,_.apply({},i)}function bb(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=mb(a).add("d",f),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function cb(a,b,c,d,e){var f,g,h=Z(a,0,1).getUTCDay();return h=0===h?7:h,c=null!=c?c:e,f=e-h+(h>d?7:0)-(e>h?7:0),g=7*(b-1)+(c-e)+f+1,{year:g>0?a:a-1,dayOfYear:g>0?g:x(a-1)+g}}function db(b){var c=b._i,d=b._f;return null===c||d===a&&""===c?mb.invalid({nullInput:!0}):("string"==typeof c&&(b._i=c=F().preparse(c)),mb.isMoment(c)?(b=k(c),b._d=new Date(+c._d)):d?o(d)?U(b):R(b):X(b),new h(b))}function eb(a,b){var c,d;if(1===b.length&&o(b[0])&&(b=b[0]),!b.length)return mb();for(c=b[0],d=1;d<b.length;++d)b[d][a](c)&&(c=b[d]);return c}function fb(a,b){var c;return"string"==typeof b&&(b=a.lang().monthsParse(b),"number"!=typeof b)?a:(c=Math.min(a.date(),v(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a)}function gb(a,b){return a._d["get"+(a._isUTC?"UTC":"")+b]()}function hb(a,b,c){return"Month"===b?fb(a,c):a._d["set"+(a._isUTC?"UTC":"")+b](c)}function ib(a,b){return function(c){return null!=c?(hb(this,a,c),mb.updateOffset(this,b),this):gb(this,a)}}function jb(a){mb.duration.fn[a]=function(){return this._data[a]}}function kb(a,b){mb.duration.fn["as"+a]=function(){return+this/b}}function lb(a){"undefined"==typeof ender&&(nb=qb.moment,qb.moment=a?d("Accessing Moment through the global scope is deprecated, and will be removed in an upcoming release.",mb):mb)}for(var mb,nb,ob,pb="2.7.0",qb="undefined"!=typeof global?global:this,rb=Math.round,sb=0,tb=1,ub=2,vb=3,wb=4,xb=5,yb=6,zb={},Ab={_isAMomentObject:null,_i:null,_f:null,_l:null,_strict:null,_tzm:null,_isUTC:null,_offset:null,_pf:null,_lang:null},Bb="undefined"!=typeof module&&module.exports,Cb=/^\/?Date\((\-?\d+)/i,Db=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,Eb=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,Fb=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,Gb=/(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,Hb=/\d\d?/,Ib=/\d{1,3}/,Jb=/\d{1,4}/,Kb=/[+\-]?\d{1,6}/,Lb=/\d+/,Mb=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,Nb=/Z|[\+\-]\d\d:?\d\d/gi,Ob=/T/i,Pb=/[\+\-]?\d+(\.\d{1,3})?/,Qb=/\d{1,2}/,Rb=/\d/,Sb=/\d\d/,Tb=/\d{3}/,Ub=/\d{4}/,Vb=/[+-]?\d{6}/,Wb=/[+-]?\d+/,Xb=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Yb="YYYY-MM-DDTHH:mm:ssZ",Zb=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],$b=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],_b=/([\+\-]|\d\d)/gi,ac=("Date|Hours|Minutes|Seconds|Milliseconds".split("|"),{Milliseconds:1,Seconds:1e3,Minutes:6e4,Hours:36e5,Days:864e5,Months:2592e6,Years:31536e6}),bc={ms:"millisecond",s:"second",m:"minute",h:"hour",d:"day",D:"date",w:"week",W:"isoWeek",M:"month",Q:"quarter",y:"year",DDD:"dayOfYear",e:"weekday",E:"isoWeekday",gg:"weekYear",GG:"isoWeekYear"},cc={dayofyear:"dayOfYear",isoweekday:"isoWeekday",isoweek:"isoWeek",weekyear:"weekYear",isoweekyear:"isoWeekYear"},dc={},ec={s:45,m:45,h:22,dd:25,dm:45,dy:345},fc="DDD w W M D d".split(" "),gc="M D H h m s w W".split(" "),hc={M:function(){return this.month()+1},MMM:function(a){return this.lang().monthsShort(this,a)},MMMM:function(a){return this.lang().months(this,a)},D:function(){return this.date()},DDD:function(){return this.dayOfYear()},d:function(){return this.day()},dd:function(a){return this.lang().weekdaysMin(this,a)},ddd:function(a){return this.lang().weekdaysShort(this,a)},dddd:function(a){return this.lang().weekdays(this,a)},w:function(){return this.week()},W:function(){return this.isoWeek()},YY:function(){return m(this.year()%100,2)},YYYY:function(){return m(this.year(),4)},YYYYY:function(){return m(this.year(),5)},YYYYYY:function(){var a=this.year(),b=a>=0?"+":"-";return b+m(Math.abs(a),6)},gg:function(){return m(this.weekYear()%100,2)},gggg:function(){return m(this.weekYear(),4)},ggggg:function(){return m(this.weekYear(),5)},GG:function(){return m(this.isoWeekYear()%100,2)},GGGG:function(){return m(this.isoWeekYear(),4)},GGGGG:function(){return m(this.isoWeekYear(),5)},e:function(){return this.weekday()},E:function(){return this.isoWeekday()},a:function(){return this.lang().meridiem(this.hours(),this.minutes(),!0)},A:function(){return this.lang().meridiem(this.hours(),this.minutes(),!1)},H:function(){return this.hours()},h:function(){return this.hours()%12||12},m:function(){return this.minutes()},s:function(){return this.seconds()},S:function(){return u(this.milliseconds()/100)},SS:function(){return m(u(this.milliseconds()/10),2)},SSS:function(){return m(this.milliseconds(),3)},SSSS:function(){return m(this.milliseconds(),3)},Z:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+m(u(a/60),2)+":"+m(u(a)%60,2)},ZZ:function(){var a=-this.zone(),b="+";return 0>a&&(a=-a,b="-"),b+m(u(a/60),2)+m(u(a)%60,2)},z:function(){return this.zoneAbbr()},zz:function(){return this.zoneName()},X:function(){return this.unix()},Q:function(){return this.quarter()}},ic=["months","monthsShort","weekdays","weekdaysShort","weekdaysMin"];fc.length;)ob=fc.pop(),hc[ob+"o"]=f(hc[ob],ob);for(;gc.length;)ob=gc.pop(),hc[ob+ob]=e(hc[ob],2);for(hc.DDDD=e(hc.DDD,3),j(g.prototype,{set:function(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b},_months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),months:function(a){return this._months[a.month()]},_monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),monthsShort:function(a){return this._monthsShort[a.month()]},monthsParse:function(a){var b,c,d;for(this._monthsParse||(this._monthsParse=[]),b=0;12>b;b++)if(this._monthsParse[b]||(c=mb.utc([2e3,b]),d="^"+this.months(c,"")+"|^"+this.monthsShort(c,""),this._monthsParse[b]=new RegExp(d.replace(".",""),"i")),this._monthsParse[b].test(a))return b},_weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdays:function(a){return this._weekdays[a.day()]},_weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysShort:function(a){return this._weekdaysShort[a.day()]},_weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),weekdaysMin:function(a){return this._weekdaysMin[a.day()]},weekdaysParse:function(a){var b,c,d;for(this._weekdaysParse||(this._weekdaysParse=[]),b=0;7>b;b++)if(this._weekdaysParse[b]||(c=mb([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b},_longDateFormat:{LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D YYYY",LLL:"MMMM D YYYY LT",LLLL:"dddd, MMMM D YYYY LT"},longDateFormat:function(a){var b=this._longDateFormat[a];return!b&&this._longDateFormat[a.toUpperCase()]&&(b=this._longDateFormat[a.toUpperCase()].replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a]=b),b},isPM:function(a){return"p"===(a+"").toLowerCase().charAt(0)},_meridiemParse:/[ap]\.?m?\.?/i,meridiem:function(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"},_calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},calendar:function(a,b){var c=this._calendar[a];return"function"==typeof c?c.apply(b):c},_relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},relativeTime:function(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)},pastFuture:function(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)},ordinal:function(a){return this._ordinal.replace("%d",a)},_ordinal:"%d",preparse:function(a){return a},postformat:function(a){return a},week:function(a){return bb(a,this._week.dow,this._week.doy).week},_week:{dow:0,doy:6},_invalidDate:"Invalid date",invalidDate:function(){return this._invalidDate}}),mb=function(b,d,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._i=b,g._f=d,g._l=e,g._strict=f,g._isUTC=!1,g._pf=c(),db(g)},mb.suppressDeprecationWarnings=!1,mb.createFromInputFallback=d("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(a){a._d=new Date(a._i)}),mb.min=function(){var a=[].slice.call(arguments,0);return eb("isBefore",a)},mb.max=function(){var a=[].slice.call(arguments,0);return eb("isAfter",a)},mb.utc=function(b,d,e,f){var g;return"boolean"==typeof e&&(f=e,e=a),g={},g._isAMomentObject=!0,g._useUTC=!0,g._isUTC=!0,g._l=e,g._i=b,g._f=d,g._strict=f,g._pf=c(),db(g).utc()},mb.unix=function(a){return mb(1e3*a)},mb.duration=function(a,b){var c,d,e,f=a,g=null;return mb.isDuration(a)?f={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(f={},b?f[b]=a:f.milliseconds=a):(g=Db.exec(a))?(c="-"===g[1]?-1:1,f={y:0,d:u(g[ub])*c,h:u(g[vb])*c,m:u(g[wb])*c,s:u(g[xb])*c,ms:u(g[yb])*c}):(g=Eb.exec(a))&&(c="-"===g[1]?-1:1,e=function(a){var b=a&&parseFloat(a.replace(",","."));return(isNaN(b)?0:b)*c},f={y:e(g[2]),M:e(g[3]),d:e(g[4]),h:e(g[5]),m:e(g[6]),s:e(g[7]),w:e(g[8])}),d=new i(f),mb.isDuration(a)&&a.hasOwnProperty("_lang")&&(d._lang=a._lang),d},mb.version=pb,mb.defaultFormat=Yb,mb.ISO_8601=function(){},mb.momentProperties=Ab,mb.updateOffset=function(){},mb.relativeTimeThreshold=function(b,c){return ec[b]===a?!1:(ec[b]=c,!0)},mb.lang=function(a,b){var c;return a?(b?D(B(a),b):null===b?(E(a),a="en"):zb[a]||F(a),c=mb.duration.fn._lang=mb.fn._lang=F(a),c._abbr):mb.fn._lang._abbr},mb.langData=function(a){return a&&a._lang&&a._lang._abbr&&(a=a._lang._abbr),F(a)},mb.isMoment=function(a){return a instanceof h||null!=a&&a.hasOwnProperty("_isAMomentObject")},mb.isDuration=function(a){return a instanceof i},ob=ic.length-1;ob>=0;--ob)t(ic[ob]);mb.normalizeUnits=function(a){return r(a)},mb.invalid=function(a){var b=mb.utc(0/0);return null!=a?j(b._pf,a):b._pf.userInvalidated=!0,b},mb.parseZone=function(){return mb.apply(null,arguments).parseZone()},mb.parseTwoDigitYear=function(a){return u(a)+(u(a)>68?1900:2e3)},j(mb.fn=h.prototype,{clone:function(){return mb(this)},valueOf:function(){return+this._d+6e4*(this._offset||0)},unix:function(){return Math.floor(+this/1e3)},toString:function(){return this.clone().lang("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){var a=mb(this).utc();return 0<a.year()&&a.year()<=9999?I(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):I(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var a=this;return[a.year(),a.month(),a.date(),a.hours(),a.minutes(),a.seconds(),a.milliseconds()]},isValid:function(){return A(this)},isDSTShifted:function(){return this._a?this.isValid()&&q(this._a,(this._isUTC?mb.utc(this._a):mb(this._a)).toArray())>0:!1},parsingFlags:function(){return j({},this._pf)},invalidAt:function(){return this._pf.overflow},utc:function(){return this.zone(0)},local:function(){return this.zone(0),this._isUTC=!1,this},format:function(a){var b=I(this,a||mb.defaultFormat);return this.lang().postformat(b)},add:function(a,b){var c;return c="string"==typeof a&&"string"==typeof b?mb.duration(isNaN(+b)?+a:+b,isNaN(+b)?b:a):"string"==typeof a?mb.duration(+b,a):mb.duration(a,b),n(this,c,1),this},subtract:function(a,b){var c;return c="string"==typeof a&&"string"==typeof b?mb.duration(isNaN(+b)?+a:+b,isNaN(+b)?b:a):"string"==typeof a?mb.duration(+b,a):mb.duration(a,b),n(this,c,-1),this},diff:function(a,b,c){var d,e,f=C(a,this),g=6e4*(this.zone()-f.zone());return b=r(b),"year"===b||"month"===b?(d=432e5*(this.daysInMonth()+f.daysInMonth()),e=12*(this.year()-f.year())+(this.month()-f.month()),e+=(this-mb(this).startOf("month")-(f-mb(f).startOf("month")))/d,e-=6e4*(this.zone()-mb(this).startOf("month").zone()-(f.zone()-mb(f).startOf("month").zone()))/d,"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:l(e)},from:function(a,b){return mb.duration(this.diff(a)).lang(this.lang()._abbr).humanize(!b)},fromNow:function(a){return this.from(mb(),a)},calendar:function(a){var b=a||mb(),c=C(b,this).startOf("day"),d=this.diff(c,"days",!0),e=-6>d?"sameElse":-1>d?"lastWeek":0>d?"lastDay":1>d?"sameDay":2>d?"nextDay":7>d?"nextWeek":"sameElse";return this.format(this.lang().calendar(e,this))},isLeapYear:function(){return y(this.year())},isDST:function(){return this.zone()<this.clone().month(0).zone()||this.zone()<this.clone().month(5).zone()},day:function(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=$(a,this.lang()),this.add({d:a-b})):b},month:ib("Month",!0),startOf:function(a){switch(a=r(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a?this.weekday(0):"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this},endOf:function(a){return a=r(a),this.startOf(a).add("isoWeek"===a?"week":a,1).subtract("ms",1)},isAfter:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)>+mb(a).startOf(b)},isBefore:function(a,b){return b="undefined"!=typeof b?b:"millisecond",+this.clone().startOf(b)<+mb(a).startOf(b)},isSame:function(a,b){return b=b||"ms",+this.clone().startOf(b)===+C(a,this).startOf(b)},min:d("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(a){return a=mb.apply(null,arguments),this>a?this:a}),max:d("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(a){return a=mb.apply(null,arguments),a>this?this:a}),zone:function(a,b){var c=this._offset||0;return null==a?this._isUTC?c:this._d.getTimezoneOffset():("string"==typeof a&&(a=L(a)),Math.abs(a)<16&&(a=60*a),this._offset=a,this._isUTC=!0,c!==a&&(!b||this._changeInProgress?n(this,mb.duration(c-a,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,mb.updateOffset(this,!0),this._changeInProgress=null)),this)},zoneAbbr:function(){return this._isUTC?"UTC":""},zoneName:function(){return this._isUTC?"Coordinated Universal Time":""},parseZone:function(){return this._tzm?this.zone(this._tzm):"string"==typeof this._i&&this.zone(this._i),this},hasAlignedHourOffset:function(a){return a=a?mb(a).zone():0,(this.zone()-a)%60===0},daysInMonth:function(){return v(this.year(),this.month())},dayOfYear:function(a){var b=rb((mb(this).startOf("day")-mb(this).startOf("year"))/864e5)+1;return null==a?b:this.add("d",a-b)},quarter:function(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)},weekYear:function(a){var b=bb(this,this.lang()._week.dow,this.lang()._week.doy).year;return null==a?b:this.add("y",a-b)},isoWeekYear:function(a){var b=bb(this,1,4).year;return null==a?b:this.add("y",a-b)},week:function(a){var b=this.lang().week(this);return null==a?b:this.add("d",7*(a-b))},isoWeek:function(a){var b=bb(this,1,4).week;return null==a?b:this.add("d",7*(a-b))},weekday:function(a){var b=(this.day()+7-this.lang()._week.dow)%7;return null==a?b:this.add("d",a-b)},isoWeekday:function(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)},isoWeeksInYear:function(){return w(this.year(),1,4)},weeksInYear:function(){var a=this._lang._week;return w(this.year(),a.dow,a.doy)},get:function(a){return a=r(a),this[a]()},set:function(a,b){return a=r(a),"function"==typeof this[a]&&this[a](b),this},lang:function(b){return b===a?this._lang:(this._lang=F(b),this)}}),mb.fn.millisecond=mb.fn.milliseconds=ib("Milliseconds",!1),mb.fn.second=mb.fn.seconds=ib("Seconds",!1),mb.fn.minute=mb.fn.minutes=ib("Minutes",!1),mb.fn.hour=mb.fn.hours=ib("Hours",!0),mb.fn.date=ib("Date",!0),mb.fn.dates=d("dates accessor is deprecated. Use date instead.",ib("Date",!0)),mb.fn.year=ib("FullYear",!0),mb.fn.years=d("years accessor is deprecated. Use year instead.",ib("FullYear",!0)),mb.fn.days=mb.fn.day,mb.fn.months=mb.fn.month,mb.fn.weeks=mb.fn.week,mb.fn.isoWeeks=mb.fn.isoWeek,mb.fn.quarters=mb.fn.quarter,mb.fn.toJSON=mb.fn.toISOString,j(mb.duration.fn=i.prototype,{_bubble:function(){var a,b,c,d,e=this._milliseconds,f=this._days,g=this._months,h=this._data;h.milliseconds=e%1e3,a=l(e/1e3),h.seconds=a%60,b=l(a/60),h.minutes=b%60,c=l(b/60),h.hours=c%24,f+=l(c/24),h.days=f%30,g+=l(f/30),h.months=g%12,d=l(g/12),h.years=d},weeks:function(){return l(this.days()/7)},valueOf:function(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*u(this._months/12)},humanize:function(a){var b=+this,c=ab(b,!a,this.lang());return a&&(c=this.lang().pastFuture(b,c)),this.lang().postformat(c)},add:function(a,b){var c=mb.duration(a,b);return this._milliseconds+=c._milliseconds,this._days+=c._days,this._months+=c._months,this._bubble(),this},subtract:function(a,b){var c=mb.duration(a,b);return this._milliseconds-=c._milliseconds,this._days-=c._days,this._months-=c._months,this._bubble(),this},get:function(a){return a=r(a),this[a.toLowerCase()+"s"]()},as:function(a){return a=r(a),this["as"+a.charAt(0).toUpperCase()+a.slice(1)+"s"]()},lang:mb.fn.lang,toIsoString:function(){var a=Math.abs(this.years()),b=Math.abs(this.months()),c=Math.abs(this.days()),d=Math.abs(this.hours()),e=Math.abs(this.minutes()),f=Math.abs(this.seconds()+this.milliseconds()/1e3);return this.asSeconds()?(this.asSeconds()<0?"-":"")+"P"+(a?a+"Y":"")+(b?b+"M":"")+(c?c+"D":"")+(d||e||f?"T":"")+(d?d+"H":"")+(e?e+"M":"")+(f?f+"S":""):"P0D"}});for(ob in ac)ac.hasOwnProperty(ob)&&(kb(ob,ac[ob]),jb(ob.toLowerCase()));kb("Weeks",6048e5),mb.duration.fn.asMonths=function(){return(+this-31536e6*this.years())/2592e6+12*this.years()},mb.lang("en",{ordinal:function(a){var b=a%10,c=1===u(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),Bb?module.exports=mb:"function"==typeof define&&define.amd?(define("moment",function(a,b,c){return c.config&&c.config()&&c.config().noGlobal===!0&&(qb.moment=nb),mb}),lb(!0)):lb()}).call(this);
//! moment-timezone.js
//! version : 0.2.2
//! author : Tim Wood
//! license : MIT
//! github.com/moment/moment-timezone

(function (root, factory) {
	"use strict";

	/*global define*/
	if (typeof define === 'function' && define.amd) {
		define(['moment'], factory);                 // AMD
	} else if (typeof exports === 'object') {
		module.exports = factory(require('moment')); // Node
	} else {
		factory(root.moment);                        // Browser
	}
}(this, function (moment) {
	"use strict";

	// Do not load moment-timezone a second time.
	if (moment.tz !== undefined) { return moment; }

	var VERSION = "0.2.2",
		zones = {},
		links = {},

		momentVersion = moment.version.split('.'),
		major = +momentVersion[0],
		minor = +momentVersion[1];

	// Moment.js version check
	if (major < 2 || (major === 2 && minor < 6)) {
		logError('Moment Timezone requires Moment.js >= 2.6.0. You are using Moment.js ' + moment.version + '. See momentjs.com');
	}

	/************************************
		Unpacking
	************************************/

	function charCodeToInt(charCode) {
		if (charCode > 96) {
			return charCode - 87;
		} else if (charCode > 64) {
			return charCode - 29;
		}
		return charCode - 48;
	}

	function unpackBase60(string) {
		var i = 0,
			parts = string.split('.'),
			whole = parts[0],
			fractional = parts[1] || '',
			multiplier = 1,
			num,
			out = 0,
			sign = 1;

		// handle negative numbers
		if (string.charCodeAt(0) === 45) {
			i = 1;
			sign = -1;
		}

		// handle digits before the decimal
		for (i; i < whole.length; i++) {
			num = charCodeToInt(whole.charCodeAt(i));
			out = 60 * out + num;
		}

		// handle digits after the decimal
		for (i = 0; i < fractional.length; i++) {
			multiplier = multiplier / 60;
			num = charCodeToInt(fractional.charCodeAt(i));
			out += num * multiplier;
		}

		return out * sign;
	}

	function arrayToInt (array) {
		for (var i = 0; i < array.length; i++) {
			array[i] = unpackBase60(array[i]);
		}
	}

	function intToUntil (array, length) {
		for (var i = 0; i < length; i++) {
			array[i] = Math.round((array[i - 1] || 0) + (array[i] * 60000)); // minutes to milliseconds
		}

		array[length - 1] = Infinity;
	}

	function mapIndices (source, indices) {
		var out = [], i;

		for (i = 0; i < indices.length; i++) {
			out[i] = source[indices[i]];
		}

		return out;
	}

	function unpack (string) {
		var data = string.split('|'),
			offsets = data[2].split(' '),
			indices = data[3].split(''),
			untils  = data[4].split(' ');

		arrayToInt(offsets);
		arrayToInt(indices);
		arrayToInt(untils);

		intToUntil(untils, indices.length);

		return {
			name    : data[0],
			abbrs   : mapIndices(data[1].split(' '), indices),
			offsets : mapIndices(offsets, indices),
			untils  : untils
		};
	}

	/************************************
		Zone object
	************************************/

	function Zone (packedString) {
		if (packedString) {
			this._set(unpack(packedString));
		}
	}

	Zone.prototype = {
		_set : function (unpacked) {
			this.name    = unpacked.name;
			this.abbrs   = unpacked.abbrs;
			this.untils  = unpacked.untils;
			this.offsets = unpacked.offsets;
		},

		_index : function (timestamp) {
			var target = +timestamp,
				untils = this.untils,
				i;

			for (i = 0; i < untils.length; i++) {
				if (target < untils[i]) {
					return i;
				}
			}
		},

		parse : function (timestamp) {
			var target  = +timestamp,
				offsets = this.offsets,
				untils  = this.untils,
				max     = untils.length - 1,
				offset, offsetNext, offsetPrev, i;

			for (i = 0; i < max; i++) {
				offset     = offsets[i];
				offsetNext = offsets[i + 1];
				offsetPrev = offsets[i ? i - 1 : i];

				if (offset < offsetNext && tz.moveAmbiguousForward) {
					offset = offsetNext;
				} else if (offset > offsetPrev && tz.moveInvalidForward) {
					offset = offsetPrev;
				}

				if (target < untils[i] - (offset * 60000)) {
					return offsets[i];
				}
			}

			return offsets[max];
		},

		abbr : function (mom) {
			return this.abbrs[this._index(mom)];
		},

		offset : function (mom) {
			return this.offsets[this._index(mom)];
		}
	};

	/************************************
		Global Methods
	************************************/

	function normalizeName (name) {
		return (name || '').toLowerCase().replace(/\//g, '_');
	}

	function addZone (packed) {
		var i, zone, zoneName;

		if (typeof packed === "string") {
			packed = [packed];
		}

		for (i = 0; i < packed.length; i++) {
			zone = new Zone(packed[i]);
			zoneName = normalizeName(zone.name);
			zones[zoneName] = zone;
			upgradeLinksToZones(zoneName);
		}
	}

	function getZone (name) {
		return zones[normalizeName(name)] || null;
	}

	function getNames () {
		var i, out = [];

		for (i in zones) {
			if (zones.hasOwnProperty(i) && zones[i]) {
				out.push(zones[i].name);
			}
		}

		return out.sort();
	}

	function addLink (aliases) {
		var i, alias;

		if (typeof aliases === "string") {
			aliases = [aliases];
		}

		for (i = 0; i < aliases.length; i++) {
			alias = aliases[i].split('|');
			pushLink(alias[0], alias[1]);
			pushLink(alias[1], alias[0]);
		}
	}

	function upgradeLinksToZones (zoneName) {
		if (!links[zoneName]) {
			return;
		}

		var i,
			zone = zones[zoneName],
			linkNames = links[zoneName];

		for (i = 0; i < linkNames.length; i++) {
			copyZoneWithName(zone, linkNames[i]);
		}

		links[zoneName] = null;
	}

	function copyZoneWithName (zone, name) {
		var linkZone = zones[normalizeName(name)] = new Zone();
		linkZone._set(zone);
		linkZone.name = name;
	}

	function pushLink (zoneName, linkName) {
		zoneName = normalizeName(zoneName);

		if (zones[zoneName]) {
			copyZoneWithName(zones[zoneName], linkName);
		} else {
			links[zoneName] = links[zoneName] || [];
			links[zoneName].push(linkName);
		}
	}

	function loadData (data) {
		addZone(data.zones);
		addLink(data.links);
		tz.dataVersion = data.version;
	}

	function zoneExists (name) {
		if (!zoneExists.didShowError) {
			zoneExists.didShowError = true;
				logError("moment.tz.zoneExists('" + name + "') has been deprecated in favor of !moment.tz.zone('" + name + "')");
		}
		return !!getZone(name);
	}

	function needsOffset (m) {
		return !!(m._a && (m._tzm === undefined));
	}

	function logError (message) {
		if (typeof console !== 'undefined' && typeof console.error === 'function') {
			console.error(message);
		}
	}

	/************************************
		moment.tz namespace
	************************************/

	function tz () {
		var args = Array.prototype.slice.call(arguments, 0, -1),
			name = arguments[arguments.length - 1],
			zone = getZone(name),
			out  = moment.utc.apply(null, args);

		if (zone && needsOffset(out)) {
			out.add(zone.parse(out), 'minutes');
		}

		out.tz(name);

		return out;
	}

	tz.version      = VERSION;
	tz.dataVersion  = '';
	tz._zones       = zones;
	tz._links       = links;
	tz.add          = addZone;
	tz.link         = addLink;
	tz.load         = loadData;
	tz.zone         = getZone;
	tz.zoneExists   = zoneExists; // deprecated in 0.1.0
	tz.names        = getNames;
	tz.Zone         = Zone;
	tz.unpack       = unpack;
	tz.unpackBase60 = unpackBase60;
	tz.needsOffset  = needsOffset;
	tz.moveInvalidForward   = true;
	tz.moveAmbiguousForward = false;

	/************************************
		Interface with Moment.js
	************************************/

	var fn = moment.fn;

	moment.tz = tz;

	moment.updateOffset = function (mom, keepTime) {
		var offset;
		if (mom._z) {
			offset = mom._z.offset(mom);
			if (Math.abs(offset) < 16) {
				offset = offset / 60;
			}
			mom.zone(offset, keepTime);
		}
	};

	fn.tz = function (name) {
		if (name) {
			this._z = getZone(name);
			if (this._z) {
				moment.updateOffset(this);
			} else {
				logError("Moment Timezone has no data for " + name + ". See http://momentjs.com/timezone/docs/#/data-loading/.");
			}
			return this;
		}
		if (this._z) { return this._z.name; }
	};

	function abbrWrap (old) {
		return function () {
			if (this._z) { return this._z.abbr(this); }
			return old.call(this);
		};
	}

	function resetZoneWrap (old) {
		return function () {
			this._z = null;
			return old.apply(this, arguments);
		};
	}

	fn.zoneName = abbrWrap(fn.zoneName);
	fn.zoneAbbr = abbrWrap(fn.zoneAbbr);
	fn.utc      = resetZoneWrap(fn.utc);

	// Cloning a moment should include the _z property.
	var momentProperties = moment.momentProperties;
	if (Object.prototype.toString.call(momentProperties) === '[object Array]') {
		// moment 2.8.1+
		momentProperties.push('_z');
		momentProperties.push('_a');
	} else if (momentProperties) {
		// moment 2.7.0
		momentProperties._z = null;
	}

	// INJECT DATA

	return moment;
}));

later=function(){var e={version:"1.1.6"};return Array.prototype.indexOf||(Array.prototype.indexOf=function(e){"use strict";if(null==this)throw new TypeError;var t=Object(this),n=t.length>>>0;if(0===n)return-1;var r=0;if(arguments.length>1&&(r=Number(arguments[1]),r!=r?r=0:0!=r&&1/0!=r&&r!=-1/0&&(r=(r>0||-1)*Math.floor(Math.abs(r)))),r>=n)return-1;for(var a=r>=0?r:Math.max(n-Math.abs(r),0);n>a;a++)if(a in t&&t[a]===e)return a;return-1}),String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}),e.array={},e.array.sort=function(e,t){e.sort(function(e,t){return+e-+t}),t&&0===e[0]&&e.push(e.shift())},e.array.next=function(e,t,n){for(var r,a=0!==n[0],i=0,u=t.length-1;u>-1;--u){if(r=t[u],r===e)return r;if(!(r>e||0===r&&a&&n[1]>e))break;i=u}return t[i]},e.array.nextInvalid=function(e,t,n){for(var r=n[0],a=n[1],i=t.length,u=0===t[i-1]&&0!==r?a:0,o=e,f=t.indexOf(e),d=o;o===(t[f]||u);)if(o++,o>a&&(o=r),f++,f===i&&(f=0),o===d)return void 0;return o},e.array.prev=function(e,t,n){for(var r,a=t.length,i=0!==n[0],u=a-1,o=0;a>o;o++){if(r=t[o],r===e)return r;if(!(e>r||0===r&&i&&n[1]<e))break;u=o}return t[u]},e.array.prevInvalid=function(e,t,n){for(var r=n[0],a=n[1],i=t.length,u=0===t[i-1]&&0!==r?a:0,o=e,f=t.indexOf(e),d=o;o===(t[f]||u);)if(o--,r>o&&(o=a),f--,-1===f&&(f=i-1),o===d)return void 0;return o},e.day=e.D={name:"day",range:86400,val:function(t){return t.D||(t.D=e.date.getDate.call(t))},isValid:function(t,n){return e.D.val(t)===(n||e.D.extent(t)[1])},extent:function(t){if(t.DExtent)return t.DExtent;var n=e.M.val(t),r=e.DAYS_IN_MONTH[n-1];return 2===n&&366===e.dy.extent(t)[1]&&(r+=1),t.DExtent=[1,r]},start:function(t){return t.DStart||(t.DStart=e.date.next(e.Y.val(t),e.M.val(t),e.D.val(t)))},end:function(t){return t.DEnd||(t.DEnd=e.date.prev(e.Y.val(t),e.M.val(t),e.D.val(t)))},next:function(t,n){n=n>e.D.extent(t)[1]?1:n;var r=e.date.nextRollover(t,n,e.D,e.M),a=e.D.extent(r)[1];return n=n>a?1:n||a,e.date.next(e.Y.val(r),e.M.val(r),n)},prev:function(t,n){var r=e.date.prevRollover(t,n,e.D,e.M),a=e.D.extent(r)[1];return e.date.prev(e.Y.val(r),e.M.val(r),n>a?a:n||a)}},e.dayOfWeekCount=e.dc={name:"day of week count",range:604800,val:function(t){return t.dc||(t.dc=Math.floor((e.D.val(t)-1)/7)+1)},isValid:function(t,n){return e.dc.val(t)===n||0===n&&e.D.val(t)>e.D.extent(t)[1]-7},extent:function(t){return t.dcExtent||(t.dcExtent=[1,Math.ceil(e.D.extent(t)[1]/7)])},start:function(t){return t.dcStart||(t.dcStart=e.date.next(e.Y.val(t),e.M.val(t),Math.max(1,7*(e.dc.val(t)-1)+1||1)))},end:function(t){return t.dcEnd||(t.dcEnd=e.date.prev(e.Y.val(t),e.M.val(t),Math.min(7*e.dc.val(t),e.D.extent(t)[1])))},next:function(t,n){n=n>e.dc.extent(t)[1]?1:n;var r=e.date.nextRollover(t,n,e.dc,e.M),a=e.dc.extent(r)[1];n=n>a?1:n;var i=e.date.next(e.Y.val(r),e.M.val(r),0===n?e.D.extent(r)[1]-6:1+7*(n-1));return i.getTime()<=t.getTime()?(r=e.M.next(t,e.M.val(t)+1),e.date.next(e.Y.val(r),e.M.val(r),0===n?e.D.extent(r)[1]-6:1+7*(n-1))):i},prev:function(t,n){var r=e.date.prevRollover(t,n,e.dc,e.M),a=e.dc.extent(r)[1];return n=n>a?a:n||a,e.dc.end(e.date.prev(e.Y.val(r),e.M.val(r),1+7*(n-1)))}},e.dayOfWeek=e.dw=e.d={name:"day of week",range:86400,val:function(t){return t.dw||(t.dw=e.date.getDay.call(t)+1)},isValid:function(t,n){return e.dw.val(t)===(n||7)},extent:function(){return[1,7]},start:function(t){return e.D.start(t)},end:function(t){return e.D.end(t)},next:function(t,n){return n=n>7?1:n||7,e.date.next(e.Y.val(t),e.M.val(t),e.D.val(t)+(n-e.dw.val(t))+(n<=e.dw.val(t)?7:0))},prev:function(t,n){return n=n>7?7:n||7,e.date.prev(e.Y.val(t),e.M.val(t),e.D.val(t)+(n-e.dw.val(t))+(n>=e.dw.val(t)?-7:0))}},e.dayOfYear=e.dy={name:"day of year",range:86400,val:function(t){return t.dy||(t.dy=Math.ceil(1+(e.D.start(t).getTime()-e.Y.start(t).getTime())/e.DAY))},isValid:function(t,n){return e.dy.val(t)===(n||e.dy.extent(t)[1])},extent:function(t){var n=e.Y.val(t);return t.dyExtent||(t.dyExtent=[1,n%4?365:366])},start:function(t){return e.D.start(t)},end:function(t){return e.D.end(t)},next:function(t,n){n=n>e.dy.extent(t)[1]?1:n;var r=e.date.nextRollover(t,n,e.dy,e.Y),a=e.dy.extent(r)[1];return n=n>a?1:n||a,e.date.next(e.Y.val(r),e.M.val(r),n)},prev:function(t,n){var r=e.date.prevRollover(t,n,e.dy,e.Y),a=e.dy.extent(r)[1];return n=n>a?a:n||a,e.date.prev(e.Y.val(r),e.M.val(r),n)}},e.hour=e.h={name:"hour",range:3600,val:function(t){return t.h||(t.h=e.date.getHour.call(t))},isValid:function(t,n){return e.h.val(t)===n},extent:function(){return[0,23]},start:function(t){return t.hStart||(t.hStart=e.date.next(e.Y.val(t),e.M.val(t),e.D.val(t),e.h.val(t)))},end:function(t){return t.hEnd||(t.hEnd=e.date.prev(e.Y.val(t),e.M.val(t),e.D.val(t),e.h.val(t)))},next:function(t,n){n=n>23?0:n;var r=e.date.next(e.Y.val(t),e.M.val(t),e.D.val(t)+(n<=e.h.val(t)?1:0),n);return!e.date.isUTC&&r.getTime()<=t.getTime()&&(r=e.date.next(e.Y.val(r),e.M.val(r),e.D.val(r),n+1)),r},prev:function(t,n){return n=n>23?23:n,e.date.prev(e.Y.val(t),e.M.val(t),e.D.val(t)+(n>=e.h.val(t)?-1:0),n)}},e.minute=e.m={name:"minute",range:60,val:function(t){return t.m||(t.m=e.date.getMin.call(t))},isValid:function(t,n){return e.m.val(t)===n},extent:function(){return[0,59]},start:function(t){return t.mStart||(t.mStart=e.date.next(e.Y.val(t),e.M.val(t),e.D.val(t),e.h.val(t),e.m.val(t)))},end:function(t){return t.mEnd||(t.mEnd=e.date.prev(e.Y.val(t),e.M.val(t),e.D.val(t),e.h.val(t),e.m.val(t)))},next:function(t,n){var r=e.m.val(t),a=e.s.val(t),i=n>59?60-r:r>=n?60-r+n:n-r,u=new Date(t.getTime()+i*e.MIN-a*e.SEC);return!e.date.isUTC&&u.getTime()<=t.getTime()&&(u=new Date(t.getTime()+(i+120)*e.MIN-a*e.SEC)),u},prev:function(t,n){return n=n>59?59:n,e.date.prev(e.Y.val(t),e.M.val(t),e.D.val(t),e.h.val(t)+(n>=e.m.val(t)?-1:0),n)}},e.month=e.M={name:"month",range:2629740,val:function(t){return t.M||(t.M=e.date.getMonth.call(t)+1)},isValid:function(t,n){return e.M.val(t)===(n||12)},extent:function(){return[1,12]},start:function(t){return t.MStart||(t.MStart=e.date.next(e.Y.val(t),e.M.val(t)))},end:function(t){return t.MEnd||(t.MEnd=e.date.prev(e.Y.val(t),e.M.val(t)))},next:function(t,n){return n=n>12?1:n||12,e.date.next(e.Y.val(t)+(n>e.M.val(t)?0:1),n)},prev:function(t,n){return n=n>12?12:n||12,e.date.prev(e.Y.val(t)-(n>=e.M.val(t)?1:0),n)}},e.second=e.s={name:"second",range:1,val:function(t){return t.s||(t.s=e.date.getSec.call(t))},isValid:function(t,n){return e.s.val(t)===n},extent:function(){return[0,59]},start:function(e){return e},end:function(e){return e},next:function(t,n){var r=e.s.val(t),a=n>59?60-r:r>=n?60-r+n:n-r,i=new Date(t.getTime()+a*e.SEC);return!e.date.isUTC&&i.getTime()<=t.getTime()&&(i=new Date(t.getTime()+(a+7200)*e.SEC)),i},prev:function(t,n){return n=n>59?59:n,e.date.prev(e.Y.val(t),e.M.val(t),e.D.val(t),e.h.val(t),e.m.val(t)+(n>=e.s.val(t)?-1:0),n)}},e.time=e.t={name:"time",range:1,val:function(t){return t.t||(t.t=3600*e.h.val(t)+60*e.m.val(t)+e.s.val(t))},isValid:function(t,n){return e.t.val(t)===n},extent:function(){return[0,86399]},start:function(e){return e},end:function(e){return e},next:function(t,n){n=n>86399?0:n;var r=e.date.next(e.Y.val(t),e.M.val(t),e.D.val(t)+(n<=e.t.val(t)?1:0),0,0,n);return!e.date.isUTC&&r.getTime()<t.getTime()&&(r=e.date.next(e.Y.val(r),e.M.val(r),e.D.val(r),e.h.val(r),e.m.val(r),n+7200)),r},prev:function(t,n){return n=n>86399?86399:n,e.date.next(e.Y.val(t),e.M.val(t),e.D.val(t)+(n>=e.t.val(t)?-1:0),0,0,n)}},e.weekOfMonth=e.wm={name:"week of month",range:604800,val:function(t){return t.wm||(t.wm=(e.D.val(t)+(e.dw.val(e.M.start(t))-1)+(7-e.dw.val(t)))/7)},isValid:function(t,n){return e.wm.val(t)===(n||e.wm.extent(t)[1])},extent:function(t){return t.wmExtent||(t.wmExtent=[1,(e.D.extent(t)[1]+(e.dw.val(e.M.start(t))-1)+(7-e.dw.val(e.M.end(t))))/7])},start:function(t){return t.wmStart||(t.wmStart=e.date.next(e.Y.val(t),e.M.val(t),Math.max(e.D.val(t)-e.dw.val(t)+1,1)))},end:function(t){return t.wmEnd||(t.wmEnd=e.date.prev(e.Y.val(t),e.M.val(t),Math.min(e.D.val(t)+(7-e.dw.val(t)),e.D.extent(t)[1])))},next:function(t,n){n=n>e.wm.extent(t)[1]?1:n;var r=e.date.nextRollover(t,n,e.wm,e.M),a=e.wm.extent(r)[1];return n=n>a?1:n||a,e.date.next(e.Y.val(r),e.M.val(r),Math.max(1,7*(n-1)-(e.dw.val(r)-2)))},prev:function(t,n){var r=e.date.prevRollover(t,n,e.wm,e.M),a=e.wm.extent(r)[1];return n=n>a?a:n||a,e.wm.end(e.date.next(e.Y.val(r),e.M.val(r),Math.max(1,7*(n-1)-(e.dw.val(r)-2))))}},e.weekOfYear=e.wy={name:"week of year (ISO)",range:604800,val:function(t){if(t.wy)return t.wy;var n=e.dw.next(e.wy.start(t),5),r=e.dw.next(e.Y.prev(n,e.Y.val(n)-1),5);return t.wy=1+Math.ceil((n.getTime()-r.getTime())/e.WEEK)},isValid:function(t,n){return e.wy.val(t)===(n||e.wy.extent(t)[1])},extent:function(t){if(t.wyExtent)return t.wyExtent;var n=e.dw.next(e.wy.start(t),5),r=e.dw.val(e.Y.start(n)),a=e.dw.val(e.Y.end(n));return t.wyExtent=[1,5===r||5===a?53:52]},start:function(t){return t.wyStart||(t.wyStart=e.date.next(e.Y.val(t),e.M.val(t),e.D.val(t)-(e.dw.val(t)>1?e.dw.val(t)-2:6)))},end:function(t){return t.wyEnd||(t.wyEnd=e.date.prev(e.Y.val(t),e.M.val(t),e.D.val(t)+(e.dw.val(t)>1?8-e.dw.val(t):0)))},next:function(t,n){n=n>e.wy.extent(t)[1]?1:n;var r=e.dw.next(e.wy.start(t),5),a=e.date.nextRollover(r,n,e.wy,e.Y);1!==e.wy.val(a)&&(a=e.dw.next(a,2));var i=e.wy.extent(a)[1],u=e.wy.start(a);return n=n>i?1:n||i,e.date.next(e.Y.val(u),e.M.val(u),e.D.val(u)+7*(n-1))},prev:function(t,n){var r=e.dw.next(e.wy.start(t),5),a=e.date.prevRollover(r,n,e.wy,e.Y);1!==e.wy.val(a)&&(a=e.dw.next(a,2));var i=e.wy.extent(a)[1],u=e.wy.end(a);return n=n>i?i:n||i,e.wy.end(e.date.next(e.Y.val(u),e.M.val(u),e.D.val(u)+7*(n-1)))}},e.year=e.Y={name:"year",range:31556900,val:function(t){return t.Y||(t.Y=e.date.getYear.call(t))},isValid:function(t,n){return e.Y.val(t)===n},extent:function(){return[1970,2099]},start:function(t){return t.YStart||(t.YStart=e.date.next(e.Y.val(t)))},end:function(t){return t.YEnd||(t.YEnd=e.date.prev(e.Y.val(t)))},next:function(t,n){return n>e.Y.val(t)&&n<=e.Y.extent()[1]?e.date.next(n):e.NEVER},prev:function(t,n){return n<e.Y.val(t)&&n>=e.Y.extent()[0]?e.date.prev(n):e.NEVER}},e.fullDate=e.fd={name:"full date",range:1,val:function(e){return e.fd||(e.fd=e.getTime())},isValid:function(t,n){return e.fd.val(t)===n},extent:function(){return[0,3250368e7]},start:function(e){return e},end:function(e){return e},next:function(t,n){return e.fd.val(t)<n?new Date(n):e.NEVER},prev:function(t,n){return e.fd.val(t)>n?new Date(n):e.NEVER}},e.modifier={},e.modifier.after=e.modifier.a=function(e,t){var n=t[0];return{name:"after "+e.name,range:(e.extent(new Date)[1]-n)*e.range,val:e.val,isValid:function(e){return this.val(e)>=n},extent:e.extent,start:e.start,end:e.end,next:function(t,r){return r!=n&&(r=e.extent(t)[0]),e.next(t,r)},prev:function(t,r){return r=r===n?e.extent(t)[1]:n-1,e.prev(t,r)}}},e.modifier.before=e.modifier.b=function(e,t){var n=t[t.length-1];return{name:"before "+e.name,range:e.range*(n-1),val:e.val,isValid:function(e){return this.val(e)<n},extent:e.extent,start:e.start,end:e.end,next:function(t,r){return r=r===n?e.extent(t)[0]:n,e.next(t,r)},prev:function(t,r){return r=r===n?n-1:e.extent(t)[1],e.prev(t,r)}}},e.compile=function(t){function n(e){return"next"===e?function(e,t){return e.getTime()>t.getTime()}:function(e,t){return t.getTime()>e.getTime()}}var r,a=[],i=0;for(var u in t){var o=u.split("_"),f=o[0],d=o[1],v=t[u],l=d?e.modifier[d](e[f],v):e[f];a.push({constraint:l,vals:v}),i++}return a.sort(function(e,t){var n=e.constraint.range,r=t.constraint.range;return n>r?-1:r>n?1:0}),r=a[i-1].constraint,{start:function(t,n){for(var u,o=n,f=e.array[t],d=1e3;d--&&!u&&o;){u=!0;for(var v=0;i>v;v++){var l=a[v].constraint,c=l.val(o),s=l.extent(o),m=f(c,a[v].vals,s);if(!l.isValid(o,m)){o=l[t](o,m),u=!1;break}}}return o!==e.NEVER&&(o="next"===t?r.start(o):r.end(o)),o},end:function(t,r){for(var u,o=e.array[t+"Invalid"],f=n(t),d=i-1;d>=0;d--){var v,l=a[d].constraint,c=l.val(r),s=l.extent(r),m=o(c,a[d].vals,s);void 0!==m&&(v=l[t](r,m),!v||u&&!f(u,v)||(u=v))}return u},tick:function(t,n){return new Date("next"===t?r.end(n).getTime()+e.SEC:r.start(n).getTime()-e.SEC)},tickStart:function(e){return r.start(e)}}},e.schedule=function(t){function n(t,n,x,g,p){var M,D,b,Y=s(t),k=n,E=1e3,T=[],O=[],S=[],N="next"===t,R=N?0:1,C=N?1:0;if(x=x?new Date(x):new Date,!x||!x.getTime())throw new Error("Invalid start date.");for(a(t,h,T,x),u(t,w,O,x);E--&&k&&(M=m(T,Y))&&(!g||!Y(M,g));)if(y&&(o(t,w,O,M),D=v(t,O,M)))i(t,h,T,D);else{if(p){var V=l(O,Y);if(D=c(t,h,T,M,V),r=N?[new Date(Math.max(x,M)),D?new Date(g?Math.min(D,g):D):void 0]:[D?new Date(g?Math.max(g,D.getTime()+e.SEC):D.getTime()+e.SEC):void 0,new Date(Math.min(x,M.getTime()+e.SEC))],b&&r[R].getTime()===b[C].getTime()?(b[C]=r[C],k++):(b=r,S.push(b)),!D)break;i(t,h,T,D)}else S.push(N?new Date(Math.max(x,M)):d(h,T,M,g)),f(t,h,T,M);k--}return 0===S.length?e.NEVER:1===n?S[0]:S}function a(e,t,n,r){for(var a=0,i=t.length;i>a;a++)n[a]=t[a].start(e,r)}function i(e,t,n,r){for(var a=s(e),i=0,u=t.length;u>i;i++)n[i]&&!a(n[i],r)&&(n[i]=t[i].start(e,r))}function u(t,n,r,a){s(t);for(var i=0,u=n.length;u>i;i++){var o=n[i].start(t,a);r[i]=o?[o,n[i].end(t,o)]:e.NEVER}}function o(t,n,r,a){for(var i=s(t),u=0,o=n.length;o>u;u++)if(r[u]&&!i(r[u][0],a)){var f=n[u].start(t,a);r[u]=f?[f,n[u].end(t,f)]:e.NEVER}}function f(e,t,n,r){for(var a=0,i=t.length;i>a;a++)n[a]&&n[a].getTime()===r.getTime()&&(n[a]=t[a].start(e,t[a].tick(e,r)))}function d(e,t,n,r){for(var a,i=0,u=t.length;u>i;i++)if(t[i]&&t[i].getTime()===n.getTime()){var o=e[i].tickStart(n);if(r&&r>o)return r;(!a||o>a)&&(a=o)}return a}function v(e,t,n){for(var r,a=s(e),i=0,u=t.length;u>i;i++){var o=t[i];!o||a(o[0],n)||o[1]&&!a(o[1],n)||(!r||a(o[1],r))&&(r=o[1])}return r}function l(e,t){for(var n,r=0,a=e.length;a>r;r++)!e[r]||n&&!t(n,e[r][0])||(n=e[r][0]);return n}function c(e,t,n,r,a){for(var i,u=s(e),o=0,f=t.length;f>o;o++){var d=n[o];if(d&&d.getTime()===r.getTime()){var v=t[o].end(e,d);if(a&&(!v||u(v,a)))return a;(!i||u(v,i))&&(i=v)}}return i}function s(e){return"next"===e?function(e,t){return!t||e.getTime()>t.getTime()}:function(e,t){return!e||t.getTime()>e.getTime()}}function m(e,t){for(var n=e[0],r=1,a=e.length;a>r;r++)e[r]&&t(n,e[r])&&(n=e[r]);return n}if(!t)throw new Error("Missing schedule definition.");if(!t.schedules)throw new Error("Definition must include at least one schedule.");for(var h=[],x=t.schedules.length,w=[],y=t.exceptions?t.exceptions.length:0,g=0;x>g;g++)h.push(e.compile(t.schedules[g]));for(var p=0;y>p;p++)w.push(e.compile(t.exceptions[p]));return{isValid:function(t){return n("next",1,t,t)!==e.NEVER},next:function(e,t,r){return n("next",e||1,t,r)},prev:function(e,t,r){return n("prev",e||1,t,r)},nextRange:function(e,t,r){return n("next",e||1,t,r,!0)},prevRange:function(e,t,r){return n("prev",e||1,t,r,!0)}}},e.setTimeout=function(t,n){function r(){var e=Date.now(),n=i.next(2,e),u=n[0].getTime()-e;1e3>u&&(u=n[1].getTime()-e),a=2147483647>u?setTimeout(t,u):setTimeout(r,2147483647)}var a,i=e.schedule(n);return r(),{clear:function(){clearTimeout(a)}}},e.setInterval=function(t,n){function r(){i||(t(),a=e.setTimeout(r,n))}var a=e.setTimeout(r,n),i=!1;return{clear:function(){i=!0,a.clear()}}},e.date={},e.date.timezone=function(t){e.date.build=t?function(e,t,n,r,a,i){return new Date(e,t,n,r,a,i)}:function(e,t,n,r,a,i){return new Date(Date.UTC(e,t,n,r,a,i))};var n=t?"get":"getUTC",r=Date.prototype;e.date.getYear=r[n+"FullYear"],e.date.getMonth=r[n+"Month"],e.date.getDate=r[n+"Date"],e.date.getDay=r[n+"Day"],e.date.getHour=r[n+"Hours"],e.date.getMin=r[n+"Minutes"],e.date.getSec=r[n+"Seconds"],e.date.isUTC=!t},e.date.UTC=function(){e.date.timezone(!1)},e.date.localTime=function(){e.date.timezone(!0)},e.date.UTC(),e.SEC=1e3,e.MIN=60*e.SEC,e.HOUR=60*e.MIN,e.DAY=24*e.HOUR,e.WEEK=7*e.DAY,e.DAYS_IN_MONTH=[31,28,31,30,31,30,31,31,30,31,30,31],e.NEVER=0,e.date.next=function(t,n,r,a,i,u){return e.date.build(t,void 0!==n?n-1:0,void 0!==r?r:1,a||0,i||0,u||0)},e.date.nextRollover=function(t,n,r,a){var i=r.val(t),u=r.extent(t)[1];return i>=(n||u)||n>u?new Date(a.end(t).getTime()+e.SEC):a.start(t)},e.date.prev=function(t,n,r,a,i,u){var o=arguments.length;return n=2>o?11:n-1,r=3>o?e.D.extent(e.date.next(t,n+1))[1]:r,a=4>o?23:a,i=5>o?59:i,u=6>o?59:u,e.date.build(t,n,r,a,i,u)},e.date.prevRollover=function(e,t,n,r){var a=n.val(e);return t>=a||!t?r.start(r.prev(e,r.val(e)-1)):r.start(e)},e.parse={},e.parse.cron=function(e,t){function n(e,t){return isNaN(e)?c[e]||null:+e+(t||0)}function r(e){var t,n={};for(t in e)"dc"!==t&&"d"!==t&&(n[t]=e[t].slice(0));return n}function a(e,t,n,r,a){var i=n;for(e[t]||(e[t]=[]);r>=i;)e[t].indexOf(i)<0&&e[t].push(i),i+=a||1}function i(e,t,n,i){(t.d&&!t.dc||t.dc&&t.dc.indexOf(i)<0)&&(e.push(r(t)),t=e[e.length-1]),a(t,"d",n,n),a(t,"dc",i,i)}function u(e,t,n){var r={},i={};1===n?(a(t,"D",1,3),a(t,"d",c.MON,c.FRI),a(r,"D",2,2),a(r,"d",c.TUE,c.FRI),a(i,"D",3,3),a(i,"d",c.TUE,c.FRI)):(a(t,"D",n-1,n+1),a(t,"d",c.MON,c.FRI),a(r,"D",n-1,n-1),a(r,"d",c.MON,c.THU),a(i,"D",n+1,n+1),a(i,"d",c.TUE,c.FRI)),e.exceptions.push(r),e.exceptions.push(i)}function o(e,t,r,i,u,o){var f=e.split("/"),d=+f[1],v=f[0];if("*"!==v&&"0"!==v){var l=v.split("-");i=n(l[0],o),u=n(l[1],o)||u}a(t,r,i,u,d)}function f(e,t,r,f,d,v){var l,c,s=t.schedules,m=s[s.length-1];"L"===e&&(e=f-1),null!==(l=n(e,v))?a(m,r,l,l):null!==(l=n(e.replace("W",""),v))?u(t,m,l):null!==(l=n(e.replace("L",""),v))?i(s,m,l,f-1):2===(c=e.split("#")).length?(l=n(c[0],v),i(s,m,l,n(c[1]))):o(e,m,r,f,d,v)}function d(e){return e.indexOf("#")>-1||e.indexOf("L")>0}function v(e,t){return d(e)&&!d(t)?1:0}function l(e){"* * * * * *"===e&&(e="0/1 * * * * *");var t,n,r,a,i={schedules:[{}],exceptions:[]},u=e.split(" ");for(t in s)if(n=s[t],r=u[n[0]],r&&"*"!==r&&"?"!==r){a=r.split(",").sort(v);var o,d=a.length;for(o=0;d>o;o++)f(a[o],i,t,n[1],n[2],n[3])}return i}var c={JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12,SUN:1,MON:2,TUE:3,WED:4,THU:5,FRI:6,SAT:7},s={s:[0,0,59],m:[1,0,59],h:[2,0,23],D:[3,1,31],M:[4,1,12],Y:[6,1970,2099],d:[5,1,7,1]},m=e.toUpperCase();return l(t?m:"0 "+m)},e.parse.recur=function(){function t(e,t,l){if(e=u?e+"_"+u:e,n||(s.push({}),n=s[0]),n[e]||(n[e]=[]),r=n[e],i){for(a=[],d=t;l>=d;d+=i)a.push(d);v={n:e,x:i,c:r.length,m:l}}a=o?[t]:f?[l]:a;var c=a.length;for(d=0;c>d;d+=1){var m=a[d];r.indexOf(m)<0&&r.push(m)}a=i=u=o=f=0}var n,r,a,i,u,o,f,d,v,l=[],c=[],s=l;return{schedules:l,exceptions:c,on:function(){return a=arguments[0]instanceof Array?arguments[0]:arguments,this},every:function(e){return i=e||1,this},after:function(e){return u="a",a=[e],this},before:function(e){return u="b",a=[e],this},first:function(){return o=1,this},last:function(){return f=1,this},time:function(){for(var e=0,n=a.length;n>e;e++){var r=a[e].split(":");r.length<3&&r.push(0),a[e]=3600*+r[0]+60*+r[1]+ +r[2]}return t("t"),this},second:function(){return t("s",0,59),this},minute:function(){return t("m",0,59),this},hour:function(){return t("h",0,23),this},dayOfMonth:function(){return t("D",1,f?0:31),this},dayOfWeek:function(){return t("d",1,7),this},onWeekend:function(){return a=[1,7],this.dayOfWeek()},onWeekday:function(){return a=[2,3,4,5,6],this.dayOfWeek()},dayOfWeekCount:function(){return t("dc",1,f?0:5),this},dayOfYear:function(){return t("dy",1,f?0:366),this},weekOfMonth:function(){return t("wm",1,f?0:5),this},weekOfYear:function(){return t("wy",1,f?0:53),this},month:function(){return t("M",1,12),this},year:function(){return t("Y",1970,2450),this},fullDate:function(){for(var e=0,n=a.length;n>e;e++)a[e]=a[e].getTime();return t("fd"),this},customModifier:function(t){var n=e.modifier[t];if(!n)throw new Error("Custom modifier "+t+" not recognized!");return u=t,a=arguments[1]instanceof Array?arguments[1]:[arguments[1]],this},customPeriod:function(n){var r=e[n];if(!r)throw new Error("Custom time period "+n+" not recognized!");return t(n,r.extent(new Date)[0],r.extent(new Date)[1]),this},startingOn:function(e){return this.between(e,v.m)},between:function(e,r){return n[v.n]=n[v.n].splice(0,v.c),i=v.x,t(v.n,e,r),this},and:function(){return n=s[s.push({})-1],this},except:function(){return s=c,n=null,this}}},e.parse.text=function(t){function n(e,t,n,r){return{startPos:e,endPos:t,text:n,type:r}}function r(e){var t,r,a,i,u,o,f=e instanceof Array?e:[e],d=/\s+/;for(f.push(d),u=w;!t||t.type===d;){o=-1,r=y.substring(u),t=n(u,u,y.split(d)[0]);var v,l=f.length;for(v=0;l>v;v++)i=f[v],a=i.exec(r),a&&0===a.index&&a[0].length>o&&(o=a[0].length,t=n(u,u+o,r.substring(0,o),i));t.type===d&&(u=t.endPos)}return t}function a(e){var t=r(e);return w=t.endPos,t}function i(e){for(var t=+s(e),n=l(g.through)?+s(e):t,r=[],a=t;n>=a;a++)r.push(a);return r}function u(e){for(var t=i(e);l(g.and);)t=t.concat(i(e));return t}function o(e){var t,n,r,a;l(g.weekend)?e.on(p.sun,p.sat).dayOfWeek():l(g.weekday)?e.on(p.mon,p.tue,p.wed,p.thu,p.fri).dayOfWeek():(t=s(g.rank),e.every(t),n=v(e),l(g.start)?(t=s(g.rank),e.startingOn(t),c(n.type)):l(g.between)&&(r=s(g.rank),l(g.and)&&(a=s(g.rank),e.between(r,a))))}function f(e){l(g.first)?e.first():l(g.last)?e.last():e.on(u(g.rank)),v(e)}function d(e){w=0,y=e,h=-1;for(var t=x();w<y.length&&0>h;){var n=c([g.every,g.after,g.before,g.onthe,g.on,g.of,g["in"],g.at,g.and,g.except,g.also]);switch(n.type){case g.every:o(t);break;case g.after:void 0!==r(g.time).type?(t.after(s(g.time)),t.time()):(t.after(s(g.rank)),v(t));break;case g.before:void 0!==r(g.time).type?(t.before(s(g.time)),t.time()):(t.before(s(g.rank)),v(t));break;case g.onthe:f(t);break;case g.on:t.on(u(g.dayName)).dayOfWeek();break;case g.of:t.on(u(g.monthName)).month();break;case g["in"]:t.on(u(g.yearIndex)).year();break;case g.at:for(t.on(s(g.time)).time();l(g.and);)t.on(s(g.time)).time();break;case g.and:break;case g.also:t.and();break;case g.except:t.except();break;default:h=w}}return{schedules:t.schedules,exceptions:t.exceptions,error:h}}function v(e){var t=c([g.second,g.minute,g.hour,g.dayOfYear,g.dayOfWeek,g.dayInstance,g.day,g.month,g.year,g.weekOfMonth,g.weekOfYear]);switch(t.type){case g.second:e.second();break;case g.minute:e.minute();break;case g.hour:e.hour();break;case g.dayOfYear:e.dayOfYear();break;case g.dayOfWeek:e.dayOfWeek();break;case g.dayInstance:e.dayOfWeekCount();break;case g.day:e.dayOfMonth();break;case g.weekOfMonth:e.weekOfMonth();break;case g.weekOfYear:e.weekOfYear();break;case g.month:e.month();break;case g.year:e.year();break;default:h=w}return t}function l(e){var t=r(e).type===e;return t&&a(e),t}function c(e){var t=a(e);return t.type?t.text=m(t.text,e):h=w,t}function s(e){return c(e).text}function m(e,t){var n=e;switch(t){case g.time:var r=e.split(/(:|am|pm)/),a="pm"===r[3]&&r[0]<12?parseInt(r[0],10)+12:r[0],i=r[2].trim();n=(1===a.length?"0":"")+a+":"+i;break;case g.rank:n=parseInt(/^\d+/.exec(e)[0],10);break;case g.monthName:case g.dayName:n=p[e.substring(0,3)]}return n}var h,x=e.parse.recur,w=0,y="",g={eof:/^$/,rank:/^((\d\d\d\d)|([2-5]?1(st)?|[2-5]?2(nd)?|[2-5]?3(rd)?|(0|[1-5]?[4-9]|[1-5]0|1[1-3])(th)?))\b/,time:/^((([0]?[1-9]|1[0-2]):[0-5]\d(\s)?(am|pm))|(([0]?\d|1\d|2[0-3]):[0-5]\d))\b/,dayName:/^((sun|mon|tue(s)?|wed(nes)?|thu(r(s)?)?|fri|sat(ur)?)(day)?)\b/,monthName:/^(jan(uary)?|feb(ruary)?|ma((r(ch)?)?|y)|apr(il)?|ju(ly|ne)|aug(ust)?|oct(ober)?|(sept|nov|dec)(ember)?)\b/,yearIndex:/^(\d\d\d\d)\b/,every:/^every\b/,after:/^after\b/,before:/^before\b/,second:/^(s|sec(ond)?(s)?)\b/,minute:/^(m|min(ute)?(s)?)\b/,hour:/^(h|hour(s)?)\b/,day:/^(day(s)?( of the month)?)\b/,dayInstance:/^day instance\b/,dayOfWeek:/^day(s)? of the week\b/,dayOfYear:/^day(s)? of the year\b/,weekOfYear:/^week(s)?( of the year)?\b/,weekOfMonth:/^week(s)? of the month\b/,weekday:/^weekday\b/,weekend:/^weekend\b/,month:/^month(s)?\b/,year:/^year(s)?\b/,between:/^between (the)?\b/,start:/^(start(ing)? (at|on( the)?)?)\b/,at:/^(at|@)\b/,and:/^(,|and\b)/,except:/^(except\b)/,also:/(also)\b/,first:/^(first)\b/,last:/^last\b/,"in":/^in\b/,of:/^of\b/,onthe:/^on the\b/,on:/^on\b/,through:/(-|^(to|through)\b)/},p={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12,sun:1,mon:2,tue:3,wed:4,thu:5,fri:6,sat:7,"1st":1,fir:1,"2nd":2,sec:2,"3rd":3,thi:3,"4th":4,"for":4};return d(t.toLowerCase())},e}();
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the 
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

/*
 * jQuery gentleSelect plugin (version 0.1.4)
 * http://shawnchin.github.com/jquery-cron
 *
 * Copyright (c) 2010-2013 Shawn Chin.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Requires:
 * - jQuery
 *
 * Usage:
 *  (JS)
 *
 *  // initialise like this
 *  var c = $('#cron').cron({
 *    initial: '9 10 * * *', # Initial value. default = "* * * * *"
 *    url_set: '/set/', # POST expecting {"cron": "12 10 * * 6"}
 *  });
 *
 *  // you can update values later
 *  c.cron("value", "1 2 3 4 *");
 *
 * // you can also get the current value using the "value" option
 * alert(c.cron("value"));
 *
 *  (HTML)
 *  <div id='cron'></div>
 *
 * Notes:
 * At this stage, we only support a subset of possible cron options.
 * For example, each cron entry can only be digits or "*", no commas
 * to denote multiple entries. We also limit the allowed combinations:
 * - Every minute : * * * * *
 * - Every hour   : ? * * * *
 * - Every day    : ? ? * * *
 * - Every week   : ? ? * * ?
 * - Every month  : ? ? ? * *
 * - Every year   : ? ? ? ? *
 */
(function($) {

    var defaults = {
        initial : "* * * * *",
        minuteOpts : {
            minWidth  : 100, // only applies if columns and itemWidth not set
            itemWidth : 30,
            columns   : 4,
            rows      : undefined,
            title     : "Minutes Past the Hour"
        },
        timeHourOpts : {
            minWidth  : 100, // only applies if columns and itemWidth not set
            itemWidth : 20,
            columns   : 2,
            rows      : undefined,
            title     : "Time: Hour"
        },
        domOpts : {
            minWidth  : 100, // only applies if columns and itemWidth not set
            itemWidth : 30,
            columns   : undefined,
            rows      : 10,
            title     : "Day of Month"
        },
        monthOpts : {
            minWidth  : 100, // only applies if columns and itemWidth not set
            itemWidth : 100,
            columns   : 2,
            rows      : undefined,
            title     : undefined
        },
        dowOpts : {
            minWidth  : 100, // only applies if columns and itemWidth not set
            itemWidth : undefined,
            columns   : undefined,
            rows      : undefined,
            title     : undefined
        },
        timeMinuteOpts : {
            minWidth  : 100, // only applies if columns and itemWidth not set
            itemWidth : 20,
            columns   : 4,
            rows      : undefined,
            title     : "Time: Minute"
        },
        effectOpts : {
            openSpeed      : 400,
            closeSpeed     : 400,
            openEffect     : "slide",
            closeEffect    : "slide",
            hideOnMouseOut : true
        },
        url_set : undefined,
        customValues : undefined,
        onChange: undefined, // callback function each time value changes
        useGentleSelect: false
    };

    // -------  build some static data -------

    // options for minutes in an hour
    var str_opt_mih = "";
    for (var i = 0; i < 60; i++) {
        var j = (i < 10)? "0":"";
        str_opt_mih += "<option value='"+i+"'>" + j +  i + "</option>\n";
    }

    // options for hours in a day
    var str_opt_hid = "";
    for (var i = 0; i < 24; i++) {
        var j = (i < 10)? "0":"";
        str_opt_hid += "<option value='"+i+"'>" + j + i + "</option>\n";
    }

    // options for days of month
    var str_opt_dom = "";
    for (var i = 1; i < 32; i++) {
        if (i == 1 || i == 21 || i == 31) { var suffix = "st"; }
        else if (i == 2 || i == 22) { var suffix = "nd"; }
        else if (i == 3 || i == 23) { var suffix = "rd"; }
        else { var suffix = "th"; }
        str_opt_dom += "<option value='"+i+"'>" + i + suffix + "</option>\n";
    }

    // options for months
    var str_opt_month = "";
    var months = ["January", "February", "March", "April",
                  "May", "June", "July", "August",
                  "September", "October", "November", "December"];
    for (var i = 0; i < months.length; i++) {
        str_opt_month += "<option value='"+(i+1)+"'>" + months[i] + "</option>\n";
    }

    // options for day of week
    var str_opt_dow = "";
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                "Friday", "Saturday"];
    for (var i = 0; i < days.length; i++) {
        str_opt_dow += "<option value='"+i+"'>" + days[i] + "</option>\n";
    }

    // options for period
    var str_opt_period = "";
    var periods = ["minute", "hour", "day", "week", "month", "year"];
    for (var i = 0; i < periods.length; i++) {
        str_opt_period += "<option value='"+periods[i]+"'>" + periods[i] + "</option>\n";
    }

    // display matrix
    var toDisplay = {
        "minute" : [],
        "hour"   : ["mins"],
        "day"    : ["time"],
        "week"   : ["dow", "time"],
        "month"  : ["dom", "time"],
        "year"   : ["dom", "month", "time"]
    };

    var combinations = {
        "minute" : /^(\*\s){4}\*$/,                    // "* * * * *"
        "hour"   : /^\d{1,2}\s(\*\s){3}\*$/,           // "? * * * *"
        "day"    : /^(\d{1,2}\s){2}(\*\s){2}\*$/,      // "? ? * * *"
        "week"   : /^(\d{1,2}\s){2}(\*\s){2}\d{1,2}$/, // "? ? * * ?"
        "month"  : /^(\d{1,2}\s){3}\*\s\*$/,           // "? ? ? * *"
        "year"   : /^(\d{1,2}\s){4}\*$/                // "? ? ? ? *"
    };

    // ------------------ internal functions ---------------
    function defined(obj) {
        if (typeof obj == "undefined") { return false; }
        else { return true; }
    }

    function undefinedOrObject(obj) {
        return (!defined(obj) || typeof obj == "object")
    }

    function getCronType(cron_str) {
        // check format of initial cron value
        var valid_cron = /^((\d{1,2}|\*)\s){4}(\d{1,2}|\*)$/
        if (typeof cron_str != "string" || !valid_cron.test(cron_str)) {
            $.error("cron: invalid initial value");
            return undefined;
        }
        // check actual cron values
        var d = cron_str.split(" ");
        //            mm, hh, DD, MM, DOW
        var minval = [ 0,  0,  1,  1,  0];
        var maxval = [59, 23, 31, 12,  6];
        for (var i = 0; i < d.length; i++) {
            if (d[i] == "*") continue;
            var v = parseInt(d[i]);
            if (defined(v) && v <= maxval[i] && v >= minval[i]) continue;

            $.error("cron: invalid value found (col "+(i+1)+") in " + o.initial);
            return undefined;
        }

        // determine combination
        for (var t in combinations) {
            if (combinations[t].test(cron_str)) { return t; }
        }

        // unknown combination
        $.error("cron: valid but unsupported cron format. sorry.");
        return undefined;
    }

    function hasError(c, o) {
        if (!defined(getCronType(o.initial))) { return true; }
        if (!undefinedOrObject(o.customValues)) { return true; }
        return false;
    }

    function getCurrentValue(c) {
        var b = c.data("block");
        var min = hour = day = month = dow = "*";
        var selectedPeriod = b["period"].find("select").val();
        switch (selectedPeriod) {
            case "minute":
                break;

            case "hour":
                min = b["mins"].find("select").val();
                break;

            case "day":
                min  = b["time"].find("select.cron-time-min").val();
                hour = b["time"].find("select.cron-time-hour").val();
                break;

            case "week":
                min  = b["time"].find("select.cron-time-min").val();
                hour = b["time"].find("select.cron-time-hour").val();
                dow  =  b["dow"].find("select").val();
                break;

            case "month":
                min  = b["time"].find("select.cron-time-min").val();
                hour = b["time"].find("select.cron-time-hour").val();
                day  = b["dom"].find("select").val();
                break;

            case "year":
                min  = b["time"].find("select.cron-time-min").val();
                hour = b["time"].find("select.cron-time-hour").val();
                day  = b["dom"].find("select").val();
                month = b["month"].find("select").val();
                break;

            default:
                // we assume this only happens when customValues is set
                return selectedPeriod;
        }
        return [min, hour, day, month, dow].join(" ");
    }

    // -------------------  PUBLIC METHODS -----------------

    var methods = {
        init : function(opts) {

            // init options
            var options = opts ? opts : {}; /* default to empty obj */
            var o = $.extend([], defaults, options);
            var eo = $.extend({}, defaults.effectOpts, options.effectOpts);
            $.extend(o, {
                minuteOpts     : $.extend({}, defaults.minuteOpts, eo, options.minuteOpts),
                domOpts        : $.extend({}, defaults.domOpts, eo, options.domOpts),
                monthOpts      : $.extend({}, defaults.monthOpts, eo, options.monthOpts),
                dowOpts        : $.extend({}, defaults.dowOpts, eo, options.dowOpts),
                timeHourOpts   : $.extend({}, defaults.timeHourOpts, eo, options.timeHourOpts),
                timeMinuteOpts : $.extend({}, defaults.timeMinuteOpts, eo, options.timeMinuteOpts)
            });

            // error checking
            if (hasError(this, o)) { return this; }

            // ---- define select boxes in the right order -----

            var block = [], custom_periods = "", cv = o.customValues;
            if (defined(cv)) { // prepend custom values if specified
                for (var key in cv) {
                    custom_periods += "<option value='" + cv[key] + "'>" + key + "</option>\n";
                }
            }

            block["period"] = $("<span class='cron-period'>"
                    + "Every <select name='cron-period'>" + custom_periods
                    + str_opt_period + "</select> </span>")
                .appendTo(this)
                .data("root", this);

            var select = block["period"].find("select");
            select.bind("change.cron", event_handlers.periodChanged)
                  .data("root", this);
            if (o.useGentleSelect) select.gentleSelect(eo);

            block["dom"] = $("<span class='cron-block cron-block-dom'>"
                    + " on the <select name='cron-dom'>" + str_opt_dom
                    + "</select> </span>")
                .appendTo(this)
                .data("root", this);

            select = block["dom"].find("select").data("root", this);
            if (o.useGentleSelect) select.gentleSelect(o.domOpts);

            block["month"] = $("<span class='cron-block cron-block-month'>"
                    + " of <select name='cron-month'>" + str_opt_month
                    + "</select> </span>")
                .appendTo(this)
                .data("root", this);

            select = block["month"].find("select").data("root", this);
            if (o.useGentleSelect) select.gentleSelect(o.monthOpts);

            block["mins"] = $("<span class='cron-block cron-block-mins'>"
                    + " at <select name='cron-mins'>" + str_opt_mih
                    + "</select> minutes past the hour </span>")
                .appendTo(this)
                .data("root", this);

            select = block["mins"].find("select").data("root", this);
            if (o.useGentleSelect) select.gentleSelect(o.minuteOpts);

            block["dow"] = $("<span class='cron-block cron-block-dow'>"
                    + " on <select name='cron-dow'>" + str_opt_dow
                    + "</select> </span>")
                .appendTo(this)
                .data("root", this);

            select = block["dow"].find("select").data("root", this);
            if (o.useGentleSelect) select.gentleSelect(o.dowOpts);

            block["time"] = $("<span class='cron-block cron-block-time'>"
                    + " at <select name='cron-time-hour' class='cron-time-hour'>" + str_opt_hid
                    + "</select>:<select name='cron-time-min' class='cron-time-min'>" + str_opt_mih
                    + " </span>")
                .appendTo(this)
                .data("root", this);

            select = block["time"].find("select.cron-time-hour").data("root", this);
            if (o.useGentleSelect) select.gentleSelect(o.timeHourOpts);
            select = block["time"].find("select.cron-time-min").data("root", this);
            if (o.useGentleSelect) select.gentleSelect(o.timeMinuteOpts);

            block["controls"] = $("<span class='cron-controls'>&laquo; save "
                    + "<span class='cron-button cron-button-save'></span>"
                    + " </span>")
                .appendTo(this)
                .data("root", this)
                .find("span.cron-button-save")
                    .bind("click.cron", event_handlers.saveClicked)
                    .data("root", this)
                    .end();

            this.find("select").bind("change.cron-callback", event_handlers.somethingChanged);
            this.data("options", o).data("block", block); // store options and block pointer
            this.data("current_value", o.initial); // remember base value to detect changes

            return methods["value"].call(this, o.initial); // set initial value
        },

        value : function(cron_str) {
            // when no args, act as getter
            if (!cron_str) { return getCurrentValue(this); }

            var t = getCronType(cron_str);
            if (!defined(t)) { return false; }

            var block = this.data("block");
            var d = cron_str.split(" ");
            var v = {
                "mins"  : d[0],
                "hour"  : d[1],
                "dom"   : d[2],
                "month" : d[3],
                "dow"   : d[4]
            };

            // is gentleSelect enabled
            var useGentleSelect = this.data('options').useGentleSelect;

            // update appropriate select boxes
            var targets = toDisplay[t];
            for (var i = 0; i < targets.length; i++) {
                var tgt = targets[i];
                if (tgt == "time") {
                    var btgt = block[tgt].find("select.cron-time-hour").val(v["hour"]);
                    if (useGentleSelect) btgt.gentleSelect("update");

                    btgt = block[tgt].find("select.cron-time-min").val(v["mins"]);
                    if (useGentleSelect) btgt.gentleSelect("update");
                } else {;
                    var btgt = block[tgt].find("select").val(v[tgt]);
                    if (useGentleSelect) btgt.gentleSelect("update");
                }
            }

            // trigger change event
            var bp = block["period"].find("select").val(t);
            if (useGentleSelect) bp.gentleSelect("update");
            bp.trigger("change");

            return this;
        }

    };

    var event_handlers = {
        periodChanged : function() {
            var root = $(this).data("root");
            var block = root.data("block"),
                opt = root.data("options");
            var period = $(this).val();

            root.find("span.cron-block").hide(); // first, hide all blocks
            if (toDisplay.hasOwnProperty(period)) { // not custom value
                var b = toDisplay[$(this).val()];
                for (var i = 0; i < b.length; i++) {
                    block[b[i]].show();
                }
            }
        },

        somethingChanged : function() {
            root = $(this).data("root");
            // if AJAX url defined, show "save"/"reset" button
            if (defined(root.data("options").url_set)) {
                if (methods.value.call(root) != root.data("current_value")) { // if changed
                    root.addClass("cron-changed");
                    root.data("block")["controls"].fadeIn();
                } else { // values manually reverted
                    root.removeClass("cron-changed");
                    root.data("block")["controls"].fadeOut();
                }
            } else {
                root.data("block")["controls"].hide();
            }

            // chain in user defined event handler, if specified
            var oc = root.data("options").onChange;
            if (defined(oc) && $.isFunction(oc)) {
                oc.call(root);
            }
        },

        saveClicked : function() {
            var btn  = $(this);
            var root = btn.data("root");
            var cron_str = methods.value.call(root);

            if (btn.hasClass("cron-loading")) { return; } // in progress
            btn.addClass("cron-loading");

            $.ajax({
                type : "POST",
                url  : root.data("options").url_set,
                data : { "cron" : cron_str },
                success : function() {
                    root.data("current_value", cron_str);
                    btn.removeClass("cron-loading");
                    // data changed since "save" clicked?
                    if (cron_str == methods.value.call(root)) {
                        root.removeClass("cron-changed");
                        root.data("block").controls.fadeOut();
                    }
                },
                error : function() {
                    alert("An error occured when submitting your request. Try again?");
                    btn.removeClass("cron-loading");
                }
            });
        }
    };

    $.fn.cron = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.cron' );
        }
    };

})(jQuery);

////////////////////////////////////////////////////////////////////////////////////
//
//  prettycron.js
//  Generates human-readable sentences from a schedule string in cron format
//
//  Based on an earlier version by Pehr Johansson
//  http://dsysadm.blogspot.com.au/2012/09/human-readable-cron-expressions-using.html
//
////////////////////////////////////////////////////////////////////////////////////
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Lesser General Public License as published
//  by the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Lesser General Public License for more details.
//
//  You should have received a copy of the GNU Lesser General Public License
//  along with this program.  If not, see <http://www.gnu.org/licenses/>.
////////////////////////////////////////////////////////////////////////////////////

if ((!moment || !later) && (typeof require !== 'undefined')) {
    var moment = require('moment');
    var later = require('later').later;
    var cronParser = require('later').parse.cron;
} else {
    var cronParser = later.parse.cron;
}

(function() {

    /*
     * For an array of numbers, e.g. a list of hours in a schedule,
     * return a string listing out all of the values (complete with
     * "and" plus ordinal text on the last item).
     */
    var numberList = function(numbers) {
        if (numbers.length < 2) {
            return moment().lang().ordinal(numbers);
        }

        var last_val = numbers.pop();
        return numbers.join(', ') + ' and ' + moment()._lang.ordinal(last_val);
    };

    /*
     * Parse a number into day of week, or a month name;
     * used in dateList below.
     */
    var numberToDateName = function(value, type) {
        if (type == 'dow') {
            return moment().day(value - 1).format('ddd');
        } else if (type == 'mon') {
            return moment().month(value - 1).format('MMM');
        }
    };

    /*
     * From an array of numbers corresponding to dates (given in type: either
     * days of the week, or months), return a string listing all the values.
     */
    var dateList = function(numbers, type) {
        if (numbers.length < 2) {
            return numberToDateName(''+numbers[0], type);
        }

        var last_val = '' + numbers.pop();
        var output_text = '';

        for (var i=0, value; value=numbers[i]; i++) {
            if (output_text.length > 0) {
                output_text += ', ';
            }
            output_text += numberToDateName(value, type);
        }
        return output_text + ' and ' + numberToDateName(last_val, type);
    };

    /*
     * Pad to equivalent of sprintf('%02d'). Both moment.js and later.js
     * have zero-fill functions, but alas, they're private.
     */
    var zeroPad = function(x) {
        return (x < 10) ? '0' + x : x;
    };

    //----------------

    /*
     * Given a schedule from later.js (i.e. after parsing the cronspec),
     * generate a friendly sentence description.
     */
    var scheduleToSentence = function(schedule) {
        var output_text = 'Every ';

        if (schedule['h'] && schedule['m'] && schedule['h'].length <= 2 && schedule['m'].length <= 2) {
            // If there are only one or two specified values for
            // hour or minute, print them in HH:MM format

            var hm = [];
            for (var i=0; i < schedule['h'].length; i++) {
                for (var j=0; j < schedule['m'].length; j++) {
                    hm.push(zeroPad(schedule['h'][i]) + ':' + zeroPad(schedule['m'][j]));
                }
            }
            if (hm.length < 2) {
                output_text = hm[0];
            } else {
                var last_val = hm.pop();
                output_text = hm.join(', ') + ' and ' + last_val;
            }
            if (!schedule['d'] && !schedule['D']) {
                output_text += ' every day';
            }

        } else {
            // Otherwise, list out every specified hour/minute value.

            if(schedule['h']) { // runs only at specific hours
                if (schedule['m']) { // and only at specific minutes
                    output_text += numberList(schedule['m']) + ' minute past the ' + numberList(schedule['h']) + ' hour';
                } else { // specific hours, but every minute
                    output_text += 'minute of ' + numberList(schedule['h']) + ' hour';
                }
            } else if(schedule['m']) { // every hour, but specific minutes
                if (schedule['m'].length == 1 && schedule['m'][0] == 0) {
                    output_text += 'hour, on the hour';
                } else {
                    output_text += numberList(schedule['m']) + ' minute past every hour';
                }
            } else { // cronspec has "*" for both hour and minute
                output_text += 'minute';
            }
        }

        if (schedule['D']) { // runs only on specific day(s) of month
            output_text += ' on the ' + numberList(schedule['D']);
            if (!schedule['M']) {
                output_text += ' of every month';
            }
        }

        if (schedule['d']) { // runs only on specific day(s) of week
            if (schedule['D']) {
                // if both day fields are specified, cron uses both; superuser.com/a/348372
                output_text += ' and every ';
            } else {
                output_text += ' on ';
            }
            output_text += dateList(schedule['d'], 'dow');
        }

        if (schedule['M']) {
            // runs only in specific months; put this output last
            output_text += ' in ' + dateList(schedule['M'], 'mon');
        }

        return output_text;
    };

    //----------------

    /*
     * Given a cronspec, return the human-readable string.
     */
    var toString = function(cronspec, sixth) {
        var schedule = cronParser(cronspec, sixth);
        return scheduleToSentence(schedule['schedules'][0]);
    };

    /*
     * Given a cronspec, return a friendly string for when it will next run.
     * (This is just a wrapper for later.js and moment.js)
     */
    var getNext = function(cronspec, sixth) {
        var schedule = cronParser(cronspec, sixth);
        return moment(
            later.schedule(schedule).next()
        ).calendar();
    };

    //----------------

    // attach ourselves to window in the browser, and to exports in Node,
    // so our functions can always be called as prettyCron.toString()
    var global_obj = (typeof exports !== "undefined" && exports !== null) ? exports : window.prettyCron = {};

    global_obj.toString = toString;
    global_obj.getNext = getNext;

}).call(this);
/*
 WATable 1.09
 Copyright (c) 2012 Andreas Petersson(apesv03@gmail.com)
 http://wootapa-watable.appspot.com/

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function ($, undefined) {

    var WATable = function () {

        var priv = {}; //private api
        var publ = {}; //public api

        priv.options = {};
        var defaults = {
            url: '',  //webservice url
            urlData: '', //webservice params
            urlPost: false, //use POST instead of GET
            debug: false, //prints debug info to console
            filter: false, //show filter row
            columnPicker: false, //show columnpicker
            checkboxes: false, //show body checkboxes
            checkAllToggle: true, //show check all toggle
            actions: '', //holds action links
            pageSize: 10, //current pagesize
            pageSizes: [10, 20, 30, 40, 50, 'All'], //available pagesizes
            hidePagerOnEmpty: false, //removes pager if no rows
            preFill: false, //prefill table with empty rows
            sorting: true, // enable column sorting
            sortEmptyLast: true, //empty values will be shown last
            types: { //type specific options
                string: {},
                number: {},
                bool: {},
                date: {}
            },
            transition: undefined, //transition type when paging
            transitionDuration: 0.3 //duration of transition in seconds
        };

        /* bundled scripts */
        priv.ext = {};
        priv.ext.XDate = /* xdate 0.7 */ function(a,b,c,d){function e(){var b=this instanceof e?this:new e,c=arguments,d=c.length,h;typeof c[d-1]=="boolean"&&(h=c[--d],c=y(c,0,d));if(d)if(d==1)if(d=c[0],d instanceof a||typeof d=="number")b[0]=new a(+d);else if(d instanceof e){var c=b,i=new a(+d[0]);if(f(d))i.toString=G;c[0]=i}else{if(typeof d=="string"){b[0]=new a(0);a:{for(var c=d,d=h||!1,i=e.parsers,j=0,k;j<i.length;j++)if(k=i[j](c,d,b)){b=k;break a}b[0]=new a(c)}}}else b[0]=new a(F.apply(a,c)),h||(b[0]=u(b[0]));else b[0]=new a;typeof h=="boolean"&&g(b,h);return b}function f(a){return a[0].toString===G}function g(b,c,d){if(c){if(!f(b))d&&(b[0]=new a(F(b[0].getFullYear(),b[0].getMonth(),b[0].getDate(),b[0].getHours(),b[0].getMinutes(),b[0].getSeconds(),b[0].getMilliseconds()))),b[0].toString=G}else f(b)&&(b[0]=d?u(b[0]):new a(+b[0]));return b}function h(a,b,c,d,e){var f=x(s,a[0],e),a=x(t,a[0],e),e=b==1?c%12:f(1),g=!1;d.length==2&&typeof d[1]=="boolean"&&(g=d[1],d=[c]);a(b,d);g&&f(1)!=e&&(a(1,[f(1)-1]),a(2,[v(f(0),f(1))]))}function i(a,c,d,e){var d=Number(d),f=b.floor(d);a["set"+B[c]](a["get"+B[c]]()+f,e||!1);f!=d&&c<6&&i(a,c+1,(d-f)*D[c],e)}function j(a,c,d){var a=a.clone().setUTCMode(!0,!0),c=e(c).setUTCMode(!0,!0),f=0;if(d==0||d==1){for(var g=6;g>=d;g--)f/=D[g],f+=s(c,!1,g)-s(a,!1,g);d==1&&(f+=(c.getFullYear()-a.getFullYear())*12)}else d==2?(d=a.toDate().setUTCHours(0,0,0,0),f=c.toDate().setUTCHours(0,0,0,0),f=b.round((f-d)/864e5)+(c-f-(a-d))/864e5):f=(c-a)/[36e5,6e4,1e3,1][d-3];return f}function k(c){var d=c(0),e=c(1),c=c(2),e=new a(F(d,e,c)),f=l(d),c=f;e<f?c=l(d-1):(d=l(d+1),e>=d&&(c=d));return b.floor(b.round((e-c)/864e5)/7)+1}function l(b){b=new a(F(b,0,4));b.setUTCDate(b.getUTCDate()-(b.getUTCDay()+6)%7);return b}function m(a,b,c,e){var f=x(s,a,e),g=x(t,a,e),c=l(c===d?f(0):c);e||(c=u(c));a.setTime(+c);g(2,[f(2)+(b-1)*7])}function n(a,b,c,d,f){var g=e.locales,h=g[e.defaultLocale]||{},i=x(s,a,f),c=(typeof c=="string"?g[c]:c)||{};return o(a,b,function(a){if(d)for(var b=(a==7?2:a)-1;b>=0;b--)d.push(i(b));return i(a)},function(a){return c[a]||h[a]},f)}function o(a,b,c,e,f){for(var g,h,i="";g=b.match(E);){i+=b.substr(0,g.index);if(g[1]){h=i;for(var i=a,j=g[1],k=c,l=e,m=f,n=j.length,q=void 0,r="";n>0;)q=p(i,j.substr(0,n),k,l,m),q!==d?(r+=q,j=j.substr(n),n=j.length):n--;i=h+(r+j)}else g[3]?(h=o(a,g[4],c,e,f),parseInt(h.replace(/\D/g,""),10)&&(i+=h)):i+=g[7]||"'";b=b.substr(g.index+g[0].length)}return i+b}function p(a,c,d,f,g){var h=e.formatters[c];if(typeof h=="string")return o(a,h,d,f,g);else if(typeof h=="function")return h(a,g||!1,f);switch(c){case"fff":return A(d(6),3);case"s":return d(5);case"ss":return A(d(5));case"m":return d(4);case"mm":return A(d(4));case"h":return d(3)%12||12;case"hh":return A(d(3)%12||12);case"H":return d(3);case"HH":return A(d(3));case"d":return d(2);case"dd":return A(d(2));case"ddd":return f("dayNamesShort")[d(7)]||"";case"dddd":return f("dayNames")[d(7)]||"";case"M":return d(1)+1;case"MM":return A(d(1)+1);case"MMM":return f("monthNamesShort")[d(1)]||"";case"MMMM":return f("monthNames")[d(1)]||"";case"yy":return(d(0)+"").substring(2);case"yyyy":return d(0);case"t":return q(d,f).substr(0,1).toLowerCase();case"tt":return q(d,f).toLowerCase();case"T":return q(d,f).substr(0,1);case"TT":return q(d,f);case"z":case"zz":case"zzz":return g?c="Z":(f=a.getTimezoneOffset(),a=f<0?"+":"-",d=b.floor(b.abs(f)/60),f=b.abs(f)%60,g=d,c=="zz"?g=A(d):c=="zzz"&&(g=A(d)+":"+A(f)),c=a+g),c;case"w":return k(d);case"ww":return A(k(d));case"S":return c=d(2),c>10&&c<20?"th":["st","nd","rd"][c%10-1]||"th"}}function q(a,b){return a(3)<12?b("amDesignator"):b("pmDesignator")}function r(a){return!isNaN(+a[0])}function s(a,b,c){return a["get"+(b?"UTC":"")+B[c]]()}function t(a,b,c,d){a["set"+(b?"UTC":"")+B[c]].apply(a,d)}function u(b){return new a(b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate(),b.getUTCHours(),b.getUTCMinutes(),b.getUTCSeconds(),b.getUTCMilliseconds())}function v(b,c){return 32-(new a(F(b,c,32))).getUTCDate()}function w(a){return function(){return a.apply(d,[this].concat(y(arguments)))}}function x(a){var b=y(arguments,1);return function(){return a.apply(d,b.concat(y(arguments)))}}function y(a,b,e){return c.prototype.slice.call(a,b||0,e===d?a.length:e)}function z(a,b){for(var c=0;c<a.length;c++)b(a[c],c)}function A(a,b){b=b||2;for(a+="";a.length<b;)a="0"+a;return a}var B="FullYear,Month,Date,Hours,Minutes,Seconds,Milliseconds,Day,Year".split(","),C=["Years","Months","Days"],D=[12,31,24,60,60,1e3,1],E=/(([a-zA-Z])\2*)|(\((('.*?'|\(.*?\)|.)*?)\))|('(.*?)')/,F=a.UTC,G=a.prototype.toUTCString,H=e.prototype;H.length=1;H.splice=c.prototype.splice;H.getUTCMode=w(f);H.setUTCMode=w(g);H.getTimezoneOffset=function(){return f(this)?0:this[0].getTimezoneOffset()};z(B,function(a,b){H["get"+a]=function(){return s(this[0],f(this),b)};b!=8&&(H["getUTC"+a]=function(){return s(this[0],!0,b)});b!=7&&(H["set"+a]=function(a){h(this,b,a,arguments,f(this));return this},b!=8&&(H["setUTC"+a]=function(a){h(this,b,a,arguments,!0);return this},H["add"+(C[b]||a)]=function(a,c){i(this,b,a,c);return this},H["diff"+(C[b]||a)]=function(a){return j(this,a,b)}))});H.getWeek=function(){return k(x(s,this,!1))};H.getUTCWeek=function(){return k(x(s,this,!0))};H.setWeek=function(a,b){m(this,a,b,!1);return this};H.setUTCWeek=function(a,b){m(this,a,b,!0);return this};H.addWeeks=function(a){return this.addDays(Number(a)*7)};H.diffWeeks=function(a){return j(this,a,2)/7};e.parsers=[function(b,c,d){if(b=b.match(/^(\d{4})(-(\d{2})(-(\d{2})([T ](\d{2}):(\d{2})(:(\d{2})(\.(\d+))?)?(Z|(([-+])(\d{2})(:?(\d{2}))?))?)?)?)?$/)){var e=new a(F(b[1],b[3]?b[3]-1:0,b[5]||1,b[7]||0,b[8]||0,b[10]||0,b[12]?Number("0."+b[12])*1e3:0));b[13]?b[14]&&e.setUTCMinutes(e.getUTCMinutes()+(b[15]=="-"?1:-1)*(Number(b[16])*60+(b[18]?Number(b[18]):0))):c||(e=u(e));return d.setTime(+e)}}];e.parse=function(a){return+e(""+a)};H.toString=function(a,b,c){return a===d||!r(this)?this[0].toString():n(this,a,b,c,f(this))};H.toUTCString=H.toGMTString=function(a,b,c){return a===d||!r(this)?this[0].toUTCString():n(this,a,b,c,!0)};H.toISOString=function(){return this.toUTCString("yyyy-MM-dd'T'HH:mm:ss(.fff)zzz")};e.defaultLocale="";e.locales={"":{monthNames:"January,February,March,April,May,June,July,August,September,October,November,December".split(","),monthNamesShort:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),dayNames:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),dayNamesShort:"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),amDesignator:"AM",pmDesignator:"PM"}};e.formatters={i:"yyyy-MM-dd'T'HH:mm:ss(.fff)",u:"yyyy-MM-dd'T'HH:mm:ss(.fff)zzz"};z("getTime,valueOf,toDateString,toTimeString,toLocaleString,toLocaleDateString,toLocaleTimeString,toJSON".split(","),function(a){H[a]=function(){return this[0][a]()}});H.setTime=function(a){this[0].setTime(a);return this};H.valid=w(r);H.clone=function(){return new e(this)};H.clearTime=function(){return this.setHours(0,0,0,0)};H.toDate=function(){return new a(+this[0])};e.now=function(){return+(new a)};e.today=function(){return(new e).clearTime()};e.UTC=F;e.getDaysInMonth=v;if(typeof module!=="undefined"&&module.exports)module.exports=e;return e}(Date,Math,Array);

        //these holds the actual dom table objects, and is used to identify what parts of the table that needs to be created.
        var _cont; //container holding table
        var _table; //the table
        var _head; //table header
        var _headSort; //table header sorting row
        var _headFilter; //table header filter row
        var _body; //table body
        var _foot; //table footer

        var _data;  //columns and rows
        var _currPage = 1; //current page
        var _pageSize; //current pagesize
        var _totalPages; //total pages
        var _currSortCol; //current sorting column
        var _currSortFlip = false; //current sorting direction
        var _currDpOp; //clicked datepicker operator
        var _filterCols = {}; //array with current filters
        var _filterTimeout; //timer for delayed filtering
        var _uniqueCol; //reference to column with the unique property
        var _uniqueCols = {}; //array with checked rows
        var _checkToggleChecked = false; //check-all toggle state

        var _vendors = ["webkit", "moz", "Moz", "ms", "o", "O"]; //vendors prefixes. used for not yet officially supported features.
        var _transition = {
            supported: undefined, //true if browser supports transitions
            doTransition: false,  //true if allowed to transition
            direction: undefined, //direction of transition.
            available: {
                'bounce': {
                    next: {
                        tin: 'bounceIn',
                        tout: 'bounceOut'
                    },
                    prev: {
                        tin: 'bounceIn',
                        tout: 'bounceOut'
                    }
                },
                'fade': {
                    next: {
                        tin: 'fadeIn',
                        tout: 'fadeOut'
                    },
                    prev: {
                        tin: 'fadeIn',
                        tout: 'fadeOut'
                    }
                },
                'flip': {
                    next: {
                        tin: 'flipInX',
                        tout: 'flipOutX'
                    },
                    prev: {
                        tin: 'flipInX',
                        tout: 'flipOutX'
                    }
                },
                'rotate': {
                    next: {
                        tin: 'rotateInDownLeft',
                        tout: 'rotateOutDownLeft'
                    },
                    prev: {
                        tin: 'rotateInUpLeft',
                        tout: 'rotateOutUpLeft'
                    }
                },
                'scroll': {
                    next: {
                        tin: 'fadeInUp',
                        tout: 'fadeOutUp'
                    },
                    prev: {
                        tin: 'fadeInDown',
                        tout: 'fadeOutDown'
                    }
                },
                'slide': {
                    next: {
                        tin: 'fadeInRight',
                        tout: 'fadeOutLeft'
                    },
                    prev: {
                        tin: 'fadeInLeft',
                        tout: 'fadeOutRight'
                    }
                }
            }

        }

        /*
         initialize the plugin.
         */
        priv.init = function () {
            _cont = priv.options.id;
            priv.options.types.string = ((priv.options.types || {}).string || {});
            priv.options.types.number = ((priv.options.types || {}).number || {});
            priv.options.types.bool = ((priv.options.types || {}).bool || {});
            priv.options.types.date = ((priv.options.types || {}).date || {});
            priv.options.transition = priv.options.transition === true ? 'scroll' : priv.options.transition;

            //check support transitions
            _transition.supported = priv.supportsTransition();

            //fill the table with empty cells
            if (priv.options.preFill) {
                var data = {
                    cols: {
                        dummy: {
                            index: 1,
                            friendly: "&nbsp;",
                            type: "string"
                        }
                    },
                    rows: []
                };
                for (var i = 0; i < priv.options.pageSize; i++)
                    data.rows.push({dummy: "&nbsp;"});
                priv.setData(data);
            }
            //try call webservice for data
            priv.update();
        };

        /*
         creates the table with all its parts and handlers.
         note that only the parts we need is created.
         (yeah, the function is huge)
         */
        priv.createTable = function () {
            var start = new priv.ext.XDate();

            //create table itself
            if (!_table) {
                _head = _body = _foot = undefined;
                _table = $('<table class="watable table table-striped table-hover table-bordered table-condensed"></table>').appendTo(_cont);
            }

            //create the header which will later hold both sorting and filtering
            if (!_head) {
                _table.find('thead').remove();
                _headSort = _headFilter = undefined;
                _head = $('<thead></thead>').prependTo(_table);
            }

            //sort the columns in index order
            var colsSorted = Object.keys(_data.cols).sort(function (a, b) {
                return _data.cols[a].index - _data.cols[b].index;
            });

            //create the header sorting row
            if (!_headSort) {
                _head.find('.sort i').tooltip('hide');
                _head.find(".sort").remove();
                _headSort = $('<tr class="sort"></tr>').prependTo(_head);

                //create the checkall toggle
                if (_uniqueCol && priv.options.checkboxes) {
                    var checked = _checkToggleChecked ? 'checked' : '';
                    var headCell = $('<th></th>').appendTo(_headSort);
                    if (priv.options.checkAllToggle) {
                        var elem = $('<input {0} class="checkToggle" type="checkbox" />'.f(checked)).appendTo(headCell);
                        elem.on('change', priv.checkToggleChanged);
                    }
                }

                //create the sortable headers
                for (var i = 0; i < colsSorted.length; i++) {
                    var column = colsSorted[i];
                    var props = _data.cols[column];

                    if (!props.hidden) {
                        var headCell = $('<th></th>').appendTo(_headSort);
                        var link;
                        if(priv.options.sorting && props.sorting !== false) {
                            link = $('<a class="pull-left" href="#">{0}</a>'.f(props.friendly || column));
                            link.on('click', {column: column}, priv.columnClicked);
                        }
                        else {
                            link = $('<span class="pull-left">{0}</span>'.f(props.friendly || column));
                        }
                        link.appendTo(headCell);

                        if (props.tooltip) {
                            $('<span class="glyphicon glyphicon-info-sign"></span>').tooltip({
                                title: props.tooltip.trim(),
                                html: true,
                                container: 'body',
                                placement: 'top',
                                delay: {
                                    show: 500,
                                    hide: 100
                                }
                            }).appendTo(link);
                        }

                        //Add sort arrow
                        if (column == _currSortCol) {
                            if (_currSortFlip) $('<span class="glyphicon glyphicon-chevron-down pull-right"></span>').appendTo(headCell);
                            else $('<span class="glyphicon glyphicon-chevron-up pull-right"></span>').appendTo(headCell);
                        }
                    }
                }
            }

            //create the header filtering row
            if (!_headFilter && priv.options.filter) {
                _head.find(".filter").remove();
                _headFilter = $('<tr class="filter"></tr>').appendTo(_head);
                var headCell;
                var elem;
                var placeHolder = '';
                var tooltip = '';

                //create the filter checkbox
                if (_uniqueCol && priv.options.checkboxes) {
                    tooltip = priv.options.types.bool.filterTooltip || 'Toggle between:<br/>indeterminate,<br/>checked,<br/>unchecked';
                    headCell = $('<th></th>').appendTo(_headFilter);
                    elem = $('<input class="filter indeterminate" checked type="checkbox" />').appendTo(headCell);
                    $.map(_filterCols, function (colProps, col) {
                        if (col == "unique") {
                            if (colProps.filter) elem.prop('checked', true).removeClass('indeterminate');
                            else if (!colProps.filter) elem.prop('checked', false).removeClass('indeterminate');
                            else if (colProps.filter == '') elem.addClass('indeterminate');
                        }
                    });

                    if (tooltip) {
                        elem.tooltip({
                            title: tooltip.trim(),
                            html: true,
                            container: 'body',
                            trigger: 'hover',
                            placement: 'top',
                            delay: {
                                show: 500,
                                hide: 100
                            }
                        });
                    }
                    elem.on('click', {column: "unique"}, priv.filterChanged);
                }

                //create the column filters
                for (var i = 0; i < colsSorted.length; i++) {
                    var column = colsSorted[i];
                    var props = _data.cols[column];
                    tooltip = props.filterTooltip === true ? undefined : props.filterTooltip === false ? '' : props.filterTooltip;
                    placeHolder = props.placeHolder === true ? undefined : props.placeHolder === false ? '' : props.placeHolder;

                    if (!props.hidden) {
                        headCell = $('<th></th>').appendTo(_headFilter);

                        switch (props.type || 'string') {
                            case "number":
                                if (placeHolder == undefined) placeHolder = priv.options.types.number.placeHolder;
                                placeHolder = (placeHolder === true || placeHolder == undefined) ? '10..20 =50' : placeHolder === false ? '' : placeHolder;
                                if (tooltip == undefined) tooltip = priv.options.types.number.filterTooltip;
                                tooltip = (tooltip === true || tooltip == undefined) ? 'Values 10 to 20:<br/>10..20<br/>Values except 10 to 20:<br/>!10..20<br/>Values exactly 50:<br/>=50' : tooltip === false ? '' : tooltip;
                                elem = $('<input placeholder="{0}" class="filter" type="text" />'.f(placeHolder));
                                elem.on('keyup', {column: column}, priv.filterChanged);
                                break;
                            case "date":
                                if (placeHolder == undefined) placeHolder = priv.options.types.date.placeHolder;
                                placeHolder = (placeHolder === true || placeHolder == undefined) ? '-7..0' : placeHolder === false ? '' : placeHolder;
                                if (tooltip == undefined) tooltip = priv.options.types.date.filterTooltip;
                                tooltip = (tooltip === true || tooltip == undefined) ? 'Today:<br/>0..1<br/>All except today:<br/>!0..1<br/>A week today excluded:<br/>-7..0' : tooltip === false ? '' : tooltip;
                                elem = $('<div><input placeholder="{0}" class="filter" type="text" /></div>'.f(placeHolder));

                                if (priv.options.types.date.datePicker === true || priv.options.types.date.datePicker == undefined)
                                {
                                    if ($().datepicker)
                                    {
                                        elem.addClass('date-wrap');
                                        var today = new priv.ext.XDate(false).setHours(0, 0, 0, 0).toString('yyyy-MM-dd');
                                        var dp = $('<div style="float:right" class="date" data-date="{0}" data-date-format="{1}" />'.f(today, 'yyyy-mm-dd')).appendTo(elem);
                                        $('<input style="display:none" type="text"  />').appendTo(dp);
                                        $('<span class="add-on glyphicon glyphicon-chevron-right"></span>').on('click', {op: "l"}, priv.dpOpChanged).appendTo(dp);
                                        $('<span class="add-on glyphicon glyphicon-chevron-left"></span>').on('click', {op: "r"}, priv.dpOpChanged).appendTo(dp);
                                        dp.datepicker({weekStart:1});
                                        dp.on('changeDate', {column: column, input: $('input.filter', elem)}, priv.dpClicked);
                                    }
                                    else
                                    priv.log('datepicker plugin not found');
                                }
                                elem.on('keyup', 'input.filter', {column: column}, priv.filterChanged);
                                break;
                            case "bool":
                                if (tooltip == undefined) tooltip = priv.options.types.bool.filterTooltip;
                                tooltip = (tooltip === true || tooltip == undefined) ? 'Toggle between:<br/>indeterminate,<br/>checked,<br/>unchecked' : tooltip === false ? '' : tooltip;
                                elem = $('<input class="filter indeterminate" checked type="checkbox" />');
                                elem.on('click', {column: column}, priv.filterChanged);
                                break;
                            case "string":
                                if (placeHolder == undefined) placeHolder = priv.options.types.string.placeHolder;
                                placeHolder = (placeHolder === true || placeHolder == undefined) ? 'John Doe' : placeHolder === false ? '' : placeHolder;
                                if (tooltip == undefined) tooltip = priv.options.types.string.filterTooltip;
                                tooltip = (tooltip === true || tooltip == undefined) ? 'Find John Doe:<br/>John Doe<br/>Find John and Jane Doe(Regex):<br/>?John Doe|Jane Doe<br/>Find all except John Doe:<br/>!John Doe' : tooltip === false ? '' : tooltip;
                                elem = $('<input placeholder="{0}" class="filter" type="text" />'.f(placeHolder));
                                elem.on('keyup', {column: column}, priv.filterChanged);
                                break;
                            case "none":
                                elem = $('<div>&nbsp;</div>');
                                break;
                        }

                        if (tooltip) {
                            elem.tooltip({
                                title: tooltip.trim(),
                                html: true,
                                container: 'body',
                                trigger: 'hover',
                                placement: 'top',
                                delay: {
                                    show: 500,
                                    hide: 100
                                }
                            });
                        }

                        if (elem && props.filter) {
                            $.map(_filterCols, function (colProps, col) {
                                if (col == column) {
                                    if (colProps.col.type == 'bool') {
                                        if (colProps.filter) elem.prop('checked', true).removeClass('indeterminate');
                                        else if (!colProps.filter) elem.prop('checked', false).removeClass('indeterminate');
                                        else if (colProps.filter == '') elem.addClass('indeterminate');
                                    }
                                    else elem.val(colProps.filter);
                                }
                            });
                            elem.appendTo(headCell);
                        }
                    }
                }
            }

            //create the body
            if (!_body) {
                var prevBody = _table.find('tbody');
                if (!_transition.doTransition && prevBody.length)
                    prevBody.remove();
                _body = $('<tbody style="display:none"></tbody>').insertAfter(_head);
                _body.on('change', '.unique', priv.rowChecked);
                _body.on('click', 'td', priv.rowClicked);

                //find out what rows to show next...
                var rowsAdded = 0;
                _data.toRow = _data.fromRow + priv.options.pageSize;
                if (_data.toRow > _data.rows.length)
                    _data.toRow = _data.rows.length;

                //slice out the chunk of data we need and create rows
                $.each(_data.rows.slice(_data.fromRow, _data.toRow), function (index, props) {
                    var row = $('<tr class="{0}"></tr>'.f(index%2 == 0 ? 'odd' : 'even')).appendTo(_body);

                    //create checkbox
                    if (_uniqueCol && priv.options.checkboxes) {
                        var check = _uniqueCols[props[_uniqueCol]] != undefined ? 'checked' : '';
                        var checkable = props['checkable'] === false ? 'disabled' : '';
                        var cell = $('<td></td>').appendTo(row);
                        $('<input class="unique" {0} {1} type="checkbox" />'.f(check, checkable)).appendTo(cell);
                    }

                    //create cells
                    for (var i = 0; i < colsSorted.length; i++) {
                        var key = colsSorted[i];
                        var val = props[key];
                        if (!_data.cols[key]) return;
                        if (_data.cols[key].unique) row.data('unique', val);

                        if (!_data.cols[key].hidden) {
                            var cell = $('<td></td>').appendTo(row);
                            cell.data('column', key);
                            if (val === undefined) continue;

                            var format = props[key + 'Format'] || _data.cols[key].format || '{0}';

                            switch (_data.cols[key].type) {
                                case "string":
                                    cell.html(format.f(val));
                                    break;
                                case "number":
                                    val = (+val);
                                    var forceDecimals = !isNaN(_data.cols[key].decimals);
                                    if (forceDecimals) cell.html(format.f(val.toFixed(_data.cols[key].decimals)));
                                    else {
                                        (val || 0) % 1 === 0
                                            ? cell.html(format.f(val))
                                            : cell.html(format.f(val.toFixed(priv.options.types.number.decimals || 2)));
                                    }
                                    break;
                                case "date":
                                    val = new priv.ext.XDate(val, priv.options.types.date.utc === true).toString(priv.options.types.date.format || 'yyyy-MM-dd HH:mm:ss');
                                    cell.html(format.f(val));
                                    break;
                                case "bool":
                                    $('<input type="checkbox" {0} disabled />'.f(val ? "checked" : "")).appendTo(cell);
                                    break;
                            }
                        }
                    }
                    rowsAdded++;

                    //enough rows created?
                    if (rowsAdded >= priv.options.pageSize) {
                        _data.toRow = _data.fromRow + rowsAdded;
                        return false;
                    }
                });

                if (_currPage == 1) {
                    _pageSize = rowsAdded;
                    _totalPages = Math.round(Math.ceil(_data.rows.length / _pageSize));
                }

                //pad with empty rows if we're at last page.
                if (_currPage == _totalPages) {
                    while (rowsAdded < _pageSize) {
                        var row = $('<tr></tr>').appendTo(_body);

                        if (_uniqueCol && priv.options.checkboxes) {
                            var cell = $('<td></td>').appendTo(row);
                            $('<input disabled type="checkbox" />').appendTo(cell);
                        }

                        $.each(_data.cols, function (column, props) {
                            if (!props.hidden) $('<td>&nbsp;</td>').appendTo(row);
                        });
                        rowsAdded++;
                    }
                }

                //transition between bodys?
                if (prevBody.length && _transition.doTransition) {
                    var transition = _transition.direction == 1 ? _transition.available[priv.options.transition].next : _transition.available[priv.options.transition].prev;

                    //animation duration
                    var vendorCSSProps = {};
                    $.each(_vendors, function (index, vendor) {
                        var key = '-{0}-animation-duration'.f(vendor);
                        vendorCSSProps[key] = '{0}s'.f(priv.options.transitionDuration);
                    });
                    prevBody.css(vendorCSSProps);

                    var fallbackTimer;
                    var vendorAnimationEnd = $.map(_vendors, function (vendor) { return '{0}AnimationEnd {0}animationend'.f(vendor); }).join(" ");
                    prevBody.one('{0} animationend'.f(vendorAnimationEnd), function (e) {
                        clearTimeout(fallbackTimer);
                        prevBody.remove();
                        _body.css(vendorCSSProps);
                        //animate in the current body
                        _body.one('{0} animationend'.f(vendorAnimationEnd), function (e) {
                            _body.removeClass('animated {0}'.f(transition.tin));
                        });
                        _body.show(0).addClass('animated {0}'.f(transition.tin));
                    });

                    //fallback timer to prevent paging from breaking when animationend wont fire
                    fallbackTimer = setTimeout(function(e) {
                        priv.log('animate.css seems to be missing!', true);
                        prevBody.remove();
                        _body.show(0);
                        _transition.supported = false;
                    }, (priv.options.transitionDuration * 1000) /* wait a little longer */ + 500);

                    //animate out the previous body
                    prevBody.addClass('animated {0}'.f(transition.tout));
                    _transition.doTransition = false;
                }
                else
                    _body.show(0);
            }

            //create the footer
            if (!_foot) {
                _table.find('tfoot').remove();
                _foot = $('<tfoot></tfoot>').insertAfter(_body);

                var footRow = $('<tr></tr>').appendTo(_foot);
                var footCell = $('<td colspan="999"></td>').appendTo(footRow);

                //create summary
                if (_data.rows.length > 0)
                    $('<p>Rows {0}-{1} of {2}</p>'.f(_data.fromRow + 1, Math.min(_data.toRow, _data.rows.length), _data.rows.length)).appendTo(footCell);
                else {
                    $('<p>No results</p>').appendTo(footCell);
                    _totalPages = 0;
                }

                //create the pager.
                var lowerPage = _currPage - 2;
                var upperPage = _currPage + 2;
                if (upperPage > _totalPages) {
                    var diff = upperPage - _totalPages;
                    upperPage = _totalPages;
                    lowerPage -= diff;
                }
                if (lowerPage < 1) lowerPage = 1;
                if (upperPage < 5) upperPage = 5;

                var footToolbar = $('<div class="btn-toolbar"></div>').appendTo(footCell);
                var footDiv = $('<div class="btn-group"></div>').appendTo(footToolbar);
                var footPagerUl = $('<ul class="pagination"></ul>').appendTo(footDiv);

                $('<li class="{0}"><a href="#">«</a></li>'.f(_currPage == 1 ? 'disabled' : ''))
                    .on('click', {pageIndex: _currPage - 1}, priv.pageChanged).appendTo(footPagerUl);

                for (var i = lowerPage; i <= upperPage; i++) {
                    var link;
                    if (i == _currPage) {
                        link = $('<li class="active"><a href="#">{0}</a></li>'.f(i));
                    }
                    else {
                        link = $('<li class="{1}"><a href="#">{0}</a></li>'.f(i, i > _totalPages ? 'disabled' : ''));
                        link.on('click', {pageIndex: i}, priv.pageChanged);
                    }
                    link.appendTo(footPagerUl);
                }
                $('<li class="{0}"><a href="#">»</a></li>'.f(_currPage == _totalPages ? 'disabled' : ''))
                    .on('click', {pageIndex: _currPage + 1}, priv.pageChanged).appendTo(footPagerUl);

                //create pagesize dropdown
                if (priv.options.pageSizes.length) {
                    var div = $('<div class="btn-group dropup pagesize"></div>').appendTo(footToolbar);
                    var btn = $('<button class="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#">Rows&nbsp;</button>').appendTo(div);
                    var span = $('<span class="caret"></span>').appendTo(btn);
                    var ul = $('<ul class="dropdown-menu">').appendTo(div);

                    $.each(priv.options.pageSizes, function (index, val) {
                        var li = $('<li></li>').appendTo(ul);
                        $('<a href="#">{0}</a>'.f(val)).appendTo(li);
                    });
                    div.on('click', 'a', priv.pageSizeChanged);
                }

                //create columnpicker dropdown
                if (priv.options.columnPicker) {
                    var div = $('<div class="btn-group dropup columnpicker"></div>').appendTo(footToolbar);
                    var btn = $('<button class="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#">Columns&nbsp;</button>').appendTo(div);
                    var span = $('<span class="caret"></span>').appendTo(btn);
                    var ul = $('<ul class="dropdown-menu">').appendTo(div);

                    for (var i = 0; i < colsSorted.length; i++) {
                        var col = colsSorted[i];
                        var props = _data.cols[col];

                        if (props.type != "unique") {
                            var li = $('<li></li>').appendTo(ul);
                            $('<input {0} type="checkbox" title="{1}" value="{1}" >&nbsp;{2}</input>'.f(props.hidden ? '' : 'checked', col, props.friendly || col)).appendTo(li);
                        }
                    }
                    div.on('click', 'input', priv.columnPickerClicked);
                }

                //create actions dropdown
                if (priv.options.actions) {
                    var div = $('<div class="btn-group dropup actions"></div>').appendTo(footToolbar);
                    var btn = $('<button class="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#"><span class="glyphicon glyphicon-list"></span>&nbsp;</button>').appendTo(div);
                    var span = $('<span class="caret"></span>').appendTo(btn);
                    var ul = $('<ul class="dropdown-menu">').appendTo(div);

                    if (priv.options.actions.filter) {
                        var li = $('<li></li>').appendTo(ul);
                        $('<input {0} type="checkbox" >&nbsp;Filter</input>'.f(priv.options.filter ? 'checked' : '')).appendTo(li);
                        li.on('click', 'input', function (e) {
                            priv.options.filter = !priv.options.filter;
                            _head = undefined;
                            priv.createTable();
                        });
                    }
                    if (priv.options.actions.columnPicker) {
                        var li = $('<li></li>').appendTo(ul);
                        $('<input {0} type="checkbox" >&nbsp;ColumnPicker</input>'.f(priv.options.columnPicker ? 'checked' : '')).appendTo(li);
                        li.on('click', 'input', function (e) {
                            priv.options.columnPicker = !priv.options.columnPicker;
                            _foot = undefined;
                            priv.createTable();
                        });
                    }
                    if (priv.options.actions.custom) {
                        $.each(priv.options.actions.custom, function (index, val) {
                            var li = $('<li></li>').appendTo(ul);
                            $(val).appendTo(li);
                        });
                    }
                }
            }

            if (_data.rows.length == 0 && priv.options.hidePagerOnEmpty)
                $('.btn-toolbar', _foot).remove();
            priv.log('table created in {0} ms.'.f(new priv.ext.XDate() - start));
            if (typeof priv.options.tableCreated == 'function')
                priv.options.tableCreated.call(_table.get(0), {table: _table.get(0)});

        };

        /*
         calls the webservice(if defined).
         */
        priv.update = function (callback, skipCols, resetChecked) {
            if (!priv.options.url) {
                priv.log('no url found');
                return;
            }

            priv.log('requesting data from url:{0} data:{1}'.f(priv.options.url, JSON.stringify(priv.options.urlData) || ''));
            var start = new priv.ext.XDate();

            $.ajax({
                url: priv.options.url,
                type: priv.options.urlPost ? 'POST' : 'GET',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: priv.options.urlData,
                async: true,
                success: function (data) {
                    priv.log('request finished in {0} ms.'.f(new priv.ext.XDate() - start));

                    //assign the new data
                    if (data.d && data.d.cols)
                        priv.setData(data.d, skipCols, resetChecked);
                    else
                        priv.setData(data, skipCols, resetChecked);
                    if (typeof callback == "function")
                        callback.call(this);
                },
                error: function (err) {
                    priv.log('request error: '.f(err));
                }
            });
        };

        /*
         assigns the new data.
         */
        priv.setData = function (pData, skipCols, resetChecked) {
            var data = $.extend(true, {}, pData);
            data.fromRow = _data && _data.fromRow || 0;
            data.toRow = _data && _data.toRow || 0;

            //use previous column definitions?
            skipCols = skipCols || false;
            if (skipCols) data.cols = _data.cols;
            else _filterCols = {};

            _data = data;
            _data.rowsOrg = _data.rows;

            //we might have more/less data now. Recalculate stuff.
            if (_currPage > 1) {
                _data.toRow = Math.min(_data.rows.length, _data.toRow);
                _data.fromRow = _data.toRow - _pageSize;
                _data.fromRow = Math.max(_data.fromRow, 0);
                _currPage = Math.ceil(_data.fromRow / _pageSize) + 1;
                _totalPages = Math.ceil(_data.rows.length / _pageSize);
            } else {
                _data.fromRow = 0;
                if (priv.options.pageSize != -1)
                    _data.toRow = _data.fromRow + priv.options.pageSize;
                _data.toRow = Math.max(_data.toRow, _data.rows.length);
            }

            //wash the new data a bit
            _uniqueCol = "";
            $.each(_data.cols, function (col, props) {
                //set sorting
                if (!_currSortCol && props.sortOrder && priv.options.sorting && props.sorting !== false) {
                    _currSortCol = col;
                    _currSortFlip = props.sortOrder != "asc";
                }

                //default to string type if missing
                if (!props.type) _data.cols[col].type = "string";

                //if several unique columns is defined, use the first.
                if (props.unique) {
                    if (!_uniqueCol) _uniqueCol = col;
                    else props.unique = false;
                }

                //if index property is missing, create one
                if (!props.index) _data.cols[col].index = new priv.ext.XDate();
                props.column = col;

                //set any initial filter
                if (!skipCols) {
                    if (props.filter == undefined) props.filter = true;
                    if (props.filter && typeof props.type != "bool" && typeof props.filter != "boolean") {
                        _filterCols[col] = _filterCols[col] || {
                            filter: String(props.filter),
                            col: props
                        };
                    }
                }
            });

            //keep any previously checked rows around?
            if (resetChecked === true || resetChecked === undefined)
                _uniqueCols = {};
            else {
                for (var key in _uniqueCols)
                    _uniqueCols[key] = priv.getRow(key);
            }

            if (_uniqueCol) {
                //create a unique column definition
                _data.cols["unique"] = {
                    column: "unique",
                    type: "unique",
                    index: -1,
                    hidden: true
                };

                //add rows that needs to be pre-checked
                $.each(_data.rows, function (index, row) {
                    if (row["checked"] === true)
                        _uniqueCols[row[_uniqueCol]] = row;
                });
            }

            _head = undefined;
            _body = undefined;
            _foot = undefined;
            priv.filter();
            priv.sort();
            priv.createTable();
        };

        /*
         filters the data.
         */
        priv.filter = function () {
            if (!priv.options.filter) return;
            if (Object.keys(_filterCols).length == 0) return;

            //get a fresh copy of the data
            _data.rows = $.extend(true, {}, _data.rowsOrg);
            var start = new priv.ext.XDate();

            //for every column with a filter, run through the rows and return the matching rows
            $.each(_filterCols, function (col, colProps) {
                priv.log('filtering on text:{0} col:{1} type:{2} '.f(colProps.filter, colProps.col.column, colProps.col.type));

                switch (colProps.col.type) {
                    case "string":
                        var filter = colProps.filter;
                        var ne = false, regex = false, validRegex = true;

                        //Escaping first character means cannot be negate or regex
                        if (filter.charAt(0) == '\\')
                            filter = filter.substr(1);
                        else {
                            var ne = filter.charAt(0) == '!';
                            if (ne) filter = filter.substring(1);
                            regex = filter.length > 0 && filter.charAt(0) == "?";
                        }

                        if (regex) {
                            filter = filter.substr(1);
                            try {filter = new RegExp(filter, "gi");}
                            catch(err) {
                                priv.log('invalid regex:{0}'.f(filter), true);
                                validRegex = false;
                            }
                        }
                        else filter = filter.toLowerCase();

                        _data.rows = $.map(_data.rows, function (row) {
                            var val = String(row[col]);

                            if (regex && validRegex) {
                                var matches = val.match(filter);
                                if (!matches && ne) return row;

                                if (matches && !ne) {
                                    var pos = 0;
                                    $.each(matches, function(index, match) {
                                        var matchMask = '<span class="filter">{0}</span>'.f(match);
                                        pos = val.indexOf(match, pos);
                                        var pre = val.substring(0, pos);
                                        var post = val.substring(pos + match.length);
                                        val = '{0}{1}{2}'.f(pre, matchMask, post);
                                        pos += matchMask.length;
                                    });

                                    if (!row[col + 'Format'] && !colProps.col.format) {
                                        row[col + 'Format'] = val;
                                    }
                                    return row;
                                }
                            }
                            else {
                                var pos = val.toLowerCase().indexOf(filter);

                                if ((pos == -1 && ne) || filter === '') return row;
                                else if (row[col] != undefined && pos >= 0 && !ne) {
                                    if (!row[col + 'Format'] && !colProps.col.format) {
                                        var pre = val.substring(0, pos);
                                        var match = val.substring(pos, pos + filter.length);
                                        var post = val.substring(pos + filter.length, row[col].length);
                                        row[col + 'Format'] = '{0}<span class="filter">{1}</span>{2}'.f(pre, match, post);
                                    }
                                    return row;
                                }
                            }
                        });
                        break;
                    case "number":
                    case "date":
                        var expr = colProps.filter.replace(/\s+/gi, ' ');
                        var pos = -1, lval, rval, op;
                        var ne = expr.charAt(0) == '!';
                        if (ne) expr = expr.substring(1);

                        //find operator,l/r value
                        $.each(["..", "="], function(index, operator) {
                            pos = expr.indexOf(operator);
                            if (pos >= 0) {
                                op = operator;
                                lval = expr.substring(0, pos);
                                rval = expr.substring(pos + op.length);

                                lval = parseFloat(lval);
                                rval = parseFloat(rval);
                                if (isNaN(lval)) lval = Number.NEGATIVE_INFINITY;
                                if (isNaN(rval)) rval = Number.MAX_VALUE;

                                if (colProps.col.type == "date") {
                                    var today = new priv.ext.XDate(priv.options.types.date.utc === true).setHours(0, 0, 0, 0);
                                    lval = today - (lval * -1) * (60 * 60 * 24 * 1000);
                                    rval = today - (rval * -1) * (60 * 60 * 24 * 1000);
                                }
                                return false;
                            }
                        });

                        _data.rows = $.map(_data.rows, function (row) {
                            var match = false;

                            switch (op) {
                                case "=":
                                    if (row[col] == rval) match = true;
                                    break;
                                case "..":
                                    if (colProps.col.type == "date") {
                                        if (row[col] >= lval && row[col] < rval) match = true;
                                    }
                                    else {
                                        if (row[col] >= lval && row[col] <= rval) match = true;
                                    }
                                    break;
                                default:
                                    break;
                            }
                            if (match && !ne ||
                                !match && ne ||
                                expr.length == 0 ||
                                pos < 0)
                                return row;
                        });
                        break;
                    case "bool":
                        _data.rows = $.map(_data.rows, function (row) {
                            if (colProps.filter === '') return row;
                            if (row[col] != undefined && ((Boolean(row[col]) && colProps.filter) || (!Boolean(row[col]) && !colProps.filter))) return row;
                        });
                        break;
                    case "unique":
                        _data.rows = $.map(_data.rows, function (row) {
                            if (colProps.filter === '') return row;
                            var a = row[_uniqueCol];
                            var b = _uniqueCols[a] ? _uniqueCols[a][_uniqueCol] : '';
                            if ((colProps.filter && a === b) || (!colProps.filter && b === '')) return row;
                        });
                        break;
                }
                if (colProps.filter === '') delete _filterCols[colProps.col.column];
            });
            priv.log('filtering finished in {0} ms.'.f(new priv.ext.XDate() - start));

            _currPage = 1;
            _data.fromRow = 0;
            _body = undefined;
            _foot = undefined;
        };

        /*
         sorts the data on the current sorting column
         */
        priv.sort = function () {
            if (!_data.cols[_currSortCol]) _currSortCol = "";
            if (!_currSortCol) return;

            var start = new priv.ext.XDate();
            priv.log('sorting on col:{0} order:{1}'.f(_currSortCol, _currSortFlip ? "desc" : "asc"));

            var isString = (_data.cols[_currSortCol].type == "string");
            _data.rows = _data.rows.sort(function (a, b) {

                var valA = a[_currSortCol];
                var valB = b[_currSortCol];

                if (isString) {
                    if (valA == undefined) valA = '';
                    if (valB == undefined) valB = '';

                    if (String(valA).toLowerCase() == String(valB).toLowerCase()) return 0;
                    if (String(valA).toLowerCase() > String(valB).toLowerCase()) return _currSortFlip ? -1 : 1;
                    else return _currSortFlip ? 1 : -1;
                } else {
                    valA = (+valA);
                    valB = (+valB);
                    if (valA == undefined || isNaN(valA)) {
                        valA = priv.options.sortEmptyLast ? _currSortFlip ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
                    }
                    if (valB == undefined || isNaN(valB)) {
                        valB = priv.options.sortEmptyLast ? _currSortFlip ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
                    }
                    if (valA == valB) return 0;
                    if (valA > valB) return _currSortFlip ? -1 : 1;
                    else return _currSortFlip ? 1 : -1;
                }
            });
            priv.log('sorting finished in {0} ms.'.f(new priv.ext.XDate() - start));
        };

        /*
         helper that returns the underlying data by the unique value
         */
        priv.getRow = function (unique) {
            var start = new priv.ext.XDate();
            var row;
            $.each(_data.rowsOrg, function (i, r) {
                if (r[_uniqueCol] == unique) {
                    row = r;
                    return false;
                }
            });
            priv.log('row lookup finished in {0} ms.'.f(new priv.ext.XDate() - start));
            return row;
        };

        /*
         helper for console logging
         */
        priv.log = function (message, isWarning) {
            if (isWarning)
                console.warn(message);
            else if (priv.options.debug)
                console.log(message);
        };

        /*
        helper to detect transition support
         */
        priv.supportsTransition = function() {
            var style = document.createElement('p').style;
            //check vendorfree support
            if( style['transition'] == '' )
                return true;

            //check vendor support
            var vendorSupport = false;
             $.each(_vendors, function (index, vendor) {
                 if ('{0}Transition'.f(vendor) in style) {
                     vendorSupport = true;
                     return false;
                 }
             });
            return vendorSupport;
        };


        /* Event Handlers
         *************************************************************************/

        /*
         when: typing a filter
         what: triggers filtering on the value
         */
        priv.filterChanged = function (e) {
            //clear old timer if we're typing fast enough
            if (_filterTimeout) {
                clearTimeout(_filterTimeout);
                priv.log('filtering cancelled');
            }

            var filter = this.value;
            var col = _data.cols[e.data.column];
            var timeout = 200;

            //boolean filters needs some special care
            if (col.type == "bool" || col.type == "unique") {
                timeout = 0;
                var elem = $(this);
                var cssClass = 'indeterminate';
                if (elem.hasClass(cssClass)) {
                    e.preventDefault();
                    elem.removeClass(cssClass);
                    filter = true;
                } else {
                    if (!elem.is(':checked')) {
                        filter = false;
                    } else {
                        elem.addClass(cssClass);
                        filter = '';
                    }
                }
            }

            //add the filter to the filter array
            _filterCols[col.column] = {
                filter: filter,
                col: col
            };

            //wait a few deciseconds before filtering
            _filterTimeout = setTimeout(function () {
                _filterTimeout = undefined;
                priv.filter();
                priv.sort();
                priv.createTable();
            }, timeout);
        };

        /*
         when: changing page in pager
         what: triggers table to be created with new page
         */
        priv.pageChanged = function (e) {
            e.preventDefault();
            if (e.data.pageIndex < 1 || e.data.pageIndex > _totalPages) return;

            //if we have a valid transition, enable it.
            _transition.doTransition = (_transition.supported && priv.options.transitionDuration > 0 && _transition.available[priv.options.transition]) || false; //
            _transition.direction = e.data.pageIndex < _currPage ? 0 : 1;
            //set the new page
            _currPage = e.data.pageIndex;
            priv.log('paging to index:{0}'.f(_currPage));

            //find out what rows to create
            _data.fromRow = ((_currPage - 1) * _pageSize);
            _data.toRow = _data.fromRow + _pageSize;
            if (_data.toRow > _data.rows.length) _data.toRow = _data.rows.length;

            //trigger callback
            if (typeof priv.options.pageChanged == 'function') {
                priv.options.pageChanged.call(e.target, {
                    event: e,
                    page: _currPage
                });
            }

            _body = undefined;
            _foot = undefined;
            priv.createTable();
        };

        /*
         when: changing pagesize in pagesize dropdown
         what: triggers table to be created with new pagesize
         */
        priv.pageSizeChanged = function (e) {
            e.preventDefault();
            var val = $(this).text().toLowerCase();
            priv.log('pagesize changed to:{0}'.f(val));

            //set the new pagesize
            if (val == "all") priv.options.pageSize = _data.rows.length;
            else priv.options.pageSize = parseInt(val);

            //revert to first page, as its gets messy otherwise.
            _currPage = 1;
            _data.fromRow = 0;
            _data.toRow = _data.fromRow + priv.options.pageSize;
            if (_data.toRow > _data.rows.length) _data.toRow = _data.rows.length;

            //trigger callback
            if (typeof priv.options.pageSizeChanged == 'function') {
                priv.options.pageSizeChanged.call(e.target, {
                    event: e,
                    pageSize: priv.options.pageSize
                });
            }

            _body = undefined;
            _foot = undefined;
            priv.createTable();
        };

        /*
         when: clicking a column
         what: triggers table to be sorted by the column
         */
        priv.columnClicked = function (e) {
            e.preventDefault();
            priv.log('col:{0} clicked'.f(e.data.column));

            //set the new sorting column
            if (_currSortCol == e.data.column) _currSortFlip = !_currSortFlip;
            _currSortCol = e.data.column;

            //trigger callback
            if (typeof priv.options.columnClicked == 'function') {
                priv.options.columnClicked.call(e.target, {
                    event: e,
                    column: _data.cols[_currSortCol],
                    descending: _currSortFlip
                });
            }

            _headSort = undefined;
            _body = undefined;
            priv.sort();
            priv.createTable();
        };

        /*
         when: clicking a column in columnpicker
         what: triggers table to show/hide the column
         */
        priv.columnPickerClicked = function (e) {
            e.stopPropagation();

            var elem = $(this);
            var col = elem.val();
            priv.log('col:{0} {1}'.f(col, elem.is(':checked') ? 'checked' : 'unchecked'));

            //toggle column visibility
            _data.cols[col].hidden = !_data.cols[col].hidden;

            _data.cols[col].index = _data.cols[col].index || new priv.ext.XDate();
            _head = undefined;
            _body = undefined;
            priv.createTable();
        };

        /*
         when: clicking the check-all checkbox
         what: toggles checked state on all rows, and adds/removes them from checked array
         */
        priv.checkToggleChanged = function (e) {
            var elem = $(this);

            if (elem.is(':checked')) {
                var start = new priv.ext.XDate();
                //for every row(except non checkables), add it to the checked array
                $.each(_data.rows, function (index, props) {
                    var row = _data.rows[index];
                    if (row.checkable === false) return;
                    _uniqueCols[props[_uniqueCol]] = row;
                });
                priv.log('{0} rows checked in {1} ms.'.f(_data.rows.length, new priv.ext.XDate() - start));
                _checkToggleChecked = true;
            }
            else {
                var start = new priv.ext.XDate();
                //for every checked row(except non checkables), remove it from checked array
                for (var key in _uniqueCols) {
                    var row = _uniqueCols[key];
                    if (row.checkable === false)
                        continue;
                    else
                        delete _uniqueCols[key];
                }
                priv.log('{0} rows unchecked in {1} ms.'.f(_data.rows.length, new priv.ext.XDate() - start));
                _checkToggleChecked = false;
            }
            _body = undefined;
            priv.createTable();
        };

        /*
         when: clicking a row checkbox
         what: toggles checked state on row, and add/removes it from checked array
         */
        priv.rowChecked = function (e) {
            var elem = $(this);

            //get the row's unique value
            var unique = elem.closest('tr').data('unique');
            priv.log('row({0}) {1}'.f(unique, elem.is(':checked') ? 'checked' : 'unchecked'));

            //store the row in checked array
            if (elem.is(':checked')) _uniqueCols[unique] = priv.getRow(unique);
            else delete _uniqueCols[unique];
        };

        /*
         when: clicking anywhere on a row
         what: row data and other info is returned to caller
         */
        priv.rowClicked = function (e) {
            if (!_uniqueCol) {
                priv.log('no unique column specified');
                return;
            }

            //gather callback data
            var elem = $(this);
            var column = _data.cols[elem.data('column')];
            var unique = elem.closest('tr').data('unique');
            var row = priv.getRow(unique);
            var isChecked = elem.closest('tr').find('.unique').is(':checked');

            //trigger callback
            if (typeof priv.options.rowClicked == 'function') {
                priv.options.rowClicked.call(e.target, {
                    event: e,
                    row: row,
                    column: column,
                    checked: isChecked
                });
            }

        };

        /*
         when: clicking a datepicker operator
         what: sets the datepicker operator before a datepicker date is chosen.
         */
        priv.dpOpChanged = function(e) {
            priv.log('dp oper:{0} clicked'.f(e.data.op));
            e.preventDefault();
            _currDpOp = e.data.op;
        };

        /*
         when: clicking a datepicker date
         what: triggers filtering on the date
         */
        priv.dpClicked = function (e) {
            priv.log('dp date:{0} clicked'.f(new priv.ext.XDate(e.date, priv.options.types.date.utc === true).toString('yyyy-MM-dd')));

            e.preventDefault();
            input = $(this).prev('input.filter').get(0);
            Placeholders.disable(input); //Remove date placeholders for IE

            var today = new priv.ext.XDate(false).setHours(0, 0, 0, 0);
            var daysDiff = Math.floor(e.date / (60 * 60 * 24 * 1000)) - Math.floor(today / (60 * 60 * 24 * 1000));

            var filter = $(e.data.input);
            var op = "..";
            var pos = filter.val().indexOf(op);
            var lval = filter.val().substring(0, pos);
            var rval = filter.val().substring(pos + op.length);

            if (_currDpOp == "l") lval = daysDiff;
            if (_currDpOp == "r") rval = daysDiff;

            filter.val("{0}{1}{2}".f(lval, op, rval));
            Placeholders.enable(input);
            $(this).datepicker('hide');
            filter.trigger('keyup');
        };


        /* Public API
         *************************************************************************/

        publ.init = function (options) {
            priv.log('watable initialization...');
            //merge supplied options with defaults
            $.extend(priv.options, defaults, options);
            priv.init();
            return publ;
        };

        publ.update = function (callback, skipCols, resetChecked) {
            priv.log('publ.update called');
            priv.update(callback, skipCols, resetChecked);
            return publ;
        };

        publ.getData = function (checked, filtered) {
            priv.log('publ.getData called');
            checked = checked || false;
            filtered = filtered || false;

            var data = $.extend(true, {}, _data);
            delete data.cols["unique"];

            $.each(data.cols, function(col) {
                if (_filterCols[col]) data.cols[col].filter = _filterCols[col].filter;
            });

            if (!filtered) {
                delete data.rows;
                data.rows = data.rowsOrg;
            }
            delete data.rowsOrg;
            delete data.fromRow;
            delete data.toRow;

            if (checked) {
                delete data.rows;
                data.rows = $.map(_uniqueCols, function (val, index) {
                    return val;
                });
            }
            return data;
        };

        publ.setData = function (data, skipCols, resetChecked) {
            priv.log('publ.setData called');
            priv.setData(data, skipCols, resetChecked);
            return publ;
        };

        publ.option = function (option, val) {
            priv.log('publ.option called');
            if (val == undefined) return priv.options[option];
            priv.options[option] = val;
            _head = undefined;
            _body = undefined;
            _foot = undefined;
            priv.createTable();
            return publ;
        };

        return publ;
    };

    $.fn.WATable = function (options) {
        options = options || {};
        return this.each(function () {
            options.id = this;
            $(this).data('WATable', new WATable().init(options));
        });
    };

    String.prototype.format = String.prototype.f = function () {
        var s = this;
        var i = arguments.length;
        while (i--) s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        return s;
    };

    //IE Polyfills
    /* placeholders.js */ (function(t){"use strict";function e(t,e,r){return t.addEventListener?t.addEventListener(e,r,!1):t.attachEvent?t.attachEvent("on"+e,r):void 0}function r(t,e){var r,n;for(r=0,n=t.length;n>r;r++)if(t[r]===e)return!0;return!1}function n(t,e){var r;t.createTextRange?(r=t.createTextRange(),r.move("character",e),r.select()):t.selectionStart&&(t.focus(),t.setSelectionRange(e,e))}function a(t,e){try{return t.type=e,!0}catch(r){return!1}}t.Placeholders={Utils:{addEventListener:e,inArray:r,moveCaret:n,changeType:a}}})(this),function(t){"use strict";function e(t){var e;return t.value===t.getAttribute(S)&&"true"===t.getAttribute(I)?(t.setAttribute(I,"false"),t.value="",t.className=t.className.replace(R,""),e=t.getAttribute(P),e&&(t.type=e),!0):!1}function r(t){var e,r=t.getAttribute(S);return""===t.value&&r?(t.setAttribute(I,"true"),t.value=r,t.className+=" "+k,e=t.getAttribute(P),e?t.type="text":"password"===t.type&&H.changeType(t,"text")&&t.setAttribute(P,"password"),!0):!1}function n(t,e){var r,n,a,u,i;if(t&&t.getAttribute(S))e(t);else for(r=t?t.getElementsByTagName("input"):v,n=t?t.getElementsByTagName("textarea"):b,i=0,u=r.length+n.length;u>i;i++)a=r.length>i?r[i]:n[i-r.length],e(a)}function a(t){n(t,e)}function u(t){n(t,r)}function i(t){return function(){f&&t.value===t.getAttribute(S)&&"true"===t.getAttribute(I)?H.moveCaret(t,0):e(t)}}function l(t){return function(){r(t)}}function c(t){return function(e){return p=t.value,"true"===t.getAttribute(I)?!(p===t.getAttribute(S)&&H.inArray(C,e.keyCode)):void 0}}function o(t){return function(){var e;"true"===t.getAttribute(I)&&t.value!==p&&(t.className=t.className.replace(R,""),t.value=t.value.replace(t.getAttribute(S),""),t.setAttribute(I,!1),e=t.getAttribute(P),e&&(t.type=e)),""===t.value&&(t.blur(),H.moveCaret(t,0))}}function s(t){return function(){t===document.activeElement&&t.value===t.getAttribute(S)&&"true"===t.getAttribute(I)&&H.moveCaret(t,0)}}function d(t){return function(){a(t)}}function g(t){t.form&&(x=t.form,x.getAttribute(U)||(H.addEventListener(x,"submit",d(x)),x.setAttribute(U,"true"))),H.addEventListener(t,"focus",i(t)),H.addEventListener(t,"blur",l(t)),f&&(H.addEventListener(t,"keydown",c(t)),H.addEventListener(t,"keyup",o(t)),H.addEventListener(t,"click",s(t))),t.setAttribute(j,"true"),t.setAttribute(S,y),r(t)}var v,b,f,h,p,m,A,y,E,x,T,N,L,w=["text","search","url","tel","email","password","number","textarea"],C=[27,33,34,35,36,37,38,39,40,8,46],B="#ccc",k="placeholdersjs",R=RegExp("\\b"+k+"\\b"),S="data-placeholder-value",I="data-placeholder-active",P="data-placeholder-type",U="data-placeholder-submit",j="data-placeholder-bound",V="data-placeholder-focus",q="data-placeholder-live",z=document.createElement("input"),D=document.getElementsByTagName("head")[0],F=document.documentElement,G=t.Placeholders,H=G.Utils;if(void 0===z.placeholder){for(v=document.getElementsByTagName("input"),b=document.getElementsByTagName("textarea"),f="false"===F.getAttribute(V),h="false"!==F.getAttribute(q),m=document.createElement("style"),m.type="text/css",A=document.createTextNode("."+k+" { color:"+B+"; }"),m.styleSheet?m.styleSheet.cssText=A.nodeValue:m.appendChild(A),D.insertBefore(m,D.firstChild),L=0,N=v.length+b.length;N>L;L++)T=v.length>L?v[L]:b[L-v.length],y=T.getAttribute("placeholder"),y&&H.inArray(w,T.type)&&g(T);E=setInterval(function(){for(L=0,N=v.length+b.length;N>L;L++)T=v.length>L?v[L]:b[L-v.length],y=T.getAttribute("placeholder"),y&&H.inArray(w,T.type)&&(T.getAttribute(j)||g(T),(y!==T.getAttribute(S)||"password"===T.type&&!T.getAttribute(P))&&("password"===T.type&&!T.getAttribute(P)&&H.changeType(T,"text")&&T.setAttribute(P,"password"),T.value===T.getAttribute(S)&&(T.value=y),T.setAttribute(S,y)));h||clearInterval(E)},100)}G.disable=a,G.enable=u}(this);
    /* json3 */ (function(){var e=null;(function(t){function r(t){if(r[t]!==u)return r[t];var s;if("bug-string-char-index"==t)s="a"!="a"[0];else if("json"==t)s=r("json-stringify")&&r("json-parse");else{var o;if("json-stringify"==t){s=l.stringify;var a="function"==typeof s&&c;if(a){(o=function(){return 1}).toJSON=o;try{a="0"===s(0)&&"0"===s(new Number)&&'""'==s(new String)&&s(i)===u&&s(u)===u&&s()===u&&"1"===s(o)&&"[1]"==s([o])&&"[null]"==s([u])&&"null"==s(e)&&"[null,null,null]"==s([u,i,e])&&'{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'==s({a:[o,!0,!1,e,"\0\b\n\f\r	"]})&&"1"===s(e,o)&&"[\n 1,\n 2\n]"==s([1,2],e,1)&&'"-271821-04-20T00:00:00.000Z"'==s(new Date(-864e13))&&'"+275760-09-13T00:00:00.000Z"'==s(new Date(864e13))&&'"-000001-01-01T00:00:00.000Z"'==s(new Date(-621987552e5))&&'"1969-12-31T23:59:59.999Z"'==s(new Date(-1))}catch(f){a=!1}}s=a}if("json-parse"==t){s=l.parse;if("function"==typeof s)try{if(0===s("0")&&!s(!1)){o=s('{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}');var h=5==o.a.length&&1===o.a[0];if(h){try{h=!s('"	"')}catch(p){}if(h)try{h=1!==s("01")}catch(d){}if(h)try{h=1!==s("1.")}catch(v){}}}}catch(m){h=!1}s=h}}return r[t]=!!s}var i={}.toString,s,o,u,a=typeof define==="function"&&define.amd,f="object"==typeof JSON&&JSON,l="object"==typeof exports&&exports&&!exports.nodeType&&exports;l&&f?(l.stringify=f.stringify,l.parse=f.parse):l=t.JSON=f||{};var c=new Date(-0xc782b5b800cec);try{c=-109252==c.getUTCFullYear()&&0===c.getUTCMonth()&&1===c.getUTCDate()&&10==c.getUTCHours()&&37==c.getUTCMinutes()&&6==c.getUTCSeconds()&&708==c.getUTCMilliseconds()}catch(h){}if(!r("json")){var p=r("bug-string-char-index");if(!c)var d=Math.floor,v=[0,31,59,90,120,151,181,212,243,273,304,334],m=function(e,t){return v[t]+365*(e-1970)+d((e-1969+(t=+(t>1)))/4)-d((e-1901+t)/100)+d((e-1601+t)/400)};if(!(s={}.hasOwnProperty))s=function(t){var r={},o;if((r.__proto__=e,r.__proto__={toString:1},r).toString!=i)s=function(t){var r=this.__proto__,t=t in(this.__proto__=e,this);this.__proto__=r;return t};else{o=r.constructor;s=function(e){var t=(this.constructor||o).prototype;return e in this&&!(e in t&&this[e]===t[e])}}r=e;return s.call(this,t)};var g={"boolean":1,number:1,string:1,"undefined":1};o=function(t,r){var u=0,a,f,l;(a=function(){this.valueOf=0}).prototype.valueOf=0;f=new a;for(l in f)s.call(f,l)&&u++;a=f=e;if(u)o=u==2?function(e,t){var n={},r=i.call(e)=="[object Function]",o;for(o in e)!(r&&o=="prototype")&&!s.call(n,o)&&(n[o]=1)&&s.call(e,o)&&t(o)}:function(e,t){var n=i.call(e)=="[object Function]",r,o;for(r in e)!(n&&r=="prototype")&&s.call(e,r)&&!(o=r==="constructor")&&t(r);(o||s.call(e,r="constructor"))&&t(r)};else{f=["valueOf","toString","toLocaleString","propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"];o=function(e,t){var n=i.call(e)=="[object Function]",r,o;if(o=!n)if(o=typeof e.constructor!="function"){o=typeof e.hasOwnProperty;o=o=="object"?!!e.hasOwnProperty:!g[o]}o=o?e.hasOwnProperty:s;for(r in e)!(n&&r=="prototype")&&o.call(e,r)&&t(r);for(n=f.length;r=f[--n];o.call(e,r)&&t(r));}}return o(t,r)};if(!r("json-stringify")){var y={92:"\\\\",34:'\\"',8:"\\b",12:"\\f",10:"\\n",13:"\\r",9:"\\t"},b=function(e,t){return("000000"+(t||0)).slice(-e)},w=function(e){var t='"',n=0,r=e.length,i=r>10&&p,s;for(i&&(s=e.split(""));n<r;n++){var o=e.charCodeAt(n);switch(o){case 8:case 9:case 10:case 12:case 13:case 34:case 92:t=t+y[o];break;default:if(o<32){t=t+("\\u00"+b(2,o.toString(16)));break}t=t+(i?s[n]:p?e.charAt(n):e[n])}}return t+'"'},E=function(t,r,a,f,l,c,h){var p,v,g,y,S,x,T,N,C;try{p=r[t]}catch(k){}if(typeof p=="object"&&p){v=i.call(p);if(v=="[object Date]"&&!s.call(p,"toJSON"))if(p>-1/0&&p<1/0){if(m){y=d(p/864e5);for(v=d(y/365.2425)+1970-1;m(v+1,0)<=y;v++);for(g=d((y-m(v,0))/30.42);m(v,g+1)<=y;g++);y=1+y-m(v,g);S=(p%864e5+864e5)%864e5;x=d(S/36e5)%24;T=d(S/6e4)%60;N=d(S/1e3)%60;S=S%1e3}else{v=p.getUTCFullYear();g=p.getUTCMonth();y=p.getUTCDate();x=p.getUTCHours();T=p.getUTCMinutes();N=p.getUTCSeconds();S=p.getUTCMilliseconds()}p=(v<=0||v>=1e4?(v<0?"-":"+")+b(6,v<0?-v:v):b(4,v))+"-"+b(2,g+1)+"-"+b(2,y)+"T"+b(2,x)+":"+b(2,T)+":"+b(2,N)+"."+b(3,S)+"Z"}else p=e;else if(typeof p.toJSON=="function"&&(v!="[object Number]"&&v!="[object String]"&&v!="[object Array]"||s.call(p,"toJSON")))p=p.toJSON(t)}a&&(p=a.call(r,t,p));if(p===e)return"null";v=i.call(p);if(v=="[object Boolean]")return""+p;if(v=="[object Number]")return p>-1/0&&p<1/0?""+p:"null";if(v=="[object String]")return w(""+p);if(typeof p=="object"){for(t=h.length;t--;)if(h[t]===p)throw TypeError();h.push(p);C=[];r=c;c=c+l;if(v=="[object Array]"){g=0;for(t=p.length;g<t;g++){v=E(g,p,a,f,l,c,h);C.push(v===u?"null":v)}t=C.length?l?"[\n"+c+C.join(",\n"+c)+"\n"+r+"]":"["+C.join(",")+"]":"[]"}else{o(f||p,function(e){var t=E(e,p,a,f,l,c,h);t!==u&&C.push(w(e)+":"+(l?" ":"")+t)});t=C.length?l?"{\n"+c+C.join(",\n"+c)+"\n"+r+"}":"{"+C.join(",")+"}":"{}"}h.pop();return t}};l.stringify=function(e,t,n){var r,s,o,u;if(typeof t=="function"||typeof t=="object"&&t)if((u=i.call(t))=="[object Function]")s=t;else if(u=="[object Array]"){o={};for(var a=0,f=t.length,l;a<f;l=t[a++],(u=i.call(l),u=="[object String]"||u=="[object Number]")&&(o[l]=1));}if(n)if((u=i.call(n))=="[object Number]"){if((n=n-n%1)>0){r="";for(n>10&&(n=10);r.length<n;r=r+" ");}}else u=="[object String]"&&(r=n.length<=10?n:n.slice(0,10));return E("",(l={},l[""]=e,l),s,o,r,"",[])}}if(!r("json-parse")){var S=String.fromCharCode,x={92:"\\",34:'"',47:"/",98:"\b",116:"	",110:"\n",102:"\f",114:"\r"},T,N,C=function(){T=N=e;throw SyntaxError()},k=function(){for(var t=N,r=t.length,i,s,o,u,a;T<r;){a=t.charCodeAt(T);switch(a){case 9:case 10:case 13:case 32:T++;break;case 123:case 125:case 91:case 93:case 58:case 44:i=p?t.charAt(T):t[T];T++;return i;case 34:i="@";for(T++;T<r;){a=t.charCodeAt(T);if(a<32)C();else if(a==92){a=t.charCodeAt(++T);switch(a){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:i=i+x[a];T++;break;case 117:s=++T;for(o=T+4;T<o;T++){a=t.charCodeAt(T);a>=48&&a<=57||a>=97&&a<=102||a>=65&&a<=70||C()}i=i+S("0x"+t.slice(s,T));break;default:C()}}else{if(a==34)break;a=t.charCodeAt(T);for(s=T;a>=32&&a!=92&&a!=34;)a=t.charCodeAt(++T);i=i+t.slice(s,T)}}if(t.charCodeAt(T)==34){T++;return i}C();default:s=T;if(a==45){u=true;a=t.charCodeAt(++T)}if(a>=48&&a<=57){for(a==48&&(a=t.charCodeAt(T+1),a>=48&&a<=57)&&C();T<r&&(a=t.charCodeAt(T),a>=48&&a<=57);T++);if(t.charCodeAt(T)==46){for(o=++T;o<r&&(a=t.charCodeAt(o),a>=48&&a<=57);o++);o==T&&C();T=o}a=t.charCodeAt(T);if(a==101||a==69){a=t.charCodeAt(++T);(a==43||a==45)&&T++;for(o=T;o<r&&(a=t.charCodeAt(o),a>=48&&a<=57);o++);o==T&&C();T=o}return+t.slice(s,T)}u&&C();if(t.slice(T,T+4)=="true"){T=T+4;return true}if(t.slice(T,T+5)=="false"){T=T+5;return false}if(t.slice(T,T+4)=="null"){T=T+4;return e}C()}}return"$"},L=function(e){var t,n;e=="$"&&C();if(typeof e=="string"){if((p?e.charAt(0):e[0])=="@")return e.slice(1);if(e=="["){for(t=[];;n||(n=true)){e=k();if(e=="]")break;if(n)if(e==","){e=k();e=="]"&&C()}else C();e==","&&C();t.push(L(e))}return t}if(e=="{"){for(t={};;n||(n=true)){e=k();if(e=="}")break;if(n)if(e==","){e=k();e=="}"&&C()}else C();(e==","||typeof e!="string"||(p?e.charAt(0):e[0])!="@"||k()!=":")&&C();t[e.slice(1)]=L(k())}return t}C()}return e},A=function(e,t,n){n=O(e,t,n);n===u?delete e[t]:e[t]=n},O=function(e,t,n){var r=e[t],s;if(typeof r=="object"&&r)if(i.call(r)=="[object Array]")for(s=r.length;s--;)A(r,s,n);else o(r,function(e){A(r,e,n)});return n.call(e,t,r)};l.parse=function(t,r){var s,o;T=0;N=""+t;s=L(k());k()!="$"&&C();T=N=e;return r&&i.call(r)=="[object Function]"?O((o={},o[""]=s,o),"",r):s}}}a&&define(function(){return l})})(this)})();
    Object.keys = Object.keys || function(o) { var result = []; for(var name in o) {  if (o.hasOwnProperty(name)) result.push(name); } return result; };
    String.prototype.trim = String.prototype.trim || function () { return this.replace(/^\s+|\s+$/g,''); };
    Date.now = Date.now || function() { return +new Date; };
    console = window.console || { log:function(){}, warn:function(){} };

})(jQuery);
/**
 * BootstrapValidator (http://bootstrapvalidator.com)
 *
 * The best jQuery plugin to validate form fields. Designed to use with Bootstrap 3
 *
 * @version     v0.4.5
 * @author      https://twitter.com/nghuuphuoc
 * @copyright   (c) 2013 - 2014 Nguyen Huu Phuoc
 * @license     MIT
 */

!function(a){var b=function(c,d){this.$form=a(c),this.options=a.extend({},b.DEFAULT_OPTIONS,d),this.$invalidField=null,this.$submitButton=null,this.STATUS_NOT_VALIDATED="NOT_VALIDATED",this.STATUS_VALIDATING="VALIDATING",this.STATUS_INVALID="INVALID",this.STATUS_VALID="VALID";var e=function(){for(var a=3,b=document.createElement("div"),c=b.all||[];b.innerHTML="<!--[if gt IE "+ ++a+"]><br><![endif]-->",c[0];);return a>4?a:!a}(),f=document.createElement("div");this._changeEvent=9!==e&&"oninput"in f?"input":"keyup",this._submitIfValid=null,this._init()};b.DEFAULT_OPTIONS={elementClass:"bv-form",message:"This value is not valid",threshold:null,excluded:[":disabled",":hidden",":not(:visible)"],feedbackIcons:{valid:null,invalid:null,validating:null},submitButtons:'[type="submit"]',submitHandler:null,live:"enabled",fields:null},b.prototype={constructor:b,_init:function(){var b,c,d,e,f,g,h,i=this,j={excluded:this.$form.attr("data-bv-excluded"),trigger:this.$form.attr("data-bv-trigger"),message:this.$form.attr("data-bv-message"),submitButtons:this.$form.attr("data-bv-submitbuttons"),threshold:this.$form.attr("data-bv-threshold"),live:this.$form.attr("data-bv-live"),fields:{},feedbackIcons:{valid:this.$form.attr("data-bv-feedbackicons-valid"),invalid:this.$form.attr("data-bv-feedbackicons-invalid"),validating:this.$form.attr("data-bv-feedbackicons-validating")}};this.$form.attr("novalidate","novalidate").addClass(this.options.elementClass).on("submit.bv",function(a){a.preventDefault(),i.validate()}).on("click",this.options.submitButtons,function(){i.$submitButton=a(this),i._submitIfValid=!0}).find("[name], [data-bv-field]").each(function(){var k=a(this);if(!i._isExcluded(k)){var l=k.attr("name")||k.attr("data-bv-field"),m={};for(c in a.fn.bootstrapValidator.validators)if(b=a.fn.bootstrapValidator.validators[c],d=k.attr("data-bv-"+c.toLowerCase())+"",h="function"==typeof b.enableByHtml5?b.enableByHtml5(a(this)):null,h&&"false"!=d||h!==!0&&(""==d||"true"==d)){b.html5Attributes=b.html5Attributes||{message:"message"},m[c]=a.extend({},1==h?{}:h,m[c]);for(g in b.html5Attributes)e=b.html5Attributes[g],f=k.attr("data-bv-"+c.toLowerCase()+"-"+g),f&&("true"==f?f=!0:"false"==f&&(f=!1),m[c][e]=f)}var n={trigger:k.attr("data-bv-trigger"),message:k.attr("data-bv-message"),container:k.attr("data-bv-container"),selector:k.attr("data-bv-selector"),threshold:k.attr("data-bv-threshold"),validators:m};a.isEmptyObject(n.validators)||a.isEmptyObject(n)||(k.attr("data-bv-field",l),j.fields[l]=a.extend({},n,j.fields[l]))}}).end().find(this.options.submitButtons).each(function(){a("<input/>").attr("type","hidden").attr("name",a(this).attr("name")).val(a(this).val()).appendTo(i.$form)}),this.options=a.extend(!0,this.options,j);for(var k in this.options.fields)this._initField(k);this.setLiveMode(this.options.live)},_initField:function(b){if(null!=this.options.fields[b]&&null!=this.options.fields[b].validators){var c=this.getFieldElements(b);if(null==c)return void delete this.options.fields[b];for(var d in this.options.fields[b].validators)a.fn.bootstrapValidator.validators[d]||delete this.options.fields[b].validators[d];for(var e=this,f=c.attr("type"),g="radio"==f||"checkbox"==f||"file"==f||"SELECT"==c[0].tagName?"change":e._changeEvent,h=c.length,i=1==h||"radio"==f||"checkbox"==f,j=0;h>j;j++){var k=a(c[j]),l=k.parents(".form-group"),m=this.options.fields[b].container?l.find(this.options.fields[b].container):this._getMessageContainer(k);k.attr("data-bv-field")||k.attr("data-bv-field",b),k.on(g+".update.bv",function(){e._submitIfValid=!1,i?e.updateStatus(b,e.STATUS_NOT_VALIDATED,null):e.updateElementStatus(a(this),e.STATUS_NOT_VALIDATED,null)}),k.data("bv.messages",m);for(d in this.options.fields[b].validators)k.data("bv.result."+d,this.STATUS_NOT_VALIDATED),i&&j!=h-1||a("<small/>").css("display","none").attr("data-bv-validator",d).attr("data-bv-validator-for",b).html(this.options.fields[b].validators[d].message||this.options.fields[b].message||this.options.message).addClass("help-block").appendTo(m);if(this.options.feedbackIcons&&this.options.feedbackIcons.validating&&this.options.feedbackIcons.invalid&&this.options.feedbackIcons.valid&&(!i||j==h-1)){l.addClass("has-feedback");var n=a("<i/>").css("display","none").addClass("form-control-feedback").attr("data-bv-icon-for",b).insertAfter(k);0==l.find("label").length&&n.css("top",0)}}null==this.options.fields[b].enabled&&(this.options.fields[b].enabled=!0)}},_getMessageContainer:function(a){var b=a.parent();if(b.hasClass("form-group"))return b;var c=b.attr("class");if(!c)return this._getMessageContainer(b);c=c.split(" ");for(var d=c.length,e=0;d>e;e++)if(/^col-(xs|sm|md|lg)-\d+$/.test(c[e])||/^col-(xs|sm|md|lg)-offset-\d+$/.test(c[e]))return b;return this._getMessageContainer(b)},_submit:function(){if(this.isValid())this.options.submitHandler&&"function"==typeof this.options.submitHandler?this.options.submitHandler.call(this,this,this.$form,this.$submitButton):this.disableSubmitButtons(!0).defaultSubmit();else if("submitted"==this.options.live&&this.setLiveMode("enabled"),this.$invalidField){var b,c=this.$invalidField.parents(".tab-pane");c&&(b=c.attr("id"))&&a('a[href="#'+b+'"][data-toggle="tab"]').trigger("click.bs.tab.data-api"),this.$invalidField.focus()}},_isExcluded:function(b){if(this.options.excluded){"string"==typeof this.options.excluded&&(this.options.excluded=a.map(this.options.excluded.split(","),function(b){return a.trim(b)}));for(var c=this.options.excluded.length,d=0;c>d;d++)if("string"==typeof this.options.excluded[d]&&b.is(this.options.excluded[d])||"function"==typeof this.options.excluded[d]&&1==this.options.excluded[d].call(this,b,this))return!0}return!1},_exceedThreshold:function(a){var b=a.attr("data-bv-field"),c=this.options.fields[b].threshold||this.options.threshold;if(!c)return!0;var d=a.attr("type"),e=-1!=["button","checkbox","file","hidden","image","radio","reset","submit"].indexOf(d);return e||a.val().length>=c},getFieldElements:function(b){var c=this.options.fields[b].selector?a(this.options.fields[b].selector):this.$form.find('[name="'+b+'"]');return 0==c.length?null:c},setLiveMode:function(b){if(this.options.live=b,"submitted"==b)return this;var c=this;for(var d in this.options.fields)!function(e){var f=c.getFieldElements(e);if(f)for(var g=f.attr("type"),h=f.length,i=1==h||"radio"==g||"checkbox"==g,j=c.options.fields[d].trigger||c.options.trigger||("radio"==g||"checkbox"==g||"file"==g||"SELECT"==f[0].tagName?"change":c._changeEvent),k=a.map(j.split(" "),function(a){return a+".live.bv"}).join(" "),l=0;h>l;l++)"enabled"==b?a(f[l]).on(k,function(){c._exceedThreshold(a(this))&&(i?c.validateField(e):c.validateFieldElement(a(this),!1))}):a(f[l]).off(k)}(d);return this},disableSubmitButtons:function(a){return a?"disabled"!=this.options.live&&this.$form.find(this.options.submitButtons).attr("disabled","disabled"):this.$form.find(this.options.submitButtons).removeAttr("disabled"),this},validate:function(){if(!this.options.fields)return this;this.disableSubmitButtons(!0);for(var a in this.options.fields)this.validateField(a);return this.$submitButton&&this._submit(),this},validateField:function(b){for(var c=this.getFieldElements(b),d=c.attr("type"),e="radio"==d||"checkbox"==d?1:c.length,f=0;e>f;f++)this.validateFieldElement(a(c[f]),1==e);return this},validateFieldElement:function(b,c){var d,e,f=this,g=b.attr("data-bv-field"),h=this.options.fields[g].validators;if(!this.options.fields[g].enabled||this._isExcluded(b))return this;for(d in h){b.data("bv.dfs."+d)&&b.data("bv.dfs."+d).reject();var i=b.data("bv.result."+d);i!=this.STATUS_VALID&&i!=this.STATUS_INVALID&&(b.data("bv.result."+d,this.STATUS_VALIDATING),e=a.fn.bootstrapValidator.validators[d].validate(this,b,h[d]),"object"==typeof e?(c?this.updateStatus(g,this.STATUS_VALIDATING,d):this.updateElementStatus(b,this.STATUS_VALIDATING,d),b.data("bv.dfs."+d,e),e.done(function(a,b,d){a.removeData("bv.dfs."+b),c?f.updateStatus(a.attr("data-bv-field"),d?f.STATUS_VALID:f.STATUS_INVALID,b):f.updateElementStatus(a,d?f.STATUS_VALID:f.STATUS_INVALID,b),d&&1==f._submitIfValid&&f._submit()})):"boolean"==typeof e&&(c?this.updateStatus(g,e?this.STATUS_VALID:this.STATUS_INVALID,d):this.updateElementStatus(b,e?this.STATUS_VALID:this.STATUS_INVALID,d)))}return this},updateStatus:function(b,c,d){for(var e=this.getFieldElements(b),f=e.attr("type"),g="radio"==f||"checkbox"==f?1:e.length,h=0;g>h;h++)this.updateElementStatus(a(e[h]),c,d);return this},updateElementStatus:function(b,c,d){var e=this,f=b.attr("data-bv-field"),g=b.parents(".form-group"),h=b.data("bv.messages"),i=h.find(".help-block[data-bv-validator]"),j=g.find('.form-control-feedback[data-bv-icon-for="'+f+'"]');if(d)b.data("bv.result."+d,c);else for(var k in this.options.fields[f].validators)b.data("bv.result."+k,c);var l,m,n=b.parents(".tab-pane");switch(n&&(l=n.attr("id"))&&(m=a('a[href="#'+l+'"][data-toggle="tab"]').parent()),c){case this.STATUS_VALIDATING:this.disableSubmitButtons(!0),g.removeClass("has-success").removeClass("has-error"),d?i.filter('.help-block[data-bv-validator="'+d+'"]').hide():i.hide(),j&&j.removeClass(this.options.feedbackIcons.valid).removeClass(this.options.feedbackIcons.invalid).addClass(this.options.feedbackIcons.validating).show(),m&&m.removeClass("bv-tab-success").removeClass("bv-tab-error");break;case this.STATUS_INVALID:this.disableSubmitButtons(!0),g.removeClass("has-success").addClass("has-error"),d?i.filter('[data-bv-validator="'+d+'"]').show():i.show(),j&&j.removeClass(this.options.feedbackIcons.valid).removeClass(this.options.feedbackIcons.validating).addClass(this.options.feedbackIcons.invalid).show(),m&&m.removeClass("bv-tab-success").addClass("bv-tab-error");break;case this.STATUS_VALID:d?i.filter('[data-bv-validator="'+d+'"]').hide():i.hide();var o=0==i.filter(function(){var c=a(this).css("display"),d=a(this).attr("data-bv-validator");return"block"==c||b.data("bv.result."+d)!=e.STATUS_VALID}).length;this.disableSubmitButtons(!o),j&&j.removeClass(this.options.feedbackIcons.invalid).removeClass(this.options.feedbackIcons.validating).removeClass(this.options.feedbackIcons.valid).addClass(o?this.options.feedbackIcons.valid:this.options.feedbackIcons.invalid).show();var p=function(c){return 0==c.find(".help-block[data-bv-validator]").filter(function(){var c=a(this).css("display"),d=a(this).attr("data-bv-validator");return"block"==c||b.data("bv.result."+d)&&b.data("bv.result."+d)!=e.STATUS_VALID}).length};g.removeClass("has-error has-success").addClass(p(g)?"has-success":"has-error"),m&&m.removeClass("bv-tab-success").removeClass("bv-tab-error").addClass(p(n)?"bv-tab-success":"bv-tab-error");break;case this.STATUS_NOT_VALIDATED:default:this.disableSubmitButtons(!1),g.removeClass("has-success").removeClass("has-error"),d?i.filter('.help-block[data-bv-validator="'+d+'"]').hide():i.hide(),j&&j.removeClass(this.options.feedbackIcons.valid).removeClass(this.options.feedbackIcons.invalid).removeClass(this.options.feedbackIcons.validating).hide(),m&&m.removeClass("bv-tab-success").removeClass("bv-tab-error")}return this},isValid:function(){var b,c,d,e,f,g,h,i;for(c in this.options.fields)if(null!=this.options.fields[c]&&this.options.fields[c].enabled)for(b=this.getFieldElements(c),e=b.attr("type"),h="radio"==e||"checkbox"==e?1:b.length,i=0;h>i;i++)if(d=a(b[i]),!this._isExcluded(d))for(g in this.options.fields[c].validators){if(f=d.data("bv.result."+g),f==this.STATUS_NOT_VALIDATED||f==this.STATUS_VALIDATING)return!1;if(f==this.STATUS_INVALID)return this.$invalidField=d,!1}return!0},defaultSubmit:function(){this.$form.off("submit.bv").submit()},resetForm:function(b){var c,d,e,f,g;for(c in this.options.fields){d=this.getFieldElements(c),e=d.length;for(var h=0;e>h;h++)for(g in this.options.fields[c].validators)a(d[h]).removeData("bv.dfs."+g);this.updateStatus(c,this.STATUS_NOT_VALIDATED,null),b&&(f=d.attr("type"),"radio"==f||"checkbox"==f?d.removeAttr("checked").removeAttr("selected"):d.val(""))}return this.$invalidField=null,this.$submitButton=null,this.disableSubmitButtons(!1),this},enableFieldValidators:function(a,b){return this.options.fields[a].enabled=b,this.updateStatus(a,this.STATUS_NOT_VALIDATED,null),this}},a.fn.bootstrapValidator=function(c){var d=arguments;return this.each(function(){var e=a(this),f=e.data("bootstrapValidator"),g="object"==typeof c&&c;f||(f=new b(this,g),e.data("bootstrapValidator",f)),"string"==typeof c&&f[c].apply(f,Array.prototype.slice.call(d,1))})},a.fn.bootstrapValidator.validators={},a.fn.bootstrapValidator.Constructor=b,a.fn.bootstrapValidator.helpers={date:function(a,b,c,d){if(1e3>a||a>9999||0==b||b>12)return!1;var e=[31,28,31,30,31,30,31,31,30,31,30,31];if((a%400==0||a%100!=0&&a%4==0)&&(e[1]=29),0>c||c>e[b-1])return!1;if(d===!0){var f=new Date,g=f.getFullYear(),h=f.getMonth(),i=f.getDate();return g>a||a==g&&h>b-1||a==g&&b-1==h&&i>c}return!0},luhn:function(a){for(var b=a.length,c=0,d=[[0,1,2,3,4,5,6,7,8,9],[0,2,4,6,8,1,3,5,7,9]],e=0;b--;)e+=d[c][parseInt(a.charAt(b),10)],c^=1;return e%10===0&&e>0},mod_11_10:function(a){for(var b=5,c=a.length,d=0;c>d;d++)b=(2*(b||10)%11+parseInt(a.charAt(d),10))%10;return 1==b},mod_37_36:function(a,b){b=b||"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";for(var c=b.length,d=a.length,e=Math.floor(c/2),f=0;d>f;f++)e=(2*(e||c)%(c+1)+b.indexOf(a.charAt(f)))%c;return 1==e}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.base64={validate:function(a,b){var c=b.val();return""==c?!0:/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(c)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.between={html5Attributes:{message:"message",min:"min",max:"max",inclusive:"inclusive"},enableByHtml5:function(a){return"range"==a.attr("type")?{min:a.attr("min"),max:a.attr("max")}:!1},validate:function(a,b,c){var d=b.val();return""==d?!0:(d=parseFloat(d),c.inclusive===!0?d>c.min&&d<c.max:d>=c.min&&d<=c.max)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.callback={validate:function(b,c,d){var e=c.val();if(d.callback&&"function"==typeof d.callback){var f=new a.Deferred;return f.resolve(c,"callback",d.callback.call(this,e,b)),f}return!0}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.choice={html5Attributes:{message:"message",min:"min",max:"max"},validate:function(a,b,c){var d=b.is("select")?a.getFieldElements(b.attr("data-bv-field")).find("option").filter(":selected").length:a.getFieldElements(b.attr("data-bv-field")).filter(":checked").length;return c.min&&d<c.min||c.max&&d>c.max?!1:!0}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.creditCard={validate:function(b,c){var d=c.val();if(""==d)return!0;if(/[^0-9-\s]+/.test(d))return!1;if(d=d.replace(/\D/g,""),!a.fn.bootstrapValidator.helpers.luhn(d))return!1;var e,f,g={AMERICAN_EXPRESS:{length:[15],prefix:["34","37"]},DINERS_CLUB:{length:[14],prefix:["300","301","302","303","304","305","36"]},DINERS_CLUB_US:{length:[16],prefix:["54","55"]},DISCOVER:{length:[16],prefix:["6011","622126","622127","622128","622129","62213","62214","62215","62216","62217","62218","62219","6222","6223","6224","6225","6226","6227","6228","62290","62291","622920","622921","622922","622923","622924","622925","644","645","646","647","648","649","65"]},JCB:{length:[16],prefix:["3528","3529","353","354","355","356","357","358"]},LASER:{length:[16,17,18,19],prefix:["6304","6706","6771","6709"]},MAESTRO:{length:[12,13,14,15,16,17,18,19],prefix:["5018","5020","5038","6304","6759","6761","6762","6763","6764","6765","6766"]},MASTERCARD:{length:[16],prefix:["51","52","53","54","55"]},SOLO:{length:[16,18,19],prefix:["6334","6767"]},UNIONPAY:{length:[16,17,18,19],prefix:["622126","622127","622128","622129","62213","62214","62215","62216","62217","62218","62219","6222","6223","6224","6225","6226","6227","6228","62290","62291","622920","622921","622922","622923","622924","622925"]},VISA:{length:[16],prefix:["4"]}};for(e in g)for(f in g[e].prefix)if(d.substr(0,g[e].prefix[f].length)==g[e].prefix[f]&&-1!=g[e].length.indexOf(d.length))return!0;return!1}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.cusip={validate:function(b,c){var d=c.val();if(""==d)return!0;if(d=d.toUpperCase(),!/^[0-9A-Z]{9}$/.test(d))return!1;for(var e=a.map(d.split(""),function(a){var b=a.charCodeAt(0);return b>="A".charCodeAt(0)&&b<="Z".charCodeAt(0)?b-"A".charCodeAt(0)+10:a}),f=e.length,g=0,h=0;f-1>h;h++){var i=parseInt(e[h]);h%2!=0&&(i*=2),i>9&&(i-=9),g+=i}return g=(10-g%10)%10,g==e[f-1]}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.cvv={html5Attributes:{message:"message",ccfield:"creditCardField"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;if(!/^[0-9]{3,4}$/.test(d))return!1;if(!c.creditCardField)return!0;var e=a.getFieldElements(c.creditCardField).val();if(""==e)return!0;e=e.replace(/\D/g,"");var f,g,h={AMERICAN_EXPRESS:{length:[15],prefix:["34","37"]},DINERS_CLUB:{length:[14],prefix:["300","301","302","303","304","305","36"]},DINERS_CLUB_US:{length:[16],prefix:["54","55"]},DISCOVER:{length:[16],prefix:["6011","622126","622127","622128","622129","62213","62214","62215","62216","62217","62218","62219","6222","6223","6224","6225","6226","6227","6228","62290","62291","622920","622921","622922","622923","622924","622925","644","645","646","647","648","649","65"]},JCB:{length:[16],prefix:["3528","3529","353","354","355","356","357","358"]},LASER:{length:[16,17,18,19],prefix:["6304","6706","6771","6709"]},MAESTRO:{length:[12,13,14,15,16,17,18,19],prefix:["5018","5020","5038","6304","6759","6761","6762","6763","6764","6765","6766"]},MASTERCARD:{length:[16],prefix:["51","52","53","54","55"]},SOLO:{length:[16,18,19],prefix:["6334","6767"]},UNIONPAY:{length:[16,17,18,19],prefix:["622126","622127","622128","622129","62213","62214","62215","62216","62217","62218","62219","6222","6223","6224","6225","6226","6227","6228","62290","62291","622920","622921","622922","622923","622924","622925"]},VISA:{length:[16],prefix:["4"]}},i=null;for(f in h)for(g in h[f].prefix)if(e.substr(0,h[f].prefix[g].length)==h[f].prefix[g]&&-1!=h[f].length.indexOf(e.length)){i=f;break}return null==i?!1:"AMERICAN_EXPRESS"==i?4==d.length:3==d.length}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.date={html5Attributes:{message:"message",format:"format"},validate:function(b,c,d){var e=c.val();if(""==e)return!0;d.format=d.format||"MM/DD/YYYY";var f=d.format.split(" "),g=f[0],h=f.length>1?f[1]:null,i=f.length>2?f[2]:null,j=e.split(" "),k=j[0],l=j.length>1?j[1]:null;if(f.length!=j.length)return!1;var m=-1!=k.indexOf("/")?"/":-1!=k.indexOf("-")?"-":null;if(null==m)return!1;k=k.split(m),g=g.split(m);var n=k[g.indexOf("YYYY")],o=k[g.indexOf("MM")],p=k[g.indexOf("DD")],q=null,r=null,s=null;if(h){if(h=h.split(":"),l=l.split(":"),h.length!=l.length)return!1;if(r=l.length>0?l[0]:null,q=l.length>1?l[1]:null,s=l.length>2?l[2]:null,s&&(s=parseInt(s,10),0>s||s>60))return!1;if(r&&(r=parseInt(r,10),0>r||r>=24||i&&r>12))return!1;if(q&&(q=parseInt(q,10),0>q||q>59))return!1}return p=parseInt(p,10),o=parseInt(o,10),n=parseInt(n,10),a.fn.bootstrapValidator.helpers.date(n,o,p)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.different={html5Attributes:{message:"message",field:"field"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e=a.getFieldElements(c.field);return null==e?!0:d!=e.val()?(a.updateStatus(c.field,a.STATUS_VALID,"different"),!0):!1}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.digits={validate:function(a,b){var c=b.val();return""==c?!0:/^\d+$/.test(c)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.ean={validate:function(a,b){var c=b.val();if(""==c)return!0;if(!/^(\d{8}|\d{12}|\d{13})$/.test(c))return!1;for(var d=c.length,e=0,f=8==d?[3,1]:[1,3],g=0;d-1>g;g++)e+=parseInt(c.charAt(g))*f[g%2];return e=10-e%10,e==c.charAt(d-1)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.emailAddress={enableByHtml5:function(a){return"email"==a.attr("type")},validate:function(a,b){var c=b.val();if(""==c)return!0;var d=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;return d.test(c)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.file={html5Attributes:{extension:"extension",maxsize:"maxSize",message:"message",type:"type"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e,f=c.extension?c.extension.split(","):null,g=c.type?c.type.split(","):null,h=window.File&&window.FileList&&window.FileReader;if(h)for(var i=b.get(0).files,j=i.length,k=0;j>k;k++){if(c.maxSize&&i[k].size>parseInt(c.maxSize))return!1;if(e=i[k].name.substr(i[k].name.lastIndexOf(".")+1),f&&-1==f.indexOf(e))return!1;if(g&&-1==g.indexOf(i[k].type))return!1}else if(e=d.substr(d.lastIndexOf(".")+1),f&&-1==f.indexOf(e))return!1;return!0}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.greaterThan={html5Attributes:{message:"message",value:"value",inclusive:"inclusive"},enableByHtml5:function(a){var b=a.attr("min");return b?{value:b}:!1},validate:function(a,b,c){var d=b.val();return""==d?!0:(d=parseFloat(d),c.inclusive===!0?d>c.value:d>=c.value)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.grid={validate:function(b,c){var d=c.val();return""==d?!0:(d=d.toUpperCase(),/^[GRID:]*([0-9A-Z]{2})[-\s]*([0-9A-Z]{5})[-\s]*([0-9A-Z]{10})[-\s]*([0-9A-Z]{1})$/g.test(d)?(d=d.replace(/\s/g,"").replace(/-/g,""),"GRID:"==d.substr(0,5)&&(d=d.substr(5)),a.fn.bootstrapValidator.helpers.mod_37_36(d)):!1)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.hex={validate:function(a,b){var c=b.val();return""==c?!0:/^[0-9a-fA-F]+$/.test(c)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.hexColor={enableByHtml5:function(a){return"color"==a.attr("type")},validate:function(a,b){var c=b.val();return""==c?!0:/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(c)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.iban={html5Attributes:{message:"message",country:"country"},validate:function(b,c,d){var e=c.val();if(""==e)return!0;var f={AD:"AD[0-9]{2}[0-9]{4}[0-9]{4}[A-Z0-9]{12}",AE:"AE[0-9]{2}[0-9]{3}[0-9]{16}",AL:"AL[0-9]{2}[0-9]{8}[A-Z0-9]{16}",AO:"AO[0-9]{2}[0-9]{21}",AT:"AT[0-9]{2}[0-9]{5}[0-9]{11}",AZ:"AZ[0-9]{2}[A-Z]{4}[A-Z0-9]{20}",BA:"BA[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{8}[0-9]{2}",BE:"BE[0-9]{2}[0-9]{3}[0-9]{7}[0-9]{2}",BF:"BF[0-9]{2}[0-9]{23}",BG:"BG[0-9]{2}[A-Z]{4}[0-9]{4}[0-9]{2}[A-Z0-9]{8}",BH:"BH[0-9]{2}[A-Z]{4}[A-Z0-9]{14}",BI:"BI[0-9]{2}[0-9]{12}",BJ:"BJ[0-9]{2}[A-Z]{1}[0-9]{23}",BR:"BR[0-9]{2}[0-9]{8}[0-9]{5}[0-9]{10}[A-Z][A-Z0-9]",CH:"CH[0-9]{2}[0-9]{5}[A-Z0-9]{12}",CI:"CI[0-9]{2}[A-Z]{1}[0-9]{23}",CM:"CM[0-9]{2}[0-9]{23}",CR:"CR[0-9]{2}[0-9]{3}[0-9]{14}",CV:"CV[0-9]{2}[0-9]{21}",CY:"CY[0-9]{2}[0-9]{3}[0-9]{5}[A-Z0-9]{16}",CZ:"CZ[0-9]{2}[0-9]{20}",DE:"DE[0-9]{2}[0-9]{8}[0-9]{10}",DK:"DK[0-9]{2}[0-9]{14}",DO:"DO[0-9]{2}[A-Z0-9]{4}[0-9]{20}",DZ:"DZ[0-9]{2}[0-9]{20}",EE:"EE[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{11}[0-9]{1}",ES:"ES[0-9]{2}[0-9]{4}[0-9]{4}[0-9]{1}[0-9]{1}[0-9]{10}",FI:"FI[0-9]{2}[0-9]{6}[0-9]{7}[0-9]{1}",FO:"FO[0-9]{2}[0-9]{4}[0-9]{9}[0-9]{1}",FR:"FR[0-9]{2}[0-9]{5}[0-9]{5}[A-Z0-9]{11}[0-9]{2}",GB:"GB[0-9]{2}[A-Z]{4}[0-9]{6}[0-9]{8}",GE:"GE[0-9]{2}[A-Z]{2}[0-9]{16}",GI:"GI[0-9]{2}[A-Z]{4}[A-Z0-9]{15}",GL:"GL[0-9]{2}[0-9]{4}[0-9]{9}[0-9]{1}",GR:"GR[0-9]{2}[0-9]{3}[0-9]{4}[A-Z0-9]{16}",GT:"GT[0-9]{2}[A-Z0-9]{4}[A-Z0-9]{20}",HR:"HR[0-9]{2}[0-9]{7}[0-9]{10}",HU:"HU[0-9]{2}[0-9]{3}[0-9]{4}[0-9]{1}[0-9]{15}[0-9]{1}",IE:"IE[0-9]{2}[A-Z]{4}[0-9]{6}[0-9]{8}",IL:"IL[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{13}",IR:"IR[0-9]{2}[0-9]{22}",IS:"IS[0-9]{2}[0-9]{4}[0-9]{2}[0-9]{6}[0-9]{10}",IT:"IT[0-9]{2}[A-Z]{1}[0-9]{5}[0-9]{5}[A-Z0-9]{12}",JO:"JO[0-9]{2}[A-Z]{4}[0-9]{4}[0]{8}[A-Z0-9]{10}",KW:"KW[0-9]{2}[A-Z]{4}[0-9]{22}",KZ:"KZ[0-9]{2}[0-9]{3}[A-Z0-9]{13}",LB:"LB[0-9]{2}[0-9]{4}[A-Z0-9]{20}",LI:"LI[0-9]{2}[0-9]{5}[A-Z0-9]{12}",LT:"LT[0-9]{2}[0-9]{5}[0-9]{11}",LU:"LU[0-9]{2}[0-9]{3}[A-Z0-9]{13}",LV:"LV[0-9]{2}[A-Z]{4}[A-Z0-9]{13}",MC:"MC[0-9]{2}[0-9]{5}[0-9]{5}[A-Z0-9]{11}[0-9]{2}",MD:"MD[0-9]{2}[A-Z0-9]{20}",ME:"ME[0-9]{2}[0-9]{3}[0-9]{13}[0-9]{2}",MG:"MG[0-9]{2}[0-9]{23}",MK:"MK[0-9]{2}[0-9]{3}[A-Z0-9]{10}[0-9]{2}",ML:"ML[0-9]{2}[A-Z]{1}[0-9]{23}",MR:"MR13[0-9]{5}[0-9]{5}[0-9]{11}[0-9]{2}",MT:"MT[0-9]{2}[A-Z]{4}[0-9]{5}[A-Z0-9]{18}",MU:"MU[0-9]{2}[A-Z]{4}[0-9]{2}[0-9]{2}[0-9]{12}[0-9]{3}[A-Z]{3}",MZ:"MZ[0-9]{2}[0-9]{21}",NL:"NL[0-9]{2}[A-Z]{4}[0-9]{10}",NO:"NO[0-9]{2}[0-9]{4}[0-9]{6}[0-9]{1}",PK:"PK[0-9]{2}[A-Z]{4}[A-Z0-9]{16}",PL:"PL[0-9]{2}[0-9]{8}[0-9]{16}",PS:"PS[0-9]{2}[A-Z]{4}[A-Z0-9]{21}",PT:"PT[0-9]{2}[0-9]{4}[0-9]{4}[0-9]{11}[0-9]{2}",QA:"QA[0-9]{2}[A-Z]{4}[A-Z0-9]{21}",RO:"RO[0-9]{2}[A-Z]{4}[A-Z0-9]{16}",RS:"RS[0-9]{2}[0-9]{3}[0-9]{13}[0-9]{2}",SA:"SA[0-9]{2}[0-9]{2}[A-Z0-9]{18}",SE:"SE[0-9]{2}[0-9]{3}[0-9]{16}[0-9]{1}",SI:"SI[0-9]{2}[0-9]{5}[0-9]{8}[0-9]{2}",SK:"SK[0-9]{2}[0-9]{4}[0-9]{6}[0-9]{10}",SM:"SM[0-9]{2}[A-Z]{1}[0-9]{5}[0-9]{5}[A-Z0-9]{12}",SN:"SN[0-9]{2}[A-Z]{1}[0-9]{23}",TN:"TN59[0-9]{2}[0-9]{3}[0-9]{13}[0-9]{2}",TR:"TR[0-9]{2}[0-9]{5}[A-Z0-9]{1}[A-Z0-9]{16}",VG:"VG[0-9]{2}[A-Z]{4}[0-9]{16}"};e=e.replace(/[^a-zA-Z0-9]/g,"").toUpperCase();var g=d.country||e.substr(0,2);if(!f[g])return!1;if(!new RegExp("^"+f[g]+"$").test(e))return!1;e=e.substr(4)+e.substr(0,4),e=a.map(e.split(""),function(a){var b=a.charCodeAt(0);return b>="A".charCodeAt(0)&&b<="Z".charCodeAt(0)?b-"A".charCodeAt(0)+10:a}),e=e.join("");for(var h=parseInt(e.substr(0,1),10),i=e.length,j=1;i>j;++j)h=(10*h+parseInt(e.substr(j,1),10))%97;return 1==h}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.id={html5Attributes:{message:"message",country:"country"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e=c.country||d.substr(0,2),f=["_",e.toLowerCase()].join("");return this[f]&&"function"==typeof this[f]?this[f](d):!0},_validateJMBG:function(a,b){if(!/^\d{13}$/.test(a))return!1;var c=parseInt(a.substr(0,2),10),d=parseInt(a.substr(2,2),10),e=(parseInt(a.substr(4,3),10),parseInt(a.substr(7,2),10)),f=parseInt(a.substr(12,1),10);if(c>31||d>12)return!1;for(var g=0,h=0;6>h;h++)g+=(7-h)*(parseInt(a.charAt(h))+parseInt(a.charAt(h+6)));if(g=11-g%11,(10==g||11==g)&&(g=0),g!=f)return!1;switch(b.toUpperCase()){case"BA":return e>=10&&19>=e;case"MK":return e>=41&&49>=e;case"ME":return e>=20&&29>=e;case"RS":return e>=70&&99>=e;case"SI":return e>=50&&59>=e;default:return!0}},_ba:function(a){return this._validateJMBG(a,"BA")},_mk:function(a){return this._validateJMBG(a,"MK")},_me:function(a){return this._validateJMBG(a,"ME")},_rs:function(a){return this._validateJMBG(a,"RS")},_si:function(a){return this._validateJMBG(a,"SI")},_bg:function(b){if(!/^\d{10}$/.test(b)&&!/^\d{6}\s\d{3}\s\d{1}$/.test(b))return!1;b=b.replace(/\s/g,"");var c=parseInt(b.substr(0,2),10)+1900,d=parseInt(b.substr(2,2),10),e=parseInt(b.substr(4,2),10);if(d>40?(c+=100,d-=40):d>20&&(c-=100,d-=20),!a.fn.bootstrapValidator.helpers.date(c,d,e))return!1;for(var f=0,g=[2,4,8,5,10,9,7,3,6],h=0;9>h;h++)f+=parseInt(b.charAt(h))*g[h];return f=f%11%10,f==b.substr(9,1)},_br:function(a){if(/^1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11}|0{11}$/.test(a))return!1;if(!/^\d{11}$/.test(a)&&!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(a))return!1;a=a.replace(/\./g,"").replace(/-/g,"");for(var b=0,c=0;9>c;c++)b+=(10-c)*parseInt(a.charAt(c));if(b=11-b%11,(10==b||11==b)&&(b=0),b!=a.charAt(9))return!1;var d=0;for(c=0;10>c;c++)d+=(11-c)*parseInt(a.charAt(c));return d=11-d%11,(10==d||11==d)&&(d=0),d==a.charAt(10)},_ch:function(a){if(!/^756[\.]{0,1}[0-9]{4}[\.]{0,1}[0-9]{4}[\.]{0,1}[0-9]{2}$/.test(a))return!1;a=a.replace(/\D/g,"").substr(3);for(var b=a.length,c=0,d=8==b?[3,1]:[1,3],e=0;b-1>e;e++)c+=parseInt(a.charAt(e))*d[e%2];return c=10-c%10,c==a.charAt(b-1)},_cl:function(a){if(!/^\d{7,8}[-]{0,1}[0-9K]$/.test(a))return!1;for(a=a.replace(/\D/g,"");a.length<9;)a="0"+a;for(var b=0,c=[3,2,7,6,5,4,3,2],d=0;8>d;d++)b+=parseInt(a.charAt(d))*c[d];return b=11-b%11,11==b?b=0:10==b&&(b="K"),b==a.charAt(8)},_cz:function(b){if(!/^\d{9,10}$/.test(b))return!1;var c=1900+parseInt(b.substr(0,2)),d=parseInt(b.substr(2,2))%50%20,e=parseInt(b.substr(4,2));if(9==b.length){if(c>=1980&&(c-=100),c>1953)return!1}else 1954>c&&(c+=100);if(!a.fn.bootstrapValidator.helpers.date(c,d,e))return!1;if(10==b.length){var f=parseInt(b.substr(0,9),10)%11;return 1985>c&&(f%=10),f==b.substr(9,1)}return!0},_dk:function(b){if(!/^[0-9]{6}[-]{0,1}[0-9]{4}$/.test(b))return!1;b=b.replace(/-/g,"");var c=parseInt(b.substr(0,2),10),d=parseInt(b.substr(2,2),10),e=parseInt(b.substr(4,2),10);switch(!0){case-1!="5678".indexOf(b.charAt(6))&&e>=58:e+=1800;break;case-1!="0123".indexOf(b.charAt(6)):case-1!="49".indexOf(b.charAt(6))&&e>=37:e+=1900;break;default:e+=2e3}return a.fn.bootstrapValidator.helpers.date(e,d,c)},_ee:function(a){return this._lt(a)},_es:function(a){if(!/^[0-9A-Z]{8}[-]{0,1}[0-9A-Z]$/.test(a)&&!/^[XYZ][-]{0,1}[0-9]{7}[-]{0,1}[0-9A-Z]$/.test(a))return!1;a=a.replace(/-/g,"");var b="XYZ".indexOf(a.charAt(0));-1!=b&&(a=b+a.substr(1)+"");var c=parseInt(a.substr(0,8),10);return c="TRWAGMYFPDXBNJZSQVHLCKE"[c%23],c==a.substr(8,1)},_fi:function(b){if(!/^[0-9]{6}[-+A][0-9]{3}[0-9ABCDEFHJKLMNPRSTUVWXY]$/.test(b))return!1;var c=parseInt(b.substr(0,2),10),d=parseInt(b.substr(2,2),10),e=parseInt(b.substr(4,2),10),f={"+":1800,"-":1900,A:2e3};if(e=f[b.charAt(6)]+e,!a.fn.bootstrapValidator.helpers.date(e,d,c))return!1;var g=parseInt(b.substr(7,3));if(2>g)return!1;var h=b.substr(0,6)+b.substr(7,3)+"";return h=parseInt(h),"0123456789ABCDEFHJKLMNPRSTUVWXY".charAt(h%31)==b.charAt(10)},_hr:function(b){return/^[0-9]{11}$/.test(b)?a.fn.bootstrapValidator.helpers.mod_11_10(b):!1},_ie:function(a){if(!/^\d{7}[A-W][AHWTX]?$/.test(a))return!1;var b=function(a){for(;a.length<7;)a="0"+a;for(var b="WABCDEFGHIJKLMNOPQRSTUV",c=0,d=0;7>d;d++)c+=parseInt(a.charAt(d))*(8-d);return c+=9*b.indexOf(a.substr(7)),b[c%23]};return 9!=a.length||"A"!=a.charAt(8)&&"H"!=a.charAt(8)?a.charAt(7)==b(a.substr(0,7)):a.charAt(7)==b(a.substr(0,7)+a.substr(8)+"")},_is:function(b){if(!/^[0-9]{6}[-]{0,1}[0-9]{4}$/.test(b))return!1;b=b.replace(/-/g,"");var c=parseInt(b.substr(0,2),10),d=parseInt(b.substr(2,2),10),e=parseInt(b.substr(4,2),10),f=parseInt(b.charAt(9));if(e=9==f?1900+e:100*(20+f)+e,!a.fn.bootstrapValidator.helpers.date(e,d,c,!0))return!1;for(var g=0,h=[3,2,7,6,5,4,3,2],i=0;8>i;i++)g+=parseInt(b.charAt(i))*h[i];return g=11-g%11,g==b.charAt(8)},_lt:function(b){if(!/^[0-9]{11}$/.test(b))return!1;var c=parseInt(b.charAt(0)),d=parseInt(b.substr(1,2),10),e=parseInt(b.substr(3,2),10),f=parseInt(b.substr(5,2),10),g=c%2==0?17+c/2:17+(c+1)/2;if(d=100*g+d,!a.fn.bootstrapValidator.helpers.date(d,e,f,!0))return!1;for(var h=0,i=[1,2,3,4,5,6,7,8,9,1],j=0;10>j;j++)h+=parseInt(b.charAt(j))*i[j];if(h%=11,10!=h)return h==b.charAt(10);for(h=0,i=[3,4,5,6,7,8,9,1,2,3],j=0;10>j;j++)h+=parseInt(b.charAt(j))*i[j];return h%=11,10==h&&(h=0),h==b.charAt(10)},_lv:function(b){if(!/^[0-9]{6}[-]{0,1}[0-9]{5}$/.test(b))return!1;b=b.replace(/\D/g,"");var c=parseInt(b.substr(0,2)),d=parseInt(b.substr(2,2)),e=parseInt(b.substr(4,2));if(e=e+1800+100*parseInt(b.charAt(6)),!a.fn.bootstrapValidator.helpers.date(e,d,c,!0))return!1;for(var f=0,g=[10,5,8,4,2,1,6,3,7,9],h=0;10>h;h++)f+=parseInt(b.charAt(h))*g[h];return f=(f+1)%11%10,f==b.charAt(10)},_nl:function(a){for(;a.length<9;)a="0"+a;if(!/^[0-9]{4}[.]{0,1}[0-9]{2}[.]{0,1}[0-9]{3}$/.test(a))return!1;if(a=a.replace(/\./g,""),0==parseInt(a,10))return!1;for(var b=0,c=a.length,d=0;c-1>d;d++)b+=(9-d)*parseInt(a.charAt(d));return b%=11,10==b&&(b=0),b==a.charAt(c-1)},_ro:function(b){if(!/^[0-9]{13}$/.test(b))return!1;var c=parseInt(b.charAt(0));if(0==c||7==c||8==c)return!1;var d=parseInt(b.substr(1,2),10),e=parseInt(b.substr(3,2),10),f=parseInt(b.substr(5,2),10),g={1:1900,2:1900,3:1800,4:1800,5:2e3,6:2e3};if(f>31&&e>12)return!1;if(9!=c&&(d=g[c+""]+d,!a.fn.bootstrapValidator.helpers.date(d,e,f)))return!1;for(var h=0,i=[2,7,9,1,4,6,3,5,8,2,7,9],j=b.length,k=0;j-1>k;k++)h+=parseInt(b.charAt(k))*i[k];
return h%=11,10==h&&(h=1),h==b.charAt(j-1)},_se:function(b){if(!/^[0-9]{10}$/.test(b)&&!/^[0-9]{6}[-|+][0-9]{4}$/.test(b))return!1;b=b.replace(/[^0-9]/g,"");var c=parseInt(b.substr(0,2))+1900,d=parseInt(b.substr(2,2)),e=parseInt(b.substr(4,2));return a.fn.bootstrapValidator.helpers.date(c,d,e)?a.fn.bootstrapValidator.helpers.luhn(b):!1},_sk:function(a){return this._cz(a)},_sm:function(a){return/^\d{5}$/.test(a)},_za:function(b){if(!/^[0-9]{10}[0|1][8|9][0-9]$/.test(b))return!1;var c=parseInt(b.substr(0,2)),d=(new Date).getFullYear()%100,e=parseInt(b.substr(2,2)),f=parseInt(b.substr(4,2));return c=c>=d?c+1900:c+2e3,a.fn.bootstrapValidator.helpers.date(c,e,f)?a.fn.bootstrapValidator.helpers.luhn(b):!1}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.identical={html5Attributes:{message:"message",field:"field"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e=a.getFieldElements(c.field);return null==e?!0:d==e.val()?(a.updateStatus(c.field,a.STATUS_VALID,"identical"),!0):!1}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.imei={validate:function(b,c){var d=c.val();if(""==d)return!0;switch(!0){case/^\d{15}$/.test(d):case/^\d{2}-\d{6}-\d{6}-\d{1}$/.test(d):case/^\d{2}\s\d{6}\s\d{6}\s\d{1}$/.test(d):return d=d.replace(/[^0-9]/g,""),a.fn.bootstrapValidator.helpers.luhn(d);case/^\d{14}$/.test(d):case/^\d{16}$/.test(d):case/^\d{2}-\d{6}-\d{6}(|-\d{2})$/.test(d):case/^\d{2}\s\d{6}\s\d{6}(|\s\d{2})$/.test(d):return!0;default:return!1}}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.integer={enableByHtml5:function(a){return"number"==a.attr("type")},validate:function(a,b){var c=b.val();return""==c?!0:/^(?:-?(?:0|[1-9][0-9]*))$/.test(c)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.ip={html5Attributes:{message:"message",ipv4:"ipv4",ipv6:"ipv6"},validate:function(b,c,d){var e=c.val();return""==e?!0:(d=a.extend({},{ipv4:!0,ipv6:!0},d),d.ipv4?/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(e):d.ipv6?/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str):!1)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.isbn={validate:function(a,b){var c=b.val();if(""==c)return!0;var d;switch(!0){case/^\d{9}[\dX]$/.test(c):case 13==c.length&&/^(\d+)-(\d+)-(\d+)-([\dX])$/.test(c):case 13==c.length&&/^(\d+)\s(\d+)\s(\d+)\s([\dX])$/.test(c):d="ISBN10";break;case/^(978|979)\d{9}[\dX]$/.test(c):case 17==c.length&&/^(978|979)-(\d+)-(\d+)-(\d+)-([\dX])$/.test(c):case 17==c.length&&/^(978|979)\s(\d+)\s(\d+)\s(\d+)\s([\dX])$/.test(c):d="ISBN13";break;default:return!1}c=c.replace(/[^0-9X]/gi,"");var e,f=c.split(""),g=f.length,h=0;switch(d){case"ISBN10":h=0;for(var i=0;g-1>i;i++)h+=(10-i)*parseInt(f[i]);return e=11-h%11,11==e?e=0:10==e&&(e="X"),e+""==f[g-1];case"ISBN13":h=0;for(var i=0;g-1>i;i++)h+=i%2==0?parseInt(f[i]):3*parseInt(f[i]);return e=10-h%10,10==e&&(e="0"),e+""==f[g-1];default:return!1}}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.isin={COUNTRY_CODES:"AF|AX|AL|DZ|AS|AD|AO|AI|AQ|AG|AR|AM|AW|AU|AT|AZ|BS|BH|BD|BB|BY|BE|BZ|BJ|BM|BT|BO|BQ|BA|BW|BV|BR|IO|BN|BG|BF|BI|KH|CM|CA|CV|KY|CF|TD|CL|CN|CX|CC|CO|KM|CG|CD|CK|CR|CI|HR|CU|CW|CY|CZ|DK|DJ|DM|DO|EC|EG|SV|GQ|ER|EE|ET|FK|FO|FJ|FI|FR|GF|PF|TF|GA|GM|GE|DE|GH|GI|GR|GL|GD|GP|GU|GT|GG|GN|GW|GY|HT|HM|VA|HN|HK|HU|IS|IN|ID|IR|IQ|IE|IM|IL|IT|JM|JP|JE|JO|KZ|KE|KI|KP|KR|KW|KG|LA|LV|LB|LS|LR|LY|LI|LT|LU|MO|MK|MG|MW|MY|MV|ML|MT|MH|MQ|MR|MU|YT|MX|FM|MD|MC|MN|ME|MS|MA|MZ|MM|NA|NR|NP|NL|NC|NZ|NI|NE|NG|NU|NF|MP|NO|OM|PK|PW|PS|PA|PG|PY|PE|PH|PN|PL|PT|PR|QA|RE|RO|RU|RW|BL|SH|KN|LC|MF|PM|VC|WS|SM|ST|SA|SN|RS|SC|SL|SG|SX|SK|SI|SB|SO|ZA|GS|SS|ES|LK|SD|SR|SJ|SZ|SE|CH|SY|TW|TJ|TZ|TH|TL|TG|TK|TO|TT|TN|TR|TM|TC|TV|UG|UA|AE|GB|US|UM|UY|UZ|VU|VE|VN|VG|VI|WF|EH|YE|ZM|ZW",validate:function(a,b){var c=b.val();if(""==c)return!0;c=c.toUpperCase();var d=new RegExp("^("+this.COUNTRY_CODES+")[0-9A-Z]{10}$");if(!d.test(c))return!1;for(var e="",f=c.length,g=0;f-1>g;g++){var h=c.charCodeAt(g);e+=h>57?(h-55).toString():c.charAt(g)}var i="",j=e.length,k=j%2!=0?0:1;for(g=0;j>g;g++)i+=parseInt(e[g])*(g%2==k?2:1)+"";var l=0;for(g=0;g<i.length;g++)l+=parseInt(i.charAt(g));return l=(10-l%10)%10,l==c.charAt(f-1)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.ismn={validate:function(a,b){var c=b.val();if(""==c)return!0;var d;switch(!0){case/^M\d{9}$/.test(c):case/^M-\d{4}-\d{4}-\d{1}$/.test(c):case/^M\s\d{4}\s\d{4}\s\d{1}$/.test(c):d="ISMN10";break;case/^9790\d{9}$/.test(c):case/^979-0-\d{4}-\d{4}-\d{1}$/.test(c):case/^979\s0\s\d{4}\s\d{4}\s\d{1}$/.test(c):d="ISMN13";break;default:return!1}"ISMN10"==d&&(c="9790"+c.substr(1)),c=c.replace(/[^0-9]/gi,"");for(var e=c.length,f=0,g=[1,3],h=0;e-1>h;h++)f+=parseInt(c.charAt(h))*g[h%2];return f=10-f%10,f==c.charAt(e-1)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.issn={validate:function(a,b){var c=b.val();if(""==c)return!0;if(!/^\d{4}\-\d{3}[\dX]$/.test(c))return!1;c=c.replace(/[^0-9X]/gi,"");var d=c.split(""),e=d.length,f=0;"X"==d[7]&&(d[7]=10);for(var g=0;e>g;g++)f+=(8-g)*parseInt(d[g]);return f%11==0}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.lessThan={html5Attributes:{message:"message",value:"value",inclusive:"inclusive"},enableByHtml5:function(a){var b=a.attr("max");return b?{value:b}:!1},validate:function(a,b,c){var d=b.val();return""==d?!0:(d=parseFloat(d),c.inclusive===!1?d<=c.value:d<c.value)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.mac={validate:function(a,b){var c=b.val();return""==c?!0:/^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/.test(c)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.notEmpty={enableByHtml5:function(a){var b=a.attr("required")+"";return"required"==b||"true"==b},validate:function(b,c){var d=c.attr("type");return"radio"==d||"checkbox"==d?b.getFieldElements(c.attr("data-bv-field")).filter(":checked").length>0:""!=a.trim(c.val())}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.numeric={html5Attributes:{message:"message",separator:"separator"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e=c.separator||".";return"."!=e&&(d=d.replace(e,".")),!isNaN(parseFloat(d))&&isFinite(d)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.phone={html5Attributes:{message:"message",country:"country"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e=(c.country||"US").toUpperCase();switch(e){case"US":default:return d=d.replace(/\D/g,""),/^(?:(1\-?)|(\+1 ?))?\(?(\d{3})[\)\-\.]?(\d{3})[\-\.]?(\d{4})$/.test(d)&&10==d.length}}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.regexp={html5Attributes:{message:"message",regexp:"regexp"},enableByHtml5:function(a){var b=a.attr("pattern");return b?{regexp:b}:!1},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e="string"==typeof c.regexp?new RegExp(c.regexp):c.regexp;return e.test(d)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.remote={html5Attributes:{message:"message",url:"url",name:"name"},validate:function(b,c,d){var e=c.val();if(""==e)return!0;var f=c.attr("data-bv-field"),g=d.data;null==g&&(g={}),"function"==typeof g&&(g=g.call(this,b)),g[d.name||f]=e;var h=new a.Deferred,i=a.ajax({type:"POST",url:d.url,dataType:"json",data:g});return i.then(function(a){h.resolve(c,"remote",a.valid===!0||"true"===a.valid)}),h.fail(function(){i.abort()}),h}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.rtn={validate:function(a,b){var c=b.val();if(""==c)return!0;if(!/^\d{9}$/.test(c))return!1;for(var d=0,e=0;e<c.length;e+=3)d+=3*parseInt(c.charAt(e),10)+7*parseInt(c.charAt(e+1),10)+parseInt(c.charAt(e+2),10);return 0!=d&&d%10==0}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.sedol={validate:function(a,b){var c=b.val();if(""==c)return!0;if(c=c.toUpperCase(),!/^[0-9A-Z]{7}$/.test(c))return!1;for(var d=0,e=[1,3,1,7,3,9,1],f=c.length,g=0;f-1>g;g++)d+=e[g]*parseInt(c.charAt(g),36);return d=(10-d%10)%10,d==c.charAt(f-1)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.siren={validate:function(b,c){var d=c.val();return""==d?!0:/^\d{9}$/.test(d)?a.fn.bootstrapValidator.helpers.luhn(d):!1}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.siret={validate:function(a,b){var c=b.val();if(""==c)return!0;for(var d,e=0,f=c.length,g=0;f>g;g++)d=parseInt(c.charAt(g),10),g%2==0&&(d=2*d,d>9&&(d-=9)),e+=d;return e%10==0}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.step={html5Attributes:{message:"message",base:"baseValue",step:"step"},validate:function(b,c,d){var e=c.val();if(""==e)return!0;if(d=a.extend({},{baseValue:0,step:1},d),e=parseFloat(e),isNaN(e)||!isFinite(e))return!1;var f=function(a,b){var c=Math.pow(10,b);a*=c;var d=a>0|-(0>a),e=a%1===.5*d;return e?(Math.floor(a)+(d>0))/c:Math.round(a)/c},g=function(a,b){if(0==b)return 1;var c=(a+"").split("."),d=(b+"").split("."),e=(1==c.length?0:c[1].length)+(1==d.length?0:d[1].length);return f(a-b*Math.floor(a/b),e)},h=g(e-d.baseValue,d.step);return 0==h||h==d.step}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.stringCase={html5Attributes:{message:"message","case":"case"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e=(c["case"]||"lower").toLowerCase();switch(e){case"upper":return d===d.toUpperCase();case"lower":default:return d===d.toLowerCase()}}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.stringLength={html5Attributes:{message:"message",min:"min",max:"max"},enableByHtml5:function(a){var b=a.attr("maxlength");return b?{max:parseInt(b,10)}:!1},validate:function(b,c,d){var e=c.val();if(""==e)return!0;var f=a.trim(e).length;return d.min&&f<d.min||d.max&&f>d.max?!1:!0}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.uri={enableByHtml5:function(a){return"url"==a.attr("type")},validate:function(a,b){var c=b.val();if(""==c)return!0;var d=new RegExp("^(?:(?:https?|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?!10(?:\\.\\d{1,3}){3})(?!127(?:\\.\\d{1,3}){3})(?!169\\.254(?:\\.\\d{1,3}){2})(?!192\\.168(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))(?::\\d{2,5})?(?:/[^\\s]*)?$","i");return d.test(c)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.uuid={html5Attributes:{message:"message",version:"version"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e={3:/^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,4:/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,5:/^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,all:/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i},f=c.version?c.version+"":"all";return null==e[f]?!0:e[f].test(d)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.vat={html5Attributes:{message:"message",country:"country"},validate:function(a,b,c){var d=b.val();if(""==d)return!0;var e=c.country||d.substr(0,2),f=["_",e.toLowerCase()].join("");return this[f]&&"function"==typeof this[f]?this[f](d):!0},_at:function(a){if(!/^ATU[0-9]{8}$/.test(a))return!1;a=a.substr(3);for(var b=0,c=[1,2,1,2,1,2,1],d=0,e=0;7>e;e++)d=parseInt(a.charAt(e))*c[e],d>9&&(d=Math.floor(d/10)+d%10),b+=d;return b=10-(b+4)%10,10==b&&(b=0),b==a.substr(7,1)},_be:function(a){if(!/^BE[0]{0,1}[0-9]{9}$/.test(a))return!1;if(a=a.substr(2),9==a.length&&(a="0"+a),0==a.substr(1,1))return!1;var b=parseInt(a.substr(0,8),10)+parseInt(a.substr(8,2),10);return b%97==0},_bg:function(b){if(!/^BG[0-9]{9,10}$/.test(b))return!1;b=b.substr(2);var c=0,d=0;if(9==b.length){for(d=0;8>d;d++)c+=parseInt(b.charAt(d))*(d+1);if(c%=11,10==c)for(c=0,d=0;8>d;d++)c+=parseInt(b.charAt(d))*(d+3);return c%=10,c==b.substr(8)}if(10==b.length){var e=function(b){var c=parseInt(b.substr(0,2),10)+1900,d=parseInt(b.substr(2,2),10),e=parseInt(b.substr(4,2),10);if(d>40?(c+=100,d-=40):d>20&&(c-=100,d-=20),!a.fn.bootstrapValidator.helpers.date(c,d,e))return!1;for(var f=0,g=[2,4,8,5,10,9,7,3,6],h=0;9>h;h++)f+=parseInt(b.charAt(h))*g[h];return f=f%11%10,f==b.substr(9,1)},f=function(a){for(var b=0,c=[21,19,17,13,11,9,7,3,1],d=0;9>d;d++)b+=parseInt(a.charAt(d))*c[d];return b%=10,b==a.substr(9,1)},g=function(a){for(var b=0,c=[4,3,2,7,6,5,4,3,2],d=0;9>d;d++)b+=parseInt(a.charAt(d))*c[d];return b=11-b%11,10==b?!1:(11==b&&(b=0),b==a.substr(9,1))};return e(b)||f(b)||g(b)}return!1},_ch:function(a){if(!/^CHE[0-9]{9}(MWST)?$/.test(a))return!1;a=a.substr(3);for(var b=0,c=[5,4,3,2,7,6,5,4],d=0;8>d;d++)b+=parseInt(a.charAt(d),10)*c[d];return b=11-b%11,10==b?!1:(11==b&&(b=0),b==a.substr(8,1))},_cy:function(a){if(!/^CY[0-5|9]{1}[0-9]{7}[A-Z]{1}$/.test(a))return!1;if(a=a.substr(2),"12"==a.substr(0,2))return!1;for(var b=0,c={0:1,1:0,2:5,3:7,4:9,5:13,6:15,7:17,8:19,9:21},d=0;8>d;d++){var e=parseInt(a.charAt(d),10);d%2==0&&(e=c[e+""]),b+=e}return b="ABCDEFGHIJKLMNOPQRSTUVWXYZ"[b%26],b==a.substr(8,1)},_cz:function(b){if(!/^CZ[0-9]{8,10}$/.test(b))return!1;b=b.substr(2);var c=0,d=0;if(8==b.length){if(b.charAt(0)+""=="9")return!1;for(c=0,d=0;7>d;d++)c+=parseInt(b.charAt(d),10)*(8-d);return c=11-c%11,10==c&&(c=0),11==c&&(c=1),c==b.substr(7,1)}if(9==b.length&&b.charAt(0)+""=="6"){for(c=0,d=0;7>d;d++)c+=parseInt(b.charAt(d+1),10)*(8-d);return c=11-c%11,10==c&&(c=0),11==c&&(c=1),c=[8,7,6,5,4,3,2,1,0,9,10][c-1],c==b.substr(8,1)}if(9==b.length||10==b.length){var e=1900+parseInt(b.substr(0,2)),f=parseInt(b.substr(2,2))%50%20,g=parseInt(b.substr(4,2));if(9==b.length){if(e>=1980&&(e-=100),e>1953)return!1}else 1954>e&&(e+=100);if(!a.fn.bootstrapValidator.helpers.date(e,f,g))return!1;if(10==b.length){var h=parseInt(b.substr(0,9),10)%11;return 1985>e&&(h%=10),h==b.substr(9,1)}return!0}return!1},_de:function(b){return/^DE[0-9]{9}$/.test(b)?(b=b.substr(2),a.fn.bootstrapValidator.helpers.mod_11_10(b)):!1},_dk:function(a){if(!/^DK[0-9]{8}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[2,7,6,5,4,3,2,1],d=0;8>d;d++)b+=parseInt(a.charAt(d),10)*c[d];return b%11==0},_ee:function(a){if(!/^EE[0-9]{9}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[3,7,1,3,7,1,3,7,1],d=0;9>d;d++)b+=parseInt(a.charAt(d))*c[d];return b%10==0},_es:function(a){if(!/^ES[0-9A-Z][0-9]{7}[0-9A-Z]$/.test(a))return!1;a=a.substr(2);var b=function(a){var b=parseInt(a.substr(0,8),10);return b="TRWAGMYFPDXBNJZSQVHLCKE"[b%23],b==a.substr(8,1)},c=function(a){var b=["XYZ".indexOf(a.charAt(0)),a.substr(1)].join("");return b=parseInt(b,10),b="TRWAGMYFPDXBNJZSQVHLCKE"[b%23],b==a.substr(8,1)},d=function(a){var b,c=a.charAt(0);if(-1!="KLM".indexOf(c))return b=parseInt(a.substr(1,8),10),b="TRWAGMYFPDXBNJZSQVHLCKE"[b%23],b==a.substr(8,1);if(-1!="ABCDEFGHJNPQRSUVW".indexOf(c)){for(var d=0,e=[2,1,2,1,2,1,2],f=0,g=0;7>g;g++)f=parseInt(a.charAt(g+1))*e[g],f>9&&(f=Math.floor(f/10)+f%10),d+=f;return d=10-d%10,d==a.substr(8,1)||"JABCDEFGHI"[d]==a.substr(8,1)}return!1},e=a.charAt(0);return/^[0-9]$/.test(e)?b(a):/^[XYZ]$/.test(e)?c(a):d(a)},_fi:function(a){if(!/^FI[0-9]{8}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[7,9,10,5,8,4,2,1],d=0;8>d;d++)b+=parseInt(a.charAt(d))*c[d];return b%11==0},_fr:function(b){if(!/^FR[0-9A-Z]{2}[0-9]{9}$/.test(b))return!1;if(b=b.substr(2),!a.fn.bootstrapValidator.helpers.luhn(b.substr(2)))return!1;if(/^[0-9]{2}$/.test(b.substr(0,2)))return b.substr(0,2)==parseInt(b.substr(2)+"12",10)%97;var c,d="0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";return c=/^[0-9]{1}$/.test(b.charAt(0))?24*d.indexOf(b.charAt(0))+d.indexOf(b.charAt(1))-10:34*d.indexOf(b.charAt(0))+d.indexOf(b.charAt(1))-100,(parseInt(b.substr(2),10)+1+Math.floor(c/11))%11==c%11},_gb:function(a){if(!(/^GB[0-9]{9}$/.test(a)||/^GB[0-9]{12}$/.test(a)||/^GBGD[0-9]{3}$/.test(a)||/^GBHA[0-9]{3}$/.test(a)||/^GB(GD|HA)8888[0-9]{5}$/.test(a)))return!1;a=a.substr(2);var b=a.length;if(5==b){var c=a.substr(0,2),d=parseInt(a.substr(2));return"GD"==c&&500>d||"HA"==c&&d>=500}if(11==b&&("GD8888"==a.substr(0,6)||"HA8888"==a.substr(0,6)))return"GD"==a.substr(0,2)&&parseInt(a.substr(6,3))>=500||"HA"==a.substr(0,2)&&parseInt(a.substr(6,3))<500?!1:parseInt(a.substr(6,3))%97==parseInt(a.substr(9,2));if(9==b||12==b){for(var e=0,f=[8,7,6,5,4,3,2,10,1],g=0;9>g;g++)e+=parseInt(a.charAt(g))*f[g];return e%=97,parseInt(a.substr(0,3))>=100?0==e||42==e||55==e:0==e}return!0},_gr:function(a){if(!/^GR[0-9]{9}$/.test(a))return!1;a=a.substr(2),8==a.length&&(a="0"+a);for(var b=0,c=[256,128,64,32,16,8,4,2],d=0;8>d;d++)b+=parseInt(a.charAt(d))*c[d];return b=b%11%10,b==a.substr(8,1)},_el:function(a){return/^EL[0-9]{9}$/.test(a)?(a="GR"+a.substr(2),this._gr(a)):!1},_hu:function(a){if(!/^HU[0-9]{8}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[9,7,3,1,9,7,3,1],d=0;8>d;d++)b+=parseInt(a.charAt(d))*c[d];return b%10==0},_hr:function(b){return/^HR[0-9]{11}$/.test(b)?(b=b.substr(2),a.fn.bootstrapValidator.helpers.mod_11_10(b)):!1},_ie:function(a){if(!/^IE[0-9]{1}[0-9A-Z\*\+]{1}[0-9]{5}[A-Z]{1,2}$/.test(a))return!1;a=a.substr(2);var b=function(a){for(;a.length<7;)a="0"+a;for(var b="WABCDEFGHIJKLMNOPQRSTUV",c=0,d=0;7>d;d++)c+=parseInt(a.charAt(d))*(8-d);return c+=9*b.indexOf(a.substr(7)),b[c%23]};return/^[0-9]+$/.test(a.substr(0,7))?a.charAt(7)==b(a.substr(0,7)+a.substr(8)+""):-1!="ABCDEFGHIJKLMNOPQRSTUVWXYZ+*".indexOf(a.charAt(1))?a.charAt(7)==b(a.substr(2,5)+a.substr(0,1)+""):!0},_it:function(b){if(!/^IT[0-9]{11}$/.test(b))return!1;if(b=b.substr(2),0==parseInt(b.substr(0,7)))return!1;var c=parseInt(b.substr(7,3));return 1>c||c>201&&999!=c&&888!=c?!1:a.fn.bootstrapValidator.helpers.luhn(b)},_lt:function(a){if(!/^LT([0-9]{7}1[0-9]{1}|[0-9]{10}1[0-9]{1})$/.test(a))return!1;a=a.substr(2);for(var b=a.length,c=0,d=0;b-1>d;d++)c+=parseInt(a.charAt(d))*(1+d%9);var e=c%11;if(10==e){c=0;for(var d=0;b-1>d;d++)c+=parseInt(a.charAt(d))*(1+(d+2)%9)}return e=e%11%10,e==a.charAt(b-1)},_lu:function(a){return/^LU[0-9]{8}$/.test(a)?(a=a.substr(2),a.substr(0,6)%89==a.substr(6,2)):!1},_lv:function(b){if(!/^LV[0-9]{11}$/.test(b))return!1;b=b.substr(2);var c=parseInt(b.charAt(0)),d=0,e=[],f=0,g=b.length;if(c>3){for(d=0,e=[9,1,4,8,3,10,2,5,7,6,1],f=0;g>f;f++)d+=parseInt(b.charAt(f))*e[f];return d%=11,3==d}var h=parseInt(b.substr(0,2)),i=parseInt(b.substr(2,2)),j=parseInt(b.substr(4,2));if(j=j+1800+100*parseInt(b.charAt(6)),!a.fn.bootstrapValidator.helpers.date(j,i,h))return!1;for(d=0,e=[10,5,8,4,2,1,6,3,7,9],f=0;g-1>f;f++)d+=parseInt(b.charAt(f))*e[f];return d=(d+1)%11%10,d==b.charAt(g-1)},_mt:function(a){if(!/^MT[0-9]{8}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[3,4,6,7,8,9,10,1],d=0;8>d;d++)b+=parseInt(a.charAt(d))*c[d];return b%37==0},_nl:function(a){if(!/^NL[0-9]{9}B[0-9]{2}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[9,8,7,6,5,4,3,2],d=0;8>d;d++)b+=parseInt(a.charAt(d))*c[d];return b%=11,b>9&&(b=0),b==a.substr(8,1)},_no:function(a){if(!/^NO[0-9]{9}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[3,2,7,6,5,4,3,2],d=0;8>d;d++)b+=parseInt(a.charAt(d))*c[d];return b=11-b%11,11==b&&(b=0),b==a.substr(8,1)},_pl:function(a){if(!/^PL[0-9]{10}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[6,5,7,2,3,4,5,6,7,-1],d=0;10>d;d++)b+=parseInt(a.charAt(d))*c[d];return b%11==0},_pt:function(a){if(!/^PT[0-9]{9}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[9,8,7,6,5,4,3,2],d=0;8>d;d++)b+=parseInt(a.charAt(d))*c[d];return b=11-b%11,b>9&&(b=0),b==a.substr(8,1)},_ro:function(a){if(!/^RO[1-9][0-9]{1,9}$/.test(a))return!1;a=a.substr(2);for(var b=a.length,c=[7,5,3,2,1,7,5,3,2].slice(10-b),d=0,e=0;b-1>e;e++)d+=parseInt(a.charAt(e))*c[e];return d=10*d%11%10,d==a.substr(b-1,1)},_ru:function(a){if(!/^RU([0-9]{9}|[0-9]{12})$/.test(a))return!1;if(a=a.substr(2),10==a.length){for(var b=0,c=[2,4,10,3,5,9,4,6,8,0],d=0;10>d;d++)b+=parseInt(a.charAt(d))*c[d];return b%=11,b>9&&(b%=10),b==a.substr(9,1)}if(12==a.length){for(var e=0,f=[7,2,4,10,3,5,9,4,6,8,0],g=0,h=[3,7,2,4,10,3,5,9,4,6,8,0],d=0;11>d;d++)e+=parseInt(a.charAt(d))*f[d],g+=parseInt(a.charAt(d))*h[d];return e%=11,e>9&&(e%=10),g%=11,g>9&&(g%=10),e==a.substr(10,1)&&g==a.substr(11,1)}return!1},_rs:function(a){if(!/^RS[0-9]{9}$/.test(a))return!1;a=a.substr(2);for(var b=10,c=0,d=0;8>d;d++)c=(parseInt(a.charAt(d))+b)%10,0==c&&(c=10),b=2*c%11;return(b+parseInt(a.substr(8,1)))%10==1},_se:function(b){return/^SE[0-9]{10}01$/.test(b)?(b=b.substr(2,10),a.fn.bootstrapValidator.helpers.luhn(b)):!1},_si:function(a){if(!/^SI[0-9]{8}$/.test(a))return!1;a=a.substr(2);for(var b=0,c=[8,7,6,5,4,3,2],d=0;7>d;d++)b+=parseInt(a.charAt(d))*c[d];return b=11-b%11,10==b&&(b=0),b==a.substr(7,1)},_sk:function(a){return/^SK[1-9][0-9][(2-4)|(6-9)][0-9]{7}$/.test(a)?(a=a.substr(2),a%11==0):!1}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.vin={validate:function(a,b){var c=b.val();if(""==c)return!0;if(!/^[a-hj-npr-z0-9]{8}[0-9xX][a-hj-npr-z0-9]{8}$/i.test(c))return!1;c=c.toUpperCase();for(var d={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,0:0},e=[8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2],f=0,g=c.length,h=0;g>h;h++)f+=d[c.charAt(h)+""]*e[h];var i=f%11;return 10==i&&(i="X"),i==c.charAt(8)}}}(window.jQuery),function(a){a.fn.bootstrapValidator.validators.zipCode={html5Attributes:{message:"message",country:"country"},validate:function(a,b,c){var d=b.val();if(""==d||!c.country)return!0;var e=(c.country||"US").toUpperCase();switch(e){case"CA":return/(?:A|B|C|E|G|J|K|L|M|N|P|R|S|T|V|X|Y){1}[0-9]{1}(?:A|B|C|E|G|J|K|L|M|N|P|R|S|T|V|X|Y){1}\s?[0-9]{1}(?:A|B|C|E|G|J|K|L|M|N|P|R|S|T|V|X|Y){1}[0-9]{1}/i.test(d);case"DK":return/^(DK(-|\s)?)?\d{4}$/i.test(d);case"GB":return this._gb(d);case"IT":return/^(I-|IT-)?\d{5}$/i.test(d);case"NL":return/^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i.test(d);case"SE":return/^(S-)?\d{3}\s?\d{2}$/i.test(d);case"US":default:return/^\d{4,5}([\-]\d{4})?$/.test(d)}},_gb:function(a){for(var b="[ABCDEFGHIJKLMNOPRSTUWYZ]",c="[ABCDEFGHKLMNOPQRSTUVWXY]",d="[ABCDEFGHJKPMNRSTUVWXY]",e="[ABEHMNPRVWXY]",f="[ABDEFGHJLNPQRSTUWXYZ]",g=[new RegExp("^("+b+"{1}"+c+"?[0-9]{1,2})(\\s*)([0-9]{1}"+f+"{2})$","i"),new RegExp("^("+b+"{1}[0-9]{1}"+d+"{1})(\\s*)([0-9]{1}"+f+"{2})$","i"),new RegExp("^("+b+"{1}"+c+"{1}?[0-9]{1}"+e+"{1})(\\s*)([0-9]{1}"+f+"{2})$","i"),new RegExp("^(BF1)(\\s*)([0-6]{1}[ABDEFGHJLNPQRST]{1}[ABDEFGHJLNPQRSTUWZYZ]{1})$","i"),/^(GIR)(\s*)(0AA)$/i,/^(BFPO)(\s*)([0-9]{1,4})$/i,/^(BFPO)(\s*)(c\/o\s*[0-9]{1,3})$/i,/^([A-Z]{4})(\s*)(1ZZ)$/i,/^(AI-2640)$/i],h=0;h<g.length;h++)if(g[h].test(a))return!0;return!1}}}(window.jQuery);
(function(e,t){var n={smoketimeout:[],init:false,zindex:1e3,i:0,bodyload:function(e){var r=t.createElement("div");r.setAttribute("id","smoke-out-"+e);r.className="smoke-base";r.style.zIndex=n.zindex;n.zindex++;t.body.appendChild(r)},newdialog:function(){var t=(new Date).getTime();t=Math.random(1,99)+t;if(!n.init){n.listen(e,"load",function(){n.bodyload(t)})}else{n.bodyload(t)}return t},forceload:function(){},build:function(t,r){n.i++;r.stack=n.i;t=t.replace(/\n/g,"<br />");t=t.replace(/\r/g,"<br />");var i="",s="OK",o="Cancel",u="",a="",f;if(r.type==="prompt"){i='<div class="dialog-prompt">'+'<input id="dialog-input-'+r.newid+'" type="text" '+(r.params.value?'value="'+r.params.value+'"':"")+" />"+"</div>"}if(r.params.ok){s=r.params.ok}if(r.params.cancel){o=r.params.cancel}if(r.params.classname){u=r.params.classname}if(r.type!=="signal"){a='<div class="dialog-buttons">';if(r.type==="alert"){a+='<button id="alert-ok-'+r.newid+'">'+s+"</button>"}else if(r.type==="quiz"){if(r.params.button_1){a+='<button class="quiz-button" id="'+r.type+"-ok1-"+r.newid+'">'+r.params.button_1+"</button>"}if(r.params.button_2){a+='<button class="quiz-button" id="'+r.type+"-ok2-"+r.newid+'">'+r.params.button_2+"</button>"}if(r.params.button_3){a+='<button class="quiz-button" id="'+r.type+"-ok3-"+r.newid+'">'+r.params.button_3+"</button>"}if(r.params.button_cancel){a+='<button id="'+r.type+"-cancel-"+r.newid+'" class="cancel">'+r.params.button_cancel+"</button>"}}else if(r.type==="prompt"||r.type==="confirm"){if(r.params.reverseButtons){a+='<button id="'+r.type+"-ok-"+r.newid+'">'+s+"</button>"+'<button id="'+r.type+"-cancel-"+r.newid+'" class="cancel">'+o+"</button>"}else{a+='<button id="'+r.type+"-cancel-"+r.newid+'" class="cancel">'+o+"</button>"+'<button id="'+r.type+"-ok-"+r.newid+'">'+s+"</button>"}}a+="</div>"}f='<div id="smoke-bg-'+r.newid+'" class="smokebg"></div>'+'<div class="dialog smoke '+u+'">'+'<div class="dialog-inner">'+t+i+a+"</div>"+"</div>";if(!n.init){n.listen(e,"load",function(){n.finishbuild(t,r,f)})}else{n.finishbuild(t,r,f)}},finishbuild:function(e,r,i){var s=t.getElementById("smoke-out-"+r.newid);s.className="smoke-base smoke-visible  smoke-"+r.type;s.innerHTML=i;while(s.innerHTML===""){s.innerHTML=i}if(n.smoketimeout[r.newid]){clearTimeout(n.smoketimeout[r.newid])}n.listen(t.getElementById("smoke-bg-"+r.newid),"click",function(){n.destroy(r.type,r.newid);if(r.type==="prompt"||r.type==="confirm"||r.type==="quiz"){r.callback(false)}else if(r.type==="alert"&&typeof r.callback!=="undefined"){r.callback()}});switch(r.type){case"alert":n.finishbuildAlert(e,r,i);break;case"confirm":n.finishbuildConfirm(e,r,i);break;case"quiz":n.finishbuildQuiz(e,r,i);break;case"prompt":n.finishbuildPrompt(e,r,i);break;case"signal":n.finishbuildSignal(e,r,i);break;default:throw"Unknown type: "+r.type}},finishbuildAlert:function(r,i,s){n.listen(t.getElementById("alert-ok-"+i.newid),"click",function(){n.destroy(i.type,i.newid);if(typeof i.callback!=="undefined"){i.callback()}});t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===13||t.keyCode===32||t.keyCode===27){n.destroy(i.type,i.newid);if(typeof i.callback!=="undefined"){i.callback()}}}},finishbuildConfirm:function(r,i,s){n.listen(t.getElementById("confirm-cancel-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(false)});n.listen(t.getElementById("confirm-ok-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(true)});t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===13||t.keyCode===32){n.destroy(i.type,i.newid);i.callback(true)}else if(t.keyCode===27){n.destroy(i.type,i.newid);i.callback(false)}}},finishbuildQuiz:function(r,i,s){var o,u,a;n.listen(t.getElementById("quiz-cancel-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(false)});if(o=t.getElementById("quiz-ok1-"+i.newid))n.listen(o,"click",function(){n.destroy(i.type,i.newid);i.callback(o.innerHTML)});if(u=t.getElementById("quiz-ok2-"+i.newid))n.listen(u,"click",function(){n.destroy(i.type,i.newid);i.callback(u.innerHTML)});if(a=t.getElementById("quiz-ok3-"+i.newid))n.listen(a,"click",function(){n.destroy(i.type,i.newid);i.callback(a.innerHTML)});t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===27){n.destroy(i.type,i.newid);i.callback(false)}}},finishbuildPrompt:function(r,i,s){var o=t.getElementById("dialog-input-"+i.newid);setTimeout(function(){o.focus();o.select()},100);n.listen(t.getElementById("prompt-cancel-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(false)});n.listen(t.getElementById("prompt-ok-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(o.value)});t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===13){n.destroy(i.type,i.newid);i.callback(o.value)}else if(t.keyCode===27){n.destroy(i.type,i.newid);i.callback(false)}}},finishbuildSignal:function(r,i,s){t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===27){n.destroy(i.type,i.newid);if(typeof i.callback!=="undefined"){i.callback()}}};n.smoketimeout[i.newid]=setTimeout(function(){n.destroy(i.type,i.newid);if(typeof i.callback!=="undefined"){i.callback()}},i.timeout)},destroy:function(e,r){var i=t.getElementById("smoke-out-"+r);if(e!=="quiz"){var s=t.getElementById(e+"-ok-"+r)}var o=t.getElementById(e+"-cancel-"+r);i.className="smoke-base";if(s){n.stoplistening(s,"click",function(){});t.onkeyup=null}if(e==="quiz"){var u=t.getElementsByClassName("quiz-button");for(var a=0;a<u.length;a++){n.stoplistening(u[a],"click",function(){});t.onkeyup=null}}if(o){n.stoplistening(o,"click",function(){})}n.i=0;i.innerHTML=""},alert:function(e,t,r){if(typeof r!=="object"){r=false}var i=n.newdialog();n.build(e,{type:"alert",callback:t,params:r,newid:i})},signal:function(e,t,r){if(typeof r!=="object"){r=false}var i=5e3;if(r.duration!=="undefined"){i=r.duration}var s=n.newdialog();n.build(e,{type:"signal",callback:t,timeout:i,params:r,newid:s})},confirm:function(e,t,r){if(typeof r!=="object"){r=false}var i=n.newdialog();n.build(e,{type:"confirm",callback:t,params:r,newid:i})},quiz:function(e,t,r){if(typeof r!=="object"){r=false}var i=n.newdialog();n.build(e,{type:"quiz",callback:t,params:r,newid:i})},prompt:function(e,t,r){if(typeof r!=="object"){r=false}var i=n.newdialog();return n.build(e,{type:"prompt",callback:t,params:r,newid:i})},listen:function(e,t,n){if(e.addEventListener){return e.addEventListener(t,n,false)}if(e.attachEvent){return e.attachEvent("on"+t,n)}return false},stoplistening:function(e,t,n){if(e.removeEventListener){return e.removeEventListener(t,n,false)}if(e.detachEvent){return e.detachEvent("on"+t,n)}return false}};n.init=true;if(typeof module!="undefined"&&module.exports){module.exports=n}else if(typeof define==="function"&&define.amd){define("smoke",[],function(){return n})}else{this.smoke=n}})(window,document)

/*
 Version 3.0.0
 =========================================================
 bootstrap-datetimepicker.js
 https://github.com/Eonasdan/bootstrap-datetimepicker
 =========================================================
 The MIT License (MIT)

 Copyright (c) 2014 Jonathan Peterson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
; (function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'moment'], factory);
    } else {
        // AMD is not used - Attempt to fetch dependencies from scope.
        if (!jQuery) {
            throw 'bootstrap-datetimepicker requires jQuery to be loaded first';
        } else if (!moment) {
            throw 'bootstrap-datetimepicker requires moment.js to be loaded first';
        } else {
            factory(jQuery, moment);
        }
    }
}

(function ($, moment) {
    if (typeof moment === 'undefined') {
        alert("momentjs is required");
        throw new Error('momentjs is required');
    };

    var dpgId = 0,

        pMoment = moment,

// ReSharper disable once InconsistentNaming
        DateTimePicker = function (element, options) {
            var defaults = $.fn.datetimepicker.defaults,

                icons = {
                    time: 'glyphicon glyphicon-time',
                    date: 'glyphicon glyphicon-calendar',
                    up: 'glyphicon glyphicon-chevron-up',
                    down: 'glyphicon glyphicon-chevron-down'
                },

                picker = this,

                init = function () {

                    var icon = false, i, dDate, longDateFormat;
                    picker.options = $.extend({}, defaults, options);
                    picker.options.icons = $.extend({}, icons, picker.options.icons);

                    picker.element = $(element);

                    dataToOptions();

                    if (!(picker.options.pickTime || picker.options.pickDate))
                        throw new Error('Must choose at least one picker');

                    picker.id = dpgId++;
                    pMoment.lang(picker.options.language);
                    picker.date = pMoment();
                    picker.unset = false;
                    picker.isInput = picker.element.is('input');
                    picker.component = false;

                    if (picker.element.hasClass('input-group')) {
                        if (picker.element.find('.datepickerbutton').size() == 0) {//in case there is more then one 'input-group-addon' Issue #48
                            picker.component = picker.element.find("[class^='input-group-']");
                        }
                        else {
                            picker.component = picker.element.find('.datepickerbutton');
                        }
                    }
                    picker.format = picker.options.format;

                    longDateFormat = pMoment()._lang._longDateFormat;

                    if (!picker.format) {
                        picker.format = (picker.options.pickDate ? longDateFormat.L : '');
                        if (picker.options.pickDate && picker.options.pickTime) picker.format += ' ';
                        picker.format += (picker.options.pickTime ? longDateFormat.LT : '');
                        if (picker.options.useSeconds) {
                            if (~longDateFormat.LT.indexOf(' A')) {
                                picker.format = picker.format.split(" A")[0] + ":ss A";
                            }
                            else {
                                picker.format += ':ss';
                            }
                        }
                    }
                    picker.use24hours = picker.format.toLowerCase().indexOf("a") < 1;

                    if (picker.component) icon = picker.component.find('span');

                    if (picker.options.pickTime) {
                        if (icon) icon.addClass(picker.options.icons.time);
                    }
                    if (picker.options.pickDate) {
                        if (icon) {
                            icon.removeClass(picker.options.icons.time);
                            icon.addClass(picker.options.icons.date);
                        }
                    }

                    picker.widget = $(getTemplate()).appendTo('body');

                    if (picker.options.useSeconds && !picker.use24hours) {
                        picker.widget.width(300);
                    }

                    picker.minViewMode = picker.options.minViewMode || 0;
                    if (typeof picker.minViewMode === 'string') {
                        switch (picker.minViewMode) {
                            case 'months':
                                picker.minViewMode = 1;
                                break;
                            case 'years':
                                picker.minViewMode = 2;
                                break;
                            default:
                                picker.minViewMode = 0;
                                break;
                        }
                    }
                    picker.viewMode = picker.options.viewMode || 0;
                    if (typeof picker.viewMode === 'string') {
                        switch (picker.viewMode) {
                            case 'months':
                                picker.viewMode = 1;
                                break;
                            case 'years':
                                picker.viewMode = 2;
                                break;
                            default:
                                picker.viewMode = 0;
                                break;
                        }
                    }

                    picker.options.disabledDates = indexGivenDates(picker.options.disabledDates);
                    picker.options.enabledDates = indexGivenDates(picker.options.enabledDates);

                    picker.startViewMode = picker.viewMode;
                    picker.setMinDate(picker.options.minDate);
                    picker.setMaxDate(picker.options.maxDate);
                    fillDow();
                    fillMonths();
                    fillHours();
                    fillMinutes();
                    fillSeconds();
                    update();
                    showMode();
                    attachDatePickerEvents();
                    if (picker.options.defaultDate !== "" && getPickerInput().val() == "") picker.setValue(picker.options.defaultDate);
                    if (picker.options.minuteStepping !== 1) {
                        var rInterval = picker.options.minuteStepping;
                        picker.date.minutes((Math.round(picker.date.minutes() / rInterval) * rInterval) % 60).seconds(0);
                    }
                },

                getPickerInput = function () {
                    var input;

                    if (picker.isInput) {
                        return picker.element;
                    } else {
                        input = picker.element.find('.datepickerinput');
                        if (input.size() === 0) {
                            input = picker.element.find('input');
                        }
                        else if (!input.is('input')) {
                            throw new Error('CSS class "datepickerinput" cannot be applied to non input element');
                        }
                        return input;
                    }
                },

                dataToOptions = function () {
                    var eData
                    if (picker.element.is('input')) {
                        eData = picker.element.data();
                    }
                    else {
                        eData = picker.element.data();
                    }
                    if (eData.dateFormat !== undefined) picker.options.format = eData.dateFormat;
                    if (eData.datePickdate !== undefined) picker.options.pickDate = eData.datePickdate;
                    if (eData.datePicktime !== undefined) picker.options.pickTime = eData.datePicktime;
                    if (eData.dateUseminutes !== undefined) picker.options.useMinutes = eData.dateUseminutes;
                    if (eData.dateUseseconds !== undefined) picker.options.useSeconds = eData.dateUseseconds;
                    if (eData.dateUsecurrent !== undefined) picker.options.useCurrent = eData.dateUsecurrent;
                    if (eData.dateMinutestepping !== undefined) picker.options.minuteStepping = eData.dateMinutestepping;
                    if (eData.dateMindate !== undefined) picker.options.minDate = eData.dateMindate;
                    if (eData.dateMaxdate !== undefined) picker.options.maxDate = eData.dateMaxdate;
                    if (eData.dateShowtoday !== undefined) picker.options.showToday = eData.dateShowtoday;
                    if (eData.dateCollapse !== undefined) picker.options.collapse = eData.dateCollapse;
                    if (eData.dateLanguage !== undefined) picker.options.language = eData.dateLanguage;
                    if (eData.dateDefaultdate !== undefined) picker.options.defaultDate = eData.dateDefaultdate;
                    if (eData.dateDisableddates !== undefined) picker.options.disabledDates = eData.dateDisableddates;
                    if (eData.dateEnableddates !== undefined) picker.options.enabledDates = eData.dateEnableddates;
                    if (eData.dateIcons !== undefined) picker.options.icons = eData.dateIcons;
                    if (eData.dateUsestrict !== undefined) picker.options.useStrict = eData.dateUsestrict;
                    if (eData.dateDirection !== undefined) picker.options.direction = eData.dateDirection;
                    if (eData.dateSidebyside !== undefined) picker.options.sideBySide = eData.dateSidebyside;
                },

                place = function () {
                    var position = 'absolute',
                        offset = picker.component ? picker.component.offset() : picker.element.offset(), $window = $(window);
                    picker.width = picker.component ? picker.component.outerWidth() : picker.element.outerWidth();
                    offset.top = offset.top + picker.element.outerHeight();

                    var placePosition;
                    if (picker.options.direction === 'up') {
                        placePosition = 'top'
                    } else if (picker.options.direction === 'bottom') {
                        placePosition = 'bottom'
                    } else if (picker.options.direction === 'auto') {
                        if (offset.top + picker.widget.height() > $window.height() + $window.scrollTop() && picker.widget.height() + picker.element.outerHeight() < offset.top) {
                            placePosition = 'top';
                        } else {
                            placePosition = 'bottom';
                        }
                    };
                    if (placePosition === 'top') {
                        offset.top -= picker.widget.height() + picker.element.outerHeight() + 15;
                        picker.widget.addClass('top').removeClass('bottom');
                    } else {
                        offset.top += 1;
                        picker.widget.addClass('bottom').removeClass('top');
                    }

                    if (picker.options.width !== undefined) {
                        picker.widget.width(picker.options.width);
                    }

                    if (picker.options.orientation === 'left') {
                        picker.widget.addClass('left-oriented');
                        offset.left = offset.left - picker.widget.width() + 20;
                    }

                    if (isInFixed()) {
                        position = 'fixed';
                        offset.top -= $window.scrollTop();
                        offset.left -= $window.scrollLeft();
                    }

                    if ($window.width() < offset.left + picker.widget.outerWidth()) {
                        offset.right = $window.width() - offset.left - picker.width;
                        offset.left = 'auto';
                        picker.widget.addClass('pull-right');
                    } else {
                        offset.right = 'auto';
                        picker.widget.removeClass('pull-right');
                    }

                    picker.widget.css({
                        position: position,
                        top: offset.top,
                        left: offset.left,
                        right: offset.right
                    });
                },

                notifyChange = function (oldDate, eventType) {
                    if (pMoment(picker.date).isSame(pMoment(oldDate))) return;
                    picker.element.trigger({
                        type: 'dp.change',
                        date: pMoment(picker.date),
                        oldDate: pMoment(oldDate)
                    });

                    if (eventType !== 'change')
                        picker.element.change();
                },

                notifyError = function (date) {
                    picker.element.trigger({
                        type: 'dp.error',
                        date: pMoment(date)
                    });
                },

                update = function (newDate) {
                    pMoment.lang(picker.options.language);
                    var dateStr = newDate;
                    if (!dateStr) {
                        dateStr = getPickerInput().val();
                        if (dateStr) picker.date = pMoment(dateStr, picker.format, picker.options.useStrict);
                        if (!picker.date) picker.date = pMoment();
                    }
                    picker.viewDate = pMoment(picker.date).startOf("month");
                    fillDate();
                    fillTime();
                },

                fillDow = function () {
                    pMoment.lang(picker.options.language);
                    var html = $('<tr>'), weekdaysMin = pMoment.weekdaysMin(), i;
                    if (pMoment()._lang._week.dow == 0) { // starts on Sunday
                        for (i = 0; i < 7; i++) {
                            html.append('<th class="dow">' + weekdaysMin[i] + '</th>');
                        }
                    } else {
                        for (i = 1; i < 8; i++) {
                            if (i == 7) {
                                html.append('<th class="dow">' + weekdaysMin[0] + '</th>');
                            } else {
                                html.append('<th class="dow">' + weekdaysMin[i] + '</th>');
                            }
                        }
                    }
                    picker.widget.find('.datepicker-days thead').append(html);
                },

                fillMonths = function () {
                    pMoment.lang(picker.options.language);
                    var html = '', i = 0, monthsShort = pMoment.monthsShort();
                    while (i < 12) {
                        html += '<span class="month">' + monthsShort[i++] + '</span>';
                    }
                    picker.widget.find('.datepicker-months td').append(html);
                },

                fillDate = function () {
                    if(!picker.options.pickDate) return;
                    pMoment.lang(picker.options.language);
                    var year = picker.viewDate.year(),
                        month = picker.viewDate.month(),
                        startYear = picker.options.minDate.year(),
                        startMonth = picker.options.minDate.month(),
                        endYear = picker.options.maxDate.year(),
                        endMonth = picker.options.maxDate.month(),
                        currentDate,
                        prevMonth, nextMonth, html = [], row, clsName, i, days, yearCont, currentYear, months = pMoment.months();

                    picker.widget.find('.datepicker-days').find('.disabled').removeClass('disabled');
                    picker.widget.find('.datepicker-months').find('.disabled').removeClass('disabled');
                    picker.widget.find('.datepicker-years').find('.disabled').removeClass('disabled');

                    picker.widget.find('.datepicker-days th:eq(1)').text(
                            months[month] + ' ' + year);

                    prevMonth = pMoment(picker.viewDate).subtract("months", 1);
                    days = prevMonth.daysInMonth();
                    prevMonth.date(days).startOf('week');
                    if ((year == startYear && month <= startMonth) || year < startYear) {
                        picker.widget.find('.datepicker-days th:eq(0)').addClass('disabled');
                    }
                    if ((year == endYear && month >= endMonth) || year > endYear) {
                        picker.widget.find('.datepicker-days th:eq(2)').addClass('disabled');
                    }

                    nextMonth = pMoment(prevMonth).add(42, "d");
                    while (prevMonth.isBefore(nextMonth)) {
                        if (prevMonth.weekday() === pMoment().startOf('week').weekday()) {
                            row = $('<tr>');
                            html.push(row);
                        }
                        clsName = '';
                        if (prevMonth.year() < year || (prevMonth.year() == year && prevMonth.month() < month)) {
                            clsName += ' old';
                        } else if (prevMonth.year() > year || (prevMonth.year() == year && prevMonth.month() > month)) {
                            clsName += ' new';
                        }
                        if (prevMonth.isSame(pMoment({ y: picker.date.year(), M: picker.date.month(), d: picker.date.date() }))) {
                            clsName += ' active';
                        }
                        if (isInDisableDates(prevMonth, 'day') || !isInEnableDates(prevMonth)) {
                            clsName += ' disabled';
                        }
                        if (picker.options.showToday === true) {
                            if (prevMonth.isSame(pMoment(), 'day')) {
                                clsName += ' today';
                            }
                        }
                        if (picker.options.daysOfWeekDisabled) {
                            for (i in picker.options.daysOfWeekDisabled) {
                                if (prevMonth.day() == picker.options.daysOfWeekDisabled[i]) {
                                    clsName += ' disabled';
                                    break;
                                }
                            }
                        }
                        row.append('<td class="day' + clsName + '">' + prevMonth.date() + '</td>');

                        currentDate = prevMonth.date();
                        prevMonth.add(1, "d");

                        if (currentDate == prevMonth.date()) {
                            prevMonth.add(1, "d");
                        }
                    }
                    picker.widget.find('.datepicker-days tbody').empty().append(html);
                    currentYear = picker.date.year(), months = picker.widget.find('.datepicker-months')
                        .find('th:eq(1)').text(year).end().find('span').removeClass('active');
                    if (currentYear === year) {
                        months.eq(picker.date.month()).addClass('active');
                    }
                    if (currentYear - 1 < startYear) {
                        picker.widget.find('.datepicker-months th:eq(0)').addClass('disabled');
                    }
                    if (currentYear + 1 > endYear) {
                        picker.widget.find('.datepicker-months th:eq(2)').addClass('disabled');
                    }
                    for (i = 0; i < 12; i++) {
                        if ((year == startYear && startMonth > i) || (year < startYear)) {
                            $(months[i]).addClass('disabled');
                        } else if ((year == endYear && endMonth < i) || (year > endYear)) {
                            $(months[i]).addClass('disabled');
                        }
                    }

                    html = '';
                    year = parseInt(year / 10, 10) * 10;
                    yearCont = picker.widget.find('.datepicker-years').find(
                        'th:eq(1)').text(year + '-' + (year + 9)).end().find('td');
                    picker.widget.find('.datepicker-years').find('th').removeClass('disabled');
                    if (startYear > year) {
                        picker.widget.find('.datepicker-years').find('th:eq(0)').addClass('disabled');
                    }
                    if (endYear < year + 9) {
                        picker.widget.find('.datepicker-years').find('th:eq(2)').addClass('disabled');
                    }
                    year -= 1;
                    for (i = -1; i < 11; i++) {
                        html += '<span class="year' + (i === -1 || i === 10 ? ' old' : '') + (currentYear === year ? ' active' : '') + ((year < startYear || year > endYear) ? ' disabled' : '') + '">' + year + '</span>';
                        year += 1;
                    }
                    yearCont.html(html);
                },

                fillHours = function () {
                    pMoment.lang(picker.options.language);
                    var table = picker.widget.find('.timepicker .timepicker-hours table'), html = '', current, i, j;
                    table.parent().hide();
                    if (picker.use24hours) {
                        current = 0;
                        for (i = 0; i < 6; i += 1) {
                            html += '<tr>';
                            for (j = 0; j < 4; j += 1) {
                                html += '<td class="hour">' + padLeft(current.toString()) + '</td>';
                                current++;
                            }
                            html += '</tr>';
                        }
                    }
                    else {
                        current = 1;
                        for (i = 0; i < 3; i += 1) {
                            html += '<tr>';
                            for (j = 0; j < 4; j += 1) {
                                html += '<td class="hour">' + padLeft(current.toString()) + '</td>';
                                current++;
                            }
                            html += '</tr>';
                        }
                    }
                    table.html(html);
                },

                fillMinutes = function () {
                    var table = picker.widget.find('.timepicker .timepicker-minutes table'), html = '', current = 0, i, j, step = picker.options.minuteStepping;
                    table.parent().hide();
                    if (step == 1) step = 5;
                    for (i = 0; i < Math.ceil(60 / step / 4) ; i++) {
                        html += '<tr>';
                        for (j = 0; j < 4; j += 1) {
                            if (current < 60) {
                                html += '<td class="minute">' + padLeft(current.toString()) + '</td>';
                                current += step;
                            } else {
                                html += '<td></td>';
                            }
                        }
                        html += '</tr>';
                    }
                    table.html(html);
                },

                fillSeconds = function () {
                    var table = picker.widget.find('.timepicker .timepicker-seconds table'), html = '', current = 0, i, j;
                    table.parent().hide();
                    for (i = 0; i < 3; i++) {
                        html += '<tr>';
                        for (j = 0; j < 4; j += 1) {
                            html += '<td class="second">' + padLeft(current.toString()) + '</td>';
                            current += 5;
                        }
                        html += '</tr>';
                    }
                    table.html(html);
                },

                fillTime = function () {
                    if (!picker.date) return;
                    var timeComponents = picker.widget.find('.timepicker span[data-time-component]'),
                        hour = picker.date.hours(),
                        period = 'AM';
                    if (!picker.use24hours) {
                        if (hour >= 12) period = 'PM';
                        if (hour === 0) hour = 12;
                        else if (hour != 12) hour = hour % 12;
                        picker.widget.find('.timepicker [data-action=togglePeriod]').text(period);
                    }
                    timeComponents.filter('[data-time-component=hours]').text(padLeft(hour));
                    timeComponents.filter('[data-time-component=minutes]').text(padLeft(picker.date.minutes()));
                    timeComponents.filter('[data-time-component=seconds]').text(padLeft(picker.date.second()));
                },

                click = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    picker.unset = false;
                    var target = $(e.target).closest('span, td, th'), month, year, step, day, oldDate = pMoment(picker.date);
                    if (target.length === 1) {
                        if (!target.is('.disabled')) {
                            switch (target[0].nodeName.toLowerCase()) {
                                case 'th':
                                    switch (target[0].className) {
                                        case 'switch':
                                            showMode(1);
                                            break;
                                        case 'prev':
                                        case 'next':
                                            step = dpGlobal.modes[picker.viewMode].navStep;
                                            if (target[0].className === 'prev') step = step * -1;
                                            picker.viewDate.add(step, dpGlobal.modes[picker.viewMode].navFnc);
                                            fillDate();
                                            break;
                                    }
                                    break;
                                case 'span':
                                    if (target.is('.month')) {
                                        month = target.parent().find('span').index(target);
                                        picker.viewDate.month(month);
                                    } else {
                                        year = parseInt(target.text(), 10) || 0;
                                        picker.viewDate.year(year);
                                    }
                                    if (picker.viewMode === picker.minViewMode) {
                                        picker.date = pMoment({
                                            y: picker.viewDate.year(),
                                            M: picker.viewDate.month(),
                                            d: picker.viewDate.date(),
                                            h: picker.date.hours(),
                                            m: picker.date.minutes(),
                                            s: picker.date.seconds()
                                        });
                                        notifyChange(oldDate, e.type);
                                        set();
                                    }
                                    showMode(-1);
                                    fillDate();
                                    break;
                                case 'td':
                                    if (target.is('.day')) {
                                        day = parseInt(target.text(), 10) || 1;
                                        month = picker.viewDate.month();
                                        year = picker.viewDate.year();
                                        if (target.is('.old')) {
                                            if (month === 0) {
                                                month = 11;
                                                year -= 1;
                                            } else {
                                                month -= 1;
                                            }
                                        } else if (target.is('.new')) {
                                            if (month == 11) {
                                                month = 0;
                                                year += 1;
                                            } else {
                                                month += 1;
                                            }
                                        }
                                        picker.date = pMoment({
                                                y: year,
                                                M: month,
                                                d: day,
                                                h: picker.date.hours(),
                                                m: picker.date.minutes(),
                                                s: picker.date.seconds()
                                            }
                                        );
                                        picker.viewDate = pMoment({
                                            y: year, M: month, d: Math.min(28, day)
                                        });
                                        fillDate();
                                        set();
                                        notifyChange(oldDate, e.type);
                                    }
                                    break;
                            }
                        }
                    }
                },

                actions = {
                    incrementHours: function () {
                        checkDate("add", "hours", 1);
                    },

                    incrementMinutes: function () {
                        checkDate("add", "minutes", picker.options.minuteStepping);
                    },

                    incrementSeconds: function () {
                        checkDate("add", "seconds", 1);
                    },

                    decrementHours: function () {
                        checkDate("subtract", "hours", 1);
                    },

                    decrementMinutes: function () {
                        checkDate("subtract", "minutes", picker.options.minuteStepping);
                    },

                    decrementSeconds: function () {
                        checkDate("subtract", "seconds", 1);
                    },

                    togglePeriod: function () {
                        var hour = picker.date.hours();
                        if (hour >= 12) hour -= 12;
                        else hour += 12;
                        picker.date.hours(hour);
                    },

                    showPicker: function () {
                        picker.widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                        picker.widget.find('.timepicker .timepicker-picker').show();
                    },

                    showHours: function () {
                        picker.widget.find('.timepicker .timepicker-picker').hide();
                        picker.widget.find('.timepicker .timepicker-hours').show();
                    },

                    showMinutes: function () {
                        picker.widget.find('.timepicker .timepicker-picker').hide();
                        picker.widget.find('.timepicker .timepicker-minutes').show();
                    },

                    showSeconds: function () {
                        picker.widget.find('.timepicker .timepicker-picker').hide();
                        picker.widget.find('.timepicker .timepicker-seconds').show();
                    },

                    selectHour: function (e) {
                        var period = picker.widget.find('.timepicker [data-action=togglePeriod]').text(), hour = parseInt($(e.target).text(), 10);
                        if (period == "PM") hour += 12
                        picker.date.hours(hour);
                        actions.showPicker.call(picker);
                    },

                    selectMinute: function (e) {
                        picker.date.minutes(parseInt($(e.target).text(), 10));
                        actions.showPicker.call(picker);
                    },

                    selectSecond: function (e) {
                        picker.date.seconds(parseInt($(e.target).text(), 10));
                        actions.showPicker.call(picker);
                    }
                },

                doAction = function (e) {
                    var oldDate = pMoment(picker.date), action = $(e.currentTarget).data('action'), rv = actions[action].apply(picker, arguments);
                    stopEvent(e);
                    if (!picker.date) picker.date = pMoment({ y: 1970 });
                    set();
                    fillTime();
                    notifyChange(oldDate, e.type);
                    return rv;
                },

                stopEvent = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                },

                keydown = function (e) {
                    if (e.keyCode === 27) // allow escape to hide picker
                        picker.hide();
                },

                change = function (e) {
                    pMoment.lang(picker.options.language);
                    var input = $(e.target), oldDate = pMoment(picker.date), newDate = pMoment(input.val(), picker.format, picker.options.useStrict);
                    if (newDate.isValid() && !isInDisableDates(newDate) && isInEnableDates(newDate)) {
                        update();
                        picker.setValue(newDate);
                        notifyChange(oldDate, e.type);
                        set();
                    }
                    else {
                        picker.viewDate = oldDate;
                        notifyChange(oldDate, e.type);
                        notifyError(newDate);
                        picker.unset = true;
                    }
                },

                showMode = function (dir) {
                    if (dir) {
                        picker.viewMode = Math.max(picker.minViewMode, Math.min(2, picker.viewMode + dir));
                    }
                    var f = dpGlobal.modes[picker.viewMode].clsName;
                    picker.widget.find('.datepicker > div').hide().filter('.datepicker-' + dpGlobal.modes[picker.viewMode].clsName).show();
                },

                attachDatePickerEvents = function () {
                    var $this, $parent, expanded, closed, collapseData;
                    picker.widget.on('click', '.datepicker *', $.proxy(click, this)); // this handles date picker clicks
                    picker.widget.on('click', '[data-action]', $.proxy(doAction, this)); // this handles time picker clicks
                    picker.widget.on('mousedown', $.proxy(stopEvent, this));
                    picker.element.on('keydown', $.proxy(keydown, this));
                    if (picker.options.pickDate && picker.options.pickTime) {
                        picker.widget.on('click.togglePicker', '.accordion-toggle', function (e) {
                            e.stopPropagation();
                            $this = $(this);
                            $parent = $this.closest('ul');
                            expanded = $parent.find('.in');
                            closed = $parent.find('.collapse:not(.in)');

                            if (expanded && expanded.length) {
                                collapseData = expanded.data('collapse');
                                if (collapseData && collapseData.transitioning) return;
                                expanded.collapse('hide');
                                closed.collapse('show');
                                $this.find('span').toggleClass(picker.options.icons.time + ' ' + picker.options.icons.date);
                                picker.element.find('.input-group-addon span').toggleClass(picker.options.icons.time + ' ' + picker.options.icons.date);
                            }
                        });
                    }
                    if (picker.isInput) {
                        picker.element.on({
                            'focus': $.proxy(picker.show, this),
                            'change': $.proxy(change, this),
                            'blur': $.proxy(picker.hide, this)
                        });
                    } else {
                        picker.element.on({
                            'change': $.proxy(change, this)
                        }, 'input');
                        if (picker.component) {
                            picker.component.on('click', $.proxy(picker.show, this));
                        } else {
                            picker.element.on('click', $.proxy(picker.show, this));
                        }
                    }
                },

                attachDatePickerGlobalEvents = function () {
                    $(window).on(
                            'resize.datetimepicker' + picker.id, $.proxy(place, this));
                    if (!picker.isInput) {
                        $(document).on(
                                'mousedown.datetimepicker' + picker.id, $.proxy(picker.hide, this));
                    }
                },

                detachDatePickerEvents = function () {
                    picker.widget.off('click', '.datepicker *', picker.click);
                    picker.widget.off('click', '[data-action]');
                    picker.widget.off('mousedown', picker.stopEvent);
                    if (picker.options.pickDate && picker.options.pickTime) {
                        picker.widget.off('click.togglePicker');
                    }
                    if (picker.isInput) {
                        picker.element.off({
                            'focus': picker.show,
                            'change': picker.change
                        });
                    } else {
                        picker.element.off({
                            'change': picker.change
                        }, 'input');
                        if (picker.component) {
                            picker.component.off('click', picker.show);
                        } else {
                            picker.element.off('click', picker.show);
                        }
                    }
                },

                detachDatePickerGlobalEvents = function () {
                    $(window).off('resize.datetimepicker' + picker.id);
                    if (!picker.isInput) {
                        $(document).off('mousedown.datetimepicker' + picker.id);
                    }
                },

                isInFixed = function () {
                    if (picker.element) {
                        var parents = picker.element.parents(), inFixed = false, i;
                        for (i = 0; i < parents.length; i++) {
                            if ($(parents[i]).css('position') == 'fixed') {
                                inFixed = true;
                                break;
                            }
                        }
                        ;
                        return inFixed;
                    } else {
                        return false;
                    }
                },

                set = function () {
                    pMoment.lang(picker.options.language);
                    var formatted = '', input;
                    if (!picker.unset) formatted = pMoment(picker.date).format(picker.format);
                    getPickerInput().val(formatted);
                    picker.element.data('date', formatted);
                    if (!picker.options.pickTime) picker.hide();
                },

                checkDate = function (direction, unit, amount) {
                    pMoment.lang(picker.options.language);
                    var newDate;
                    if (direction == "add") {
                        newDate = pMoment(picker.date);
                        if (newDate.hours() == 23) newDate.add(amount, unit);
                        newDate.add(amount, unit);
                    }
                    else {
                        newDate = pMoment(picker.date).subtract(amount, unit);
                    }
                    if (isInDisableDates(pMoment(newDate.subtract(amount, unit))) || isInDisableDates(newDate)) {
                        notifyError(newDate.format(picker.format));
                        return;
                    }

                    if (direction == "add") {
                        picker.date.add(amount, unit);
                    }
                    else {
                        picker.date.subtract(amount, unit);
                    }
                    picker.unset = false;
                },

                isInDisableDates = function (date, timeUnit) {
                    pMoment.lang(picker.options.language);
                    var maxDate = picker.options.maxDate;
                    var minDate = picker.options.minDate;

                    if(timeUnit) {
                        maxDate = pMoment(maxDate).endOf(timeUnit);
                        minDate = pMoment(minDate).startOf(timeUnit);
                    }

                    if (date.isAfter(maxDate) || date.isBefore(minDate)) return true;
                    if (picker.options.disabledDates === false) {
                        return false;
                    }
                    return picker.options.disabledDates[pMoment(date).format("YYYY-MM-DD")] === true;
                },
                isInEnableDates = function (date) {
                    pMoment.lang(picker.options.language);
                    if (picker.options.enabledDates === false) {
                        return true;
                    }
                    return picker.options.enabledDates[pMoment(date).format("YYYY-MM-DD")] === true;
                },

                indexGivenDates = function (givenDatesArray) {
                    // Store given enabledDates and disabledDates as keys.
                    // This way we can check their existence in O(1) time instead of looping through whole array.
                    // (for example: picker.options.enabledDates['2014-02-27'] === true)
                    var givenDatesIndexed = {};
                    var givenDatesCount = 0;
                    for (i = 0; i < givenDatesArray.length; i++) {
                        dDate = pMoment(givenDatesArray[i]);
                        if (dDate.isValid()) {
                            givenDatesIndexed[dDate.format("YYYY-MM-DD")] = true;
                            givenDatesCount++;
                        }
                    }
                    if (givenDatesCount > 0) {
                        return givenDatesIndexed;
                    }
                    return false;
                },

                padLeft = function (string) {
                    string = string.toString();
                    if (string.length >= 2) return string;
                    else return '0' + string;
                },

                getTemplate = function () {
                    if (picker.options.pickDate && picker.options.pickTime) {
                        var ret = '';
                        ret = '<div class="bootstrap-datetimepicker-widget' + (picker.options.sideBySide ? ' timepicker-sbs' : '') + ' dropdown-menu" style="z-index:9999 !important;">';
                        if (picker.options.sideBySide) {
                            ret += '<div class="row">' +
                                '<div class="col-sm-6 datepicker">' + dpGlobal.template + '</div>' +
                                '<div class="col-sm-6 timepicker">' + tpGlobal.getTemplate() + '</div>' +
                                '</div>';
                        } else {
                            ret += '<ul class="list-unstyled">' +
                                '<li' + (picker.options.collapse ? ' class="collapse in"' : '') + '>' +
                                '<div class="datepicker">' + dpGlobal.template + '</div>' +
                                '</li>' +
                                '<li class="picker-switch accordion-toggle"><a class="btn" style="width:100%"><span class="' + picker.options.icons.time + '"></span></a></li>' +
                                '<li' + (picker.options.collapse ? ' class="collapse"' : '') + '>' +
                                '<div class="timepicker">' + tpGlobal.getTemplate() + '</div>' +
                                '</li>' +
                                '</ul>';
                        }
                        ret += '</div>';
                        return ret;
                    } else if (picker.options.pickTime) {
                        return (
                            '<div class="bootstrap-datetimepicker-widget dropdown-menu">' +
                            '<ul class="list-unstyled">' +
                            '<li class="collapse in">' +
                            '<div class="timepicker">' + tpGlobal.getTemplate() + '</div>' +
                            '</li>' +
                            '</ul>' +
                            '</div>'
                            );
                    } else {
                        return (
                            '<div class="bootstrap-datetimepicker-widget dropdown-menu">' +
                            '<div class="datepicker">' + dpGlobal.template + '</div>' +
                            '</div>'
                            );
                    }
                },

                dpGlobal = {
                    modes: [
                        {
                            clsName: 'days',
                            navFnc: 'month',
                            navStep: 1
                        },
                        {
                            clsName: 'months',
                            navFnc: 'year',
                            navStep: 1
                        },
                        {
                            clsName: 'years',
                            navFnc: 'year',
                            navStep: 10
                        }],
                    headTemplate:
                        '<thead>' +
                        '<tr>' +
                        '<th class="prev">&lsaquo;</th><th colspan="5" class="switch"></th><th class="next">&rsaquo;</th>' +
                        '</tr>' +
                        '</thead>',
                    contTemplate:
                        '<tbody><tr><td colspan="7"></td></tr></tbody>'
                },

                tpGlobal = {
                    hourTemplate: '<span data-action="showHours"   data-time-component="hours"   class="timepicker-hour"></span>',
                    minuteTemplate: '<span data-action="showMinutes" data-time-component="minutes" class="timepicker-minute"></span>',
                    secondTemplate: '<span data-action="showSeconds"  data-time-component="seconds" class="timepicker-second"></span>'
                };

            dpGlobal.template =
                '<div class="datepicker-days">' +
                '<table class="table-condensed">' + dpGlobal.headTemplate + '<tbody></tbody></table>' +
                '</div>' +
                '<div class="datepicker-months">' +
                '<table class="table-condensed">' + dpGlobal.headTemplate + dpGlobal.contTemplate + '</table>' +
                '</div>' +
                '<div class="datepicker-years">' +
                '<table class="table-condensed">' + dpGlobal.headTemplate + dpGlobal.contTemplate + '</table>' +
                '</div>';

            tpGlobal.getTemplate = function () {
                return (
                    '<div class="timepicker-picker">' +
                    '<table class="table-condensed">' +
                    '<tr>' +
                    '<td><a href="#" class="btn" data-action="incrementHours"><span class="' + picker.options.icons.up + '"></span></a></td>' +
                    '<td class="separator"></td>' +
                    '<td>' + (picker.options.useMinutes ? '<a href="#" class="btn" data-action="incrementMinutes"><span class="' + picker.options.icons.up + '"></span></a>' : '') + '</td>' +
                    (picker.options.useSeconds ?
                        '<td class="separator"></td><td><a href="#" class="btn" data-action="incrementSeconds"><span class="' + picker.options.icons.up + '"></span></a></td>' : '') +
                    (picker.use24hours ? '' : '<td class="separator"></td>') +
                    '</tr>' +
                    '<tr>' +
                    '<td>' + tpGlobal.hourTemplate + '</td> ' +
                    '<td class="separator">:</td>' +
                    '<td>' + (picker.options.useMinutes ? tpGlobal.minuteTemplate : '<span class="timepicker-minute">00</span>') + '</td> ' +
                    (picker.options.useSeconds ?
                        '<td class="separator">:</td><td>' + tpGlobal.secondTemplate + '</td>' : '') +
                    (picker.use24hours ? '' : '<td class="separator"></td>' +
                        '<td><button type="button" class="btn btn-primary" data-action="togglePeriod"></button></td>') +
                    '</tr>' +
                    '<tr>' +
                    '<td><a href="#" class="btn" data-action="decrementHours"><span class="' + picker.options.icons.down + '"></span></a></td>' +
                    '<td class="separator"></td>' +
                    '<td>' + (picker.options.useMinutes ? '<a href="#" class="btn" data-action="decrementMinutes"><span class="' + picker.options.icons.down + '"></span></a>' : '') + '</td>' +
                    (picker.options.useSeconds ?
                        '<td class="separator"></td><td><a href="#" class="btn" data-action="decrementSeconds"><span class="' + picker.options.icons.down + '"></span></a></td>' : '') +
                    (picker.use24hours ? '' : '<td class="separator"></td>') +
                    '</tr>' +
                    '</table>' +
                    '</div>' +
                    '<div class="timepicker-hours" data-action="selectHour">' +
                    '<table class="table-condensed"></table>' +
                    '</div>' +
                    '<div class="timepicker-minutes" data-action="selectMinute">' +
                    '<table class="table-condensed"></table>' +
                    '</div>' +
                    (picker.options.useSeconds ?
                        '<div class="timepicker-seconds" data-action="selectSecond"><table class="table-condensed"></table></div>' : '')
                    );
            };

            picker.destroy = function () {
                detachDatePickerEvents();
                detachDatePickerGlobalEvents();
                picker.widget.remove();
                picker.element.removeData('DateTimePicker');
                if (picker.component)
                    picker.component.removeData('DateTimePicker');
            };

            picker.show = function (e) {
                if (picker.options.useCurrent) {
                    if (getPickerInput().val() == '') {
                        if (picker.options.minuteStepping !== 1) {
                            var mDate = pMoment(),
                                rInterval = picker.options.minuteStepping;
                            mDate.minutes((Math.round(mDate.minutes() / rInterval) * rInterval) % 60)
                                .seconds(0);
                            picker.setValue(mDate.format(picker.format))
                        } else {
                            picker.setValue(pMoment().format(picker.format))
                        }
                    };
                }
                if (picker.widget.hasClass("picker-open")) {
                    picker.widget.hide();
                    picker.widget.removeClass("picker-open");
                }
                else {
                    picker.widget.show();
                    picker.widget.addClass("picker-open");
                }
                picker.height = picker.component ? picker.component.outerHeight() : picker.element.outerHeight();
                place();
                picker.element.trigger({
                    type: 'dp.show',
                    date: pMoment(picker.date)
                });
                attachDatePickerGlobalEvents();
                if (e) {
                    stopEvent(e);
                }
            },

                picker.disable = function () {
                    var input = picker.element.find('input');
                    if (input.prop('disabled')) return;

                    input.prop('disabled', true);
                    detachDatePickerEvents();
                },

                picker.enable = function () {
                    var input = picker.element.find('input');
                    if (!input.prop('disabled')) return;

                    input.prop('disabled', false);
                    attachDatePickerEvents();
                },

                picker.hide = function (event) {
                    if (event && $(event.target).is(picker.element.attr("id")))
                        return;
                    // Ignore event if in the middle of a picker transition
                    var collapse = picker.widget.find('.collapse'), i, collapseData;
                    for (i = 0; i < collapse.length; i++) {
                        collapseData = collapse.eq(i).data('collapse');
                        if (collapseData && collapseData.transitioning)
                            return;
                    }
                    picker.widget.hide();
                    picker.widget.removeClass("picker-open");
                    picker.viewMode = picker.startViewMode;
                    showMode();
                    picker.element.trigger({
                        type: 'dp.hide',
                        date: pMoment(picker.date)
                    });
                    detachDatePickerGlobalEvents();
                },

                picker.setValue = function (newDate) {
                    pMoment.lang(picker.options.language);
                    if (!newDate) {
                        picker.unset = true;
                        set();
                    } else {
                        picker.unset = false;
                    }
                    if (!pMoment.isMoment(newDate)) newDate = (newDate instanceof Date) ? pMoment(newDate) : pMoment(newDate, picker.format);
                    if (newDate.isValid()) {
                        picker.date = newDate;
                        set();
                        picker.viewDate = pMoment({ y: picker.date.year(), M: picker.date.month() });
                        fillDate();
                        fillTime();
                    }
                    else {
                        notifyError(newDate);
                    }
                },

                picker.getDate = function () {
                    if (picker.unset) return null;
                    return picker.date;
                },

                picker.setDate = function (date) {
                    var oldDate = pMoment(picker.date);
                    if (!date) {
                        picker.setValue(null);
                    } else {
                        picker.setValue(date);
                    }
                    notifyChange(oldDate, "function");
                },

                picker.setDisabledDates = function (dates) {
                    picker.options.disabledDates = indexGivenDates(dates);
                    if (picker.viewDate) update();
                },
                picker.setEnabledDates = function (dates) {
                    picker.options.enabledDates = indexGivenDates(dates);
                    if (picker.viewDate) update();
                },

                picker.setMaxDate = function (date) {
                    if (date == undefined) return;
                    picker.options.maxDate = pMoment(date);
                    if (picker.viewDate) update();
                },

                picker.setMinDate = function (date) {
                    if (date == undefined) return;
                    picker.options.minDate = pMoment(date);
                    if (picker.viewDate) update();
                };

            init();
        };

    $.fn.datetimepicker = function (options) {
        return this.each(function () {
            var $this = $(this), data = $this.data('DateTimePicker');
            if (!data) $this.data('DateTimePicker', new DateTimePicker(this, options));
        });
    };

    $.fn.datetimepicker.defaults = {
        pickDate: true,
        pickTime: true,
        useMinutes: true,
        useSeconds: false,
        useCurrent: true,
        minuteStepping: 1,
        minDate: new pMoment({ y: 1900 }),
        maxDate: new pMoment().add(100, "y"),
        showToday: true,
        collapse: true,
        language: "en",
        defaultDate: "",
        disabledDates: false,
        enabledDates: false,
        icons: {},
        useStrict: false,
        direction: "auto",
        sideBySide: false,
        daysOfWeekDisabled: false
    };

}));
/**
 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
 *
 * @version 1.0.2
 * @codingstandard ftlabs-jsv2
 * @copyright The Financial Times Limited [All Rights Reserved]
 * @license MIT License (see LICENSE.txt)
 */

/*jslint browser:true, node:true*/
/*global define, Event, Node*/


/**
 * Instantiate fast-clicking listeners on the specified layer.
 *
 * @constructor
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
function FastClick(layer, options) {
	'use strict';
	var oldOnClick;

	options = options || {};

	/**
	 * Whether a click is currently being tracked.
	 *
	 * @type boolean
	 */
	this.trackingClick = false;


	/**
	 * Timestamp for when click tracking started.
	 *
	 * @type number
	 */
	this.trackingClickStart = 0;


	/**
	 * The element being tracked for a click.
	 *
	 * @type EventTarget
	 */
	this.targetElement = null;


	/**
	 * X-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartX = 0;


	/**
	 * Y-coordinate of touch start event.
	 *
	 * @type number
	 */
	this.touchStartY = 0;


	/**
	 * ID of the last touch, retrieved from Touch.identifier.
	 *
	 * @type number
	 */
	this.lastTouchIdentifier = 0;


	/**
	 * Touchmove boundary, beyond which a click will be cancelled.
	 *
	 * @type number
	 */
	this.touchBoundary = options.touchBoundary || 10;


	/**
	 * The FastClick layer.
	 *
	 * @type Element
	 */
	this.layer = layer;

	/**
	 * The minimum time between tap(touchstart and touchend) events
	 *
	 * @type number
	 */
	this.tapDelay = options.tapDelay || 200;

	if (FastClick.notNeeded(layer)) {
		return;
	}

	// Some old versions of Android don't have Function.prototype.bind
	function bind(method, context) {
		return function() { return method.apply(context, arguments); };
	}


	var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
	var context = this;
	for (var i = 0, l = methods.length; i < l; i++) {
		context[methods[i]] = bind(context[methods[i]], context);
	}

	// Set up event handlers as required
	if (deviceIsAndroid) {
		layer.addEventListener('mouseover', this.onMouse, true);
		layer.addEventListener('mousedown', this.onMouse, true);
		layer.addEventListener('mouseup', this.onMouse, true);
	}

	layer.addEventListener('click', this.onClick, true);
	layer.addEventListener('touchstart', this.onTouchStart, false);
	layer.addEventListener('touchmove', this.onTouchMove, false);
	layer.addEventListener('touchend', this.onTouchEnd, false);
	layer.addEventListener('touchcancel', this.onTouchCancel, false);

	// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
	// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
	// layer when they are cancelled.
	if (!Event.prototype.stopImmediatePropagation) {
		layer.removeEventListener = function(type, callback, capture) {
			var rmv = Node.prototype.removeEventListener;
			if (type === 'click') {
				rmv.call(layer, type, callback.hijacked || callback, capture);
			} else {
				rmv.call(layer, type, callback, capture);
			}
		};

		layer.addEventListener = function(type, callback, capture) {
			var adv = Node.prototype.addEventListener;
			if (type === 'click') {
				adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
					if (!event.propagationStopped) {
						callback(event);
					}
				}), capture);
			} else {
				adv.call(layer, type, callback, capture);
			}
		};
	}

	// If a handler is already declared in the element's onclick attribute, it will be fired before
	// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
	// adding it as listener.
	if (typeof layer.onclick === 'function') {

		// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
		// - the old one won't work if passed to addEventListener directly.
		oldOnClick = layer.onclick;
		layer.addEventListener('click', function(event) {
			oldOnClick(event);
		}, false);
		layer.onclick = null;
	}
}


/**
 * Android requires exceptions.
 *
 * @type boolean
 */
var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0;


/**
 * iOS requires exceptions.
 *
 * @type boolean
 */
var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent);


/**
 * iOS 4 requires an exception for select elements.
 *
 * @type boolean
 */
var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


/**
 * iOS 6.0(+?) requires the target element to be manually derived
 *
 * @type boolean
 */
var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS ([6-9]|\d{2})_\d/).test(navigator.userAgent);


/**
 * Determine whether a given element requires a native click.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element needs a native click
 */
FastClick.prototype.needsClick = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {

	// Don't send a synthetic click to disabled inputs (issue #62)
	case 'button':
	case 'select':
	case 'textarea':
		if (target.disabled) {
			return true;
		}

		break;
	case 'input':

		// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
		if ((deviceIsIOS && target.type === 'file') || target.disabled) {
			return true;
		}

		break;
	case 'label':
	case 'video':
		return true;
	}

	return (/\bneedsclick\b/).test(target.className);
};


/**
 * Determine whether a given element requires a call to focus to simulate click into element.
 *
 * @param {EventTarget|Element} target Target DOM element
 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
 */
FastClick.prototype.needsFocus = function(target) {
	'use strict';
	switch (target.nodeName.toLowerCase()) {
	case 'textarea':
		return true;
	case 'select':
		return !deviceIsAndroid;
	case 'input':
		switch (target.type) {
		case 'button':
		case 'checkbox':
		case 'file':
		case 'image':
		case 'radio':
		case 'submit':
			return false;
		}

		// No point in attempting to focus disabled inputs
		return !target.disabled && !target.readOnly;
	default:
		return (/\bneedsfocus\b/).test(target.className);
	}
};


/**
 * Send a click event to the specified element.
 *
 * @param {EventTarget|Element} targetElement
 * @param {Event} event
 */
FastClick.prototype.sendClick = function(targetElement, event) {
	'use strict';
	var clickEvent, touch;

	// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
	if (document.activeElement && document.activeElement !== targetElement) {
		document.activeElement.blur();
	}

	touch = event.changedTouches[0];

	// Synthesise a click event, with an extra attribute so it can be tracked
	clickEvent = document.createEvent('MouseEvents');
	clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
	clickEvent.forwardedTouchEvent = true;
	targetElement.dispatchEvent(clickEvent);
};

FastClick.prototype.determineEventType = function(targetElement) {
	'use strict';

	//Issue #159: Android Chrome Select Box does not open with a synthetic click event
	if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
		return 'mousedown';
	}

	return 'click';
};


/**
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.focus = function(targetElement) {
	'use strict';
	var length;

	// Issue #160: on iOS 7, some input elements (e.g. date datetime) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
	if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time') {
		length = targetElement.value.length;
		targetElement.setSelectionRange(length, length);
	} else {
		targetElement.focus();
	}
};


/**
 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
 *
 * @param {EventTarget|Element} targetElement
 */
FastClick.prototype.updateScrollParent = function(targetElement) {
	'use strict';
	var scrollParent, parentElement;

	scrollParent = targetElement.fastClickScrollParent;

	// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
	// target element was moved to another parent.
	if (!scrollParent || !scrollParent.contains(targetElement)) {
		parentElement = targetElement;
		do {
			if (parentElement.scrollHeight > parentElement.offsetHeight) {
				scrollParent = parentElement;
				targetElement.fastClickScrollParent = parentElement;
				break;
			}

			parentElement = parentElement.parentElement;
		} while (parentElement);
	}

	// Always update the scroll top tracker if possible.
	if (scrollParent) {
		scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
	}
};


/**
 * @param {EventTarget} targetElement
 * @returns {Element|EventTarget}
 */
FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
	'use strict';

	// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
	if (eventTarget.nodeType === Node.TEXT_NODE) {
		return eventTarget.parentNode;
	}

	return eventTarget;
};


/**
 * On touch start, record the position and scroll offset.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchStart = function(event) {
	'use strict';
	var targetElement, touch, selection;

	// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
	if (event.targetTouches.length > 1) {
		return true;
	}

	targetElement = this.getTargetElementFromEventTarget(event.target);
	touch = event.targetTouches[0];

	if (deviceIsIOS) {

		// Only trusted events will deselect text on iOS (issue #49)
		selection = window.getSelection();
		if (selection.rangeCount && !selection.isCollapsed) {
			return true;
		}

		if (!deviceIsIOS4) {

			// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
			// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
			// with the same identifier as the touch event that previously triggered the click that triggered the alert.
			// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
			// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
			if (touch.identifier === this.lastTouchIdentifier) {
				event.preventDefault();
				return false;
			}

			this.lastTouchIdentifier = touch.identifier;

			// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
			// 1) the user does a fling scroll on the scrollable layer
			// 2) the user stops the fling scroll with another tap
			// then the event.target of the last 'touchend' event will be the element that was under the user's finger
			// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
			// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
			this.updateScrollParent(targetElement);
		}
	}

	this.trackingClick = true;
	this.trackingClickStart = event.timeStamp;
	this.targetElement = targetElement;

	this.touchStartX = touch.pageX;
	this.touchStartY = touch.pageY;

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		event.preventDefault();
	}

	return true;
};


/**
 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.touchHasMoved = function(event) {
	'use strict';
	var touch = event.changedTouches[0], boundary = this.touchBoundary;

	if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
		return true;
	}

	return false;
};


/**
 * Update the last position.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchMove = function(event) {
	'use strict';
	if (!this.trackingClick) {
		return true;
	}

	// If the touch has moved, cancel the click tracking
	if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
		this.trackingClick = false;
		this.targetElement = null;
	}

	return true;
};


/**
 * Attempt to find the labelled control for the given label element.
 *
 * @param {EventTarget|HTMLLabelElement} labelElement
 * @returns {Element|null}
 */
FastClick.prototype.findControl = function(labelElement) {
	'use strict';

	// Fast path for newer browsers supporting the HTML5 control attribute
	if (labelElement.control !== undefined) {
		return labelElement.control;
	}

	// All browsers under test that support touch events also support the HTML5 htmlFor attribute
	if (labelElement.htmlFor) {
		return document.getElementById(labelElement.htmlFor);
	}

	// If no for attribute exists, attempt to retrieve the first labellable descendant element
	// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
	return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
};


/**
 * On touch end, determine whether to send a click event at once.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onTouchEnd = function(event) {
	'use strict';
	var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

	if (!this.trackingClick) {
		return true;
	}

	// Prevent phantom clicks on fast double-tap (issue #36)
	if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
		this.cancelNextClick = true;
		return true;
	}

	// Reset to prevent wrong click cancel on input (issue #156).
	this.cancelNextClick = false;

	this.lastClickTime = event.timeStamp;

	trackingClickStart = this.trackingClickStart;
	this.trackingClick = false;
	this.trackingClickStart = 0;

	// On some iOS devices, the targetElement supplied with the event is invalid if the layer
	// is performing a transition or scroll, and has to be re-detected manually. Note that
	// for this to function correctly, it must be called *after* the event target is checked!
	// See issue #57; also filed as rdar://13048589 .
	if (deviceIsIOSWithBadTarget) {
		touch = event.changedTouches[0];

		// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
		targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
		targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
	}

	targetTagName = targetElement.tagName.toLowerCase();
	if (targetTagName === 'label') {
		forElement = this.findControl(targetElement);
		if (forElement) {
			this.focus(targetElement);
			if (deviceIsAndroid) {
				return false;
			}

			targetElement = forElement;
		}
	} else if (this.needsFocus(targetElement)) {

		// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
		// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
		if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
			this.targetElement = null;
			return false;
		}

		this.focus(targetElement);
		this.sendClick(targetElement, event);

		// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
		// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
		if (!deviceIsIOS || targetTagName !== 'select') {
			this.targetElement = null;
			event.preventDefault();
		}

		return false;
	}

	if (deviceIsIOS && !deviceIsIOS4) {

		// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
		// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
		scrollParent = targetElement.fastClickScrollParent;
		if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
			return true;
		}
	}

	// Prevent the actual click from going though - unless the target node is marked as requiring
	// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
	if (!this.needsClick(targetElement)) {
		event.preventDefault();
		this.sendClick(targetElement, event);
	}

	return false;
};


/**
 * On touch cancel, stop tracking the click.
 *
 * @returns {void}
 */
FastClick.prototype.onTouchCancel = function() {
	'use strict';
	this.trackingClick = false;
	this.targetElement = null;
};


/**
 * Determine mouse events which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onMouse = function(event) {
	'use strict';

	// If a target element was never set (because a touch event was never fired) allow the event
	if (!this.targetElement) {
		return true;
	}

	if (event.forwardedTouchEvent) {
		return true;
	}

	// Programmatically generated events targeting a specific element should be permitted
	if (!event.cancelable) {
		return true;
	}

	// Derive and check the target element to see whether the mouse event needs to be permitted;
	// unless explicitly enabled, prevent non-touch click events from triggering actions,
	// to prevent ghost/doubleclicks.
	if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

		// Prevent any user-added listeners declared on FastClick element from being fired.
		if (event.stopImmediatePropagation) {
			event.stopImmediatePropagation();
		} else {

			// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
			event.propagationStopped = true;
		}

		// Cancel the event
		event.stopPropagation();
		event.preventDefault();

		return false;
	}

	// If the mouse event is permitted, return true for the action to go through.
	return true;
};


/**
 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
 * an actual click which should be permitted.
 *
 * @param {Event} event
 * @returns {boolean}
 */
FastClick.prototype.onClick = function(event) {
	'use strict';
	var permitted;

	// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
	if (this.trackingClick) {
		this.targetElement = null;
		this.trackingClick = false;
		return true;
	}

	// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
	if (event.target.type === 'submit' && event.detail === 0) {
		return true;
	}

	permitted = this.onMouse(event);

	// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
	if (!permitted) {
		this.targetElement = null;
	}

	// If clicks are permitted, return true for the action to go through.
	return permitted;
};


/**
 * Remove all FastClick's event listeners.
 *
 * @returns {void}
 */
FastClick.prototype.destroy = function() {
	'use strict';
	var layer = this.layer;

	if (deviceIsAndroid) {
		layer.removeEventListener('mouseover', this.onMouse, true);
		layer.removeEventListener('mousedown', this.onMouse, true);
		layer.removeEventListener('mouseup', this.onMouse, true);
	}

	layer.removeEventListener('click', this.onClick, true);
	layer.removeEventListener('touchstart', this.onTouchStart, false);
	layer.removeEventListener('touchmove', this.onTouchMove, false);
	layer.removeEventListener('touchend', this.onTouchEnd, false);
	layer.removeEventListener('touchcancel', this.onTouchCancel, false);
};


/**
 * Check whether FastClick is needed.
 *
 * @param {Element} layer The layer to listen on
 */
FastClick.notNeeded = function(layer) {
	'use strict';
	var metaViewport;
	var chromeVersion;

	// Devices that don't support touch don't need FastClick
	if (typeof window.ontouchstart === 'undefined') {
		return true;
	}

	// Chrome version - zero for other browsers
	chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

	if (chromeVersion) {

		if (deviceIsAndroid) {
			metaViewport = document.querySelector('meta[name=viewport]');

			if (metaViewport) {
				// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
				if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
					return true;
				}
				// Chrome 32 and above with width=device-width or less don't need FastClick
				if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
					return true;
				}
			}

		// Chrome desktop doesn't need FastClick (issue #15)
		} else {
			return true;
		}
	}

	// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
	if (layer.style.msTouchAction === 'none') {
		return true;
	}

	return false;
};


/**
 * Factory method for creating a FastClick object
 *
 * @param {Element} layer The layer to listen on
 * @param {Object} options The options to override the defaults
 */
FastClick.attach = function(layer, options) {
	'use strict';
	return new FastClick(layer, options);
};


if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {

	// AMD. Register as an anonymous module.
	define(function() {
		'use strict';
		return FastClick;
	});
} else if (typeof module !== 'undefined' && module.exports) {
	module.exports = FastClick.attach;
	module.exports.FastClick = FastClick;
} else {
	window.FastClick = FastClick;
}

var loadScript = function (path) {
    var result = $.Deferred(),
        script = document.createElement("script");
    script.async = "async";
    script.type = "text/javascript";
    script.src = path;
    script.onload = script.onreadystatechange = function (_, isAbort) {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
            if (isAbort)
                result.reject();
            else
                result.resolve();
        }
    };
    script.onerror = function () { result.reject(); };
    $("head")[0].appendChild(script);
    return result.promise();
};
$(document).ready(function() {

    // Set active (selected) navigation elements
    // This is kind of a hack.  Instead we set in the jade
    // template via passing in the URL.
    // $('.nav [href="'+ window.location.pathname +'"]').closest('li').toggleClass('active');

    // To handle facebook URL junk
    // http://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
    if (window.location.hash && window.location.hash === '#_=_') {
        if (window.history && history.pushState) {
            window.history.pushState("", document.title, window.location.pathname);
        } else {
            // Prevent scrolling by storing the page's current scroll offset
            var scroll = {
                top: documentElement.scrollTop,
                left: documentElement.scrollLeft
            };
            window.location.hash = '';
            // Restore the scroll offset, should be flicker free
            documentElement.scrollTop = scroll.top;
            documentElement.scrollLeft = scroll.left;
        }
    }

});
$(document).ready(function() {
    $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
        localStorage.setItem('lastTab', $(e.target).attr('href'));
    });

    $(function(){
        var lastTab = localStorage.getItem('lastTab');
        if (lastTab) {
            $('a[href="'+ lastTab + '"]').tab('show');
        }
    });
});

/*! jQuery Migrate v1.1.1 | (c) 2005, 2013 jQuery Foundation, Inc. and other contributors | jquery.org/license */
jQuery.migrateMute===void 0&&(jQuery.migrateMute=!0),function(e,t,n){function r(n){o[n]||(o[n]=!0,e.migrateWarnings.push(n),t.console&&console.warn&&!e.migrateMute&&(console.warn("JQMIGRATE: "+n),e.migrateTrace&&console.trace&&console.trace()))}function a(t,a,o,i){if(Object.defineProperty)try{return Object.defineProperty(t,a,{configurable:!0,enumerable:!0,get:function(){return r(i),o},set:function(e){r(i),o=e}}),n}catch(s){}e._definePropertyBroken=!0,t[a]=o}var o={};e.migrateWarnings=[],!e.migrateMute&&t.console&&console.log&&console.log("JQMIGRATE: Logging is active"),e.migrateTrace===n&&(e.migrateTrace=!0),e.migrateReset=function(){o={},e.migrateWarnings.length=0},"BackCompat"===document.compatMode&&r("jQuery is not compatible with Quirks Mode");var i=e("<input/>",{size:1}).attr("size")&&e.attrFn,s=e.attr,u=e.attrHooks.value&&e.attrHooks.value.get||function(){return null},c=e.attrHooks.value&&e.attrHooks.value.set||function(){return n},l=/^(?:input|button)$/i,d=/^[238]$/,p=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,f=/^(?:checked|selected)$/i;a(e,"attrFn",i||{},"jQuery.attrFn is deprecated"),e.attr=function(t,a,o,u){var c=a.toLowerCase(),g=t&&t.nodeType;return u&&(4>s.length&&r("jQuery.fn.attr( props, pass ) is deprecated"),t&&!d.test(g)&&(i?a in i:e.isFunction(e.fn[a])))?e(t)[a](o):("type"===a&&o!==n&&l.test(t.nodeName)&&t.parentNode&&r("Can't change the 'type' of an input or button in IE 6/7/8"),!e.attrHooks[c]&&p.test(c)&&(e.attrHooks[c]={get:function(t,r){var a,o=e.prop(t,r);return o===!0||"boolean"!=typeof o&&(a=t.getAttributeNode(r))&&a.nodeValue!==!1?r.toLowerCase():n},set:function(t,n,r){var a;return n===!1?e.removeAttr(t,r):(a=e.propFix[r]||r,a in t&&(t[a]=!0),t.setAttribute(r,r.toLowerCase())),r}},f.test(c)&&r("jQuery.fn.attr('"+c+"') may use property instead of attribute")),s.call(e,t,a,o))},e.attrHooks.value={get:function(e,t){var n=(e.nodeName||"").toLowerCase();return"button"===n?u.apply(this,arguments):("input"!==n&&"option"!==n&&r("jQuery.fn.attr('value') no longer gets properties"),t in e?e.value:null)},set:function(e,t){var a=(e.nodeName||"").toLowerCase();return"button"===a?c.apply(this,arguments):("input"!==a&&"option"!==a&&r("jQuery.fn.attr('value', val) no longer sets properties"),e.value=t,n)}};var g,h,v=e.fn.init,m=e.parseJSON,y=/^(?:[^<]*(<[\w\W]+>)[^>]*|#([\w\-]*))$/;e.fn.init=function(t,n,a){var o;return t&&"string"==typeof t&&!e.isPlainObject(n)&&(o=y.exec(t))&&o[1]&&("<"!==t.charAt(0)&&r("$(html) HTML strings must start with '<' character"),n&&n.context&&(n=n.context),e.parseHTML)?v.call(this,e.parseHTML(e.trim(t),n,!0),n,a):v.apply(this,arguments)},e.fn.init.prototype=e.fn,e.parseJSON=function(e){return e||null===e?m.apply(this,arguments):(r("jQuery.parseJSON requires a valid JSON string"),null)},e.uaMatch=function(e){e=e.toLowerCase();var t=/(chrome)[ \/]([\w.]+)/.exec(e)||/(webkit)[ \/]([\w.]+)/.exec(e)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e)||/(msie) ([\w.]+)/.exec(e)||0>e.indexOf("compatible")&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e)||[];return{browser:t[1]||"",version:t[2]||"0"}},e.browser||(g=e.uaMatch(navigator.userAgent),h={},g.browser&&(h[g.browser]=!0,h.version=g.version),h.chrome?h.webkit=!0:h.webkit&&(h.safari=!0),e.browser=h),a(e,"browser",e.browser,"jQuery.browser is deprecated"),e.sub=function(){function t(e,n){return new t.fn.init(e,n)}e.extend(!0,t,this),t.superclass=this,t.fn=t.prototype=this(),t.fn.constructor=t,t.sub=this.sub,t.fn.init=function(r,a){return a&&a instanceof e&&!(a instanceof t)&&(a=t(a)),e.fn.init.call(this,r,a,n)},t.fn.init.prototype=t.fn;var n=t(document);return r("jQuery.sub() is deprecated"),t},e.ajaxSetup({converters:{"text json":e.parseJSON}});var b=e.fn.data;e.fn.data=function(t){var a,o,i=this[0];return!i||"events"!==t||1!==arguments.length||(a=e.data(i,t),o=e._data(i,t),a!==n&&a!==o||o===n)?b.apply(this,arguments):(r("Use of jQuery.fn.data('events') is deprecated"),o)};var j=/\/(java|ecma)script/i,w=e.fn.andSelf||e.fn.addBack;e.fn.andSelf=function(){return r("jQuery.fn.andSelf() replaced by jQuery.fn.addBack()"),w.apply(this,arguments)},e.clean||(e.clean=function(t,a,o,i){a=a||document,a=!a.nodeType&&a[0]||a,a=a.ownerDocument||a,r("jQuery.clean() is deprecated");var s,u,c,l,d=[];if(e.merge(d,e.buildFragment(t,a).childNodes),o)for(c=function(e){return!e.type||j.test(e.type)?i?i.push(e.parentNode?e.parentNode.removeChild(e):e):o.appendChild(e):n},s=0;null!=(u=d[s]);s++)e.nodeName(u,"script")&&c(u)||(o.appendChild(u),u.getElementsByTagName!==n&&(l=e.grep(e.merge([],u.getElementsByTagName("script")),c),d.splice.apply(d,[s+1,0].concat(l)),s+=l.length));return d});var Q=e.event.add,x=e.event.remove,k=e.event.trigger,N=e.fn.toggle,C=e.fn.live,S=e.fn.die,T="ajaxStart|ajaxStop|ajaxSend|ajaxComplete|ajaxError|ajaxSuccess",M=RegExp("\\b(?:"+T+")\\b"),H=/(?:^|\s)hover(\.\S+|)\b/,A=function(t){return"string"!=typeof t||e.event.special.hover?t:(H.test(t)&&r("'hover' pseudo-event is deprecated, use 'mouseenter mouseleave'"),t&&t.replace(H,"mouseenter$1 mouseleave$1"))};e.event.props&&"attrChange"!==e.event.props[0]&&e.event.props.unshift("attrChange","attrName","relatedNode","srcElement"),e.event.dispatch&&a(e.event,"handle",e.event.dispatch,"jQuery.event.handle is undocumented and deprecated"),e.event.add=function(e,t,n,a,o){e!==document&&M.test(t)&&r("AJAX events should be attached to document: "+t),Q.call(this,e,A(t||""),n,a,o)},e.event.remove=function(e,t,n,r,a){x.call(this,e,A(t)||"",n,r,a)},e.fn.error=function(){var e=Array.prototype.slice.call(arguments,0);return r("jQuery.fn.error() is deprecated"),e.splice(0,0,"error"),arguments.length?this.bind.apply(this,e):(this.triggerHandler.apply(this,e),this)},e.fn.toggle=function(t,n){if(!e.isFunction(t)||!e.isFunction(n))return N.apply(this,arguments);r("jQuery.fn.toggle(handler, handler...) is deprecated");var a=arguments,o=t.guid||e.guid++,i=0,s=function(n){var r=(e._data(this,"lastToggle"+t.guid)||0)%i;return e._data(this,"lastToggle"+t.guid,r+1),n.preventDefault(),a[r].apply(this,arguments)||!1};for(s.guid=o;a.length>i;)a[i++].guid=o;return this.click(s)},e.fn.live=function(t,n,a){return r("jQuery.fn.live() is deprecated"),C?C.apply(this,arguments):(e(this.context).on(t,this.selector,n,a),this)},e.fn.die=function(t,n){return r("jQuery.fn.die() is deprecated"),S?S.apply(this,arguments):(e(this.context).off(t,this.selector||"**",n),this)},e.event.trigger=function(e,t,n,a){return n||M.test(e)||r("Global events are undocumented and deprecated"),k.call(this,e,t,n||document,a)},e.each(T.split("|"),function(t,n){e.event.special[n]={setup:function(){var t=this;return t!==document&&(e.event.add(document,n+"."+e.guid,function(){e.event.trigger(n,null,t,!0)}),e._data(this,n,e.guid++)),!1},teardown:function(){return this!==document&&e.event.remove(document,n+"."+e._data(this,n)),!1}}})}(jQuery,window);
//@ sourceMappingURL=dist/jquery-migrate.min.map
/**
 * @summary     DataTables
 * @description Paginate, search and sort HTML tables
 * @version     1.9.4
 * @file        jquery.dataTables.js
 * @author      Allan Jardine (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 *
 * @copyright Copyright 2008-2012 Allan Jardine, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license, available at:
 *   http://datatables.net/license_gpl2
 *   http://datatables.net/license_bsd
 * 
 * This source file is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 * 
 * For details please refer to: http://www.datatables.net
 */

/*jslint evil: true, undef: true, browser: true */
/*globals $, jQuery,define,_fnExternApiFunc,_fnInitialise,_fnInitComplete,_fnLanguageCompat,_fnAddColumn,_fnColumnOptions,_fnAddData,_fnCreateTr,_fnGatherData,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAjaxUpdate,_fnAjaxParameters,_fnAjaxUpdateDraw,_fnServerParams,_fnAddOptionsHtml,_fnFeatureHtmlTable,_fnScrollDraw,_fnAdjustColumnSizing,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnBuildSearchArray,_fnBuildSearchRow,_fnFilterCreateSearch,_fnDataToSearch,_fnSort,_fnSortAttachListener,_fnSortingClasses,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnFeatureHtmlLength,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnNodeToDataIndex,_fnVisbleColumns,_fnCalculateEnd,_fnConvertToWidth,_fnCalculateColumnWidths,_fnScrollingWidthAdjust,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnDetectType,_fnSettingsFromNode,_fnGetDataMaster,_fnGetTrNodes,_fnGetTdNodes,_fnEscapeRegex,_fnDeleteIndex,_fnReOrderIndex,_fnColumnOrdering,_fnLog,_fnClearTable,_fnSaveState,_fnLoadState,_fnCreateCookie,_fnReadCookie,_fnDetectHeader,_fnGetUniqueThs,_fnScrollBarWidth,_fnApplyToChildren,_fnMap,_fnGetRowData,_fnGetCellData,_fnSetCellData,_fnGetObjectDataFn,_fnSetObjectDataFn,_fnApplyColumnDefs,_fnBindAction,_fnCallbackReg,_fnCallbackFire,_fnJsonString,_fnRender,_fnNodeToColumnIndex,_fnInfoMacros,_fnBrowserDetect,_fnGetColumns*/

(/** @lends <global> */function( window, document, undefined ) {

(function( factory ) {
	"use strict";

	// Define as an AMD module if possible
	if ( typeof define === 'function' && define.amd )
	{
		define( ['../../../../../Downloads/DataTables-1.9.4/media/js/jquery'], factory );
	}
	/* Define using browser globals otherwise
	 * Prevent multiple instantiations if the script is loaded twice
	 */
	else if ( jQuery && !jQuery.fn.dataTable )
	{
		factory( jQuery );
	}
}
(/** @lends <global> */function( $ ) {
	"use strict";
	/** 
	 * DataTables is a plug-in for the jQuery Javascript library. It is a 
	 * highly flexible tool, based upon the foundations of progressive 
	 * enhancement, which will add advanced interaction controls to any 
	 * HTML table. For a full list of features please refer to
	 * <a href="http://datatables.net">DataTables.net</a>.
	 *
	 * Note that the <i>DataTable</i> object is not a global variable but is
	 * aliased to <i>jQuery.fn.DataTable</i> and <i>jQuery.fn.dataTable</i> through which 
	 * it may be  accessed.
	 *
	 *  @class
	 *  @param {object} [oInit={}] Configuration object for DataTables. Options
	 *    are defined by {@link DataTable.defaults}
	 *  @requires jQuery 1.3+
	 * 
	 *  @example
	 *    // Basic initialisation
	 *    $(document).ready( function {
	 *      $('#example').dataTable();
	 *    } );
	 *  
	 *  @example
	 *    // Initialisation with configuration options - in this case, disable
	 *    // pagination and sorting.
	 *    $(document).ready( function {
	 *      $('#example').dataTable( {
	 *        "bPaginate": false,
	 *        "bSort": false 
	 *      } );
	 *    } );
	 */
	var DataTable = function( oInit )
	{
		
		
		/**
		 * Add a column to the list used for the table with default values
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nTh The th element for this column
		 *  @memberof DataTable#oApi
		 */
		function _fnAddColumn( oSettings, nTh )
		{
			var oDefaults = DataTable.defaults.columns;
			var iCol = oSettings.aoColumns.length;
			var oCol = $.extend( {}, DataTable.models.oColumn, oDefaults, {
				"sSortingClass": oSettings.oClasses.sSortable,
				"sSortingClassJUI": oSettings.oClasses.sSortJUI,
				"nTh": nTh ? nTh : document.createElement('th'),
				"sTitle":    oDefaults.sTitle    ? oDefaults.sTitle    : nTh ? nTh.innerHTML : '',
				"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
				"mData": oDefaults.mData ? oDefaults.oDefaults : iCol
			} );
			oSettings.aoColumns.push( oCol );
			
			/* Add a column specific filter */
			if ( oSettings.aoPreSearchCols[ iCol ] === undefined || oSettings.aoPreSearchCols[ iCol ] === null )
			{
				oSettings.aoPreSearchCols[ iCol ] = $.extend( {}, DataTable.models.oSearch );
			}
			else
			{
				var oPre = oSettings.aoPreSearchCols[ iCol ];
				
				/* Don't require that the user must specify bRegex, bSmart or bCaseInsensitive */
				if ( oPre.bRegex === undefined )
				{
					oPre.bRegex = true;
				}
				
				if ( oPre.bSmart === undefined )
				{
					oPre.bSmart = true;
				}
				
				if ( oPre.bCaseInsensitive === undefined )
				{
					oPre.bCaseInsensitive = true;
				}
			}
			
			/* Use the column options function to initialise classes etc */
			_fnColumnOptions( oSettings, iCol, null );
		}
		
		
		/**
		 * Apply options for a column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iCol column index to consider
		 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnOptions( oSettings, iCol, oOptions )
		{
			var oCol = oSettings.aoColumns[ iCol ];
			
			/* User specified column options */
			if ( oOptions !== undefined && oOptions !== null )
			{
				/* Backwards compatibility for mDataProp */
				if ( oOptions.mDataProp && !oOptions.mData )
				{
					oOptions.mData = oOptions.mDataProp;
				}
		
				if ( oOptions.sType !== undefined )
				{
					oCol.sType = oOptions.sType;
					oCol._bAutoType = false;
				}
				
				$.extend( oCol, oOptions );
				_fnMap( oCol, oOptions, "sWidth", "sWidthOrig" );
		
				/* iDataSort to be applied (backwards compatibility), but aDataSort will take
				 * priority if defined
				 */
				if ( oOptions.iDataSort !== undefined )
				{
					oCol.aDataSort = [ oOptions.iDataSort ];
				}
				_fnMap( oCol, oOptions, "aDataSort" );
			}
		
			/* Cache the data get and set functions for speed */
			var mRender = oCol.mRender ? _fnGetObjectDataFn( oCol.mRender ) : null;
			var mData = _fnGetObjectDataFn( oCol.mData );
		
			oCol.fnGetData = function (oData, sSpecific) {
				var innerData = mData( oData, sSpecific );
		
				if ( oCol.mRender && (sSpecific && sSpecific !== '') )
				{
					return mRender( innerData, sSpecific, oData );
				}
				return innerData;
			};
			oCol.fnSetData = _fnSetObjectDataFn( oCol.mData );
			
			/* Feature sorting overrides column specific when off */
			if ( !oSettings.oFeatures.bSort )
			{
				oCol.bSortable = false;
			}
			
			/* Check that the class assignment is correct for sorting */
			if ( !oCol.bSortable ||
				 ($.inArray('asc', oCol.asSorting) == -1 && $.inArray('desc', oCol.asSorting) == -1) )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortableNone;
				oCol.sSortingClassJUI = "";
			}
			else if ( $.inArray('asc', oCol.asSorting) == -1 && $.inArray('desc', oCol.asSorting) == -1 )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortable;
				oCol.sSortingClassJUI = oSettings.oClasses.sSortJUI;
			}
			else if ( $.inArray('asc', oCol.asSorting) != -1 && $.inArray('desc', oCol.asSorting) == -1 )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortableAsc;
				oCol.sSortingClassJUI = oSettings.oClasses.sSortJUIAscAllowed;
			}
			else if ( $.inArray('asc', oCol.asSorting) == -1 && $.inArray('desc', oCol.asSorting) != -1 )
			{
				oCol.sSortingClass = oSettings.oClasses.sSortableDesc;
				oCol.sSortingClassJUI = oSettings.oClasses.sSortJUIDescAllowed;
			}
		}
		
		
		/**
		 * Adjust the table column widths for new data. Note: you would probably want to 
		 * do a redraw after calling this function!
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnAdjustColumnSizing ( oSettings )
		{
			/* Not interested in doing column width calculation if auto-width is disabled */
			if ( oSettings.oFeatures.bAutoWidth === false )
			{
				return false;
			}
			
			_fnCalculateColumnWidths( oSettings );
			for ( var i=0 , iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oSettings.aoColumns[i].nTh.style.width = oSettings.aoColumns[i].sWidth;
			}
		}
		
		
		/**
		 * Covert the index of a visible column to the index in the data array (take account
		 * of hidden columns)
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iMatch Visible column index to lookup
		 *  @returns {int} i the data index
		 *  @memberof DataTable#oApi
		 */
		function _fnVisibleToColumnIndex( oSettings, iMatch )
		{
			var aiVis = _fnGetColumns( oSettings, 'bVisible' );
		
			return typeof aiVis[iMatch] === 'number' ?
				aiVis[iMatch] :
				null;
		}
		
		
		/**
		 * Covert the index of an index in the data array and convert it to the visible
		 *   column index (take account of hidden columns)
		 *  @param {int} iMatch Column index to lookup
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {int} i the data index
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnIndexToVisible( oSettings, iMatch )
		{
			var aiVis = _fnGetColumns( oSettings, 'bVisible' );
			var iPos = $.inArray( iMatch, aiVis );
		
			return iPos !== -1 ? iPos : null;
		}
		
		
		/**
		 * Get the number of visible columns
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {int} i the number of visible columns
		 *  @memberof DataTable#oApi
		 */
		function _fnVisbleColumns( oSettings )
		{
			return _fnGetColumns( oSettings, 'bVisible' ).length;
		}
		
		
		/**
		 * Get an array of column indexes that match a given property
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sParam Parameter in aoColumns to look for - typically 
		 *    bVisible or bSearchable
		 *  @returns {array} Array of indexes with matched properties
		 *  @memberof DataTable#oApi
		 */
		function _fnGetColumns( oSettings, sParam )
		{
			var a = [];
		
			$.map( oSettings.aoColumns, function(val, i) {
				if ( val[sParam] ) {
					a.push( i );
				}
			} );
		
			return a;
		}
		
		
		/**
		 * Get the sort type based on an input string
		 *  @param {string} sData data we wish to know the type of
		 *  @returns {string} type (defaults to 'string' if no type can be detected)
		 *  @memberof DataTable#oApi
		 */
		function _fnDetectType( sData )
		{
			var aTypes = DataTable.ext.aTypes;
			var iLen = aTypes.length;
			
			for ( var i=0 ; i<iLen ; i++ )
			{
				var sType = aTypes[i]( sData );
				if ( sType !== null )
				{
					return sType;
				}
			}
			
			return 'string';
		}
		
		
		/**
		 * Figure out how to reorder a display list
		 *  @param {object} oSettings dataTables settings object
		 *  @returns array {int} aiReturn index list for reordering
		 *  @memberof DataTable#oApi
		 */
		function _fnReOrderIndex ( oSettings, sColumns )
		{
			var aColumns = sColumns.split(',');
			var aiReturn = [];
			
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				for ( var j=0 ; j<iLen ; j++ )
				{
					if ( oSettings.aoColumns[i].sName == aColumns[j] )
					{
						aiReturn.push( j );
						break;
					}
				}
			}
			
			return aiReturn;
		}
		
		
		/**
		 * Get the column ordering that DataTables expects
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {string} comma separated list of names
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnOrdering ( oSettings )
		{
			var sNames = '';
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				sNames += oSettings.aoColumns[i].sName+',';
			}
			if ( sNames.length == iLen )
			{
				return "";
			}
			return sNames.slice(0, -1);
		}
		
		
		/**
		 * Take the column definitions and static columns arrays and calculate how
		 * they relate to column indexes. The callback function will then apply the
		 * definition found for a column to a suitable configuration object.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
		 *  @param {array} aoCols The aoColumns array that defines columns individually
		 *  @param {function} fn Callback function - takes two parameters, the calculated
		 *    column index and the definition for that column.
		 *  @memberof DataTable#oApi
		 */
		function _fnApplyColumnDefs( oSettings, aoColDefs, aoCols, fn )
		{
			var i, iLen, j, jLen, k, kLen;
		
			// Column definitions with aTargets
			if ( aoColDefs )
			{
				/* Loop over the definitions array - loop in reverse so first instance has priority */
				for ( i=aoColDefs.length-1 ; i>=0 ; i-- )
				{
					/* Each definition can target multiple columns, as it is an array */
					var aTargets = aoColDefs[i].aTargets;
					if ( !$.isArray( aTargets ) )
					{
						_fnLog( oSettings, 1, 'aTargets must be an array of targets, not a '+(typeof aTargets) );
					}
		
					for ( j=0, jLen=aTargets.length ; j<jLen ; j++ )
					{
						if ( typeof aTargets[j] === 'number' && aTargets[j] >= 0 )
						{
							/* Add columns that we don't yet know about */
							while( oSettings.aoColumns.length <= aTargets[j] )
							{
								_fnAddColumn( oSettings );
							}
		
							/* Integer, basic index */
							fn( aTargets[j], aoColDefs[i] );
						}
						else if ( typeof aTargets[j] === 'number' && aTargets[j] < 0 )
						{
							/* Negative integer, right to left column counting */
							fn( oSettings.aoColumns.length+aTargets[j], aoColDefs[i] );
						}
						else if ( typeof aTargets[j] === 'string' )
						{
							/* Class name matching on TH element */
							for ( k=0, kLen=oSettings.aoColumns.length ; k<kLen ; k++ )
							{
								if ( aTargets[j] == "_all" ||
								     $(oSettings.aoColumns[k].nTh).hasClass( aTargets[j] ) )
								{
									fn( k, aoColDefs[i] );
								}
							}
						}
					}
				}
			}
		
			// Statically defined columns array
			if ( aoCols )
			{
				for ( i=0, iLen=aoCols.length ; i<iLen ; i++ )
				{
					fn( i, aoCols[i] );
				}
			}
		}
		
		/**
		 * Add a data array to the table, creating DOM node etc. This is the parallel to 
		 * _fnGatherData, but for adding rows from a Javascript source, rather than a
		 * DOM source.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aData data array to be added
		 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
		 *  @memberof DataTable#oApi
		 */
		function _fnAddData ( oSettings, aDataSupplied )
		{
			var oCol;
			
			/* Take an independent copy of the data source so we can bash it about as we wish */
			var aDataIn = ($.isArray(aDataSupplied)) ?
				aDataSupplied.slice() :
				$.extend( true, {}, aDataSupplied );
			
			/* Create the object for storing information about this new row */
			var iRow = oSettings.aoData.length;
			var oData = $.extend( true, {}, DataTable.models.oRow );
			oData._aData = aDataIn;
			oSettings.aoData.push( oData );
		
			/* Create the cells */
			var nTd, sThisType;
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oCol = oSettings.aoColumns[i];
		
				/* Use rendered data for filtering / sorting */
				if ( typeof oCol.fnRender === 'function' && oCol.bUseRendered && oCol.mData !== null )
				{
					_fnSetCellData( oSettings, iRow, i, _fnRender(oSettings, iRow, i) );
				}
				else
				{
					_fnSetCellData( oSettings, iRow, i, _fnGetCellData( oSettings, iRow, i ) );
				}
				
				/* See if we should auto-detect the column type */
				if ( oCol._bAutoType && oCol.sType != 'string' )
				{
					/* Attempt to auto detect the type - same as _fnGatherData() */
					var sVarType = _fnGetCellData( oSettings, iRow, i, 'type' );
					if ( sVarType !== null && sVarType !== '' )
					{
						sThisType = _fnDetectType( sVarType );
						if ( oCol.sType === null )
						{
							oCol.sType = sThisType;
						}
						else if ( oCol.sType != sThisType && oCol.sType != "html" )
						{
							/* String is always the 'fallback' option */
							oCol.sType = 'string';
						}
					}
				}
			}
			
			/* Add to the display array */
			oSettings.aiDisplayMaster.push( iRow );
		
			/* Create the DOM information */
			if ( !oSettings.oFeatures.bDeferRender )
			{
				_fnCreateTr( oSettings, iRow );
			}
		
			return iRow;
		}
		
		
		/**
		 * Read in the data from the target table from the DOM
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnGatherData( oSettings )
		{
			var iLoop, i, iLen, j, jLen, jInner,
			 	nTds, nTrs, nTd, nTr, aLocalData, iThisIndex,
				iRow, iRows, iColumn, iColumns, sNodeName,
				oCol, oData;
			
			/*
			 * Process by row first
			 * Add the data object for the whole table - storing the tr node. Note - no point in getting
			 * DOM based data if we are going to go and replace it with Ajax source data.
			 */
			if ( oSettings.bDeferLoading || oSettings.sAjaxSource === null )
			{
				nTr = oSettings.nTBody.firstChild;
				while ( nTr )
				{
					if ( nTr.nodeName.toUpperCase() == "TR" )
					{
						iThisIndex = oSettings.aoData.length;
						nTr._DT_RowIndex = iThisIndex;
						oSettings.aoData.push( $.extend( true, {}, DataTable.models.oRow, {
							"nTr": nTr
						} ) );
		
						oSettings.aiDisplayMaster.push( iThisIndex );
						nTd = nTr.firstChild;
						jInner = 0;
						while ( nTd )
						{
							sNodeName = nTd.nodeName.toUpperCase();
							if ( sNodeName == "TD" || sNodeName == "TH" )
							{
								_fnSetCellData( oSettings, iThisIndex, jInner, $.trim(nTd.innerHTML) );
								jInner++;
							}
							nTd = nTd.nextSibling;
						}
					}
					nTr = nTr.nextSibling;
				}
			}
			
			/* Gather in the TD elements of the Table - note that this is basically the same as
			 * fnGetTdNodes, but that function takes account of hidden columns, which we haven't yet
			 * setup!
			 */
			nTrs = _fnGetTrNodes( oSettings );
			nTds = [];
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				nTd = nTrs[i].firstChild;
				while ( nTd )
				{
					sNodeName = nTd.nodeName.toUpperCase();
					if ( sNodeName == "TD" || sNodeName == "TH" )
					{
						nTds.push( nTd );
					}
					nTd = nTd.nextSibling;
				}
			}
			
			/* Now process by column */
			for ( iColumn=0, iColumns=oSettings.aoColumns.length ; iColumn<iColumns ; iColumn++ )
			{
				oCol = oSettings.aoColumns[iColumn];
		
				/* Get the title of the column - unless there is a user set one */
				if ( oCol.sTitle === null )
				{
					oCol.sTitle = oCol.nTh.innerHTML;
				}
				
				var
					bAutoType = oCol._bAutoType,
					bRender = typeof oCol.fnRender === 'function',
					bClass = oCol.sClass !== null,
					bVisible = oCol.bVisible,
					nCell, sThisType, sRendered, sValType;
				
				/* A single loop to rule them all (and be more efficient) */
				if ( bAutoType || bRender || bClass || !bVisible )
				{
					for ( iRow=0, iRows=oSettings.aoData.length ; iRow<iRows ; iRow++ )
					{
						oData = oSettings.aoData[iRow];
						nCell = nTds[ (iRow*iColumns) + iColumn ];
						
						/* Type detection */
						if ( bAutoType && oCol.sType != 'string' )
						{
							sValType = _fnGetCellData( oSettings, iRow, iColumn, 'type' );
							if ( sValType !== '' )
							{
								sThisType = _fnDetectType( sValType );
								if ( oCol.sType === null )
								{
									oCol.sType = sThisType;
								}
								else if ( oCol.sType != sThisType && 
								          oCol.sType != "html" )
								{
									/* String is always the 'fallback' option */
									oCol.sType = 'string';
								}
							}
						}
		
						if ( oCol.mRender )
						{
							// mRender has been defined, so we need to get the value and set it
							nCell.innerHTML = _fnGetCellData( oSettings, iRow, iColumn, 'display' );
						}
						else if ( oCol.mData !== iColumn )
						{
							// If mData is not the same as the column number, then we need to
							// get the dev set value. If it is the column, no point in wasting
							// time setting the value that is already there!
							nCell.innerHTML = _fnGetCellData( oSettings, iRow, iColumn, 'display' );
						}
						
						/* Rendering */
						if ( bRender )
						{
							sRendered = _fnRender( oSettings, iRow, iColumn );
							nCell.innerHTML = sRendered;
							if ( oCol.bUseRendered )
							{
								/* Use the rendered data for filtering / sorting */
								_fnSetCellData( oSettings, iRow, iColumn, sRendered );
							}
						}
						
						/* Classes */
						if ( bClass )
						{
							nCell.className += ' '+oCol.sClass;
						}
						
						/* Column visibility */
						if ( !bVisible )
						{
							oData._anHidden[iColumn] = nCell;
							nCell.parentNode.removeChild( nCell );
						}
						else
						{
							oData._anHidden[iColumn] = null;
						}
		
						if ( oCol.fnCreatedCell )
						{
							oCol.fnCreatedCell.call( oSettings.oInstance,
								nCell, _fnGetCellData( oSettings, iRow, iColumn, 'display' ), oData._aData, iRow, iColumn
							);
						}
					}
				}
			}
		
			/* Row created callbacks */
			if ( oSettings.aoRowCreatedCallback.length !== 0 )
			{
				for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
				{
					oData = oSettings.aoData[i];
					_fnCallbackFire( oSettings, 'aoRowCreatedCallback', null, [oData.nTr, oData._aData, i] );
				}
			}
		}
		
		
		/**
		 * Take a TR element and convert it to an index in aoData
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} n the TR element to find
		 *  @returns {int} index if the node is found, null if not
		 *  @memberof DataTable#oApi
		 */
		function _fnNodeToDataIndex( oSettings, n )
		{
			return (n._DT_RowIndex!==undefined) ? n._DT_RowIndex : null;
		}
		
		
		/**
		 * Take a TD element and convert it into a column data index (not the visible index)
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow The row number the TD/TH can be found in
		 *  @param {node} n The TD/TH element to find
		 *  @returns {int} index if the node is found, -1 if not
		 *  @memberof DataTable#oApi
		 */
		function _fnNodeToColumnIndex( oSettings, iRow, n )
		{
			var anCells = _fnGetTdNodes( oSettings, iRow );
		
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				if ( anCells[i] === n )
				{
					return i;
				}
			}
			return -1;
		}
		
		
		/**
		 * Get an array of data for a given row from the internal data cache
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow aoData row id
		 *  @param {string} sSpecific data get type ('type' 'filter' 'sort')
		 *  @param {array} aiColumns Array of column indexes to get data from
		 *  @returns {array} Data array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetRowData( oSettings, iRow, sSpecific, aiColumns )
		{
			var out = [];
			for ( var i=0, iLen=aiColumns.length ; i<iLen ; i++ )
			{
				out.push( _fnGetCellData( oSettings, iRow, aiColumns[i], sSpecific ) );
			}
			return out;
		}
		
		
		/**
		 * Get the data for a given cell from the internal cache, taking into account data mapping
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow aoData row id
		 *  @param {int} iCol Column index
		 *  @param {string} sSpecific data get type ('display', 'type' 'filter' 'sort')
		 *  @returns {*} Cell data
		 *  @memberof DataTable#oApi
		 */
		function _fnGetCellData( oSettings, iRow, iCol, sSpecific )
		{
			var sData;
			var oCol = oSettings.aoColumns[iCol];
			var oData = oSettings.aoData[iRow]._aData;
		
			if ( (sData=oCol.fnGetData( oData, sSpecific )) === undefined )
			{
				if ( oSettings.iDrawError != oSettings.iDraw && oCol.sDefaultContent === null )
				{
					_fnLog( oSettings, 0, "Requested unknown parameter "+
						(typeof oCol.mData=='function' ? '{mData function}' : "'"+oCol.mData+"'")+
						" from the data source for row "+iRow );
					oSettings.iDrawError = oSettings.iDraw;
				}
				return oCol.sDefaultContent;
			}
		
			/* When the data source is null, we can use default column data */
			if ( sData === null && oCol.sDefaultContent !== null )
			{
				sData = oCol.sDefaultContent;
			}
			else if ( typeof sData === 'function' )
			{
				/* If the data source is a function, then we run it and use the return */
				return sData();
			}
		
			if ( sSpecific == 'display' && sData === null )
			{
				return '';
			}
			return sData;
		}
		
		
		/**
		 * Set the value for a specific cell, into the internal data cache
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow aoData row id
		 *  @param {int} iCol Column index
		 *  @param {*} val Value to set
		 *  @memberof DataTable#oApi
		 */
		function _fnSetCellData( oSettings, iRow, iCol, val )
		{
			var oCol = oSettings.aoColumns[iCol];
			var oData = oSettings.aoData[iRow]._aData;
		
			oCol.fnSetData( oData, val );
		}
		
		
		// Private variable that is used to match array syntax in the data property object
		var __reArray = /\[.*?\]$/;
		
		/**
		 * Return a function that can be used to get data from a source object, taking
		 * into account the ability to use nested objects as a source
		 *  @param {string|int|function} mSource The data source for the object
		 *  @returns {function} Data get function
		 *  @memberof DataTable#oApi
		 */
		function _fnGetObjectDataFn( mSource )
		{
			if ( mSource === null )
			{
				/* Give an empty string for rendering / sorting etc */
				return function (data, type) {
					return null;
				};
			}
			else if ( typeof mSource === 'function' )
			{
				return function (data, type, extra) {
					return mSource( data, type, extra );
				};
			}
			else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 || mSource.indexOf('[') !== -1) )
			{
				/* If there is a . in the source string then the data source is in a 
				 * nested object so we loop over the data for each level to get the next
				 * level down. On each loop we test for undefined, and if found immediately
				 * return. This allows entire objects to be missing and sDefaultContent to
				 * be used if defined, rather than throwing an error
				 */
				var fetchData = function (data, type, src) {
					var a = src.split('.');
					var arrayNotation, out, innerSrc;
		
					if ( src !== "" )
					{
						for ( var i=0, iLen=a.length ; i<iLen ; i++ )
						{
							// Check if we are dealing with an array notation request
							arrayNotation = a[i].match(__reArray);
		
							if ( arrayNotation ) {
								a[i] = a[i].replace(__reArray, '');
		
								// Condition allows simply [] to be passed in
								if ( a[i] !== "" ) {
									data = data[ a[i] ];
								}
								out = [];
								
								// Get the remainder of the nested object to get
								a.splice( 0, i+1 );
								innerSrc = a.join('.');
		
								// Traverse each entry in the array getting the properties requested
								for ( var j=0, jLen=data.length ; j<jLen ; j++ ) {
									out.push( fetchData( data[j], type, innerSrc ) );
								}
		
								// If a string is given in between the array notation indicators, that
								// is used to join the strings together, otherwise an array is returned
								var join = arrayNotation[0].substring(1, arrayNotation[0].length-1);
								data = (join==="") ? out : out.join(join);
		
								// The inner call to fetchData has already traversed through the remainder
								// of the source requested, so we exit from the loop
								break;
							}
		
							if ( data === null || data[ a[i] ] === undefined )
							{
								return undefined;
							}
							data = data[ a[i] ];
						}
					}
		
					return data;
				};
		
				return function (data, type) {
					return fetchData( data, type, mSource );
				};
			}
			else
			{
				/* Array or flat object mapping */
				return function (data, type) {
					return data[mSource];	
				};
			}
		}
		
		
		/**
		 * Return a function that can be used to set data from a source object, taking
		 * into account the ability to use nested objects as a source
		 *  @param {string|int|function} mSource The data source for the object
		 *  @returns {function} Data set function
		 *  @memberof DataTable#oApi
		 */
		function _fnSetObjectDataFn( mSource )
		{
			if ( mSource === null )
			{
				/* Nothing to do when the data source is null */
				return function (data, val) {};
			}
			else if ( typeof mSource === 'function' )
			{
				return function (data, val) {
					mSource( data, 'set', val );
				};
			}
			else if ( typeof mSource === 'string' && (mSource.indexOf('.') !== -1 || mSource.indexOf('[') !== -1) )
			{
				/* Like the get, we need to get data from a nested object */
				var setData = function (data, val, src) {
					var a = src.split('.'), b;
					var arrayNotation, o, innerSrc;
		
					for ( var i=0, iLen=a.length-1 ; i<iLen ; i++ )
					{
						// Check if we are dealing with an array notation request
						arrayNotation = a[i].match(__reArray);
		
						if ( arrayNotation )
						{
							a[i] = a[i].replace(__reArray, '');
							data[ a[i] ] = [];
							
							// Get the remainder of the nested object to set so we can recurse
							b = a.slice();
							b.splice( 0, i+1 );
							innerSrc = b.join('.');
		
							// Traverse each entry in the array setting the properties requested
							for ( var j=0, jLen=val.length ; j<jLen ; j++ )
							{
								o = {};
								setData( o, val[j], innerSrc );
								data[ a[i] ].push( o );
							}
		
							// The inner call to setData has already traversed through the remainder
							// of the source and has set the data, thus we can exit here
							return;
						}
		
						// If the nested object doesn't currently exist - since we are
						// trying to set the value - create it
						if ( data[ a[i] ] === null || data[ a[i] ] === undefined )
						{
							data[ a[i] ] = {};
						}
						data = data[ a[i] ];
					}
		
					// If array notation is used, we just want to strip it and use the property name
					// and assign the value. If it isn't used, then we get the result we want anyway
					data[ a[a.length-1].replace(__reArray, '') ] = val;
				};
		
				return function (data, val) {
					return setData( data, val, mSource );
				};
			}
			else
			{
				/* Array or flat object mapping */
				return function (data, val) {
					data[mSource] = val;	
				};
			}
		}
		
		
		/**
		 * Return an array with the full table data
		 *  @param {object} oSettings dataTables settings object
		 *  @returns array {array} aData Master data array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetDataMaster ( oSettings )
		{
			var aData = [];
			var iLen = oSettings.aoData.length;
			for ( var i=0 ; i<iLen; i++ )
			{
				aData.push( oSettings.aoData[i]._aData );
			}
			return aData;
		}
		
		
		/**
		 * Nuke the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnClearTable( oSettings )
		{
			oSettings.aoData.splice( 0, oSettings.aoData.length );
			oSettings.aiDisplayMaster.splice( 0, oSettings.aiDisplayMaster.length );
			oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length );
			_fnCalculateEnd( oSettings );
		}
		
		
		 /**
		 * Take an array of integers (index array) and remove a target integer (value - not 
		 * the key!)
		 *  @param {array} a Index array to target
		 *  @param {int} iTarget value to find
		 *  @memberof DataTable#oApi
		 */
		function _fnDeleteIndex( a, iTarget )
		{
			var iTargetIndex = -1;
			
			for ( var i=0, iLen=a.length ; i<iLen ; i++ )
			{
				if ( a[i] == iTarget )
				{
					iTargetIndex = i;
				}
				else if ( a[i] > iTarget )
				{
					a[i]--;
				}
			}
			
			if ( iTargetIndex != -1 )
			{
				a.splice( iTargetIndex, 1 );
			}
		}
		
		
		 /**
		 * Call the developer defined fnRender function for a given cell (row/column) with
		 * the required parameters and return the result.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow aoData index for the row
		 *  @param {int} iCol aoColumns index for the column
		 *  @returns {*} Return of the developer's fnRender function
		 *  @memberof DataTable#oApi
		 */
		function _fnRender( oSettings, iRow, iCol )
		{
			var oCol = oSettings.aoColumns[iCol];
		
			return oCol.fnRender( {
				"iDataRow":    iRow,
				"iDataColumn": iCol,
				"oSettings":   oSettings,
				"aData":       oSettings.aoData[iRow]._aData,
				"mDataProp":   oCol.mData
			}, _fnGetCellData(oSettings, iRow, iCol, 'display') );
		}
		/**
		 * Create a new TR element (and it's TD children) for a row
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow Row to consider
		 *  @memberof DataTable#oApi
		 */
		function _fnCreateTr ( oSettings, iRow )
		{
			var oData = oSettings.aoData[iRow];
			var nTd;
		
			if ( oData.nTr === null )
			{
				oData.nTr = document.createElement('tr');
		
				/* Use a private property on the node to allow reserve mapping from the node
				 * to the aoData array for fast look up
				 */
				oData.nTr._DT_RowIndex = iRow;
		
				/* Special parameters can be given by the data source to be used on the row */
				if ( oData._aData.DT_RowId )
				{
					oData.nTr.id = oData._aData.DT_RowId;
				}
		
				if ( oData._aData.DT_RowClass )
				{
					oData.nTr.className = oData._aData.DT_RowClass;
				}
		
				/* Process each column */
				for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					var oCol = oSettings.aoColumns[i];
					nTd = document.createElement( oCol.sCellType );
		
					/* Render if needed - if bUseRendered is true then we already have the rendered
					 * value in the data source - so can just use that
					 */
					nTd.innerHTML = (typeof oCol.fnRender === 'function' && (!oCol.bUseRendered || oCol.mData === null)) ?
						_fnRender( oSettings, iRow, i ) :
						_fnGetCellData( oSettings, iRow, i, 'display' );
				
					/* Add user defined class */
					if ( oCol.sClass !== null )
					{
						nTd.className = oCol.sClass;
					}
					
					if ( oCol.bVisible )
					{
						oData.nTr.appendChild( nTd );
						oData._anHidden[i] = null;
					}
					else
					{
						oData._anHidden[i] = nTd;
					}
		
					if ( oCol.fnCreatedCell )
					{
						oCol.fnCreatedCell.call( oSettings.oInstance,
							nTd, _fnGetCellData( oSettings, iRow, i, 'display' ), oData._aData, iRow, i
						);
					}
				}
		
				_fnCallbackFire( oSettings, 'aoRowCreatedCallback', null, [oData.nTr, oData._aData, iRow] );
			}
		}
		
		
		/**
		 * Create the HTML header for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnBuildHead( oSettings )
		{
			var i, nTh, iLen, j, jLen;
			var iThs = $('th, td', oSettings.nTHead).length;
			var iCorrector = 0;
			var jqChildren;
			
			/* If there is a header in place - then use it - otherwise it's going to get nuked... */
			if ( iThs !== 0 )
			{
				/* We've got a thead from the DOM, so remove hidden columns and apply width to vis cols */
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					nTh = oSettings.aoColumns[i].nTh;
					nTh.setAttribute('role', 'columnheader');
					if ( oSettings.aoColumns[i].bSortable )
					{
						nTh.setAttribute('tabindex', oSettings.iTabIndex);
						nTh.setAttribute('aria-controls', oSettings.sTableId);
					}
		
					if ( oSettings.aoColumns[i].sClass !== null )
					{
						$(nTh).addClass( oSettings.aoColumns[i].sClass );
					}
					
					/* Set the title of the column if it is user defined (not what was auto detected) */
					if ( oSettings.aoColumns[i].sTitle != nTh.innerHTML )
					{
						nTh.innerHTML = oSettings.aoColumns[i].sTitle;
					}
				}
			}
			else
			{
				/* We don't have a header in the DOM - so we are going to have to create one */
				var nTr = document.createElement( "tr" );
				
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					nTh = oSettings.aoColumns[i].nTh;
					nTh.innerHTML = oSettings.aoColumns[i].sTitle;
					nTh.setAttribute('tabindex', '0');
					
					if ( oSettings.aoColumns[i].sClass !== null )
					{
						$(nTh).addClass( oSettings.aoColumns[i].sClass );
					}
					
					nTr.appendChild( nTh );
				}
				$(oSettings.nTHead).html( '' )[0].appendChild( nTr );
				_fnDetectHeader( oSettings.aoHeader, oSettings.nTHead );
			}
			
			/* ARIA role for the rows */	
			$(oSettings.nTHead).children('tr').attr('role', 'row');
			
			/* Add the extra markup needed by jQuery UI's themes */
			if ( oSettings.bJUI )
			{
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					nTh = oSettings.aoColumns[i].nTh;
					
					var nDiv = document.createElement('div');
					nDiv.className = oSettings.oClasses.sSortJUIWrapper;
					$(nTh).contents().appendTo(nDiv);
					
					var nSpan = document.createElement('span');
					nSpan.className = oSettings.oClasses.sSortIcon;
					nDiv.appendChild( nSpan );
					nTh.appendChild( nDiv );
				}
			}
			
			if ( oSettings.oFeatures.bSort )
			{
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					if ( oSettings.aoColumns[i].bSortable !== false )
					{
						_fnSortAttachListener( oSettings, oSettings.aoColumns[i].nTh, i );
					}
					else
					{
						$(oSettings.aoColumns[i].nTh).addClass( oSettings.oClasses.sSortableNone );
					}
				}
			}
			
			/* Deal with the footer - add classes if required */
			if ( oSettings.oClasses.sFooterTH !== "" )
			{
				$(oSettings.nTFoot).children('tr').children('th').addClass( oSettings.oClasses.sFooterTH );
			}
			
			/* Cache the footer elements */
			if ( oSettings.nTFoot !== null )
			{
				var anCells = _fnGetUniqueThs( oSettings, null, oSettings.aoFooter );
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					if ( anCells[i] )
					{
						oSettings.aoColumns[i].nTf = anCells[i];
						if ( oSettings.aoColumns[i].sClass )
						{
							$(anCells[i]).addClass( oSettings.aoColumns[i].sClass );
						}
					}
				}
			}
		}
		
		
		/**
		 * Draw the header (or footer) element based on the column visibility states. The
		 * methodology here is to use the layout array from _fnDetectHeader, modified for
		 * the instantaneous column visibility, to construct the new layout. The grid is
		 * traversed over cell at a time in a rows x columns grid fashion, although each 
		 * cell insert can cover multiple elements in the grid - which is tracks using the
		 * aApplied array. Cell inserts in the grid will only occur where there isn't
		 * already a cell in that position.
		 *  @param {object} oSettings dataTables settings object
		 *  @param array {objects} aoSource Layout array from _fnDetectHeader
		 *  @param {boolean} [bIncludeHidden=false] If true then include the hidden columns in the calc, 
		 *  @memberof DataTable#oApi
		 */
		function _fnDrawHead( oSettings, aoSource, bIncludeHidden )
		{
			var i, iLen, j, jLen, k, kLen, n, nLocalTr;
			var aoLocal = [];
			var aApplied = [];
			var iColumns = oSettings.aoColumns.length;
			var iRowspan, iColspan;
		
			if (  bIncludeHidden === undefined )
			{
				bIncludeHidden = false;
			}
		
			/* Make a copy of the master layout array, but without the visible columns in it */
			for ( i=0, iLen=aoSource.length ; i<iLen ; i++ )
			{
				aoLocal[i] = aoSource[i].slice();
				aoLocal[i].nTr = aoSource[i].nTr;
		
				/* Remove any columns which are currently hidden */
				for ( j=iColumns-1 ; j>=0 ; j-- )
				{
					if ( !oSettings.aoColumns[j].bVisible && !bIncludeHidden )
					{
						aoLocal[i].splice( j, 1 );
					}
				}
		
				/* Prep the applied array - it needs an element for each row */
				aApplied.push( [] );
			}
		
			for ( i=0, iLen=aoLocal.length ; i<iLen ; i++ )
			{
				nLocalTr = aoLocal[i].nTr;
				
				/* All cells are going to be replaced, so empty out the row */
				if ( nLocalTr )
				{
					while( (n = nLocalTr.firstChild) )
					{
						nLocalTr.removeChild( n );
					}
				}
		
				for ( j=0, jLen=aoLocal[i].length ; j<jLen ; j++ )
				{
					iRowspan = 1;
					iColspan = 1;
		
					/* Check to see if there is already a cell (row/colspan) covering our target
					 * insert point. If there is, then there is nothing to do.
					 */
					if ( aApplied[i][j] === undefined )
					{
						nLocalTr.appendChild( aoLocal[i][j].cell );
						aApplied[i][j] = 1;
		
						/* Expand the cell to cover as many rows as needed */
						while ( aoLocal[i+iRowspan] !== undefined &&
						        aoLocal[i][j].cell == aoLocal[i+iRowspan][j].cell )
						{
							aApplied[i+iRowspan][j] = 1;
							iRowspan++;
						}
		
						/* Expand the cell to cover as many columns as needed */
						while ( aoLocal[i][j+iColspan] !== undefined &&
						        aoLocal[i][j].cell == aoLocal[i][j+iColspan].cell )
						{
							/* Must update the applied array over the rows for the columns */
							for ( k=0 ; k<iRowspan ; k++ )
							{
								aApplied[i+k][j+iColspan] = 1;
							}
							iColspan++;
						}
		
						/* Do the actual expansion in the DOM */
						aoLocal[i][j].cell.rowSpan = iRowspan;
						aoLocal[i][j].cell.colSpan = iColspan;
					}
				}
			}
		}
		
		
		/**
		 * Insert the required TR nodes into the table for display
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnDraw( oSettings )
		{
			/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
			var aPreDraw = _fnCallbackFire( oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings] );
			if ( $.inArray( false, aPreDraw ) !== -1 )
			{
				_fnProcessingDisplay( oSettings, false );
				return;
			}
			
			var i, iLen, n;
			var anRows = [];
			var iRowCount = 0;
			var iStripes = oSettings.asStripeClasses.length;
			var iOpenRows = oSettings.aoOpenRows.length;
			
			oSettings.bDrawing = true;
			
			/* Check and see if we have an initial draw position from state saving */
			if ( oSettings.iInitDisplayStart !== undefined && oSettings.iInitDisplayStart != -1 )
			{
				if ( oSettings.oFeatures.bServerSide )
				{
					oSettings._iDisplayStart = oSettings.iInitDisplayStart;
				}
				else
				{
					oSettings._iDisplayStart = (oSettings.iInitDisplayStart >= oSettings.fnRecordsDisplay()) ?
						0 : oSettings.iInitDisplayStart;
				}
				oSettings.iInitDisplayStart = -1;
				_fnCalculateEnd( oSettings );
			}
			
			/* Server-side processing draw intercept */
			if ( oSettings.bDeferLoading )
			{
				oSettings.bDeferLoading = false;
				oSettings.iDraw++;
			}
			else if ( !oSettings.oFeatures.bServerSide )
			{
				oSettings.iDraw++;
			}
			else if ( !oSettings.bDestroying && !_fnAjaxUpdate( oSettings ) )
			{
				return;
			}
			
			if ( oSettings.aiDisplay.length !== 0 )
			{
				var iStart = oSettings._iDisplayStart;
				var iEnd = oSettings._iDisplayEnd;
				
				if ( oSettings.oFeatures.bServerSide )
				{
					iStart = 0;
					iEnd = oSettings.aoData.length;
				}
				
				for ( var j=iStart ; j<iEnd ; j++ )
				{
					var aoData = oSettings.aoData[ oSettings.aiDisplay[j] ];
					if ( aoData.nTr === null )
					{
						_fnCreateTr( oSettings, oSettings.aiDisplay[j] );
					}
		
					var nRow = aoData.nTr;
					
					/* Remove the old striping classes and then add the new one */
					if ( iStripes !== 0 )
					{
						var sStripe = oSettings.asStripeClasses[ iRowCount % iStripes ];
						if ( aoData._sRowStripe != sStripe )
						{
							$(nRow).removeClass( aoData._sRowStripe ).addClass( sStripe );
							aoData._sRowStripe = sStripe;
						}
					}
					
					/* Row callback functions - might want to manipulate the row */
					_fnCallbackFire( oSettings, 'aoRowCallback', null, 
						[nRow, oSettings.aoData[ oSettings.aiDisplay[j] ]._aData, iRowCount, j] );
					
					anRows.push( nRow );
					iRowCount++;
					
					/* If there is an open row - and it is attached to this parent - attach it on redraw */
					if ( iOpenRows !== 0 )
					{
						for ( var k=0 ; k<iOpenRows ; k++ )
						{
							if ( nRow == oSettings.aoOpenRows[k].nParent )
							{
								anRows.push( oSettings.aoOpenRows[k].nTr );
								break;
							}
						}
					}
				}
			}
			else
			{
				/* Table is empty - create a row with an empty message in it */
				anRows[ 0 ] = document.createElement( 'tr' );
				
				if ( oSettings.asStripeClasses[0] )
				{
					anRows[ 0 ].className = oSettings.asStripeClasses[0];
				}
		
				var oLang = oSettings.oLanguage;
				var sZero = oLang.sZeroRecords;
				if ( oSettings.iDraw == 1 && oSettings.sAjaxSource !== null && !oSettings.oFeatures.bServerSide )
				{
					sZero = oLang.sLoadingRecords;
				}
				else if ( oLang.sEmptyTable && oSettings.fnRecordsTotal() === 0 )
				{
					sZero = oLang.sEmptyTable;
				}
		
				var nTd = document.createElement( 'td' );
				nTd.setAttribute( 'valign', "top" );
				nTd.colSpan = _fnVisbleColumns( oSettings );
				nTd.className = oSettings.oClasses.sRowEmpty;
				nTd.innerHTML = _fnInfoMacros( oSettings, sZero );
				
				anRows[ iRowCount ].appendChild( nTd );
			}
			
			/* Header and footer callbacks */
			_fnCallbackFire( oSettings, 'aoHeaderCallback', 'header', [ $(oSettings.nTHead).children('tr')[0], 
				_fnGetDataMaster( oSettings ), oSettings._iDisplayStart, oSettings.fnDisplayEnd(), oSettings.aiDisplay ] );
			
			_fnCallbackFire( oSettings, 'aoFooterCallback', 'footer', [ $(oSettings.nTFoot).children('tr')[0], 
				_fnGetDataMaster( oSettings ), oSettings._iDisplayStart, oSettings.fnDisplayEnd(), oSettings.aiDisplay ] );
			
			/* 
			 * Need to remove any old row from the display - note we can't just empty the tbody using
			 * $().html('') since this will unbind the jQuery event handlers (even although the node 
			 * still exists!) - equally we can't use innerHTML, since IE throws an exception.
			 */
			var
				nAddFrag = document.createDocumentFragment(),
				nRemoveFrag = document.createDocumentFragment(),
				nBodyPar, nTrs;
			
			if ( oSettings.nTBody )
			{
				nBodyPar = oSettings.nTBody.parentNode;
				nRemoveFrag.appendChild( oSettings.nTBody );
				
				/* When doing infinite scrolling, only remove child rows when sorting, filtering or start
				 * up. When not infinite scroll, always do it.
				 */
				if ( !oSettings.oScroll.bInfinite || !oSettings._bInitComplete ||
				 	oSettings.bSorted || oSettings.bFiltered )
				{
					while( (n = oSettings.nTBody.firstChild) )
					{
						oSettings.nTBody.removeChild( n );
					}
				}
				
				/* Put the draw table into the dom */
				for ( i=0, iLen=anRows.length ; i<iLen ; i++ )
				{
					nAddFrag.appendChild( anRows[i] );
				}
				
				oSettings.nTBody.appendChild( nAddFrag );
				if ( nBodyPar !== null )
				{
					nBodyPar.appendChild( oSettings.nTBody );
				}
			}
			
			/* Call all required callback functions for the end of a draw */
			_fnCallbackFire( oSettings, 'aoDrawCallback', 'draw', [oSettings] );
			
			/* Draw is complete, sorting and filtering must be as well */
			oSettings.bSorted = false;
			oSettings.bFiltered = false;
			oSettings.bDrawing = false;
			
			if ( oSettings.oFeatures.bServerSide )
			{
				_fnProcessingDisplay( oSettings, false );
				if ( !oSettings._bInitComplete )
				{
					_fnInitComplete( oSettings );
				}
			}
		}
		
		
		/**
		 * Redraw the table - taking account of the various features which are enabled
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnReDraw( oSettings )
		{
			if ( oSettings.oFeatures.bSort )
			{
				/* Sorting will refilter and draw for us */
				_fnSort( oSettings, oSettings.oPreviousSearch );
			}
			else if ( oSettings.oFeatures.bFilter )
			{
				/* Filtering will redraw for us */
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch );
			}
			else
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
		}
		
		
		/**
		 * Add the options to the page HTML for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnAddOptionsHtml ( oSettings )
		{
			/*
			 * Create a temporary, empty, div which we can later on replace with what we have generated
			 * we do it this way to rendering the 'options' html offline - speed :-)
			 */
			var nHolding = $('<div></div>')[0];
			oSettings.nTable.parentNode.insertBefore( nHolding, oSettings.nTable );
			
			/* 
			 * All DataTables are wrapped in a div
			 */
			oSettings.nTableWrapper = $('<div id="'+oSettings.sTableId+'_wrapper" class="'+oSettings.oClasses.sWrapper+'" role="grid"></div>')[0];
			oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;
		
			/* Track where we want to insert the option */
			var nInsertNode = oSettings.nTableWrapper;
			
			/* Loop over the user set positioning and place the elements as needed */
			var aDom = oSettings.sDom.split('');
			var nTmp, iPushFeature, cOption, nNewNode, cNext, sAttr, j;
			for ( var i=0 ; i<aDom.length ; i++ )
			{
				iPushFeature = 0;
				cOption = aDom[i];
				
				if ( cOption == '<' )
				{
					/* New container div */
					nNewNode = $('<div></div>')[0];
					
					/* Check to see if we should append an id and/or a class name to the container */
					cNext = aDom[i+1];
					if ( cNext == "'" || cNext == '"' )
					{
						sAttr = "";
						j = 2;
						while ( aDom[i+j] != cNext )
						{
							sAttr += aDom[i+j];
							j++;
						}
						
						/* Replace jQuery UI constants */
						if ( sAttr == "H" )
						{
							sAttr = oSettings.oClasses.sJUIHeader;
						}
						else if ( sAttr == "F" )
						{
							sAttr = oSettings.oClasses.sJUIFooter;
						}
						
						/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
						 * breaks the string into parts and applies them as needed
						 */
						if ( sAttr.indexOf('.') != -1 )
						{
							var aSplit = sAttr.split('.');
							nNewNode.id = aSplit[0].substr(1, aSplit[0].length-1);
							nNewNode.className = aSplit[1];
						}
						else if ( sAttr.charAt(0) == "#" )
						{
							nNewNode.id = sAttr.substr(1, sAttr.length-1);
						}
						else
						{
							nNewNode.className = sAttr;
						}
						
						i += j; /* Move along the position array */
					}
					
					nInsertNode.appendChild( nNewNode );
					nInsertNode = nNewNode;
				}
				else if ( cOption == '>' )
				{
					/* End container div */
					nInsertNode = nInsertNode.parentNode;
				}
				else if ( cOption == 'l' && oSettings.oFeatures.bPaginate && oSettings.oFeatures.bLengthChange )
				{
					/* Length */
					nTmp = _fnFeatureHtmlLength( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 'f' && oSettings.oFeatures.bFilter )
				{
					/* Filter */
					nTmp = _fnFeatureHtmlFilter( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 'r' && oSettings.oFeatures.bProcessing )
				{
					/* pRocessing */
					nTmp = _fnFeatureHtmlProcessing( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 't' )
				{
					/* Table */
					nTmp = _fnFeatureHtmlTable( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption ==  'i' && oSettings.oFeatures.bInfo )
				{
					/* Info */
					nTmp = _fnFeatureHtmlInfo( oSettings );
					iPushFeature = 1;
				}
				else if ( cOption == 'p' && oSettings.oFeatures.bPaginate )
				{
					/* Pagination */
					nTmp = _fnFeatureHtmlPaginate( oSettings );
					iPushFeature = 1;
				}
				else if ( DataTable.ext.aoFeatures.length !== 0 )
				{
					/* Plug-in features */
					var aoFeatures = DataTable.ext.aoFeatures;
					for ( var k=0, kLen=aoFeatures.length ; k<kLen ; k++ )
					{
						if ( cOption == aoFeatures[k].cFeature )
						{
							nTmp = aoFeatures[k].fnInit( oSettings );
							if ( nTmp )
							{
								iPushFeature = 1;
							}
							break;
						}
					}
				}
				
				/* Add to the 2D features array */
				if ( iPushFeature == 1 && nTmp !== null )
				{
					if ( typeof oSettings.aanFeatures[cOption] !== 'object' )
					{
						oSettings.aanFeatures[cOption] = [];
					}
					oSettings.aanFeatures[cOption].push( nTmp );
					nInsertNode.appendChild( nTmp );
				}
			}
			
			/* Built our DOM structure - replace the holding div with what we want */
			nHolding.parentNode.replaceChild( oSettings.nTableWrapper, nHolding );
		}
		
		
		/**
		 * Use the DOM source to create up an array of header cells. The idea here is to
		 * create a layout grid (array) of rows x columns, which contains a reference
		 * to the cell that that point in the grid (regardless of col/rowspan), such that
		 * any column / row could be removed and the new grid constructed
		 *  @param array {object} aLayout Array to store the calculated layout in
		 *  @param {node} nThead The header/footer element for the table
		 *  @memberof DataTable#oApi
		 */
		function _fnDetectHeader ( aLayout, nThead )
		{
			var nTrs = $(nThead).children('tr');
			var nTr, nCell;
			var i, k, l, iLen, jLen, iColShifted, iColumn, iColspan, iRowspan;
			var bUnique;
			var fnShiftCol = function ( a, i, j ) {
				var k = a[i];
		                while ( k[j] ) {
					j++;
				}
				return j;
			};
		
			aLayout.splice( 0, aLayout.length );
			
			/* We know how many rows there are in the layout - so prep it */
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				aLayout.push( [] );
			}
			
			/* Calculate a layout array */
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				nTr = nTrs[i];
				iColumn = 0;
				
				/* For every cell in the row... */
				nCell = nTr.firstChild;
				while ( nCell ) {
					if ( nCell.nodeName.toUpperCase() == "TD" ||
					     nCell.nodeName.toUpperCase() == "TH" )
					{
						/* Get the col and rowspan attributes from the DOM and sanitise them */
						iColspan = nCell.getAttribute('colspan') * 1;
						iRowspan = nCell.getAttribute('rowspan') * 1;
						iColspan = (!iColspan || iColspan===0 || iColspan===1) ? 1 : iColspan;
						iRowspan = (!iRowspan || iRowspan===0 || iRowspan===1) ? 1 : iRowspan;
		
						/* There might be colspan cells already in this row, so shift our target 
						 * accordingly
						 */
						iColShifted = fnShiftCol( aLayout, i, iColumn );
						
						/* Cache calculation for unique columns */
						bUnique = iColspan === 1 ? true : false;
						
						/* If there is col / rowspan, copy the information into the layout grid */
						for ( l=0 ; l<iColspan ; l++ )
						{
							for ( k=0 ; k<iRowspan ; k++ )
							{
								aLayout[i+k][iColShifted+l] = {
									"cell": nCell,
									"unique": bUnique
								};
								aLayout[i+k].nTr = nTr;
							}
						}
					}
					nCell = nCell.nextSibling;
				}
			}
		}
		
		
		/**
		 * Get an array of unique th elements, one for each column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nHeader automatically detect the layout from this node - optional
		 *  @param {array} aLayout thead/tfoot layout from _fnDetectHeader - optional
		 *  @returns array {node} aReturn list of unique th's
		 *  @memberof DataTable#oApi
		 */
		function _fnGetUniqueThs ( oSettings, nHeader, aLayout )
		{
			var aReturn = [];
			if ( !aLayout )
			{
				aLayout = oSettings.aoHeader;
				if ( nHeader )
				{
					aLayout = [];
					_fnDetectHeader( aLayout, nHeader );
				}
			}
		
			for ( var i=0, iLen=aLayout.length ; i<iLen ; i++ )
			{
				for ( var j=0, jLen=aLayout[i].length ; j<jLen ; j++ )
				{
					if ( aLayout[i][j].unique && 
						 (!aReturn[j] || !oSettings.bSortCellsTop) )
					{
						aReturn[j] = aLayout[i][j].cell;
					}
				}
			}
			
			return aReturn;
		}
		
		
		
		/**
		 * Update the table using an Ajax call
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {boolean} Block the table drawing or not
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxUpdate( oSettings )
		{
			if ( oSettings.bAjaxDataGet )
			{
				oSettings.iDraw++;
				_fnProcessingDisplay( oSettings, true );
				var iColumns = oSettings.aoColumns.length;
				var aoData = _fnAjaxParameters( oSettings );
				_fnServerParams( oSettings, aoData );
				
				oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, aoData,
					function(json) {
						_fnAjaxUpdateDraw( oSettings, json );
					}, oSettings );
				return false;
			}
			else
			{
				return true;
			}
		}
		
		
		/**
		 * Build up the parameters in an object needed for a server-side processing request
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {bool} block the table drawing or not
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxParameters( oSettings )
		{
			var iColumns = oSettings.aoColumns.length;
			var aoData = [], mDataProp, aaSort, aDataSort;
			var i, j;
			
			aoData.push( { "name": "sEcho",          "value": oSettings.iDraw } );
			aoData.push( { "name": "iColumns",       "value": iColumns } );
			aoData.push( { "name": "sColumns",       "value": _fnColumnOrdering(oSettings) } );
			aoData.push( { "name": "iDisplayStart",  "value": oSettings._iDisplayStart } );
			aoData.push( { "name": "iDisplayLength", "value": oSettings.oFeatures.bPaginate !== false ?
				oSettings._iDisplayLength : -1 } );
				
			for ( i=0 ; i<iColumns ; i++ )
			{
			  mDataProp = oSettings.aoColumns[i].mData;
				aoData.push( { "name": "mDataProp_"+i, "value": typeof(mDataProp)==="function" ? 'function' : mDataProp } );
			}
			
			/* Filtering */
			if ( oSettings.oFeatures.bFilter !== false )
			{
				aoData.push( { "name": "sSearch", "value": oSettings.oPreviousSearch.sSearch } );
				aoData.push( { "name": "bRegex",  "value": oSettings.oPreviousSearch.bRegex } );
				for ( i=0 ; i<iColumns ; i++ )
				{
					aoData.push( { "name": "sSearch_"+i,     "value": oSettings.aoPreSearchCols[i].sSearch } );
					aoData.push( { "name": "bRegex_"+i,      "value": oSettings.aoPreSearchCols[i].bRegex } );
					aoData.push( { "name": "bSearchable_"+i, "value": oSettings.aoColumns[i].bSearchable } );
				}
			}
			
			/* Sorting */
			if ( oSettings.oFeatures.bSort !== false )
			{
				var iCounter = 0;
		
				aaSort = ( oSettings.aaSortingFixed !== null ) ?
					oSettings.aaSortingFixed.concat( oSettings.aaSorting ) :
					oSettings.aaSorting.slice();
				
				for ( i=0 ; i<aaSort.length ; i++ )
				{
					aDataSort = oSettings.aoColumns[ aaSort[i][0] ].aDataSort;
					
					for ( j=0 ; j<aDataSort.length ; j++ )
					{
						aoData.push( { "name": "iSortCol_"+iCounter,  "value": aDataSort[j] } );
						aoData.push( { "name": "sSortDir_"+iCounter,  "value": aaSort[i][1] } );
						iCounter++;
					}
				}
				aoData.push( { "name": "iSortingCols",   "value": iCounter } );
				
				for ( i=0 ; i<iColumns ; i++ )
				{
					aoData.push( { "name": "bSortable_"+i,  "value": oSettings.aoColumns[i].bSortable } );
				}
			}
			
			return aoData;
		}
		
		
		/**
		 * Add Ajax parameters from plug-ins
		 *  @param {object} oSettings dataTables settings object
		 *  @param array {objects} aoData name/value pairs to send to the server
		 *  @memberof DataTable#oApi
		 */
		function _fnServerParams( oSettings, aoData )
		{
			_fnCallbackFire( oSettings, 'aoServerParams', 'serverParams', [aoData] );
		}
		
		
		/**
		 * Data the data from the server (nuking the old) and redraw the table
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} json json data return from the server.
		 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
		 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
		 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
		 *  @param {array} json.aaData The data to display on this page
		 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxUpdateDraw ( oSettings, json )
		{
			if ( json.sEcho !== undefined )
			{
				/* Protect against old returns over-writing a new one. Possible when you get
				 * very fast interaction, and later queries are completed much faster
				 */
				if ( json.sEcho*1 < oSettings.iDraw )
				{
					return;
				}
				else
				{
					oSettings.iDraw = json.sEcho * 1;
				}
			}
			
			if ( !oSettings.oScroll.bInfinite ||
				   (oSettings.oScroll.bInfinite && (oSettings.bSorted || oSettings.bFiltered)) )
			{
				_fnClearTable( oSettings );
			}
			oSettings._iRecordsTotal = parseInt(json.iTotalRecords, 10);
			oSettings._iRecordsDisplay = parseInt(json.iTotalDisplayRecords, 10);
			
			/* Determine if reordering is required */
			var sOrdering = _fnColumnOrdering(oSettings);
			var bReOrder = (json.sColumns !== undefined && sOrdering !== "" && json.sColumns != sOrdering );
			var aiIndex;
			if ( bReOrder )
			{
				aiIndex = _fnReOrderIndex( oSettings, json.sColumns );
			}
			
			var aData = _fnGetObjectDataFn( oSettings.sAjaxDataProp )( json );
			for ( var i=0, iLen=aData.length ; i<iLen ; i++ )
			{
				if ( bReOrder )
				{
					/* If we need to re-order, then create a new array with the correct order and add it */
					var aDataSorted = [];
					for ( var j=0, jLen=oSettings.aoColumns.length ; j<jLen ; j++ )
					{
						aDataSorted.push( aData[i][ aiIndex[j] ] );
					}
					_fnAddData( oSettings, aDataSorted );
				}
				else
				{
					/* No re-order required, sever got it "right" - just straight add */
					_fnAddData( oSettings, aData[i] );
				}
			}
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			oSettings.bAjaxDataGet = false;
			_fnDraw( oSettings );
			oSettings.bAjaxDataGet = true;
			_fnProcessingDisplay( oSettings, false );
		}
		
		
		
		/**
		 * Generate the node required for filtering text
		 *  @returns {node} Filter control element
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlFilter ( oSettings )
		{
			var oPreviousSearch = oSettings.oPreviousSearch;
			
			var sSearchStr = oSettings.oLanguage.sSearch;
			sSearchStr = (sSearchStr.indexOf('_INPUT_') !== -1) ?
			  sSearchStr.replace('_INPUT_', '<input type="text" />') :
			  sSearchStr==="" ? '<input type="text" />' : sSearchStr+' <input type="text" />';
			
			var nFilter = document.createElement( 'div' );
			nFilter.className = oSettings.oClasses.sFilter;
			nFilter.innerHTML = '<label>'+sSearchStr+'</label>';
			if ( !oSettings.aanFeatures.f )
			{
				nFilter.id = oSettings.sTableId+'_filter';
			}
			
			var jqFilter = $('input[type="text"]', nFilter);
		
			// Store a reference to the input element, so other input elements could be
			// added to the filter wrapper if needed (submit button for example)
			nFilter._DT_Input = jqFilter[0];
		
			jqFilter.val( oPreviousSearch.sSearch.replace('"','&quot;') );
			jqFilter.bind( 'keyup.DT', function(e) {
				/* Update all other filter input elements for the new display */
				var n = oSettings.aanFeatures.f;
				var val = this.value==="" ? "" : this.value; // mental IE8 fix :-(
		
				for ( var i=0, iLen=n.length ; i<iLen ; i++ )
				{
					if ( n[i] != $(this).parents('div.dataTables_filter')[0] )
					{
						$(n[i]._DT_Input).val( val );
					}
				}
				
				/* Now do the filter */
				if ( val != oPreviousSearch.sSearch )
				{
					_fnFilterComplete( oSettings, { 
						"sSearch": val, 
						"bRegex": oPreviousSearch.bRegex,
						"bSmart": oPreviousSearch.bSmart ,
						"bCaseInsensitive": oPreviousSearch.bCaseInsensitive 
					} );
				}
			} );
		
			jqFilter
				.attr('aria-controls', oSettings.sTableId)
				.bind( 'keypress.DT', function(e) {
					/* Prevent form submission */
					if ( e.keyCode == 13 )
					{
						return false;
					}
				}
			);
			
			return nFilter;
		}
		
		
		/**
		 * Filter the table using both the global filter and column based filtering
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} oSearch search information
		 *  @param {int} [iForce] force a research of the master array (1) or not (undefined or 0)
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterComplete ( oSettings, oInput, iForce )
		{
			var oPrevSearch = oSettings.oPreviousSearch;
			var aoPrevSearch = oSettings.aoPreSearchCols;
			var fnSaveFilter = function ( oFilter ) {
				/* Save the filtering values */
				oPrevSearch.sSearch = oFilter.sSearch;
				oPrevSearch.bRegex = oFilter.bRegex;
				oPrevSearch.bSmart = oFilter.bSmart;
				oPrevSearch.bCaseInsensitive = oFilter.bCaseInsensitive;
			};
		
			/* In server-side processing all filtering is done by the server, so no point hanging around here */
			if ( !oSettings.oFeatures.bServerSide )
			{
				/* Global filter */
				_fnFilter( oSettings, oInput.sSearch, iForce, oInput.bRegex, oInput.bSmart, oInput.bCaseInsensitive );
				fnSaveFilter( oInput );
		
				/* Now do the individual column filter */
				for ( var i=0 ; i<oSettings.aoPreSearchCols.length ; i++ )
				{
					_fnFilterColumn( oSettings, aoPrevSearch[i].sSearch, i, aoPrevSearch[i].bRegex, 
						aoPrevSearch[i].bSmart, aoPrevSearch[i].bCaseInsensitive );
				}
				
				/* Custom filtering */
				_fnFilterCustom( oSettings );
			}
			else
			{
				fnSaveFilter( oInput );
			}
			
			/* Tell the draw function we have been filtering */
			oSettings.bFiltered = true;
			$(oSettings.oInstance).trigger('filter', oSettings);
			
			/* Redraw the table */
			oSettings._iDisplayStart = 0;
			_fnCalculateEnd( oSettings );
			_fnDraw( oSettings );
			
			/* Rebuild search array 'offline' */
			_fnBuildSearchArray( oSettings, 0 );
		}
		
		
		/**
		 * Apply custom filtering functions
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterCustom( oSettings )
		{
			var afnFilters = DataTable.ext.afnFiltering;
			var aiFilterColumns = _fnGetColumns( oSettings, 'bSearchable' );
		
			for ( var i=0, iLen=afnFilters.length ; i<iLen ; i++ )
			{
				var iCorrector = 0;
				for ( var j=0, jLen=oSettings.aiDisplay.length ; j<jLen ; j++ )
				{
					var iDisIndex = oSettings.aiDisplay[j-iCorrector];
					var bTest = afnFilters[i](
						oSettings,
						_fnGetRowData( oSettings, iDisIndex, 'filter', aiFilterColumns ),
						iDisIndex
					);
					
					/* Check if we should use this row based on the filtering function */
					if ( !bTest )
					{
						oSettings.aiDisplay.splice( j-iCorrector, 1 );
						iCorrector++;
					}
				}
			}
		}
		
		
		/**
		 * Filter the table on a per-column basis
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sInput string to filter on
		 *  @param {int} iColumn column to filter
		 *  @param {bool} bRegex treat search string as a regular expression or not
		 *  @param {bool} bSmart use smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insenstive matching or not
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterColumn ( oSettings, sInput, iColumn, bRegex, bSmart, bCaseInsensitive )
		{
			if ( sInput === "" )
			{
				return;
			}
			
			var iIndexCorrector = 0;
			var rpSearch = _fnFilterCreateSearch( sInput, bRegex, bSmart, bCaseInsensitive );
			
			for ( var i=oSettings.aiDisplay.length-1 ; i>=0 ; i-- )
			{
				var sData = _fnDataToSearch( _fnGetCellData( oSettings, oSettings.aiDisplay[i], iColumn, 'filter' ),
					oSettings.aoColumns[iColumn].sType );
				if ( ! rpSearch.test( sData ) )
				{
					oSettings.aiDisplay.splice( i, 1 );
					iIndexCorrector++;
				}
			}
		}
		
		
		/**
		 * Filter the data table based on user input and draw the table
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sInput string to filter on
		 *  @param {int} iForce optional - force a research of the master array (1) or not (undefined or 0)
		 *  @param {bool} bRegex treat as a regular expression or not
		 *  @param {bool} bSmart perform smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insenstive matching or not
		 *  @memberof DataTable#oApi
		 */
		function _fnFilter( oSettings, sInput, iForce, bRegex, bSmart, bCaseInsensitive )
		{
			var i;
			var rpSearch = _fnFilterCreateSearch( sInput, bRegex, bSmart, bCaseInsensitive );
			var oPrevSearch = oSettings.oPreviousSearch;
			
			/* Check if we are forcing or not - optional parameter */
			if ( !iForce )
			{
				iForce = 0;
			}
			
			/* Need to take account of custom filtering functions - always filter */
			if ( DataTable.ext.afnFiltering.length !== 0 )
			{
				iForce = 1;
			}
			
			/*
			 * If the input is blank - we want the full data set
			 */
			if ( sInput.length <= 0 )
			{
				oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length);
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			}
			else
			{
				/*
				 * We are starting a new search or the new search string is smaller 
				 * then the old one (i.e. delete). Search from the master array
			 	 */
				if ( oSettings.aiDisplay.length == oSettings.aiDisplayMaster.length ||
					   oPrevSearch.sSearch.length > sInput.length || iForce == 1 ||
					   sInput.indexOf(oPrevSearch.sSearch) !== 0 )
				{
					/* Nuke the old display array - we are going to rebuild it */
					oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length);
					
					/* Force a rebuild of the search array */
					_fnBuildSearchArray( oSettings, 1 );
					
					/* Search through all records to populate the search array
					 * The the oSettings.aiDisplayMaster and asDataSearch arrays have 1 to 1 
					 * mapping
					 */
					for ( i=0 ; i<oSettings.aiDisplayMaster.length ; i++ )
					{
						if ( rpSearch.test(oSettings.asDataSearch[i]) )
						{
							oSettings.aiDisplay.push( oSettings.aiDisplayMaster[i] );
						}
					}
			  }
			  else
				{
			  	/* Using old search array - refine it - do it this way for speed
			  	 * Don't have to search the whole master array again
					 */
			  	var iIndexCorrector = 0;
			  	
			  	/* Search the current results */
			  	for ( i=0 ; i<oSettings.asDataSearch.length ; i++ )
					{
			  		if ( ! rpSearch.test(oSettings.asDataSearch[i]) )
						{
			  			oSettings.aiDisplay.splice( i-iIndexCorrector, 1 );
			  			iIndexCorrector++;
			  		}
			  	}
			  }
			}
		}
		
		
		/**
		 * Create an array which can be quickly search through
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iMaster use the master data array - optional
		 *  @memberof DataTable#oApi
		 */
		function _fnBuildSearchArray ( oSettings, iMaster )
		{
			if ( !oSettings.oFeatures.bServerSide )
			{
				/* Clear out the old data */
				oSettings.asDataSearch = [];
		
				var aiFilterColumns = _fnGetColumns( oSettings, 'bSearchable' );
				var aiIndex = (iMaster===1) ?
				 	oSettings.aiDisplayMaster :
				 	oSettings.aiDisplay;
				
				for ( var i=0, iLen=aiIndex.length ; i<iLen ; i++ )
				{
					oSettings.asDataSearch[i] = _fnBuildSearchRow(
						oSettings,
						_fnGetRowData( oSettings, aiIndex[i], 'filter', aiFilterColumns )
					);
				}
			}
		}
		
		
		/**
		 * Create a searchable string from a single data row
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aData Row data array to use for the data to search
		 *  @memberof DataTable#oApi
		 */
		function _fnBuildSearchRow( oSettings, aData )
		{
			var sSearch = aData.join('  ');
			
			/* If it looks like there is an HTML entity in the string, attempt to decode it */
			if ( sSearch.indexOf('&') !== -1 )
			{
				sSearch = $('<div>').html(sSearch).text();
			}
			
			// Strip newline characters
			return sSearch.replace( /[\n\r]/g, " " );
		}
		
		/**
		 * Build a regular expression object suitable for searching a table
		 *  @param {string} sSearch string to search for
		 *  @param {bool} bRegex treat as a regular expression or not
		 *  @param {bool} bSmart perform smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
		 *  @returns {RegExp} constructed object
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterCreateSearch( sSearch, bRegex, bSmart, bCaseInsensitive )
		{
			var asSearch, sRegExpString;
			
			if ( bSmart )
			{
				/* Generate the regular expression to use. Something along the lines of:
				 * ^(?=.*?\bone\b)(?=.*?\btwo\b)(?=.*?\bthree\b).*$
				 */
				asSearch = bRegex ? sSearch.split( ' ' ) : _fnEscapeRegex( sSearch ).split( ' ' );
				sRegExpString = '^(?=.*?'+asSearch.join( ')(?=.*?' )+').*$';
				return new RegExp( sRegExpString, bCaseInsensitive ? "i" : "" );
			}
			else
			{
				sSearch = bRegex ? sSearch : _fnEscapeRegex( sSearch );
				return new RegExp( sSearch, bCaseInsensitive ? "i" : "" );
			}
		}
		
		
		/**
		 * Convert raw data into something that the user can search on
		 *  @param {string} sData data to be modified
		 *  @param {string} sType data type
		 *  @returns {string} search string
		 *  @memberof DataTable#oApi
		 */
		function _fnDataToSearch ( sData, sType )
		{
			if ( typeof DataTable.ext.ofnSearch[sType] === "function" )
			{
				return DataTable.ext.ofnSearch[sType]( sData );
			}
			else if ( sData === null )
			{
				return '';
			}
			else if ( sType == "html" )
			{
				return sData.replace(/[\r\n]/g," ").replace( /<.*?>/g, "" );
			}
			else if ( typeof sData === "string" )
			{
				return sData.replace(/[\r\n]/g," ");
			}
			return sData;
		}
		
		
		/**
		 * scape a string such that it can be used in a regular expression
		 *  @param {string} sVal string to escape
		 *  @returns {string} escaped string
		 *  @memberof DataTable#oApi
		 */
		function _fnEscapeRegex ( sVal )
		{
			var acEscape = [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-' ];
			var reReplace = new RegExp( '(\\' + acEscape.join('|\\') + ')', 'g' );
			return sVal.replace(reReplace, '\\$1');
		}
		
		
		/**
		 * Generate the node required for the info display
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Information element
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlInfo ( oSettings )
		{
			var nInfo = document.createElement( 'div' );
			nInfo.className = oSettings.oClasses.sInfo;
			
			/* Actions that are to be taken once only for this feature */
			if ( !oSettings.aanFeatures.i )
			{
				/* Add draw callback */
				oSettings.aoDrawCallback.push( {
					"fn": _fnUpdateInfo,
					"sName": "information"
				} );
				
				/* Add id */
				nInfo.id = oSettings.sTableId+'_info';
			}
			oSettings.nTable.setAttribute( 'aria-describedby', oSettings.sTableId+'_info' );
			
			return nInfo;
		}
		
		
		/**
		 * Update the information elements in the display
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnUpdateInfo ( oSettings )
		{
			/* Show information about the table */
			if ( !oSettings.oFeatures.bInfo || oSettings.aanFeatures.i.length === 0 )
			{
				return;
			}
			
			var
				oLang = oSettings.oLanguage,
				iStart = oSettings._iDisplayStart+1,
				iEnd = oSettings.fnDisplayEnd(),
				iMax = oSettings.fnRecordsTotal(),
				iTotal = oSettings.fnRecordsDisplay(),
				sOut;
			
			if ( iTotal === 0 )
			{
				/* Empty record set */
				sOut = oLang.sInfoEmpty;
			}
			else {
				/* Normal record set */
				sOut = oLang.sInfo;
			}
		
			if ( iTotal != iMax )
			{
				/* Record set after filtering */
				sOut += ' ' + oLang.sInfoFiltered;
			}
		
			// Convert the macros
			sOut += oLang.sInfoPostFix;
			sOut = _fnInfoMacros( oSettings, sOut );
			
			if ( oLang.fnInfoCallback !== null )
			{
				sOut = oLang.fnInfoCallback.call( oSettings.oInstance, 
					oSettings, iStart, iEnd, iMax, iTotal, sOut );
			}
			
			var n = oSettings.aanFeatures.i;
			for ( var i=0, iLen=n.length ; i<iLen ; i++ )
			{
				$(n[i]).html( sOut );
			}
		}
		
		
		function _fnInfoMacros ( oSettings, str )
		{
			var
				iStart = oSettings._iDisplayStart+1,
				sStart = oSettings.fnFormatNumber( iStart ),
				iEnd = oSettings.fnDisplayEnd(),
				sEnd = oSettings.fnFormatNumber( iEnd ),
				iTotal = oSettings.fnRecordsDisplay(),
				sTotal = oSettings.fnFormatNumber( iTotal ),
				iMax = oSettings.fnRecordsTotal(),
				sMax = oSettings.fnFormatNumber( iMax );
		
			// When infinite scrolling, we are always starting at 1. _iDisplayStart is used only
			// internally
			if ( oSettings.oScroll.bInfinite )
			{
				sStart = oSettings.fnFormatNumber( 1 );
			}
		
			return str.
				replace(/_START_/g, sStart).
				replace(/_END_/g,   sEnd).
				replace(/_TOTAL_/g, sTotal).
				replace(/_MAX_/g,   sMax);
		}
		
		
		
		/**
		 * Draw the table for the first time, adding all required features
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnInitialise ( oSettings )
		{
			var i, iLen, iAjaxStart=oSettings.iInitDisplayStart;
			
			/* Ensure that the table data is fully initialised */
			if ( oSettings.bInitialised === false )
			{
				setTimeout( function(){ _fnInitialise( oSettings ); }, 200 );
				return;
			}
			
			/* Show the display HTML options */
			_fnAddOptionsHtml( oSettings );
			
			/* Build and draw the header / footer for the table */
			_fnBuildHead( oSettings );
			_fnDrawHead( oSettings, oSettings.aoHeader );
			if ( oSettings.nTFoot )
			{
				_fnDrawHead( oSettings, oSettings.aoFooter );
			}
		
			/* Okay to show that something is going on now */
			_fnProcessingDisplay( oSettings, true );
			
			/* Calculate sizes for columns */
			if ( oSettings.oFeatures.bAutoWidth )
			{
				_fnCalculateColumnWidths( oSettings );
			}
			
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoColumns[i].sWidth !== null )
				{
					oSettings.aoColumns[i].nTh.style.width = _fnStringToCss( oSettings.aoColumns[i].sWidth );
				}
			}
			
			/* If there is default sorting required - let's do it. The sort function will do the
			 * drawing for us. Otherwise we draw the table regardless of the Ajax source - this allows
			 * the table to look initialised for Ajax sourcing data (show 'loading' message possibly)
			 */
			if ( oSettings.oFeatures.bSort )
			{
				_fnSort( oSettings );
			}
			else if ( oSettings.oFeatures.bFilter )
			{
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch );
			}
			else
			{
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
			
			/* if there is an ajax source load the data */
			if ( oSettings.sAjaxSource !== null && !oSettings.oFeatures.bServerSide )
			{
				var aoData = [];
				_fnServerParams( oSettings, aoData );
				oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, aoData, function(json) {
					var aData = (oSettings.sAjaxDataProp !== "") ?
					 	_fnGetObjectDataFn( oSettings.sAjaxDataProp )(json) : json;
		
					/* Got the data - add it to the table */
					for ( i=0 ; i<aData.length ; i++ )
					{
						_fnAddData( oSettings, aData[i] );
					}
					
					/* Reset the init display for cookie saving. We've already done a filter, and
					 * therefore cleared it before. So we need to make it appear 'fresh'
					 */
					oSettings.iInitDisplayStart = iAjaxStart;
					
					if ( oSettings.oFeatures.bSort )
					{
						_fnSort( oSettings );
					}
					else
					{
						oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
						_fnCalculateEnd( oSettings );
						_fnDraw( oSettings );
					}
					
					_fnProcessingDisplay( oSettings, false );
					_fnInitComplete( oSettings, json );
				}, oSettings );
				return;
			}
			
			/* Server-side processing initialisation complete is done at the end of _fnDraw */
			if ( !oSettings.oFeatures.bServerSide )
			{
				_fnProcessingDisplay( oSettings, false );
				_fnInitComplete( oSettings );
			}
		}
		
		
		/**
		 * Draw the table for the first time, adding all required features
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} [json] JSON from the server that completed the table, if using Ajax source
		 *    with client-side processing (optional)
		 *  @memberof DataTable#oApi
		 */
		function _fnInitComplete ( oSettings, json )
		{
			oSettings._bInitComplete = true;
			_fnCallbackFire( oSettings, 'aoInitComplete', 'init', [oSettings, json] );
		}
		
		
		/**
		 * Language compatibility - when certain options are given, and others aren't, we
		 * need to duplicate the values over, in order to provide backwards compatibility
		 * with older language files.
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnLanguageCompat( oLanguage )
		{
			var oDefaults = DataTable.defaults.oLanguage;
		
			/* Backwards compatibility - if there is no sEmptyTable given, then use the same as
			 * sZeroRecords - assuming that is given.
			 */
			if ( !oLanguage.sEmptyTable && oLanguage.sZeroRecords &&
				oDefaults.sEmptyTable === "No data available in table" )
			{
				_fnMap( oLanguage, oLanguage, 'sZeroRecords', 'sEmptyTable' );
			}
		
			/* Likewise with loading records */
			if ( !oLanguage.sLoadingRecords && oLanguage.sZeroRecords &&
				oDefaults.sLoadingRecords === "Loading..." )
			{
				_fnMap( oLanguage, oLanguage, 'sZeroRecords', 'sLoadingRecords' );
			}
		}
		
		
		
		/**
		 * Generate the node required for user display length changing
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Display length feature node
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlLength ( oSettings )
		{
			if ( oSettings.oScroll.bInfinite )
			{
				return null;
			}
			
			/* This can be overruled by not using the _MENU_ var/macro in the language variable */
			var sName = 'name="'+oSettings.sTableId+'_length"';
			var sStdMenu = '<select size="1" '+sName+'>';
			var i, iLen;
			var aLengthMenu = oSettings.aLengthMenu;
			
			if ( aLengthMenu.length == 2 && typeof aLengthMenu[0] === 'object' && 
					typeof aLengthMenu[1] === 'object' )
			{
				for ( i=0, iLen=aLengthMenu[0].length ; i<iLen ; i++ )
				{
					sStdMenu += '<option value="'+aLengthMenu[0][i]+'">'+aLengthMenu[1][i]+'</option>';
				}
			}
			else
			{
				for ( i=0, iLen=aLengthMenu.length ; i<iLen ; i++ )
				{
					sStdMenu += '<option value="'+aLengthMenu[i]+'">'+aLengthMenu[i]+'</option>';
				}
			}
			sStdMenu += '</select>';
			
			var nLength = document.createElement( 'div' );
			if ( !oSettings.aanFeatures.l )
			{
				nLength.id = oSettings.sTableId+'_length';
			}
			nLength.className = oSettings.oClasses.sLength;
			nLength.innerHTML = '<label>'+oSettings.oLanguage.sLengthMenu.replace( '_MENU_', sStdMenu )+'</label>';
			
			/*
			 * Set the length to the current display length - thanks to Andrea Pavlovic for this fix,
			 * and Stefan Skopnik for fixing the fix!
			 */
			$('select option[value="'+oSettings._iDisplayLength+'"]', nLength).attr("selected", true);
			
			$('select', nLength).bind( 'change.DT', function(e) {
				var iVal = $(this).val();
				
				/* Update all other length options for the new display */
				var n = oSettings.aanFeatures.l;
				for ( i=0, iLen=n.length ; i<iLen ; i++ )
				{
					if ( n[i] != this.parentNode )
					{
						$('select', n[i]).val( iVal );
					}
				}
				
				/* Redraw the table */
				oSettings._iDisplayLength = parseInt(iVal, 10);
				_fnCalculateEnd( oSettings );
				
				/* If we have space to show extra rows (backing up from the end point - then do so */
				if ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() )
				{
					oSettings._iDisplayStart = oSettings.fnDisplayEnd() - oSettings._iDisplayLength;
					if ( oSettings._iDisplayStart < 0 )
					{
						oSettings._iDisplayStart = 0;
					}
				}
				
				if ( oSettings._iDisplayLength == -1 )
				{
					oSettings._iDisplayStart = 0;
				}
				
				_fnDraw( oSettings );
			} );
		
		
			$('select', nLength).attr('aria-controls', oSettings.sTableId);
			
			return nLength;
		}
		
		
		/**
		 * Recalculate the end point based on the start point
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnCalculateEnd( oSettings )
		{
			if ( oSettings.oFeatures.bPaginate === false )
			{
				oSettings._iDisplayEnd = oSettings.aiDisplay.length;
			}
			else
			{
				/* Set the end point of the display - based on how many elements there are
				 * still to display
				 */
				if ( oSettings._iDisplayStart + oSettings._iDisplayLength > oSettings.aiDisplay.length ||
					   oSettings._iDisplayLength == -1 )
				{
					oSettings._iDisplayEnd = oSettings.aiDisplay.length;
				}
				else
				{
					oSettings._iDisplayEnd = oSettings._iDisplayStart + oSettings._iDisplayLength;
				}
			}
		}
		
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Note that most of the paging logic is done in 
		 * DataTable.ext.oPagination
		 */
		
		/**
		 * Generate the node required for default pagination
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Pagination feature node
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlPaginate ( oSettings )
		{
			if ( oSettings.oScroll.bInfinite )
			{
				return null;
			}
			
			var nPaginate = document.createElement( 'div' );
			nPaginate.className = oSettings.oClasses.sPaging+oSettings.sPaginationType;
			
			DataTable.ext.oPagination[ oSettings.sPaginationType ].fnInit( oSettings, nPaginate, 
				function( oSettings ) {
					_fnCalculateEnd( oSettings );
					_fnDraw( oSettings );
				}
			);
			
			/* Add a draw callback for the pagination on first instance, to update the paging display */
			if ( !oSettings.aanFeatures.p )
			{
				oSettings.aoDrawCallback.push( {
					"fn": function( oSettings ) {
						DataTable.ext.oPagination[ oSettings.sPaginationType ].fnUpdate( oSettings, function( oSettings ) {
							_fnCalculateEnd( oSettings );
							_fnDraw( oSettings );
						} );
					},
					"sName": "pagination"
				} );
			}
			return nPaginate;
		}
		
		
		/**
		 * Alter the display settings to change the page
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
		 *    or page number to jump to (integer)
		 *  @returns {bool} true page has changed, false - no change (no effect) eg 'first' on page 1
		 *  @memberof DataTable#oApi
		 */
		function _fnPageChange ( oSettings, mAction )
		{
			var iOldStart = oSettings._iDisplayStart;
			
			if ( typeof mAction === "number" )
			{
				oSettings._iDisplayStart = mAction * oSettings._iDisplayLength;
				if ( oSettings._iDisplayStart > oSettings.fnRecordsDisplay() )
				{
					oSettings._iDisplayStart = 0;
				}
			}
			else if ( mAction == "first" )
			{
				oSettings._iDisplayStart = 0;
			}
			else if ( mAction == "previous" )
			{
				oSettings._iDisplayStart = oSettings._iDisplayLength>=0 ?
					oSettings._iDisplayStart - oSettings._iDisplayLength :
					0;
				
				/* Correct for under-run */
				if ( oSettings._iDisplayStart < 0 )
				{
				  oSettings._iDisplayStart = 0;
				}
			}
			else if ( mAction == "next" )
			{
				if ( oSettings._iDisplayLength >= 0 )
				{
					/* Make sure we are not over running the display array */
					if ( oSettings._iDisplayStart + oSettings._iDisplayLength < oSettings.fnRecordsDisplay() )
					{
						oSettings._iDisplayStart += oSettings._iDisplayLength;
					}
				}
				else
				{
					oSettings._iDisplayStart = 0;
				}
			}
			else if ( mAction == "last" )
			{
				if ( oSettings._iDisplayLength >= 0 )
				{
					var iPages = parseInt( (oSettings.fnRecordsDisplay()-1) / oSettings._iDisplayLength, 10 ) + 1;
					oSettings._iDisplayStart = (iPages-1) * oSettings._iDisplayLength;
				}
				else
				{
					oSettings._iDisplayStart = 0;
				}
			}
			else
			{
				_fnLog( oSettings, 0, "Unknown paging action: "+mAction );
			}
			$(oSettings.oInstance).trigger('page', oSettings);
			
			return iOldStart != oSettings._iDisplayStart;
		}
		
		
		
		/**
		 * Generate the node required for the processing node
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Processing element
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlProcessing ( oSettings )
		{
			var nProcessing = document.createElement( 'div' );
			
			if ( !oSettings.aanFeatures.r )
			{
				nProcessing.id = oSettings.sTableId+'_processing';
			}
			nProcessing.innerHTML = oSettings.oLanguage.sProcessing;
			nProcessing.className = oSettings.oClasses.sProcessing;
			oSettings.nTable.parentNode.insertBefore( nProcessing, oSettings.nTable );
			
			return nProcessing;
		}
		
		
		/**
		 * Display or hide the processing indicator
		 *  @param {object} oSettings dataTables settings object
		 *  @param {bool} bShow Show the processing indicator (true) or not (false)
		 *  @memberof DataTable#oApi
		 */
		function _fnProcessingDisplay ( oSettings, bShow )
		{
			if ( oSettings.oFeatures.bProcessing )
			{
				var an = oSettings.aanFeatures.r;
				for ( var i=0, iLen=an.length ; i<iLen ; i++ )
				{
					an[i].style.visibility = bShow ? "visible" : "hidden";
				}
			}
		
			$(oSettings.oInstance).trigger('processing', [oSettings, bShow]);
		}
		
		/**
		 * Add any control elements for the table - specifically scrolling
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Node to add to the DOM
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlTable ( oSettings )
		{
			/* Check if scrolling is enabled or not - if not then leave the DOM unaltered */
			if ( oSettings.oScroll.sX === "" && oSettings.oScroll.sY === "" )
			{
				return oSettings.nTable;
			}
			
			/*
			 * The HTML structure that we want to generate in this function is:
			 *  div - nScroller
			 *    div - nScrollHead
			 *      div - nScrollHeadInner
			 *        table - nScrollHeadTable
			 *          thead - nThead
			 *    div - nScrollBody
			 *      table - oSettings.nTable
			 *        thead - nTheadSize
			 *        tbody - nTbody
			 *    div - nScrollFoot
			 *      div - nScrollFootInner
			 *        table - nScrollFootTable
			 *          tfoot - nTfoot
			 */
			var
			 	nScroller = document.createElement('div'),
			 	nScrollHead = document.createElement('div'),
			 	nScrollHeadInner = document.createElement('div'),
			 	nScrollBody = document.createElement('div'),
			 	nScrollFoot = document.createElement('div'),
			 	nScrollFootInner = document.createElement('div'),
			 	nScrollHeadTable = oSettings.nTable.cloneNode(false),
			 	nScrollFootTable = oSettings.nTable.cloneNode(false),
				nThead = oSettings.nTable.getElementsByTagName('thead')[0],
			 	nTfoot = oSettings.nTable.getElementsByTagName('tfoot').length === 0 ? null : 
					oSettings.nTable.getElementsByTagName('tfoot')[0],
				oClasses = oSettings.oClasses;
			
			nScrollHead.appendChild( nScrollHeadInner );
			nScrollFoot.appendChild( nScrollFootInner );
			nScrollBody.appendChild( oSettings.nTable );
			nScroller.appendChild( nScrollHead );
			nScroller.appendChild( nScrollBody );
			nScrollHeadInner.appendChild( nScrollHeadTable );
			nScrollHeadTable.appendChild( nThead );
			if ( nTfoot !== null )
			{
				nScroller.appendChild( nScrollFoot );
				nScrollFootInner.appendChild( nScrollFootTable );
				nScrollFootTable.appendChild( nTfoot );
			}
			
			nScroller.className = oClasses.sScrollWrapper;
			nScrollHead.className = oClasses.sScrollHead;
			nScrollHeadInner.className = oClasses.sScrollHeadInner;
			nScrollBody.className = oClasses.sScrollBody;
			nScrollFoot.className = oClasses.sScrollFoot;
			nScrollFootInner.className = oClasses.sScrollFootInner;
			
			if ( oSettings.oScroll.bAutoCss )
			{
				nScrollHead.style.overflow = "hidden";
				nScrollHead.style.position = "relative";
				nScrollFoot.style.overflow = "hidden";
				nScrollBody.style.overflow = "auto";
			}
			
			nScrollHead.style.border = "0";
			nScrollHead.style.width = "100%";
			nScrollFoot.style.border = "0";
			nScrollHeadInner.style.width = oSettings.oScroll.sXInner !== "" ?
				oSettings.oScroll.sXInner : "100%"; /* will be overwritten */
			
			/* Modify attributes to respect the clones */
			nScrollHeadTable.removeAttribute('id');
			nScrollHeadTable.style.marginLeft = "0";
			oSettings.nTable.style.marginLeft = "0";
			if ( nTfoot !== null )
			{
				nScrollFootTable.removeAttribute('id');
				nScrollFootTable.style.marginLeft = "0";
			}
			
			/* Move caption elements from the body to the header, footer or leave where it is
			 * depending on the configuration. Note that the DTD says there can be only one caption */
			var nCaption = $(oSettings.nTable).children('caption');
			if ( nCaption.length > 0 )
			{
				nCaption = nCaption[0];
				if ( nCaption._captionSide === "top" )
				{
					nScrollHeadTable.appendChild( nCaption );
				}
				else if ( nCaption._captionSide === "bottom" && nTfoot )
				{
					nScrollFootTable.appendChild( nCaption );
				}
			}
			
			/*
			 * Sizing
			 */
			/* When x-scrolling add the width and a scroller to move the header with the body */
			if ( oSettings.oScroll.sX !== "" )
			{
				nScrollHead.style.width = _fnStringToCss( oSettings.oScroll.sX );
				nScrollBody.style.width = _fnStringToCss( oSettings.oScroll.sX );
				
				if ( nTfoot !== null )
				{
					nScrollFoot.style.width = _fnStringToCss( oSettings.oScroll.sX );	
				}
				
				/* When the body is scrolled, then we also want to scroll the headers */
				$(nScrollBody).scroll( function (e) {
					nScrollHead.scrollLeft = this.scrollLeft;
					
					if ( nTfoot !== null )
					{
						nScrollFoot.scrollLeft = this.scrollLeft;
					}
				} );
			}
			
			/* When yscrolling, add the height */
			if ( oSettings.oScroll.sY !== "" )
			{
				nScrollBody.style.height = _fnStringToCss( oSettings.oScroll.sY );
			}
			
			/* Redraw - align columns across the tables */
			oSettings.aoDrawCallback.push( {
				"fn": _fnScrollDraw,
				"sName": "scrolling"
			} );
			
			/* Infinite scrolling event handlers */
			if ( oSettings.oScroll.bInfinite )
			{
				$(nScrollBody).scroll( function() {
					/* Use a blocker to stop scrolling from loading more data while other data is still loading */
					if ( !oSettings.bDrawing && $(this).scrollTop() !== 0 )
					{
						/* Check if we should load the next data set */
						if ( $(this).scrollTop() + $(this).height() > 
							$(oSettings.nTable).height() - oSettings.oScroll.iLoadGap )
						{
							/* Only do the redraw if we have to - we might be at the end of the data */
							if ( oSettings.fnDisplayEnd() < oSettings.fnRecordsDisplay() )
							{
								_fnPageChange( oSettings, 'next' );
								_fnCalculateEnd( oSettings );
								_fnDraw( oSettings );
							}
						}
					}
				} );
			}
			
			oSettings.nScrollHead = nScrollHead;
			oSettings.nScrollFoot = nScrollFoot;
			
			return nScroller;
		}
		
		
		/**
		 * Update the various tables for resizing. It's a bit of a pig this function, but
		 * basically the idea to:
		 *   1. Re-create the table inside the scrolling div
		 *   2. Take live measurements from the DOM
		 *   3. Apply the measurements
		 *   4. Clean up
		 *  @param {object} o dataTables settings object
		 *  @returns {node} Node to add to the DOM
		 *  @memberof DataTable#oApi
		 */
		function _fnScrollDraw ( o )
		{
			var
				nScrollHeadInner = o.nScrollHead.getElementsByTagName('div')[0],
				nScrollHeadTable = nScrollHeadInner.getElementsByTagName('table')[0],
				nScrollBody = o.nTable.parentNode,
				i, iLen, j, jLen, anHeadToSize, anHeadSizers, anFootSizers, anFootToSize, oStyle, iVis,
				nTheadSize, nTfootSize,
				iWidth, aApplied=[], aAppliedFooter=[], iSanityWidth,
				nScrollFootInner = (o.nTFoot !== null) ? o.nScrollFoot.getElementsByTagName('div')[0] : null,
				nScrollFootTable = (o.nTFoot !== null) ? nScrollFootInner.getElementsByTagName('table')[0] : null,
				ie67 = o.oBrowser.bScrollOversize,
				zeroOut = function(nSizer) {
					oStyle = nSizer.style;
					oStyle.paddingTop = "0";
					oStyle.paddingBottom = "0";
					oStyle.borderTopWidth = "0";
					oStyle.borderBottomWidth = "0";
					oStyle.height = 0;
				};
			
			/*
			 * 1. Re-create the table inside the scrolling div
			 */
			
			/* Remove the old minimised thead and tfoot elements in the inner table */
			$(o.nTable).children('thead, tfoot').remove();
		
			/* Clone the current header and footer elements and then place it into the inner table */
			nTheadSize = $(o.nTHead).clone()[0];
			o.nTable.insertBefore( nTheadSize, o.nTable.childNodes[0] );
			anHeadToSize = o.nTHead.getElementsByTagName('tr');
			anHeadSizers = nTheadSize.getElementsByTagName('tr');
			
			if ( o.nTFoot !== null )
			{
				nTfootSize = $(o.nTFoot).clone()[0];
				o.nTable.insertBefore( nTfootSize, o.nTable.childNodes[1] );
				anFootToSize = o.nTFoot.getElementsByTagName('tr');
				anFootSizers = nTfootSize.getElementsByTagName('tr');
			}
			
			/*
			 * 2. Take live measurements from the DOM - do not alter the DOM itself!
			 */
			
			/* Remove old sizing and apply the calculated column widths
			 * Get the unique column headers in the newly created (cloned) header. We want to apply the
			 * calculated sizes to this header
			 */
			if ( o.oScroll.sX === "" )
			{
				nScrollBody.style.width = '100%';
				nScrollHeadInner.parentNode.style.width = '100%';
			}
			
			var nThs = _fnGetUniqueThs( o, nTheadSize );
			for ( i=0, iLen=nThs.length ; i<iLen ; i++ )
			{
				iVis = _fnVisibleToColumnIndex( o, i );
				nThs[i].style.width = o.aoColumns[iVis].sWidth;
			}
			
			if ( o.nTFoot !== null )
			{
				_fnApplyToChildren( function(n) {
					n.style.width = "";
				}, anFootSizers );
			}
		
			// If scroll collapse is enabled, when we put the headers back into the body for sizing, we
			// will end up forcing the scrollbar to appear, making our measurements wrong for when we
			// then hide it (end of this function), so add the header height to the body scroller.
			if ( o.oScroll.bCollapse && o.oScroll.sY !== "" )
			{
				nScrollBody.style.height = (nScrollBody.offsetHeight + o.nTHead.offsetHeight)+"px";
			}
			
			/* Size the table as a whole */
			iSanityWidth = $(o.nTable).outerWidth();
			if ( o.oScroll.sX === "" )
			{
				/* No x scrolling */
				o.nTable.style.width = "100%";
				
				/* I know this is rubbish - but IE7 will make the width of the table when 100% include
				 * the scrollbar - which is shouldn't. When there is a scrollbar we need to take this
				 * into account.
				 */
				if ( ie67 && ($('tbody', nScrollBody).height() > nScrollBody.offsetHeight || 
					$(nScrollBody).css('overflow-y') == "scroll")  )
				{
					o.nTable.style.width = _fnStringToCss( $(o.nTable).outerWidth() - o.oScroll.iBarWidth);
				}
			}
			else
			{
				if ( o.oScroll.sXInner !== "" )
				{
					/* x scroll inner has been given - use it */
					o.nTable.style.width = _fnStringToCss(o.oScroll.sXInner);
				}
				else if ( iSanityWidth == $(nScrollBody).width() &&
				   $(nScrollBody).height() < $(o.nTable).height() )
				{
					/* There is y-scrolling - try to take account of the y scroll bar */
					o.nTable.style.width = _fnStringToCss( iSanityWidth-o.oScroll.iBarWidth );
					if ( $(o.nTable).outerWidth() > iSanityWidth-o.oScroll.iBarWidth )
					{
						/* Not possible to take account of it */
						o.nTable.style.width = _fnStringToCss( iSanityWidth );
					}
				}
				else
				{
					/* All else fails */
					o.nTable.style.width = _fnStringToCss( iSanityWidth );
				}
			}
			
			/* Recalculate the sanity width - now that we've applied the required width, before it was
			 * a temporary variable. This is required because the column width calculation is done
			 * before this table DOM is created.
			 */
			iSanityWidth = $(o.nTable).outerWidth();
			
			/* We want the hidden header to have zero height, so remove padding and borders. Then
			 * set the width based on the real headers
			 */
			
			// Apply all styles in one pass. Invalidates layout only once because we don't read any 
			// DOM properties.
			_fnApplyToChildren( zeroOut, anHeadSizers );
			 
			// Read all widths in next pass. Forces layout only once because we do not change 
			// any DOM properties.
			_fnApplyToChildren( function(nSizer) {
				aApplied.push( _fnStringToCss( $(nSizer).width() ) );
			}, anHeadSizers );
			 
			// Apply all widths in final pass. Invalidates layout only once because we do not
			// read any DOM properties.
			_fnApplyToChildren( function(nToSize, i) {
				nToSize.style.width = aApplied[i];
			}, anHeadToSize );
		
			$(anHeadSizers).height(0);
			
			/* Same again with the footer if we have one */
			if ( o.nTFoot !== null )
			{
				_fnApplyToChildren( zeroOut, anFootSizers );
				 
				_fnApplyToChildren( function(nSizer) {
					aAppliedFooter.push( _fnStringToCss( $(nSizer).width() ) );
				}, anFootSizers );
				 
				_fnApplyToChildren( function(nToSize, i) {
					nToSize.style.width = aAppliedFooter[i];
				}, anFootToSize );
		
				$(anFootSizers).height(0);
			}
			
			/*
			 * 3. Apply the measurements
			 */
			
			/* "Hide" the header and footer that we used for the sizing. We want to also fix their width
			 * to what they currently are
			 */
			_fnApplyToChildren( function(nSizer, i) {
				nSizer.innerHTML = "";
				nSizer.style.width = aApplied[i];
			}, anHeadSizers );
			
			if ( o.nTFoot !== null )
			{
				_fnApplyToChildren( function(nSizer, i) {
					nSizer.innerHTML = "";
					nSizer.style.width = aAppliedFooter[i];
				}, anFootSizers );
			}
			
			/* Sanity check that the table is of a sensible width. If not then we are going to get
			 * misalignment - try to prevent this by not allowing the table to shrink below its min width
			 */
			if ( $(o.nTable).outerWidth() < iSanityWidth )
			{
				/* The min width depends upon if we have a vertical scrollbar visible or not */
				var iCorrection = ((nScrollBody.scrollHeight > nScrollBody.offsetHeight || 
					$(nScrollBody).css('overflow-y') == "scroll")) ?
						iSanityWidth+o.oScroll.iBarWidth : iSanityWidth;
				
				/* IE6/7 are a law unto themselves... */
				if ( ie67 && (nScrollBody.scrollHeight > 
					nScrollBody.offsetHeight || $(nScrollBody).css('overflow-y') == "scroll")  )
				{
					o.nTable.style.width = _fnStringToCss( iCorrection-o.oScroll.iBarWidth );
				}
				
				/* Apply the calculated minimum width to the table wrappers */
				nScrollBody.style.width = _fnStringToCss( iCorrection );
				o.nScrollHead.style.width = _fnStringToCss( iCorrection );
				
				if ( o.nTFoot !== null )
				{
					o.nScrollFoot.style.width = _fnStringToCss( iCorrection );
				}
				
				/* And give the user a warning that we've stopped the table getting too small */
				if ( o.oScroll.sX === "" )
				{
					_fnLog( o, 1, "The table cannot fit into the current element which will cause column"+
						" misalignment. The table has been drawn at its minimum possible width." );
				}
				else if ( o.oScroll.sXInner !== "" )
				{
					_fnLog( o, 1, "The table cannot fit into the current element which will cause column"+
						" misalignment. Increase the sScrollXInner value or remove it to allow automatic"+
						" calculation" );
				}
			}
			else
			{
				nScrollBody.style.width = _fnStringToCss( '100%' );
				o.nScrollHead.style.width = _fnStringToCss( '100%' );
				
				if ( o.nTFoot !== null )
				{
					o.nScrollFoot.style.width = _fnStringToCss( '100%' );
				}
			}
			
			
			/*
			 * 4. Clean up
			 */
			if ( o.oScroll.sY === "" )
			{
				/* IE7< puts a vertical scrollbar in place (when it shouldn't be) due to subtracting
				 * the scrollbar height from the visible display, rather than adding it on. We need to
				 * set the height in order to sort this. Don't want to do it in any other browsers.
				 */
				if ( ie67 )
				{
					nScrollBody.style.height = _fnStringToCss( o.nTable.offsetHeight+o.oScroll.iBarWidth );
				}
			}
			
			if ( o.oScroll.sY !== "" && o.oScroll.bCollapse )
			{
				nScrollBody.style.height = _fnStringToCss( o.oScroll.sY );
				
				var iExtra = (o.oScroll.sX !== "" && o.nTable.offsetWidth > nScrollBody.offsetWidth) ?
				 	o.oScroll.iBarWidth : 0;
				if ( o.nTable.offsetHeight < nScrollBody.offsetHeight )
				{
					nScrollBody.style.height = _fnStringToCss( o.nTable.offsetHeight+iExtra );
				}
			}
			
			/* Finally set the width's of the header and footer tables */
			var iOuterWidth = $(o.nTable).outerWidth();
			nScrollHeadTable.style.width = _fnStringToCss( iOuterWidth );
			nScrollHeadInner.style.width = _fnStringToCss( iOuterWidth );
		
			// Figure out if there are scrollbar present - if so then we need a the header and footer to
			// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
			var bScrolling = $(o.nTable).height() > nScrollBody.clientHeight || $(nScrollBody).css('overflow-y') == "scroll";
			nScrollHeadInner.style.paddingRight = bScrolling ? o.oScroll.iBarWidth+"px" : "0px";
			
			if ( o.nTFoot !== null )
			{
				nScrollFootTable.style.width = _fnStringToCss( iOuterWidth );
				nScrollFootInner.style.width = _fnStringToCss( iOuterWidth );
				nScrollFootInner.style.paddingRight = bScrolling ? o.oScroll.iBarWidth+"px" : "0px";
			}
		
			/* Adjust the position of the header in case we loose the y-scrollbar */
			$(nScrollBody).scroll();
			
			/* If sorting or filtering has occurred, jump the scrolling back to the top */
			if ( o.bSorted || o.bFiltered )
			{
				nScrollBody.scrollTop = 0;
			}
		}
		
		
		/**
		 * Apply a given function to the display child nodes of an element array (typically
		 * TD children of TR rows
		 *  @param {function} fn Method to apply to the objects
		 *  @param array {nodes} an1 List of elements to look through for display children
		 *  @param array {nodes} an2 Another list (identical structure to the first) - optional
		 *  @memberof DataTable#oApi
		 */
		function _fnApplyToChildren( fn, an1, an2 )
		{
			var index=0, i=0, iLen=an1.length;
			var nNode1, nNode2;
		
			while ( i < iLen )
			{
				nNode1 = an1[i].firstChild;
				nNode2 = an2 ? an2[i].firstChild : null;
				while ( nNode1 )
				{
					if ( nNode1.nodeType === 1 )
					{
						if ( an2 )
						{
							fn( nNode1, nNode2, index );
						}
						else
						{
							fn( nNode1, index );
						}
						index++;
					}
					nNode1 = nNode1.nextSibling;
					nNode2 = an2 ? nNode2.nextSibling : null;
				}
				i++;
			}
		}
		
		/**
		 * Convert a CSS unit width to pixels (e.g. 2em)
		 *  @param {string} sWidth width to be converted
		 *  @param {node} nParent parent to get the with for (required for relative widths) - optional
		 *  @returns {int} iWidth width in pixels
		 *  @memberof DataTable#oApi
		 */
		function _fnConvertToWidth ( sWidth, nParent )
		{
			if ( !sWidth || sWidth === null || sWidth === '' )
			{
				return 0;
			}
			
			if ( !nParent )
			{
				nParent = document.body;
			}
			
			var iWidth;
			var nTmp = document.createElement( "div" );
			nTmp.style.width = _fnStringToCss( sWidth );
			
			nParent.appendChild( nTmp );
			iWidth = nTmp.offsetWidth;
			nParent.removeChild( nTmp );
			
			return ( iWidth );
		}
		
		
		/**
		 * Calculate the width of columns for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnCalculateColumnWidths ( oSettings )
		{
			var iTableWidth = oSettings.nTable.offsetWidth;
			var iUserInputs = 0;
			var iTmpWidth;
			var iVisibleColumns = 0;
			var iColums = oSettings.aoColumns.length;
			var i, iIndex, iCorrector, iWidth;
			var oHeaders = $('th', oSettings.nTHead);
			var widthAttr = oSettings.nTable.getAttribute('width');
			var nWrapper = oSettings.nTable.parentNode;
			
			/* Convert any user input sizes into pixel sizes */
			for ( i=0 ; i<iColums ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible )
				{
					iVisibleColumns++;
					
					if ( oSettings.aoColumns[i].sWidth !== null )
					{
						iTmpWidth = _fnConvertToWidth( oSettings.aoColumns[i].sWidthOrig, 
							nWrapper );
						if ( iTmpWidth !== null )
						{
							oSettings.aoColumns[i].sWidth = _fnStringToCss( iTmpWidth );
						}
							
						iUserInputs++;
					}
				}
			}
			
			/* If the number of columns in the DOM equals the number that we have to process in 
			 * DataTables, then we can use the offsets that are created by the web-browser. No custom 
			 * sizes can be set in order for this to happen, nor scrolling used
			 */
			if ( iColums == oHeaders.length && iUserInputs === 0 && iVisibleColumns == iColums &&
				oSettings.oScroll.sX === "" && oSettings.oScroll.sY === "" )
			{
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					iTmpWidth = $(oHeaders[i]).width();
					if ( iTmpWidth !== null )
					{
						oSettings.aoColumns[i].sWidth = _fnStringToCss( iTmpWidth );
					}
				}
			}
			else
			{
				/* Otherwise we are going to have to do some calculations to get the width of each column.
				 * Construct a 1 row table with the widest node in the data, and any user defined widths,
				 * then insert it into the DOM and allow the browser to do all the hard work of
				 * calculating table widths.
				 */
				var
					nCalcTmp = oSettings.nTable.cloneNode( false ),
					nTheadClone = oSettings.nTHead.cloneNode(true),
					nBody = document.createElement( 'tbody' ),
					nTr = document.createElement( 'tr' ),
					nDivSizing;
				
				nCalcTmp.removeAttribute( "id" );
				nCalcTmp.appendChild( nTheadClone );
				if ( oSettings.nTFoot !== null )
				{
					nCalcTmp.appendChild( oSettings.nTFoot.cloneNode(true) );
					_fnApplyToChildren( function(n) {
						n.style.width = "";
					}, nCalcTmp.getElementsByTagName('tr') );
				}
				
				nCalcTmp.appendChild( nBody );
				nBody.appendChild( nTr );
				
				/* Remove any sizing that was previously applied by the styles */
				var jqColSizing = $('thead th', nCalcTmp);
				if ( jqColSizing.length === 0 )
				{
					jqColSizing = $('tbody tr:eq(0)>td', nCalcTmp);
				}
		
				/* Apply custom sizing to the cloned header */
				var nThs = _fnGetUniqueThs( oSettings, nTheadClone );
				iCorrector = 0;
				for ( i=0 ; i<iColums ; i++ )
				{
					var oColumn = oSettings.aoColumns[i];
					if ( oColumn.bVisible && oColumn.sWidthOrig !== null && oColumn.sWidthOrig !== "" )
					{
						nThs[i-iCorrector].style.width = _fnStringToCss( oColumn.sWidthOrig );
					}
					else if ( oColumn.bVisible )
					{
						nThs[i-iCorrector].style.width = "";
					}
					else
					{
						iCorrector++;
					}
				}
		
				/* Find the biggest td for each column and put it into the table */
				for ( i=0 ; i<iColums ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						var nTd = _fnGetWidestNode( oSettings, i );
						if ( nTd !== null )
						{
							nTd = nTd.cloneNode(true);
							if ( oSettings.aoColumns[i].sContentPadding !== "" )
							{
								nTd.innerHTML += oSettings.aoColumns[i].sContentPadding;
							}
							nTr.appendChild( nTd );
						}
					}
				}
				
				/* Build the table and 'display' it */
				nWrapper.appendChild( nCalcTmp );
				
				/* When scrolling (X or Y) we want to set the width of the table as appropriate. However,
				 * when not scrolling leave the table width as it is. This results in slightly different,
				 * but I think correct behaviour
				 */
				if ( oSettings.oScroll.sX !== "" && oSettings.oScroll.sXInner !== "" )
				{
					nCalcTmp.style.width = _fnStringToCss(oSettings.oScroll.sXInner);
				}
				else if ( oSettings.oScroll.sX !== "" )
				{
					nCalcTmp.style.width = "";
					if ( $(nCalcTmp).width() < nWrapper.offsetWidth )
					{
						nCalcTmp.style.width = _fnStringToCss( nWrapper.offsetWidth );
					}
				}
				else if ( oSettings.oScroll.sY !== "" )
				{
					nCalcTmp.style.width = _fnStringToCss( nWrapper.offsetWidth );
				}
				else if ( widthAttr )
				{
					nCalcTmp.style.width = _fnStringToCss( widthAttr );
				}
				nCalcTmp.style.visibility = "hidden";
				
				/* Scrolling considerations */
				_fnScrollingWidthAdjust( oSettings, nCalcTmp );
				
				/* Read the width's calculated by the browser and store them for use by the caller. We
				 * first of all try to use the elements in the body, but it is possible that there are
				 * no elements there, under which circumstances we use the header elements
				 */
				var oNodes = $("tbody tr:eq(0)", nCalcTmp).children();
				if ( oNodes.length === 0 )
				{
					oNodes = _fnGetUniqueThs( oSettings, $('thead', nCalcTmp)[0] );
				}
		
				/* Browsers need a bit of a hand when a width is assigned to any columns when 
				 * x-scrolling as they tend to collapse the table to the min-width, even if
				 * we sent the column widths. So we need to keep track of what the table width
				 * should be by summing the user given values, and the automatic values
				 */
				if ( oSettings.oScroll.sX !== "" )
				{
					var iTotal = 0;
					iCorrector = 0;
					for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
					{
						if ( oSettings.aoColumns[i].bVisible )
						{
							if ( oSettings.aoColumns[i].sWidthOrig === null )
							{
								iTotal += $(oNodes[iCorrector]).outerWidth();
							}
							else
							{
								iTotal += parseInt(oSettings.aoColumns[i].sWidth.replace('px',''), 10) +
									($(oNodes[iCorrector]).outerWidth() - $(oNodes[iCorrector]).width());
							}
							iCorrector++;
						}
					}
					
					nCalcTmp.style.width = _fnStringToCss( iTotal );
					oSettings.nTable.style.width = _fnStringToCss( iTotal );
				}
		
				iCorrector = 0;
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						iWidth = $(oNodes[iCorrector]).width();
						if ( iWidth !== null && iWidth > 0 )
						{
							oSettings.aoColumns[i].sWidth = _fnStringToCss( iWidth );
						}
						iCorrector++;
					}
				}
		
				var cssWidth = $(nCalcTmp).css('width');
				oSettings.nTable.style.width = (cssWidth.indexOf('%') !== -1) ?
				    cssWidth : _fnStringToCss( $(nCalcTmp).outerWidth() );
				nCalcTmp.parentNode.removeChild( nCalcTmp );
			}
		
			if ( widthAttr )
			{
				oSettings.nTable.style.width = _fnStringToCss( widthAttr );
			}
		}
		
		
		/**
		 * Adjust a table's width to take account of scrolling
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} n table node
		 *  @memberof DataTable#oApi
		 */
		function _fnScrollingWidthAdjust ( oSettings, n )
		{
			if ( oSettings.oScroll.sX === "" && oSettings.oScroll.sY !== "" )
			{
				/* When y-scrolling only, we want to remove the width of the scroll bar so the table
				 * + scroll bar will fit into the area avaialble.
				 */
				var iOrigWidth = $(n).width();
				n.style.width = _fnStringToCss( $(n).outerWidth()-oSettings.oScroll.iBarWidth );
			}
			else if ( oSettings.oScroll.sX !== "" )
			{
				/* When x-scrolling both ways, fix the table at it's current size, without adjusting */
				n.style.width = _fnStringToCss( $(n).outerWidth() );
			}
		}
		
		
		/**
		 * Get the widest node
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iCol column of interest
		 *  @returns {node} widest table node
		 *  @memberof DataTable#oApi
		 */
		function _fnGetWidestNode( oSettings, iCol )
		{
			var iMaxIndex = _fnGetMaxLenString( oSettings, iCol );
			if ( iMaxIndex < 0 )
			{
				return null;
			}
		
			if ( oSettings.aoData[iMaxIndex].nTr === null )
			{
				var n = document.createElement('td');
				n.innerHTML = _fnGetCellData( oSettings, iMaxIndex, iCol, '' );
				return n;
			}
			return _fnGetTdNodes(oSettings, iMaxIndex)[iCol];
		}
		
		
		/**
		 * Get the maximum strlen for each data column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iCol column of interest
		 *  @returns {string} max string length for each column
		 *  @memberof DataTable#oApi
		 */
		function _fnGetMaxLenString( oSettings, iCol )
		{
			var iMax = -1;
			var iMaxIndex = -1;
			
			for ( var i=0 ; i<oSettings.aoData.length ; i++ )
			{
				var s = _fnGetCellData( oSettings, i, iCol, 'display' )+"";
				s = s.replace( /<.*?>/g, "" );
				if ( s.length > iMax )
				{
					iMax = s.length;
					iMaxIndex = i;
				}
			}
			
			return iMaxIndex;
		}
		
		
		/**
		 * Append a CSS unit (only if required) to a string
		 *  @param {array} aArray1 first array
		 *  @param {array} aArray2 second array
		 *  @returns {int} 0 if match, 1 if length is different, 2 if no match
		 *  @memberof DataTable#oApi
		 */
		function _fnStringToCss( s )
		{
			if ( s === null )
			{
				return "0px";
			}
			
			if ( typeof s == 'number' )
			{
				if ( s < 0 )
				{
					return "0px";
				}
				return s+"px";
			}
			
			/* Check if the last character is not 0-9 */
			var c = s.charCodeAt( s.length-1 );
			if (c < 0x30 || c > 0x39)
			{
				return s;
			}
			return s+"px";
		}
		
		
		/**
		 * Get the width of a scroll bar in this browser being used
		 *  @returns {int} width in pixels
		 *  @memberof DataTable#oApi
		 */
		function _fnScrollBarWidth ()
		{  
			var inner = document.createElement('p');
			var style = inner.style;
			style.width = "100%";
			style.height = "200px";
			style.padding = "0px";
			
			var outer = document.createElement('div');
			style = outer.style;
			style.position = "absolute";
			style.top = "0px";
			style.left = "0px";
			style.visibility = "hidden";
			style.width = "200px";
			style.height = "150px";
			style.padding = "0px";
			style.overflow = "hidden";
			outer.appendChild(inner);
			
			document.body.appendChild(outer);
			var w1 = inner.offsetWidth;
			outer.style.overflow = 'scroll';
			var w2 = inner.offsetWidth;
			if ( w1 == w2 )
			{
				w2 = outer.clientWidth;
			}
			
			document.body.removeChild(outer);
			return (w1 - w2);  
		}
		
		/**
		 * Change the order of the table
		 *  @param {object} oSettings dataTables settings object
		 *  @param {bool} bApplyClasses optional - should we apply classes or not
		 *  @memberof DataTable#oApi
		 */
		function _fnSort ( oSettings, bApplyClasses )
		{
			var
				i, iLen, j, jLen, k, kLen,
				sDataType, nTh,
				aaSort = [],
			 	aiOrig = [],
				oSort = DataTable.ext.oSort,
				aoData = oSettings.aoData,
				aoColumns = oSettings.aoColumns,
				oAria = oSettings.oLanguage.oAria;
			
			/* No sorting required if server-side or no sorting array */
			if ( !oSettings.oFeatures.bServerSide && 
				(oSettings.aaSorting.length !== 0 || oSettings.aaSortingFixed !== null) )
			{
				aaSort = ( oSettings.aaSortingFixed !== null ) ?
					oSettings.aaSortingFixed.concat( oSettings.aaSorting ) :
					oSettings.aaSorting.slice();
				
				/* If there is a sorting data type, and a function belonging to it, then we need to
				 * get the data from the developer's function and apply it for this column
				 */
				for ( i=0 ; i<aaSort.length ; i++ )
				{
					var iColumn = aaSort[i][0];
					var iVisColumn = _fnColumnIndexToVisible( oSettings, iColumn );
					sDataType = oSettings.aoColumns[ iColumn ].sSortDataType;
					if ( DataTable.ext.afnSortData[sDataType] )
					{
						var aData = DataTable.ext.afnSortData[sDataType].call( 
							oSettings.oInstance, oSettings, iColumn, iVisColumn
						);
						if ( aData.length === aoData.length )
						{
							for ( j=0, jLen=aoData.length ; j<jLen ; j++ )
							{
								_fnSetCellData( oSettings, j, iColumn, aData[j] );
							}
						}
						else
						{
							_fnLog( oSettings, 0, "Returned data sort array (col "+iColumn+") is the wrong length" );
						}
					}
				}
				
				/* Create a value - key array of the current row positions such that we can use their
				 * current position during the sort, if values match, in order to perform stable sorting
				 */
				for ( i=0, iLen=oSettings.aiDisplayMaster.length ; i<iLen ; i++ )
				{
					aiOrig[ oSettings.aiDisplayMaster[i] ] = i;
				}
		
				/* Build an internal data array which is specific to the sort, so we can get and prep
				 * the data to be sorted only once, rather than needing to do it every time the sorting
				 * function runs. This make the sorting function a very simple comparison
				 */
				var iSortLen = aaSort.length;
				var fnSortFormat, aDataSort;
				for ( i=0, iLen=aoData.length ; i<iLen ; i++ )
				{
					for ( j=0 ; j<iSortLen ; j++ )
					{
						aDataSort = aoColumns[ aaSort[j][0] ].aDataSort;
		
						for ( k=0, kLen=aDataSort.length ; k<kLen ; k++ )
						{
							sDataType = aoColumns[ aDataSort[k] ].sType;
							fnSortFormat = oSort[ (sDataType ? sDataType : 'string')+"-pre" ];
							
							aoData[i]._aSortData[ aDataSort[k] ] = fnSortFormat ?
								fnSortFormat( _fnGetCellData( oSettings, i, aDataSort[k], 'sort' ) ) :
								_fnGetCellData( oSettings, i, aDataSort[k], 'sort' );
						}
					}
				}
				
				/* Do the sort - here we want multi-column sorting based on a given data source (column)
				 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
				 * follow on it's own, but this is what we want (example two column sorting):
				 *  fnLocalSorting = function(a,b){
				 *  	var iTest;
				 *  	iTest = oSort['string-asc']('data11', 'data12');
				 *  	if (iTest !== 0)
				 *  		return iTest;
				 *    iTest = oSort['numeric-desc']('data21', 'data22');
				 *    if (iTest !== 0)
				 *  		return iTest;
				 *  	return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
				 *  }
				 * Basically we have a test for each sorting column, if the data in that column is equal,
				 * test the next column. If all columns match, then we use a numeric sort on the row 
				 * positions in the original data array to provide a stable sort.
				 */
				oSettings.aiDisplayMaster.sort( function ( a, b ) {
					var k, l, lLen, iTest, aDataSort, sDataType;
					for ( k=0 ; k<iSortLen ; k++ )
					{
						aDataSort = aoColumns[ aaSort[k][0] ].aDataSort;
		
						for ( l=0, lLen=aDataSort.length ; l<lLen ; l++ )
						{
							sDataType = aoColumns[ aDataSort[l] ].sType;
							
							iTest = oSort[ (sDataType ? sDataType : 'string')+"-"+aaSort[k][1] ](
								aoData[a]._aSortData[ aDataSort[l] ],
								aoData[b]._aSortData[ aDataSort[l] ]
							);
						
							if ( iTest !== 0 )
							{
								return iTest;
							}
						}
					}
					
					return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
				} );
			}
			
			/* Alter the sorting classes to take account of the changes */
			if ( (bApplyClasses === undefined || bApplyClasses) && !oSettings.oFeatures.bDeferRender )
			{
				_fnSortingClasses( oSettings );
			}
		
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				var sTitle = aoColumns[i].sTitle.replace( /<.*?>/g, "" );
				nTh = aoColumns[i].nTh;
				nTh.removeAttribute('aria-sort');
				nTh.removeAttribute('aria-label');
				
				/* In ARIA only the first sorting column can be marked as sorting - no multi-sort option */
				if ( aoColumns[i].bSortable )
				{
					if ( aaSort.length > 0 && aaSort[0][0] == i )
					{
						nTh.setAttribute('aria-sort', aaSort[0][1]=="asc" ? "ascending" : "descending" );
						
						var nextSort = (aoColumns[i].asSorting[ aaSort[0][2]+1 ]) ? 
							aoColumns[i].asSorting[ aaSort[0][2]+1 ] : aoColumns[i].asSorting[0];
						nTh.setAttribute('aria-label', sTitle+
							(nextSort=="asc" ? oAria.sSortAscending : oAria.sSortDescending) );
					}
					else
					{
						nTh.setAttribute('aria-label', sTitle+
							(aoColumns[i].asSorting[0]=="asc" ? oAria.sSortAscending : oAria.sSortDescending) );
					}
				}
				else
				{
					nTh.setAttribute('aria-label', sTitle);
				}
			}
			
			/* Tell the draw function that we have sorted the data */
			oSettings.bSorted = true;
			$(oSettings.oInstance).trigger('sort', oSettings);
			
			/* Copy the master data into the draw array and re-draw */
			if ( oSettings.oFeatures.bFilter )
			{
				/* _fnFilter() will redraw the table for us */
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch, 1 );
			}
			else
			{
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				oSettings._iDisplayStart = 0; /* reset display back to page 0 */
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
		}
		
		
		/**
		 * Attach a sort handler (click) to a node
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nNode node to attach the handler to
		 *  @param {int} iDataIndex column sorting index
		 *  @param {function} [fnCallback] callback function
		 *  @memberof DataTable#oApi
		 */
		function _fnSortAttachListener ( oSettings, nNode, iDataIndex, fnCallback )
		{
			_fnBindAction( nNode, {}, function (e) {
				/* If the column is not sortable - don't to anything */
				if ( oSettings.aoColumns[iDataIndex].bSortable === false )
				{
					return;
				}
				
				/*
				 * This is a little bit odd I admit... I declare a temporary function inside the scope of
				 * _fnBuildHead and the click handler in order that the code presented here can be used 
				 * twice - once for when bProcessing is enabled, and another time for when it is 
				 * disabled, as we need to perform slightly different actions.
				 *   Basically the issue here is that the Javascript engine in modern browsers don't 
				 * appear to allow the rendering engine to update the display while it is still executing
				 * it's thread (well - it does but only after long intervals). This means that the 
				 * 'processing' display doesn't appear for a table sort. To break the js thread up a bit
				 * I force an execution break by using setTimeout - but this breaks the expected 
				 * thread continuation for the end-developer's point of view (their code would execute
				 * too early), so we only do it when we absolutely have to.
				 */
				var fnInnerSorting = function () {
					var iColumn, iNextSort;
					
					/* If the shift key is pressed then we are multiple column sorting */
					if ( e.shiftKey )
					{
						/* Are we already doing some kind of sort on this column? */
						var bFound = false;
						for ( var i=0 ; i<oSettings.aaSorting.length ; i++ )
						{
							if ( oSettings.aaSorting[i][0] == iDataIndex )
							{
								bFound = true;
								iColumn = oSettings.aaSorting[i][0];
								iNextSort = oSettings.aaSorting[i][2]+1;
								
								if ( !oSettings.aoColumns[iColumn].asSorting[iNextSort] )
								{
									/* Reached the end of the sorting options, remove from multi-col sort */
									oSettings.aaSorting.splice( i, 1 );
								}
								else
								{
									/* Move onto next sorting direction */
									oSettings.aaSorting[i][1] = oSettings.aoColumns[iColumn].asSorting[iNextSort];
									oSettings.aaSorting[i][2] = iNextSort;
								}
								break;
							}
						}
						
						/* No sort yet - add it in */
						if ( bFound === false )
						{
							oSettings.aaSorting.push( [ iDataIndex, 
								oSettings.aoColumns[iDataIndex].asSorting[0], 0 ] );
						}
					}
					else
					{
						/* If no shift key then single column sort */
						if ( oSettings.aaSorting.length == 1 && oSettings.aaSorting[0][0] == iDataIndex )
						{
							iColumn = oSettings.aaSorting[0][0];
							iNextSort = oSettings.aaSorting[0][2]+1;
							if ( !oSettings.aoColumns[iColumn].asSorting[iNextSort] )
							{
								iNextSort = 0;
							}
							oSettings.aaSorting[0][1] = oSettings.aoColumns[iColumn].asSorting[iNextSort];
							oSettings.aaSorting[0][2] = iNextSort;
						}
						else
						{
							oSettings.aaSorting.splice( 0, oSettings.aaSorting.length );
							oSettings.aaSorting.push( [ iDataIndex, 
								oSettings.aoColumns[iDataIndex].asSorting[0], 0 ] );
						}
					}
					
					/* Run the sort */
					_fnSort( oSettings );
				}; /* /fnInnerSorting */
				
				if ( !oSettings.oFeatures.bProcessing )
				{
					fnInnerSorting();
				}
				else
				{
					_fnProcessingDisplay( oSettings, true );
					setTimeout( function() {
						fnInnerSorting();
						if ( !oSettings.oFeatures.bServerSide )
						{
							_fnProcessingDisplay( oSettings, false );
						}
					}, 0 );
				}
				
				/* Call the user specified callback function - used for async user interaction */
				if ( typeof fnCallback == 'function' )
				{
					fnCallback( oSettings );
				}
			} );
		}
		
		
		/**
		 * Set the sorting classes on the header, Note: it is safe to call this function 
		 * when bSort and bSortClasses are false
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnSortingClasses( oSettings )
		{
			var i, iLen, j, jLen, iFound;
			var aaSort, sClass;
			var iColumns = oSettings.aoColumns.length;
			var oClasses = oSettings.oClasses;
			
			for ( i=0 ; i<iColumns ; i++ )
			{
				if ( oSettings.aoColumns[i].bSortable )
				{
					$(oSettings.aoColumns[i].nTh).removeClass( oClasses.sSortAsc +" "+ oClasses.sSortDesc +
						" "+ oSettings.aoColumns[i].sSortingClass );
				}
			}
			
			if ( oSettings.aaSortingFixed !== null )
			{
				aaSort = oSettings.aaSortingFixed.concat( oSettings.aaSorting );
			}
			else
			{
				aaSort = oSettings.aaSorting.slice();
			}
			
			/* Apply the required classes to the header */
			for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bSortable )
				{
					sClass = oSettings.aoColumns[i].sSortingClass;
					iFound = -1;
					for ( j=0 ; j<aaSort.length ; j++ )
					{
						if ( aaSort[j][0] == i )
						{
							sClass = ( aaSort[j][1] == "asc" ) ?
								oClasses.sSortAsc : oClasses.sSortDesc;
							iFound = j;
							break;
						}
					}
					$(oSettings.aoColumns[i].nTh).addClass( sClass );
					
					if ( oSettings.bJUI )
					{
						/* jQuery UI uses extra markup */
						var jqSpan = $("span."+oClasses.sSortIcon,  oSettings.aoColumns[i].nTh);
						jqSpan.removeClass(oClasses.sSortJUIAsc +" "+ oClasses.sSortJUIDesc +" "+ 
							oClasses.sSortJUI +" "+ oClasses.sSortJUIAscAllowed +" "+ oClasses.sSortJUIDescAllowed );
						
						var sSpanClass;
						if ( iFound == -1 )
						{
						 	sSpanClass = oSettings.aoColumns[i].sSortingClassJUI;
						}
						else if ( aaSort[iFound][1] == "asc" )
						{
							sSpanClass = oClasses.sSortJUIAsc;
						}
						else
						{
							sSpanClass = oClasses.sSortJUIDesc;
						}
						
						jqSpan.addClass( sSpanClass );
					}
				}
				else
				{
					/* No sorting on this column, so add the base class. This will have been assigned by
					 * _fnAddColumn
					 */
					$(oSettings.aoColumns[i].nTh).addClass( oSettings.aoColumns[i].sSortingClass );
				}
			}
			
			/* 
			 * Apply the required classes to the table body
			 * Note that this is given as a feature switch since it can significantly slow down a sort
			 * on large data sets (adding and removing of classes is always slow at the best of times..)
			 * Further to this, note that this code is admittedly fairly ugly. It could be made a lot 
			 * simpler using jQuery selectors and add/removeClass, but that is significantly slower
			 * (on the order of 5 times slower) - hence the direct DOM manipulation here.
			 * Note that for deferred drawing we do use jQuery - the reason being that taking the first
			 * row found to see if the whole column needs processed can miss classes since the first
			 * column might be new.
			 */
			sClass = oClasses.sSortColumn;
			
			if ( oSettings.oFeatures.bSort && oSettings.oFeatures.bSortClasses )
			{
				var nTds = _fnGetTdNodes( oSettings );
				
				/* Determine what the sorting class for each column should be */
				var iClass, iTargetCol;
				var asClasses = [];
				for (i = 0; i < iColumns; i++)
				{
					asClasses.push("");
				}
				for (i = 0, iClass = 1; i < aaSort.length; i++)
				{
					iTargetCol = parseInt( aaSort[i][0], 10 );
					asClasses[iTargetCol] = sClass + iClass;
					
					if ( iClass < 3 )
					{
						iClass++;
					}
				}
				
				/* Make changes to the classes for each cell as needed */
				var reClass = new RegExp(sClass + "[123]");
				var sTmpClass, sCurrentClass, sNewClass;
				for ( i=0, iLen=nTds.length; i<iLen; i++ )
				{
					/* Determine which column we're looking at */
					iTargetCol = i % iColumns;
					
					/* What is the full list of classes now */
					sCurrentClass = nTds[i].className;
					/* What sorting class should be applied? */
					sNewClass = asClasses[iTargetCol];
					/* What would the new full list be if we did a replacement? */
					sTmpClass = sCurrentClass.replace(reClass, sNewClass);
					
					if ( sTmpClass != sCurrentClass )
					{
						/* We changed something */
						nTds[i].className = $.trim( sTmpClass );
					}
					else if ( sNewClass.length > 0 && sCurrentClass.indexOf(sNewClass) == -1 )
					{
						/* We need to add a class */
						nTds[i].className = sCurrentClass + " " + sNewClass;
					}
				}
			}
		}
		
		
		
		/**
		 * Save the state of a table in a cookie such that the page can be reloaded
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnSaveState ( oSettings )
		{
			if ( !oSettings.oFeatures.bStateSave || oSettings.bDestroying )
			{
				return;
			}
		
			/* Store the interesting variables */
			var i, iLen, bInfinite=oSettings.oScroll.bInfinite;
			var oState = {
				"iCreate":      new Date().getTime(),
				"iStart":       (bInfinite ? 0 : oSettings._iDisplayStart),
				"iEnd":         (bInfinite ? oSettings._iDisplayLength : oSettings._iDisplayEnd),
				"iLength":      oSettings._iDisplayLength,
				"aaSorting":    $.extend( true, [], oSettings.aaSorting ),
				"oSearch":      $.extend( true, {}, oSettings.oPreviousSearch ),
				"aoSearchCols": $.extend( true, [], oSettings.aoPreSearchCols ),
				"abVisCols":    []
			};
		
			for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				oState.abVisCols.push( oSettings.aoColumns[i].bVisible );
			}
		
			_fnCallbackFire( oSettings, "aoStateSaveParams", 'stateSaveParams', [oSettings, oState] );
			
			oSettings.fnStateSave.call( oSettings.oInstance, oSettings, oState );
		}
		
		
		/**
		 * Attempt to load a saved table state from a cookie
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} oInit DataTables init object so we can override settings
		 *  @memberof DataTable#oApi
		 */
		function _fnLoadState ( oSettings, oInit )
		{
			if ( !oSettings.oFeatures.bStateSave )
			{
				return;
			}
		
			var oData = oSettings.fnStateLoad.call( oSettings.oInstance, oSettings );
			if ( !oData )
			{
				return;
			}
			
			/* Allow custom and plug-in manipulation functions to alter the saved data set and
			 * cancelling of loading by returning false
			 */
			var abStateLoad = _fnCallbackFire( oSettings, 'aoStateLoadParams', 'stateLoadParams', [oSettings, oData] );
			if ( $.inArray( false, abStateLoad ) !== -1 )
			{
				return;
			}
			
			/* Store the saved state so it might be accessed at any time */
			oSettings.oLoadedState = $.extend( true, {}, oData );
			
			/* Restore key features */
			oSettings._iDisplayStart    = oData.iStart;
			oSettings.iInitDisplayStart = oData.iStart;
			oSettings._iDisplayEnd      = oData.iEnd;
			oSettings._iDisplayLength   = oData.iLength;
			oSettings.aaSorting         = oData.aaSorting.slice();
			oSettings.saved_aaSorting   = oData.aaSorting.slice();
			
			/* Search filtering  */
			$.extend( oSettings.oPreviousSearch, oData.oSearch );
			$.extend( true, oSettings.aoPreSearchCols, oData.aoSearchCols );
			
			/* Column visibility state
			 * Pass back visibility settings to the init handler, but to do not here override
			 * the init object that the user might have passed in
			 */
			oInit.saved_aoColumns = [];
			for ( var i=0 ; i<oData.abVisCols.length ; i++ )
			{
				oInit.saved_aoColumns[i] = {};
				oInit.saved_aoColumns[i].bVisible = oData.abVisCols[i];
			}
		
			_fnCallbackFire( oSettings, 'aoStateLoaded', 'stateLoaded', [oSettings, oData] );
		}
		
		
		/**
		 * Create a new cookie with a value to store the state of a table
		 *  @param {string} sName name of the cookie to create
		 *  @param {string} sValue the value the cookie should take
		 *  @param {int} iSecs duration of the cookie
		 *  @param {string} sBaseName sName is made up of the base + file name - this is the base
		 *  @param {function} fnCallback User definable function to modify the cookie
		 *  @memberof DataTable#oApi
		 */
		function _fnCreateCookie ( sName, sValue, iSecs, sBaseName, fnCallback )
		{
			var date = new Date();
			date.setTime( date.getTime()+(iSecs*1000) );
			
			/* 
			 * Shocking but true - it would appear IE has major issues with having the path not having
			 * a trailing slash on it. We need the cookie to be available based on the path, so we
			 * have to append the file name to the cookie name. Appalling. Thanks to vex for adding the
			 * patch to use at least some of the path
			 */
			var aParts = window.location.pathname.split('/');
			var sNameFile = sName + '_' + aParts.pop().replace(/[\/:]/g,"").toLowerCase();
			var sFullCookie, oData;
			
			if ( fnCallback !== null )
			{
				oData = (typeof $.parseJSON === 'function') ? 
					$.parseJSON( sValue ) : eval( '('+sValue+')' );
				sFullCookie = fnCallback( sNameFile, oData, date.toGMTString(),
					aParts.join('/')+"/" );
			}
			else
			{
				sFullCookie = sNameFile + "=" + encodeURIComponent(sValue) +
					"; expires=" + date.toGMTString() +"; path=" + aParts.join('/')+"/";
			}
			
			/* Are we going to go over the cookie limit of 4KiB? If so, try to delete a cookies
			 * belonging to DataTables.
			 */
			var
				aCookies =document.cookie.split(';'),
				iNewCookieLen = sFullCookie.split(';')[0].length,
				aOldCookies = [];
			
			if ( iNewCookieLen+document.cookie.length+10 > 4096 ) /* Magic 10 for padding */
			{
				for ( var i=0, iLen=aCookies.length ; i<iLen ; i++ )
				{
					if ( aCookies[i].indexOf( sBaseName ) != -1 )
					{
						/* It's a DataTables cookie, so eval it and check the time stamp */
						var aSplitCookie = aCookies[i].split('=');
						try {
							oData = eval( '('+decodeURIComponent(aSplitCookie[1])+')' );
		
							if ( oData && oData.iCreate )
							{
								aOldCookies.push( {
									"name": aSplitCookie[0],
									"time": oData.iCreate
								} );
							}
						}
						catch( e ) {}
					}
				}
		
				// Make sure we delete the oldest ones first
				aOldCookies.sort( function (a, b) {
					return b.time - a.time;
				} );
		
				// Eliminate as many old DataTables cookies as we need to
				while ( iNewCookieLen + document.cookie.length + 10 > 4096 ) {
					if ( aOldCookies.length === 0 ) {
						// Deleted all DT cookies and still not enough space. Can't state save
						return;
					}
					
					var old = aOldCookies.pop();
					document.cookie = old.name+"=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path="+
						aParts.join('/') + "/";
				}
			}
			
			document.cookie = sFullCookie;
		}
		
		
		/**
		 * Read an old cookie to get a cookie with an old table state
		 *  @param {string} sName name of the cookie to read
		 *  @returns {string} contents of the cookie - or null if no cookie with that name found
		 *  @memberof DataTable#oApi
		 */
		function _fnReadCookie ( sName )
		{
			var
				aParts = window.location.pathname.split('/'),
				sNameEQ = sName + '_' + aParts[aParts.length-1].replace(/[\/:]/g,"").toLowerCase() + '=',
			 	sCookieContents = document.cookie.split(';');
			
			for( var i=0 ; i<sCookieContents.length ; i++ )
			{
				var c = sCookieContents[i];
				
				while (c.charAt(0)==' ')
				{
					c = c.substring(1,c.length);
				}
				
				if (c.indexOf(sNameEQ) === 0)
				{
					return decodeURIComponent( c.substring(sNameEQ.length,c.length) );
				}
			}
			return null;
		}
		
		
		/**
		 * Return the settings object for a particular table
		 *  @param {node} nTable table we are using as a dataTable
		 *  @returns {object} Settings object - or null if not found
		 *  @memberof DataTable#oApi
		 */
		function _fnSettingsFromNode ( nTable )
		{
			for ( var i=0 ; i<DataTable.settings.length ; i++ )
			{
				if ( DataTable.settings[i].nTable === nTable )
				{
					return DataTable.settings[i];
				}
			}
			
			return null;
		}
		
		
		/**
		 * Return an array with the TR nodes for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {array} TR array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetTrNodes ( oSettings )
		{
			var aNodes = [];
			var aoData = oSettings.aoData;
			for ( var i=0, iLen=aoData.length ; i<iLen ; i++ )
			{
				if ( aoData[i].nTr !== null )
				{
					aNodes.push( aoData[i].nTr );
				}
			}
			return aNodes;
		}
		
		
		/**
		 * Return an flat array with all TD nodes for the table, or row
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} [iIndividualRow] aoData index to get the nodes for - optional 
		 *    if not given then the return array will contain all nodes for the table
		 *  @returns {array} TD array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetTdNodes ( oSettings, iIndividualRow )
		{
			var anReturn = [];
			var iCorrector;
			var anTds, nTd;
			var iRow, iRows=oSettings.aoData.length,
				iColumn, iColumns, oData, sNodeName, iStart=0, iEnd=iRows;
			
			/* Allow the collection to be limited to just one row */
			if ( iIndividualRow !== undefined )
			{
				iStart = iIndividualRow;
				iEnd = iIndividualRow+1;
			}
		
			for ( iRow=iStart ; iRow<iEnd ; iRow++ )
			{
				oData = oSettings.aoData[iRow];
				if ( oData.nTr !== null )
				{
					/* get the TD child nodes - taking into account text etc nodes */
					anTds = [];
					nTd = oData.nTr.firstChild;
					while ( nTd )
					{
						sNodeName = nTd.nodeName.toLowerCase();
						if ( sNodeName == 'td' || sNodeName == 'th' )
						{
							anTds.push( nTd );
						}
						nTd = nTd.nextSibling;
					}
		
					iCorrector = 0;
					for ( iColumn=0, iColumns=oSettings.aoColumns.length ; iColumn<iColumns ; iColumn++ )
					{
						if ( oSettings.aoColumns[iColumn].bVisible )
						{
							anReturn.push( anTds[iColumn-iCorrector] );
						}
						else
						{
							anReturn.push( oData._anHidden[iColumn] );
							iCorrector++;
						}
					}
				}
			}
		
			return anReturn;
		}
		
		
		/**
		 * Log an error message
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iLevel log error messages, or display them to the user
		 *  @param {string} sMesg error message
		 *  @memberof DataTable#oApi
		 */
		function _fnLog( oSettings, iLevel, sMesg )
		{
			var sAlert = (oSettings===null) ?
				"DataTables warning: "+sMesg :
				"DataTables warning (table id = '"+oSettings.sTableId+"'): "+sMesg;
			
			if ( iLevel === 0 )
			{
				if ( DataTable.ext.sErrMode == 'alert' )
				{
					alert( sAlert );
				}
				else
				{
					throw new Error(sAlert);
				}
				return;
			}
			else if ( window.console && console.log )
			{
				console.log( sAlert );
			}
		}
		
		
		/**
		 * See if a property is defined on one object, if so assign it to the other object
		 *  @param {object} oRet target object
		 *  @param {object} oSrc source object
		 *  @param {string} sName property
		 *  @param {string} [sMappedName] name to map too - optional, sName used if not given
		 *  @memberof DataTable#oApi
		 */
		function _fnMap( oRet, oSrc, sName, sMappedName )
		{
			if ( sMappedName === undefined )
			{
				sMappedName = sName;
			}
			if ( oSrc[sName] !== undefined )
			{
				oRet[sMappedName] = oSrc[sName];
			}
		}
		
		
		/**
		 * Extend objects - very similar to jQuery.extend, but deep copy objects, and shallow
		 * copy arrays. The reason we need to do this, is that we don't want to deep copy array
		 * init values (such as aaSorting) since the dev wouldn't be able to override them, but
		 * we do want to deep copy arrays.
		 *  @param {object} oOut Object to extend
		 *  @param {object} oExtender Object from which the properties will be applied to oOut
		 *  @returns {object} oOut Reference, just for convenience - oOut === the return.
		 *  @memberof DataTable#oApi
		 *  @todo This doesn't take account of arrays inside the deep copied objects.
		 */
		function _fnExtend( oOut, oExtender )
		{
			var val;
			
			for ( var prop in oExtender )
			{
				if ( oExtender.hasOwnProperty(prop) )
				{
					val = oExtender[prop];
		
					if ( typeof oInit[prop] === 'object' && val !== null && $.isArray(val) === false )
					{
						$.extend( true, oOut[prop], val );
					}
					else
					{
						oOut[prop] = val;
					}
				}
			}
		
			return oOut;
		}
		
		
		/**
		 * Bind an event handers to allow a click or return key to activate the callback.
		 * This is good for accessibility since a return on the keyboard will have the
		 * same effect as a click, if the element has focus.
		 *  @param {element} n Element to bind the action to
		 *  @param {object} oData Data object to pass to the triggered function
		 *  @param {function} fn Callback function for when the event is triggered
		 *  @memberof DataTable#oApi
		 */
		function _fnBindAction( n, oData, fn )
		{
			$(n)
				.bind( 'click.DT', oData, function (e) {
						n.blur(); // Remove focus outline for mouse users
						fn(e);
					} )
				.bind( 'keypress.DT', oData, function (e){
					if ( e.which === 13 ) {
						fn(e);
					} } )
				.bind( 'selectstart.DT', function () {
					/* Take the brutal approach to cancelling text selection */
					return false;
					} );
		}
		
		
		/**
		 * Register a callback function. Easily allows a callback function to be added to
		 * an array store of callback functions that can then all be called together.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sStore Name of the array storage for the callbacks in oSettings
		 *  @param {function} fn Function to be called back
		 *  @param {string} sName Identifying name for the callback (i.e. a label)
		 *  @memberof DataTable#oApi
		 */
		function _fnCallbackReg( oSettings, sStore, fn, sName )
		{
			if ( fn )
			{
				oSettings[sStore].push( {
					"fn": fn,
					"sName": sName
				} );
			}
		}
		
		
		/**
		 * Fire callback functions and trigger events. Note that the loop over the callback
		 * array store is done backwards! Further note that you do not want to fire off triggers
		 * in time sensitive applications (for example cell creation) as its slow.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sStore Name of the array storage for the callbacks in oSettings
		 *  @param {string} sTrigger Name of the jQuery custom event to trigger. If null no trigger
		 *    is fired
		 *  @param {array} aArgs Array of arguments to pass to the callback function / trigger
		 *  @memberof DataTable#oApi
		 */
		function _fnCallbackFire( oSettings, sStore, sTrigger, aArgs )
		{
			var aoStore = oSettings[sStore];
			var aRet =[];
		
			for ( var i=aoStore.length-1 ; i>=0 ; i-- )
			{
				aRet.push( aoStore[i].fn.apply( oSettings.oInstance, aArgs ) );
			}
		
			if ( sTrigger !== null )
			{
				$(oSettings.oInstance).trigger(sTrigger, aArgs);
			}
		
			return aRet;
		}
		
		
		/**
		 * JSON stringify. If JSON.stringify it provided by the browser, json2.js or any other
		 * library, then we use that as it is fast, safe and accurate. If the function isn't 
		 * available then we need to built it ourselves - the inspiration for this function comes
		 * from Craig Buckler ( http://www.sitepoint.com/javascript-json-serialization/ ). It is
		 * not perfect and absolutely should not be used as a replacement to json2.js - but it does
		 * do what we need, without requiring a dependency for DataTables.
		 *  @param {object} o JSON object to be converted
		 *  @returns {string} JSON string
		 *  @memberof DataTable#oApi
		 */
		var _fnJsonString = (window.JSON) ? JSON.stringify : function( o )
		{
			/* Not an object or array */
			var sType = typeof o;
			if (sType !== "object" || o === null)
			{
				// simple data type
				if (sType === "string")
				{
					o = '"'+o+'"';
				}
				return o+"";
			}
		
			/* If object or array, need to recurse over it */
			var
				sProp, mValue,
				json = [],
				bArr = $.isArray(o);
			
			for (sProp in o)
			{
				mValue = o[sProp];
				sType = typeof mValue;
		
				if (sType === "string")
				{
					mValue = '"'+mValue+'"';
				}
				else if (sType === "object" && mValue !== null)
				{
					mValue = _fnJsonString(mValue);
				}
		
				json.push((bArr ? "" : '"'+sProp+'":') + mValue);
			}
		
			return (bArr ? "[" : "{") + json + (bArr ? "]" : "}");
		};
		
		
		/**
		 * From some browsers (specifically IE6/7) we need special handling to work around browser
		 * bugs - this function is used to detect when these workarounds are needed.
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnBrowserDetect( oSettings )
		{
			/* IE6/7 will oversize a width 100% element inside a scrolling element, to include the
			 * width of the scrollbar, while other browsers ensure the inner element is contained
			 * without forcing scrolling
			 */
			var n = $(
				'<div style="position:absolute; top:0; left:0; height:1px; width:1px; overflow:hidden">'+
					'<div style="position:absolute; top:1px; left:1px; width:100px; overflow:scroll;">'+
						'<div id="DT_BrowserTest" style="width:100%; height:10px;"></div>'+
					'</div>'+
				'</div>')[0];
		
			document.body.appendChild( n );
			oSettings.oBrowser.bScrollOversize = $('#DT_BrowserTest', n)[0].offsetWidth === 100 ? true : false;
			document.body.removeChild( n );
		}
		

		/**
		 * Perform a jQuery selector action on the table's TR elements (from the tbody) and
		 * return the resulting jQuery object.
		 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
		 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
		 *  @param {string} [oOpts.filter=none] Select TR elements that meet the current filter
		 *    criterion ("applied") or all TR elements (i.e. no filter).
		 *  @param {string} [oOpts.order=current] Order of the TR elements in the processed array.
		 *    Can be either 'current', whereby the current sorting of the table is used, or
		 *    'original' whereby the original order the data was read into the table is used.
		 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
		 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be 
		 *    'current' and filter is 'applied', regardless of what they might be given as.
		 *  @returns {object} jQuery object, filtered by the given selector.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Highlight every second row
		 *      oTable.$('tr:odd').css('backgroundColor', 'blue');
		 *    } );
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to rows with 'Webkit' in them, add a background colour and then
		 *      // remove the filter, thus highlighting the 'Webkit' rows only.
		 *      oTable.fnFilter('Webkit');
		 *      oTable.$('tr', {"filter": "applied"}).css('backgroundColor', 'blue');
		 *      oTable.fnFilter('');
		 *    } );
		 */
		this.$ = function ( sSelector, oOpts )
		{
			var i, iLen, a = [], tr;
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var aoData = oSettings.aoData;
			var aiDisplay = oSettings.aiDisplay;
			var aiDisplayMaster = oSettings.aiDisplayMaster;
		
			if ( !oOpts )
			{
				oOpts = {};
			}
		
			oOpts = $.extend( {}, {
				"filter": "none", // applied
				"order": "current", // "original"
				"page": "all" // current
			}, oOpts );
		
			// Current page implies that order=current and fitler=applied, since it is fairly
			// senseless otherwise
			if ( oOpts.page == 'current' )
			{
				for ( i=oSettings._iDisplayStart, iLen=oSettings.fnDisplayEnd() ; i<iLen ; i++ )
				{
					tr = aoData[ aiDisplay[i] ].nTr;
					if ( tr )
					{
						a.push( tr );
					}
				}
			}
			else if ( oOpts.order == "current" && oOpts.filter == "none" )
			{
				for ( i=0, iLen=aiDisplayMaster.length ; i<iLen ; i++ )
				{
					tr = aoData[ aiDisplayMaster[i] ].nTr;
					if ( tr )
					{
						a.push( tr );
					}
				}
			}
			else if ( oOpts.order == "current" && oOpts.filter == "applied" )
			{
				for ( i=0, iLen=aiDisplay.length ; i<iLen ; i++ )
				{
					tr = aoData[ aiDisplay[i] ].nTr;
					if ( tr )
					{
						a.push( tr );
					}
				}
			}
			else if ( oOpts.order == "original" && oOpts.filter == "none" )
			{
				for ( i=0, iLen=aoData.length ; i<iLen ; i++ )
				{
					tr = aoData[ i ].nTr ;
					if ( tr )
					{
						a.push( tr );
					}
				}
			}
			else if ( oOpts.order == "original" && oOpts.filter == "applied" )
			{
				for ( i=0, iLen=aoData.length ; i<iLen ; i++ )
				{
					tr = aoData[ i ].nTr;
					if ( $.inArray( i, aiDisplay ) !== -1 && tr )
					{
						a.push( tr );
					}
				}
			}
			else
			{
				_fnLog( oSettings, 1, "Unknown selection options" );
			}
		
			/* We need to filter on the TR elements and also 'find' in their descendants
			 * to make the selector act like it would in a full table - so we need
			 * to build both results and then combine them together
			 */
			var jqA = $(a);
			var jqTRs = jqA.filter( sSelector );
			var jqDescendants = jqA.find( sSelector );
		
			return $( [].concat($.makeArray(jqTRs), $.makeArray(jqDescendants)) );
		};
		
		
		/**
		 * Almost identical to $ in operation, but in this case returns the data for the matched
		 * rows - as such, the jQuery selector used should match TR row nodes or TD/TH cell nodes
		 * rather than any descendants, so the data can be obtained for the row/cell. If matching
		 * rows are found, the data returned is the original data array/object that was used to  
		 * create the row (or a generated array if from a DOM source).
		 *
		 * This method is often useful in-combination with $ where both functions are given the
		 * same parameters and the array indexes will match identically.
		 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
		 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
		 *  @param {string} [oOpts.filter=none] Select elements that meet the current filter
		 *    criterion ("applied") or all elements (i.e. no filter).
		 *  @param {string} [oOpts.order=current] Order of the data in the processed array.
		 *    Can be either 'current', whereby the current sorting of the table is used, or
		 *    'original' whereby the original order the data was read into the table is used.
		 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
		 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be 
		 *    'current' and filter is 'applied', regardless of what they might be given as.
		 *  @returns {array} Data for the matched elements. If any elements, as a result of the
		 *    selector, were not TR, TD or TH elements in the DataTable, they will have a null 
		 *    entry in the array.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Get the data from the first row in the table
		 *      var data = oTable._('tr:first');
		 *
		 *      // Do something useful with the data
		 *      alert( "First cell is: "+data[0] );
		 *    } );
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *
		 *      // Filter to 'Webkit' and get all data for 
		 *      oTable.fnFilter('Webkit');
		 *      var data = oTable._('tr', {"filter": "applied"});
		 *      
		 *      // Do something with the data
		 *      alert( data.length+" rows matched the filter" );
		 *    } );
		 */
		this._ = function ( sSelector, oOpts )
		{
			var aOut = [];
			var i, iLen, iIndex;
			var aTrs = this.$( sSelector, oOpts );
		
			for ( i=0, iLen=aTrs.length ; i<iLen ; i++ )
			{
				aOut.push( this.fnGetData(aTrs[i]) );
			}
		
			return aOut;
		};
		
		
		/**
		 * Add a single new row or multiple rows of data to the table. Please note
		 * that this is suitable for client-side processing only - if you are using 
		 * server-side processing (i.e. "bServerSide": true), then to add data, you
		 * must add it to the data source, i.e. the server-side, through an Ajax call.
		 *  @param {array|object} mData The data to be added to the table. This can be:
		 *    <ul>
		 *      <li>1D array of data - add a single row with the data provided</li>
		 *      <li>2D array of arrays - add multiple rows in a single call</li>
		 *      <li>object - data object when using <i>mData</i></li>
		 *      <li>array of objects - multiple data objects when using <i>mData</i></li>
		 *    </ul>
		 *  @param {bool} [bRedraw=true] redraw the table or not
		 *  @returns {array} An array of integers, representing the list of indexes in 
		 *    <i>aoData</i> ({@link DataTable.models.oSettings}) that have been added to 
		 *    the table.
		 *  @dtopt API
		 *
		 *  @example
		 *    // Global var for counter
		 *    var giCount = 2;
		 *    
		 *    $(document).ready(function() {
		 *      $('#example').dataTable();
		 *    } );
		 *    
		 *    function fnClickAddRow() {
		 *      $('#example').dataTable().fnAddData( [
		 *        giCount+".1",
		 *        giCount+".2",
		 *        giCount+".3",
		 *        giCount+".4" ]
		 *      );
		 *        
		 *      giCount++;
		 *    }
		 */
		this.fnAddData = function( mData, bRedraw )
		{
			if ( mData.length === 0 )
			{
				return [];
			}
			
			var aiReturn = [];
			var iTest;
			
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			
			/* Check if we want to add multiple rows or not */
			if ( typeof mData[0] === "object" && mData[0] !== null )
			{
				for ( var i=0 ; i<mData.length ; i++ )
				{
					iTest = _fnAddData( oSettings, mData[i] );
					if ( iTest == -1 )
					{
						return aiReturn;
					}
					aiReturn.push( iTest );
				}
			}
			else
			{
				iTest = _fnAddData( oSettings, mData );
				if ( iTest == -1 )
				{
					return aiReturn;
				}
				aiReturn.push( iTest );
			}
			
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			if ( bRedraw === undefined || bRedraw )
			{
				_fnReDraw( oSettings );
			}
			return aiReturn;
		};
		
		
		/**
		 * This function will make DataTables recalculate the column sizes, based on the data 
		 * contained in the table and the sizes applied to the columns (in the DOM, CSS or 
		 * through the sWidth parameter). This can be useful when the width of the table's 
		 * parent element changes (for example a window resize).
		 *  @param {boolean} [bRedraw=true] Redraw the table or not, you will typically want to
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false
		 *      } );
		 *      
		 *      $(window).bind('resize', function () {
		 *        oTable.fnAdjustColumnSizing();
		 *      } );
		 *    } );
		 */
		this.fnAdjustColumnSizing = function ( bRedraw )
		{
			var oSettings = _fnSettingsFromNode(this[DataTable.ext.iApiIndex]);
			_fnAdjustColumnSizing( oSettings );
			
			if ( bRedraw === undefined || bRedraw )
			{
				this.fnDraw( false );
			}
			else if ( oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "" )
			{
				/* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
				this.oApi._fnScrollDraw(oSettings);
			}
		};
		
		
		/**
		 * Quickly and simply clear a table
		 *  @param {bool} [bRedraw=true] redraw the table or not
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      
		 *      // Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
		 *      oTable.fnClearTable();
		 *    } );
		 */
		this.fnClearTable = function( bRedraw )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			_fnClearTable( oSettings );
			
			if ( bRedraw === undefined || bRedraw )
			{
				_fnDraw( oSettings );
			}
		};
		
		
		/**
		 * The exact opposite of 'opening' a row, this function will close any rows which 
		 * are currently 'open'.
		 *  @param {node} nTr the table row to 'close'
		 *  @returns {int} 0 on success, or 1 if failed (can't find the row)
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *      
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *      
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnClose = function( nTr )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			
			for ( var i=0 ; i<oSettings.aoOpenRows.length ; i++ )
			{
				if ( oSettings.aoOpenRows[i].nParent == nTr )
				{
					var nTrParent = oSettings.aoOpenRows[i].nTr.parentNode;
					if ( nTrParent )
					{
						/* Remove it if it is currently on display */
						nTrParent.removeChild( oSettings.aoOpenRows[i].nTr );
					}
					oSettings.aoOpenRows.splice( i, 1 );
					return 0;
				}
			}
			return 1;
		};
		
		
		/**
		 * Remove a row for the table
		 *  @param {mixed} mTarget The index of the row from aoData to be deleted, or
		 *    the TR element you want to delete
		 *  @param {function|null} [fnCallBack] Callback function
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @returns {array} The row that was deleted
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      
		 *      // Immediately remove the first row
		 *      oTable.fnDeleteRow( 0 );
		 *    } );
		 */
		this.fnDeleteRow = function( mTarget, fnCallBack, bRedraw )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var i, iLen, iAODataIndex;
			
			iAODataIndex = (typeof mTarget === 'object') ? 
				_fnNodeToDataIndex(oSettings, mTarget) : mTarget;
			
			/* Return the data array from this row */
			var oData = oSettings.aoData.splice( iAODataIndex, 1 );
		
			/* Update the _DT_RowIndex parameter */
			for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoData[i].nTr !== null )
				{
					oSettings.aoData[i].nTr._DT_RowIndex = i;
				}
			}
			
			/* Remove the target row from the search array */
			var iDisplayIndex = $.inArray( iAODataIndex, oSettings.aiDisplay );
			oSettings.asDataSearch.splice( iDisplayIndex, 1 );
			
			/* Delete from the display arrays */
			_fnDeleteIndex( oSettings.aiDisplayMaster, iAODataIndex );
			_fnDeleteIndex( oSettings.aiDisplay, iAODataIndex );
			
			/* If there is a user callback function - call it */
			if ( typeof fnCallBack === "function" )
			{
				fnCallBack.call( this, oSettings, oData );
			}
			
			/* Check for an 'overflow' they case for displaying the table */
			if ( oSettings._iDisplayStart >= oSettings.fnRecordsDisplay() )
			{
				oSettings._iDisplayStart -= oSettings._iDisplayLength;
				if ( oSettings._iDisplayStart < 0 )
				{
					oSettings._iDisplayStart = 0;
				}
			}
			
			if ( bRedraw === undefined || bRedraw )
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
			
			return oData;
		};
		
		
		/**
		 * Restore the table to it's original state in the DOM by removing all of DataTables 
		 * enhancements, alterations to the DOM structure of the table and event listeners.
		 *  @param {boolean} [bRemove=false] Completely remove the table from the DOM
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      // This example is fairly pointless in reality, but shows how fnDestroy can be used
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnDestroy();
		 *    } );
		 */
		this.fnDestroy = function ( bRemove )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var nOrig = oSettings.nTableWrapper.parentNode;
			var nBody = oSettings.nTBody;
			var i, iLen;
		
			bRemove = (bRemove===undefined) ? false : bRemove;
			
			/* Flag to note that the table is currently being destroyed - no action should be taken */
			oSettings.bDestroying = true;
			
			/* Fire off the destroy callbacks for plug-ins etc */
			_fnCallbackFire( oSettings, "aoDestroyCallback", "destroy", [oSettings] );
		
			/* If the table is not being removed, restore the hidden columns */
			if ( !bRemove )
			{
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible === false )
					{
						this.fnSetColumnVis( i, true );
					}
				}
			}
			
			/* Blitz all DT events */
			$(oSettings.nTableWrapper).find('*').andSelf().unbind('.DT');
			
			/* If there is an 'empty' indicator row, remove it */
			$('tbody>tr>td.'+oSettings.oClasses.sRowEmpty, oSettings.nTable).parent().remove();
			
			/* When scrolling we had to break the table up - restore it */
			if ( oSettings.nTable != oSettings.nTHead.parentNode )
			{
				$(oSettings.nTable).children('thead').remove();
				oSettings.nTable.appendChild( oSettings.nTHead );
			}
			
			if ( oSettings.nTFoot && oSettings.nTable != oSettings.nTFoot.parentNode )
			{
				$(oSettings.nTable).children('tfoot').remove();
				oSettings.nTable.appendChild( oSettings.nTFoot );
			}
			
			/* Remove the DataTables generated nodes, events and classes */
			oSettings.nTable.parentNode.removeChild( oSettings.nTable );
			$(oSettings.nTableWrapper).remove();
			
			oSettings.aaSorting = [];
			oSettings.aaSortingFixed = [];
			_fnSortingClasses( oSettings );
			
			$(_fnGetTrNodes( oSettings )).removeClass( oSettings.asStripeClasses.join(' ') );
			
			$('th, td', oSettings.nTHead).removeClass( [
				oSettings.oClasses.sSortable,
				oSettings.oClasses.sSortableAsc,
				oSettings.oClasses.sSortableDesc,
				oSettings.oClasses.sSortableNone ].join(' ')
			);
			if ( oSettings.bJUI )
			{
				$('th span.'+oSettings.oClasses.sSortIcon
					+ ', td span.'+oSettings.oClasses.sSortIcon, oSettings.nTHead).remove();
		
				$('th, td', oSettings.nTHead).each( function () {
					var jqWrapper = $('div.'+oSettings.oClasses.sSortJUIWrapper, this);
					var kids = jqWrapper.contents();
					$(this).append( kids );
					jqWrapper.remove();
				} );
			}
			
			/* Add the TR elements back into the table in their original order */
			if ( !bRemove && oSettings.nTableReinsertBefore )
			{
				nOrig.insertBefore( oSettings.nTable, oSettings.nTableReinsertBefore );
			}
			else if ( !bRemove )
			{
				nOrig.appendChild( oSettings.nTable );
			}
		
			for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
			{
				if ( oSettings.aoData[i].nTr !== null )
				{
					nBody.appendChild( oSettings.aoData[i].nTr );
				}
			}
			
			/* Restore the width of the original table */
			if ( oSettings.oFeatures.bAutoWidth === true )
			{
			  oSettings.nTable.style.width = _fnStringToCss(oSettings.sDestroyWidth);
			}
			
			/* If the were originally stripe classes - then we add them back here. Note
			 * this is not fool proof (for example if not all rows had stripe classes - but
			 * it's a good effort without getting carried away
			 */
			iLen = oSettings.asDestroyStripes.length;
			if (iLen)
			{
				var anRows = $(nBody).children('tr');
				for ( i=0 ; i<iLen ; i++ )
				{
					anRows.filter(':nth-child(' + iLen + 'n + ' + i + ')').addClass( oSettings.asDestroyStripes[i] );
				}
			}
			
			/* Remove the settings object from the settings array */
			for ( i=0, iLen=DataTable.settings.length ; i<iLen ; i++ )
			{
				if ( DataTable.settings[i] == oSettings )
				{
					DataTable.settings.splice( i, 1 );
				}
			}
			
			/* End it all */
			oSettings = null;
			oInit = null;
		};
		
		
		/**
		 * Redraw the table
		 *  @param {bool} [bComplete=true] Re-filter and resort (if enabled) the table before the draw.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      
		 *      // Re-draw the table - you wouldn't want to do it here, but it's an example :-)
		 *      oTable.fnDraw();
		 *    } );
		 */
		this.fnDraw = function( bComplete )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			if ( bComplete === false )
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
			else
			{
				_fnReDraw( oSettings );
			}
		};
		
		
		/**
		 * Filter the input based on data
		 *  @param {string} sInput String to filter the table on
		 *  @param {int|null} [iColumn] Column to limit filtering to
		 *  @param {bool} [bRegex=false] Treat as regular expression or not
		 *  @param {bool} [bSmart=true] Perform smart filtering or not
		 *  @param {bool} [bShowGlobal=true] Show the input global filter in it's input box(es)
		 *  @param {bool} [bCaseInsensitive=true] Do case-insensitive matching (true) or not (false)
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      
		 *      // Sometime later - filter...
		 *      oTable.fnFilter( 'test string' );
		 *    } );
		 */
		this.fnFilter = function( sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			
			if ( !oSettings.oFeatures.bFilter )
			{
				return;
			}
			
			if ( bRegex === undefined || bRegex === null )
			{
				bRegex = false;
			}
			
			if ( bSmart === undefined || bSmart === null )
			{
				bSmart = true;
			}
			
			if ( bShowGlobal === undefined || bShowGlobal === null )
			{
				bShowGlobal = true;
			}
			
			if ( bCaseInsensitive === undefined || bCaseInsensitive === null )
			{
				bCaseInsensitive = true;
			}
			
			if ( iColumn === undefined || iColumn === null )
			{
				/* Global filter */
				_fnFilterComplete( oSettings, {
					"sSearch":sInput+"",
					"bRegex": bRegex,
					"bSmart": bSmart,
					"bCaseInsensitive": bCaseInsensitive
				}, 1 );
				
				if ( bShowGlobal && oSettings.aanFeatures.f )
				{
					var n = oSettings.aanFeatures.f;
					for ( var i=0, iLen=n.length ; i<iLen ; i++ )
					{
						// IE9 throws an 'unknown error' if document.activeElement is used
						// inside an iframe or frame...
						try {
							if ( n[i]._DT_Input != document.activeElement )
							{
								$(n[i]._DT_Input).val( sInput );
							}
						}
						catch ( e ) {
							$(n[i]._DT_Input).val( sInput );
						}
					}
				}
			}
			else
			{
				/* Single column filter */
				$.extend( oSettings.aoPreSearchCols[ iColumn ], {
					"sSearch": sInput+"",
					"bRegex": bRegex,
					"bSmart": bSmart,
					"bCaseInsensitive": bCaseInsensitive
				} );
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch, 1 );
			}
		};
		
		
		/**
		 * Get the data for the whole table, an individual row or an individual cell based on the 
		 * provided parameters.
		 *  @param {int|node} [mRow] A TR row node, TD/TH cell node or an integer. If given as
		 *    a TR node then the data source for the whole row will be returned. If given as a
		 *    TD/TH cell node then iCol will be automatically calculated and the data for the
		 *    cell returned. If given as an integer, then this is treated as the aoData internal
		 *    data index for the row (see fnGetPosition) and the data for that row used.
		 *  @param {int} [iCol] Optional column index that you want the data of.
		 *  @returns {array|object|string} If mRow is undefined, then the data for all rows is
		 *    returned. If mRow is defined, just data for that row, and is iCol is
		 *    defined, only data for the designated cell is returned.
		 *  @dtopt API
		 *
		 *  @example
		 *    // Row data
		 *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('tr').click( function () {
		 *        var data = oTable.fnGetData( this );
		 *        // ... do something with the array / object of data for the row
		 *      } );
		 *    } );
		 *
		 *  @example
		 *    // Individual cell data
		 *    $(document).ready(function() {
		 *      oTable = $('#example').dataTable();
		 *
		 *      oTable.$('td').click( function () {
		 *        var sData = oTable.fnGetData( this );
		 *        alert( 'The cell clicked on had the value of '+sData );
		 *      } );
		 *    } );
		 */
		this.fnGetData = function( mRow, iCol )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			
			if ( mRow !== undefined )
			{
				var iRow = mRow;
				if ( typeof mRow === 'object' )
				{
					var sNode = mRow.nodeName.toLowerCase();
					if (sNode === "tr" )
					{
						iRow = _fnNodeToDataIndex(oSettings, mRow);
					}
					else if ( sNode === "td" )
					{
						iRow = _fnNodeToDataIndex(oSettings, mRow.parentNode);
						iCol = _fnNodeToColumnIndex( oSettings, iRow, mRow );
					}
				}
		
				if ( iCol !== undefined )
				{
					return _fnGetCellData( oSettings, iRow, iCol, '' );
				}
				return (oSettings.aoData[iRow]!==undefined) ?
					oSettings.aoData[iRow]._aData : null;
			}
			return _fnGetDataMaster( oSettings );
		};
		
		
		/**
		 * Get an array of the TR nodes that are used in the table's body. Note that you will 
		 * typically want to use the '$' API method in preference to this as it is more 
		 * flexible.
		 *  @param {int} [iRow] Optional row index for the TR element you want
		 *  @returns {array|node} If iRow is undefined, returns an array of all TR elements
		 *    in the table's body, or iRow is defined, just the TR element requested.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      
		 *      // Get the nodes from the table
		 *      var nNodes = oTable.fnGetNodes( );
		 *    } );
		 */
		this.fnGetNodes = function( iRow )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			
			if ( iRow !== undefined ) {
				return (oSettings.aoData[iRow]!==undefined) ?
					oSettings.aoData[iRow].nTr : null;
			}
			return _fnGetTrNodes( oSettings );
		};
		
		
		/**
		 * Get the array indexes of a particular cell from it's DOM element
		 * and column index including hidden columns
		 *  @param {node} nNode this can either be a TR, TD or TH in the table's body
		 *  @returns {int} If nNode is given as a TR, then a single index is returned, or
		 *    if given as a cell, an array of [row index, column index (visible), 
		 *    column index (all)] is given.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      $('#example tbody td').click( function () {
		 *        // Get the position of the current data from the node
		 *        var aPos = oTable.fnGetPosition( this );
		 *        
		 *        // Get the data array for this row
		 *        var aData = oTable.fnGetData( aPos[0] );
		 *        
		 *        // Update the data array and return the value
		 *        aData[ aPos[1] ] = 'clicked';
		 *        this.innerHTML = 'clicked';
		 *      } );
		 *      
		 *      // Init DataTables
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnGetPosition = function( nNode )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var sNodeName = nNode.nodeName.toUpperCase();
			
			if ( sNodeName == "TR" )
			{
				return _fnNodeToDataIndex(oSettings, nNode);
			}
			else if ( sNodeName == "TD" || sNodeName == "TH" )
			{
				var iDataIndex = _fnNodeToDataIndex( oSettings, nNode.parentNode );
				var iColumnIndex = _fnNodeToColumnIndex( oSettings, iDataIndex, nNode );
				return [ iDataIndex, _fnColumnIndexToVisible(oSettings, iColumnIndex ), iColumnIndex ];
			}
			return null;
		};
		
		
		/**
		 * Check to see if a row is 'open' or not.
		 *  @param {node} nTr the table row to check
		 *  @returns {boolean} true if the row is currently open, false otherwise
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *      
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *      
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnIsOpen = function( nTr )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var aoOpenRows = oSettings.aoOpenRows;
			
			for ( var i=0 ; i<oSettings.aoOpenRows.length ; i++ )
			{
				if ( oSettings.aoOpenRows[i].nParent == nTr )
				{
					return true;
				}
			}
			return false;
		};
		
		
		/**
		 * This function will place a new row directly after a row which is currently 
		 * on display on the page, with the HTML contents that is passed into the 
		 * function. This can be used, for example, to ask for confirmation that a 
		 * particular record should be deleted.
		 *  @param {node} nTr The table row to 'open'
		 *  @param {string|node|jQuery} mHtml The HTML to put into the row
		 *  @param {string} sClass Class to give the new TD cell
		 *  @returns {node} The row opened. Note that if the table row passed in as the
		 *    first parameter, is not found in the table, this method will silently
		 *    return.
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable;
		 *      
		 *      // 'open' an information row when a row is clicked on
		 *      $('#example tbody tr').click( function () {
		 *        if ( oTable.fnIsOpen(this) ) {
		 *          oTable.fnClose( this );
		 *        } else {
		 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
		 *        }
		 *      } );
		 *      
		 *      oTable = $('#example').dataTable();
		 *    } );
		 */
		this.fnOpen = function( nTr, mHtml, sClass )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
		
			/* Check that the row given is in the table */
			var nTableRows = _fnGetTrNodes( oSettings );
			if ( $.inArray(nTr, nTableRows) === -1 )
			{
				return;
			}
			
			/* the old open one if there is one */
			this.fnClose( nTr );
			
			var nNewRow = document.createElement("tr");
			var nNewCell = document.createElement("td");
			nNewRow.appendChild( nNewCell );
			nNewCell.className = sClass;
			nNewCell.colSpan = _fnVisbleColumns( oSettings );
		
			if (typeof mHtml === "string")
			{
				nNewCell.innerHTML = mHtml;
			}
			else
			{
				$(nNewCell).html( mHtml );
			}
		
			/* If the nTr isn't on the page at the moment - then we don't insert at the moment */
			var nTrs = $('tr', oSettings.nTBody);
			if ( $.inArray(nTr, nTrs) != -1  )
			{
				$(nNewRow).insertAfter(nTr);
			}
			
			oSettings.aoOpenRows.push( {
				"nTr": nNewRow,
				"nParent": nTr
			} );
			
			return nNewRow;
		};
		
		
		/**
		 * Change the pagination - provides the internal logic for pagination in a simple API 
		 * function. With this function you can have a DataTables table go to the next, 
		 * previous, first or last pages.
		 *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
		 *    or page number to jump to (integer), note that page 0 is the first page.
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnPageChange( 'next' );
		 *    } );
		 */
		this.fnPageChange = function ( mAction, bRedraw )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			_fnPageChange( oSettings, mAction );
			_fnCalculateEnd( oSettings );
			
			if ( bRedraw === undefined || bRedraw )
			{
				_fnDraw( oSettings );
			}
		};
		
		
		/**
		 * Show a particular column
		 *  @param {int} iCol The column whose display should be changed
		 *  @param {bool} bShow Show (true) or hide (false) the column
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      
		 *      // Hide the second column after initialisation
		 *      oTable.fnSetColumnVis( 1, false );
		 *    } );
		 */
		this.fnSetColumnVis = function ( iCol, bShow, bRedraw )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var i, iLen;
			var aoColumns = oSettings.aoColumns;
			var aoData = oSettings.aoData;
			var nTd, bAppend, iBefore;
			
			/* No point in doing anything if we are requesting what is already true */
			if ( aoColumns[iCol].bVisible == bShow )
			{
				return;
			}
			
			/* Show the column */
			if ( bShow )
			{
				var iInsert = 0;
				for ( i=0 ; i<iCol ; i++ )
				{
					if ( aoColumns[i].bVisible )
					{
						iInsert++;
					}
				}
				
				/* Need to decide if we should use appendChild or insertBefore */
				bAppend = (iInsert >= _fnVisbleColumns( oSettings ));
		
				/* Which coloumn should we be inserting before? */
				if ( !bAppend )
				{
					for ( i=iCol ; i<aoColumns.length ; i++ )
					{
						if ( aoColumns[i].bVisible )
						{
							iBefore = i;
							break;
						}
					}
				}
		
				for ( i=0, iLen=aoData.length ; i<iLen ; i++ )
				{
					if ( aoData[i].nTr !== null )
					{
						if ( bAppend )
						{
							aoData[i].nTr.appendChild( 
								aoData[i]._anHidden[iCol]
							);
						}
						else
						{
							aoData[i].nTr.insertBefore(
								aoData[i]._anHidden[iCol], 
								_fnGetTdNodes( oSettings, i )[iBefore] );
						}
					}
				}
			}
			else
			{
				/* Remove a column from display */
				for ( i=0, iLen=aoData.length ; i<iLen ; i++ )
				{
					if ( aoData[i].nTr !== null )
					{
						nTd = _fnGetTdNodes( oSettings, i )[iCol];
						aoData[i]._anHidden[iCol] = nTd;
						nTd.parentNode.removeChild( nTd );
					}
				}
			}
		
			/* Clear to set the visible flag */
			aoColumns[iCol].bVisible = bShow;
		
			/* Redraw the header and footer based on the new column visibility */
			_fnDrawHead( oSettings, oSettings.aoHeader );
			if ( oSettings.nTFoot )
			{
				_fnDrawHead( oSettings, oSettings.aoFooter );
			}
			
			/* If there are any 'open' rows, then we need to alter the colspan for this col change */
			for ( i=0, iLen=oSettings.aoOpenRows.length ; i<iLen ; i++ )
			{
				oSettings.aoOpenRows[i].nTr.colSpan = _fnVisbleColumns( oSettings );
			}
			
			/* Do a redraw incase anything depending on the table columns needs it 
			 * (built-in: scrolling) 
			 */
			if ( bRedraw === undefined || bRedraw )
			{
				_fnAdjustColumnSizing( oSettings );
				_fnDraw( oSettings );
			}
			
			_fnSaveState( oSettings );
		};
		
		
		/**
		 * Get the settings for a particular table for external manipulation
		 *  @returns {object} DataTables settings object. See 
		 *    {@link DataTable.models.oSettings}
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      var oSettings = oTable.fnSettings();
		 *      
		 *      // Show an example parameter from the settings
		 *      alert( oSettings._iDisplayStart );
		 *    } );
		 */
		this.fnSettings = function()
		{
			return _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
		};
		
		
		/**
		 * Sort the table by a particular column
		 *  @param {int} iCol the data index to sort on. Note that this will not match the 
		 *    'display index' if you have hidden data entries
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      
		 *      // Sort immediately with columns 0 and 1
		 *      oTable.fnSort( [ [0,'asc'], [1,'asc'] ] );
		 *    } );
		 */
		this.fnSort = function( aaSort )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			oSettings.aaSorting = aaSort;
			_fnSort( oSettings );
		};
		
		
		/**
		 * Attach a sort listener to an element for a given column
		 *  @param {node} nNode the element to attach the sort listener to
		 *  @param {int} iColumn the column that a click on this node will sort on
		 *  @param {function} [fnCallback] callback function when sort is run
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      
		 *      // Sort on column 1, when 'sorter' is clicked on
		 *      oTable.fnSortListener( document.getElementById('sorter'), 1 );
		 *    } );
		 */
		this.fnSortListener = function( nNode, iColumn, fnCallback )
		{
			_fnSortAttachListener( _fnSettingsFromNode( this[DataTable.ext.iApiIndex] ), nNode, iColumn,
			 	fnCallback );
		};
		
		
		/**
		 * Update a table cell or row - this method will accept either a single value to
		 * update the cell with, an array of values with one element for each column or
		 * an object in the same format as the original data source. The function is
		 * self-referencing in order to make the multi column updates easier.
		 *  @param {object|array|string} mData Data to update the cell/row with
		 *  @param {node|int} mRow TR element you want to update or the aoData index
		 *  @param {int} [iColumn] The column to update (not used of mData is an array or object)
		 *  @param {bool} [bRedraw=true] Redraw the table or not
		 *  @param {bool} [bAction=true] Perform pre-draw actions or not
		 *  @returns {int} 0 on success, 1 on error
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      oTable.fnUpdate( 'Example update', 0, 0 ); // Single cell
		 *      oTable.fnUpdate( ['a', 'b', 'c', 'd', 'e'], 1, 0 ); // Row
		 *    } );
		 */
		this.fnUpdate = function( mData, mRow, iColumn, bRedraw, bAction )
		{
			var oSettings = _fnSettingsFromNode( this[DataTable.ext.iApiIndex] );
			var i, iLen, sDisplay;
			var iRow = (typeof mRow === 'object') ? 
				_fnNodeToDataIndex(oSettings, mRow) : mRow;
			
			if ( $.isArray(mData) && iColumn === undefined )
			{
				/* Array update - update the whole row */
				oSettings.aoData[iRow]._aData = mData.slice();
				
				/* Flag to the function that we are recursing */
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					this.fnUpdate( _fnGetCellData( oSettings, iRow, i ), iRow, i, false, false );
				}
			}
			else if ( $.isPlainObject(mData) && iColumn === undefined )
			{
				/* Object update - update the whole row - assume the developer gets the object right */
				oSettings.aoData[iRow]._aData = $.extend( true, {}, mData );
		
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					this.fnUpdate( _fnGetCellData( oSettings, iRow, i ), iRow, i, false, false );
				}
			}
			else
			{
				/* Individual cell update */
				_fnSetCellData( oSettings, iRow, iColumn, mData );
				sDisplay = _fnGetCellData( oSettings, iRow, iColumn, 'display' );
				
				var oCol = oSettings.aoColumns[iColumn];
				if ( oCol.fnRender !== null )
				{
					sDisplay = _fnRender( oSettings, iRow, iColumn );
					if ( oCol.bUseRendered )
					{
						_fnSetCellData( oSettings, iRow, iColumn, sDisplay );
					}
				}
				
				if ( oSettings.aoData[iRow].nTr !== null )
				{
					/* Do the actual HTML update */
					_fnGetTdNodes( oSettings, iRow )[iColumn].innerHTML = sDisplay;
				}
			}
			
			/* Modify the search index for this row (strictly this is likely not needed, since fnReDraw
			 * will rebuild the search array - however, the redraw might be disabled by the user)
			 */
			var iDisplayIndex = $.inArray( iRow, oSettings.aiDisplay );
			oSettings.asDataSearch[iDisplayIndex] = _fnBuildSearchRow(
				oSettings, 
				_fnGetRowData( oSettings, iRow, 'filter', _fnGetColumns( oSettings, 'bSearchable' ) )
			);
			
			/* Perform pre-draw actions */
			if ( bAction === undefined || bAction )
			{
				_fnAdjustColumnSizing( oSettings );
			}
			
			/* Redraw the table */
			if ( bRedraw === undefined || bRedraw )
			{
				_fnReDraw( oSettings );
			}
			return 0;
		};
		
		
		/**
		 * Provide a common method for plug-ins to check the version of DataTables being used, in order
		 * to ensure compatibility.
		 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
		 *    formats "X" and "X.Y" are also acceptable.
		 *  @returns {boolean} true if this version of DataTables is greater or equal to the required
		 *    version, or false if this version of DataTales is not suitable
		 *  @method
		 *  @dtopt API
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
		 *    } );
		 */
		this.fnVersionCheck = DataTable.ext.fnVersionCheck;
		
		
		/*
		 * This is really a good bit rubbish this method of exposing the internal methods
		 * publicly... - To be fixed in 2.0 using methods on the prototype
		 */
		
		
		/**
		 * Create a wrapper function for exporting an internal functions to an external API.
		 *  @param {string} sFunc API function name
		 *  @returns {function} wrapped function
		 *  @memberof DataTable#oApi
		 */
		function _fnExternApiFunc (sFunc)
		{
			return function() {
				var aArgs = [_fnSettingsFromNode(this[DataTable.ext.iApiIndex])].concat( 
					Array.prototype.slice.call(arguments) );
				return DataTable.ext.oApi[sFunc].apply( this, aArgs );
			};
		}
		
		
		/**
		 * Reference to internal functions for use by plug-in developers. Note that these
		 * methods are references to internal functions and are considered to be private.
		 * If you use these methods, be aware that they are liable to change between versions
		 * (check the upgrade notes).
		 *  @namespace
		 */
		this.oApi = {
			"_fnExternApiFunc": _fnExternApiFunc,
			"_fnInitialise": _fnInitialise,
			"_fnInitComplete": _fnInitComplete,
			"_fnLanguageCompat": _fnLanguageCompat,
			"_fnAddColumn": _fnAddColumn,
			"_fnColumnOptions": _fnColumnOptions,
			"_fnAddData": _fnAddData,
			"_fnCreateTr": _fnCreateTr,
			"_fnGatherData": _fnGatherData,
			"_fnBuildHead": _fnBuildHead,
			"_fnDrawHead": _fnDrawHead,
			"_fnDraw": _fnDraw,
			"_fnReDraw": _fnReDraw,
			"_fnAjaxUpdate": _fnAjaxUpdate,
			"_fnAjaxParameters": _fnAjaxParameters,
			"_fnAjaxUpdateDraw": _fnAjaxUpdateDraw,
			"_fnServerParams": _fnServerParams,
			"_fnAddOptionsHtml": _fnAddOptionsHtml,
			"_fnFeatureHtmlTable": _fnFeatureHtmlTable,
			"_fnScrollDraw": _fnScrollDraw,
			"_fnAdjustColumnSizing": _fnAdjustColumnSizing,
			"_fnFeatureHtmlFilter": _fnFeatureHtmlFilter,
			"_fnFilterComplete": _fnFilterComplete,
			"_fnFilterCustom": _fnFilterCustom,
			"_fnFilterColumn": _fnFilterColumn,
			"_fnFilter": _fnFilter,
			"_fnBuildSearchArray": _fnBuildSearchArray,
			"_fnBuildSearchRow": _fnBuildSearchRow,
			"_fnFilterCreateSearch": _fnFilterCreateSearch,
			"_fnDataToSearch": _fnDataToSearch,
			"_fnSort": _fnSort,
			"_fnSortAttachListener": _fnSortAttachListener,
			"_fnSortingClasses": _fnSortingClasses,
			"_fnFeatureHtmlPaginate": _fnFeatureHtmlPaginate,
			"_fnPageChange": _fnPageChange,
			"_fnFeatureHtmlInfo": _fnFeatureHtmlInfo,
			"_fnUpdateInfo": _fnUpdateInfo,
			"_fnFeatureHtmlLength": _fnFeatureHtmlLength,
			"_fnFeatureHtmlProcessing": _fnFeatureHtmlProcessing,
			"_fnProcessingDisplay": _fnProcessingDisplay,
			"_fnVisibleToColumnIndex": _fnVisibleToColumnIndex,
			"_fnColumnIndexToVisible": _fnColumnIndexToVisible,
			"_fnNodeToDataIndex": _fnNodeToDataIndex,
			"_fnVisbleColumns": _fnVisbleColumns,
			"_fnCalculateEnd": _fnCalculateEnd,
			"_fnConvertToWidth": _fnConvertToWidth,
			"_fnCalculateColumnWidths": _fnCalculateColumnWidths,
			"_fnScrollingWidthAdjust": _fnScrollingWidthAdjust,
			"_fnGetWidestNode": _fnGetWidestNode,
			"_fnGetMaxLenString": _fnGetMaxLenString,
			"_fnStringToCss": _fnStringToCss,
			"_fnDetectType": _fnDetectType,
			"_fnSettingsFromNode": _fnSettingsFromNode,
			"_fnGetDataMaster": _fnGetDataMaster,
			"_fnGetTrNodes": _fnGetTrNodes,
			"_fnGetTdNodes": _fnGetTdNodes,
			"_fnEscapeRegex": _fnEscapeRegex,
			"_fnDeleteIndex": _fnDeleteIndex,
			"_fnReOrderIndex": _fnReOrderIndex,
			"_fnColumnOrdering": _fnColumnOrdering,
			"_fnLog": _fnLog,
			"_fnClearTable": _fnClearTable,
			"_fnSaveState": _fnSaveState,
			"_fnLoadState": _fnLoadState,
			"_fnCreateCookie": _fnCreateCookie,
			"_fnReadCookie": _fnReadCookie,
			"_fnDetectHeader": _fnDetectHeader,
			"_fnGetUniqueThs": _fnGetUniqueThs,
			"_fnScrollBarWidth": _fnScrollBarWidth,
			"_fnApplyToChildren": _fnApplyToChildren,
			"_fnMap": _fnMap,
			"_fnGetRowData": _fnGetRowData,
			"_fnGetCellData": _fnGetCellData,
			"_fnSetCellData": _fnSetCellData,
			"_fnGetObjectDataFn": _fnGetObjectDataFn,
			"_fnSetObjectDataFn": _fnSetObjectDataFn,
			"_fnApplyColumnDefs": _fnApplyColumnDefs,
			"_fnBindAction": _fnBindAction,
			"_fnExtend": _fnExtend,
			"_fnCallbackReg": _fnCallbackReg,
			"_fnCallbackFire": _fnCallbackFire,
			"_fnJsonString": _fnJsonString,
			"_fnRender": _fnRender,
			"_fnNodeToColumnIndex": _fnNodeToColumnIndex,
			"_fnInfoMacros": _fnInfoMacros,
			"_fnBrowserDetect": _fnBrowserDetect,
			"_fnGetColumns": _fnGetColumns
		};
		
		$.extend( DataTable.ext.oApi, this.oApi );
		
		for ( var sFunc in DataTable.ext.oApi )
		{
			if ( sFunc )
			{
				this[sFunc] = _fnExternApiFunc(sFunc);
			}
		}
		
		
		var _that = this;
		this.each(function() {
			var i=0, iLen, j, jLen, k, kLen;
			var sId = this.getAttribute( 'id' );
			var bInitHandedOff = false;
			var bUsePassedData = false;
			
			
			/* Sanity check */
			if ( this.nodeName.toLowerCase() != 'table' )
			{
				_fnLog( null, 0, "Attempted to initialise DataTables on a node which is not a "+
					"table: "+this.nodeName );
				return;
			}
			
			/* Check to see if we are re-initialising a table */
			for ( i=0, iLen=DataTable.settings.length ; i<iLen ; i++ )
			{
				/* Base check on table node */
				if ( DataTable.settings[i].nTable == this )
				{
					if ( oInit === undefined || oInit.bRetrieve )
					{
						return DataTable.settings[i].oInstance;
					}
					else if ( oInit.bDestroy )
					{
						DataTable.settings[i].oInstance.fnDestroy();
						break;
					}
					else
					{
						_fnLog( DataTable.settings[i], 0, "Cannot reinitialise DataTable.\n\n"+
							"To retrieve the DataTables object for this table, pass no arguments or see "+
							"the docs for bRetrieve and bDestroy" );
						return;
					}
				}
				
				/* If the element we are initialising has the same ID as a table which was previously
				 * initialised, but the table nodes don't match (from before) then we destroy the old
				 * instance by simply deleting it. This is under the assumption that the table has been
				 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
				 */
				if ( DataTable.settings[i].sTableId == this.id )
				{
					DataTable.settings.splice( i, 1 );
					break;
				}
			}
			
			/* Ensure the table has an ID - required for accessibility */
			if ( sId === null || sId === "" )
			{
				sId = "DataTables_Table_"+(DataTable.ext._oExternConfig.iNextUnique++);
				this.id = sId;
			}
			
			/* Create the settings object for this table and set some of the default parameters */
			var oSettings = $.extend( true, {}, DataTable.models.oSettings, {
				"nTable":        this,
				"oApi":          _that.oApi,
				"oInit":         oInit,
				"sDestroyWidth": $(this).width(),
				"sInstance":     sId,
				"sTableId":      sId
			} );
			DataTable.settings.push( oSettings );
			
			// Need to add the instance after the instance after the settings object has been added
			// to the settings array, so we can self reference the table instance if more than one
			oSettings.oInstance = (_that.length===1) ? _that : $(this).dataTable();
			
			/* Setting up the initialisation object */
			if ( !oInit )
			{
				oInit = {};
			}
			
			// Backwards compatibility, before we apply all the defaults
			if ( oInit.oLanguage )
			{
				_fnLanguageCompat( oInit.oLanguage );
			}
			
			oInit = _fnExtend( $.extend(true, {}, DataTable.defaults), oInit );
			
			// Map the initialisation options onto the settings object
			_fnMap( oSettings.oFeatures, oInit, "bPaginate" );
			_fnMap( oSettings.oFeatures, oInit, "bLengthChange" );
			_fnMap( oSettings.oFeatures, oInit, "bFilter" );
			_fnMap( oSettings.oFeatures, oInit, "bSort" );
			_fnMap( oSettings.oFeatures, oInit, "bInfo" );
			_fnMap( oSettings.oFeatures, oInit, "bProcessing" );
			_fnMap( oSettings.oFeatures, oInit, "bAutoWidth" );
			_fnMap( oSettings.oFeatures, oInit, "bSortClasses" );
			_fnMap( oSettings.oFeatures, oInit, "bServerSide" );
			_fnMap( oSettings.oFeatures, oInit, "bDeferRender" );
			_fnMap( oSettings.oScroll, oInit, "sScrollX", "sX" );
			_fnMap( oSettings.oScroll, oInit, "sScrollXInner", "sXInner" );
			_fnMap( oSettings.oScroll, oInit, "sScrollY", "sY" );
			_fnMap( oSettings.oScroll, oInit, "bScrollCollapse", "bCollapse" );
			_fnMap( oSettings.oScroll, oInit, "bScrollInfinite", "bInfinite" );
			_fnMap( oSettings.oScroll, oInit, "iScrollLoadGap", "iLoadGap" );
			_fnMap( oSettings.oScroll, oInit, "bScrollAutoCss", "bAutoCss" );
			_fnMap( oSettings, oInit, "asStripeClasses" );
			_fnMap( oSettings, oInit, "asStripClasses", "asStripeClasses" ); // legacy
			_fnMap( oSettings, oInit, "fnServerData" );
			_fnMap( oSettings, oInit, "fnFormatNumber" );
			_fnMap( oSettings, oInit, "sServerMethod" );
			_fnMap( oSettings, oInit, "aaSorting" );
			_fnMap( oSettings, oInit, "aaSortingFixed" );
			_fnMap( oSettings, oInit, "aLengthMenu" );
			_fnMap( oSettings, oInit, "sPaginationType" );
			_fnMap( oSettings, oInit, "sAjaxSource" );
			_fnMap( oSettings, oInit, "sAjaxDataProp" );
			_fnMap( oSettings, oInit, "iCookieDuration" );
			_fnMap( oSettings, oInit, "sCookiePrefix" );
			_fnMap( oSettings, oInit, "sDom" );
			_fnMap( oSettings, oInit, "bSortCellsTop" );
			_fnMap( oSettings, oInit, "iTabIndex" );
			_fnMap( oSettings, oInit, "oSearch", "oPreviousSearch" );
			_fnMap( oSettings, oInit, "aoSearchCols", "aoPreSearchCols" );
			_fnMap( oSettings, oInit, "iDisplayLength", "_iDisplayLength" );
			_fnMap( oSettings, oInit, "bJQueryUI", "bJUI" );
			_fnMap( oSettings, oInit, "fnCookieCallback" );
			_fnMap( oSettings, oInit, "fnStateLoad" );
			_fnMap( oSettings, oInit, "fnStateSave" );
			_fnMap( oSettings.oLanguage, oInit, "fnInfoCallback" );
			
			/* Callback functions which are array driven */
			_fnCallbackReg( oSettings, 'aoDrawCallback',       oInit.fnDrawCallback,      'user' );
			_fnCallbackReg( oSettings, 'aoServerParams',       oInit.fnServerParams,      'user' );
			_fnCallbackReg( oSettings, 'aoStateSaveParams',    oInit.fnStateSaveParams,   'user' );
			_fnCallbackReg( oSettings, 'aoStateLoadParams',    oInit.fnStateLoadParams,   'user' );
			_fnCallbackReg( oSettings, 'aoStateLoaded',        oInit.fnStateLoaded,       'user' );
			_fnCallbackReg( oSettings, 'aoRowCallback',        oInit.fnRowCallback,       'user' );
			_fnCallbackReg( oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow,        'user' );
			_fnCallbackReg( oSettings, 'aoHeaderCallback',     oInit.fnHeaderCallback,    'user' );
			_fnCallbackReg( oSettings, 'aoFooterCallback',     oInit.fnFooterCallback,    'user' );
			_fnCallbackReg( oSettings, 'aoInitComplete',       oInit.fnInitComplete,      'user' );
			_fnCallbackReg( oSettings, 'aoPreDrawCallback',    oInit.fnPreDrawCallback,   'user' );
			
			if ( oSettings.oFeatures.bServerSide && oSettings.oFeatures.bSort &&
				   oSettings.oFeatures.bSortClasses )
			{
				/* Enable sort classes for server-side processing. Safe to do it here, since server-side
				 * processing must be enabled by the developer
				 */
				_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSortingClasses, 'server_side_sort_classes' );
			}
			else if ( oSettings.oFeatures.bDeferRender )
			{
				_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSortingClasses, 'defer_sort_classes' );
			}
			
			if ( oInit.bJQueryUI )
			{
				/* Use the JUI classes object for display. You could clone the oStdClasses object if 
				 * you want to have multiple tables with multiple independent classes 
				 */
				$.extend( oSettings.oClasses, DataTable.ext.oJUIClasses );
				
				if ( oInit.sDom === DataTable.defaults.sDom && DataTable.defaults.sDom === "lfrtip" )
				{
					/* Set the DOM to use a layout suitable for jQuery UI's theming */
					oSettings.sDom = '<"H"lfr>t<"F"ip>';
				}
			}
			else
			{
				$.extend( oSettings.oClasses, DataTable.ext.oStdClasses );
			}
			$(this).addClass( oSettings.oClasses.sTable );
			
			/* Calculate the scroll bar width and cache it for use later on */
			if ( oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "" )
			{
				oSettings.oScroll.iBarWidth = _fnScrollBarWidth();
			}
			
			if ( oSettings.iInitDisplayStart === undefined )
			{
				/* Display start point, taking into account the save saving */
				oSettings.iInitDisplayStart = oInit.iDisplayStart;
				oSettings._iDisplayStart = oInit.iDisplayStart;
			}
			
			/* Must be done after everything which can be overridden by a cookie! */
			if ( oInit.bStateSave )
			{
				oSettings.oFeatures.bStateSave = true;
				_fnLoadState( oSettings, oInit );
				_fnCallbackReg( oSettings, 'aoDrawCallback', _fnSaveState, 'state_save' );
			}
			
			if ( oInit.iDeferLoading !== null )
			{
				oSettings.bDeferLoading = true;
				var tmp = $.isArray( oInit.iDeferLoading );
				oSettings._iRecordsDisplay = tmp ? oInit.iDeferLoading[0] : oInit.iDeferLoading;
				oSettings._iRecordsTotal = tmp ? oInit.iDeferLoading[1] : oInit.iDeferLoading;
			}
			
			if ( oInit.aaData !== null )
			{
				bUsePassedData = true;
			}
			
			/* Language definitions */
			if ( oInit.oLanguage.sUrl !== "" )
			{
				/* Get the language definitions from a file - because this Ajax call makes the language
				 * get async to the remainder of this function we use bInitHandedOff to indicate that 
				 * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
				 */
				oSettings.oLanguage.sUrl = oInit.oLanguage.sUrl;
				$.getJSON( oSettings.oLanguage.sUrl, null, function( json ) {
					_fnLanguageCompat( json );
					$.extend( true, oSettings.oLanguage, oInit.oLanguage, json );
					_fnInitialise( oSettings );
				} );
				bInitHandedOff = true;
			}
			else
			{
				$.extend( true, oSettings.oLanguage, oInit.oLanguage );
			}
			
			
			/*
			 * Stripes
			 */
			if ( oInit.asStripeClasses === null )
			{
				oSettings.asStripeClasses =[
					oSettings.oClasses.sStripeOdd,
					oSettings.oClasses.sStripeEven
				];
			}
			
			/* Remove row stripe classes if they are already on the table row */
			iLen=oSettings.asStripeClasses.length;
			oSettings.asDestroyStripes = [];
			if (iLen)
			{
				var bStripeRemove = false;
				var anRows = $(this).children('tbody').children('tr:lt(' + iLen + ')');
				for ( i=0 ; i<iLen ; i++ )
				{
					if ( anRows.hasClass( oSettings.asStripeClasses[i] ) )
					{
						bStripeRemove = true;
						
						/* Store the classes which we are about to remove so they can be re-added on destroy */
						oSettings.asDestroyStripes.push( oSettings.asStripeClasses[i] );
					}
				}
				
				if ( bStripeRemove )
				{
					anRows.removeClass( oSettings.asStripeClasses.join(' ') );
				}
			}
			
			/*
			 * Columns
			 * See if we should load columns automatically or use defined ones
			 */
			var anThs = [];
			var aoColumnsInit;
			var nThead = this.getElementsByTagName('thead');
			if ( nThead.length !== 0 )
			{
				_fnDetectHeader( oSettings.aoHeader, nThead[0] );
				anThs = _fnGetUniqueThs( oSettings );
			}
			
			/* If not given a column array, generate one with nulls */
			if ( oInit.aoColumns === null )
			{
				aoColumnsInit = [];
				for ( i=0, iLen=anThs.length ; i<iLen ; i++ )
				{
					aoColumnsInit.push( null );
				}
			}
			else
			{
				aoColumnsInit = oInit.aoColumns;
			}
			
			/* Add the columns */
			for ( i=0, iLen=aoColumnsInit.length ; i<iLen ; i++ )
			{
				/* Short cut - use the loop to check if we have column visibility state to restore */
				if ( oInit.saved_aoColumns !== undefined && oInit.saved_aoColumns.length == iLen )
				{
					if ( aoColumnsInit[i] === null )
					{
						aoColumnsInit[i] = {};
					}
					aoColumnsInit[i].bVisible = oInit.saved_aoColumns[i].bVisible;
				}
				
				_fnAddColumn( oSettings, anThs ? anThs[i] : null );
			}
			
			/* Apply the column definitions */
			_fnApplyColumnDefs( oSettings, oInit.aoColumnDefs, aoColumnsInit, function (iCol, oDef) {
				_fnColumnOptions( oSettings, iCol, oDef );
			} );
			
			
			/*
			 * Sorting
			 * Check the aaSorting array
			 */
			for ( i=0, iLen=oSettings.aaSorting.length ; i<iLen ; i++ )
			{
				if ( oSettings.aaSorting[i][0] >= oSettings.aoColumns.length )
				{
					oSettings.aaSorting[i][0] = 0;
				}
				var oColumn = oSettings.aoColumns[ oSettings.aaSorting[i][0] ];
				
				/* Add a default sorting index */
				if ( oSettings.aaSorting[i][2] === undefined )
				{
					oSettings.aaSorting[i][2] = 0;
				}
				
				/* If aaSorting is not defined, then we use the first indicator in asSorting */
				if ( oInit.aaSorting === undefined && oSettings.saved_aaSorting === undefined )
				{
					oSettings.aaSorting[i][1] = oColumn.asSorting[0];
				}
				
				/* Set the current sorting index based on aoColumns.asSorting */
				for ( j=0, jLen=oColumn.asSorting.length ; j<jLen ; j++ )
				{
					if ( oSettings.aaSorting[i][1] == oColumn.asSorting[j] )
					{
						oSettings.aaSorting[i][2] = j;
						break;
					}
				}
			}
				
			/* Do a first pass on the sorting classes (allows any size changes to be taken into
			 * account, and also will apply sorting disabled classes if disabled
			 */
			_fnSortingClasses( oSettings );
			
			
			/*
			 * Final init
			 * Cache the header, body and footer as required, creating them if needed
			 */
			
			/* Browser support detection */
			_fnBrowserDetect( oSettings );
			
			// Work around for Webkit bug 83867 - store the caption-side before removing from doc
			var captions = $(this).children('caption').each( function () {
				this._captionSide = $(this).css('caption-side');
			} );
			
			var thead = $(this).children('thead');
			if ( thead.length === 0 )
			{
				thead = [ document.createElement( 'thead' ) ];
				this.appendChild( thead[0] );
			}
			oSettings.nTHead = thead[0];
			
			var tbody = $(this).children('tbody');
			if ( tbody.length === 0 )
			{
				tbody = [ document.createElement( 'tbody' ) ];
				this.appendChild( tbody[0] );
			}
			oSettings.nTBody = tbody[0];
			oSettings.nTBody.setAttribute( "role", "alert" );
			oSettings.nTBody.setAttribute( "aria-live", "polite" );
			oSettings.nTBody.setAttribute( "aria-relevant", "all" );
			
			var tfoot = $(this).children('tfoot');
			if ( tfoot.length === 0 && captions.length > 0 && (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "") )
			{
				// If we are a scrolling table, and no footer has been given, then we need to create
				// a tfoot element for the caption element to be appended to
				tfoot = [ document.createElement( 'tfoot' ) ];
				this.appendChild( tfoot[0] );
			}
			
			if ( tfoot.length > 0 )
			{
				oSettings.nTFoot = tfoot[0];
				_fnDetectHeader( oSettings.aoFooter, oSettings.nTFoot );
			}
			
			/* Check if there is data passing into the constructor */
			if ( bUsePassedData )
			{
				for ( i=0 ; i<oInit.aaData.length ; i++ )
				{
					_fnAddData( oSettings, oInit.aaData[ i ] );
				}
			}
			else
			{
				/* Grab the data from the page */
				_fnGatherData( oSettings );
			}
			
			/* Copy the data index array */
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			/* Initialisation complete - table can be drawn */
			oSettings.bInitialised = true;
			
			/* Check if we need to initialise the table (it might not have been handed off to the
			 * language processor)
			 */
			if ( bInitHandedOff === false )
			{
				_fnInitialise( oSettings );
			}
		} );
		_that = null;
		return this;
	};

	
	
	/**
	 * Provide a common method for plug-ins to check the version of DataTables being used, in order
	 * to ensure compatibility.
	 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
	 *    formats "X" and "X.Y" are also acceptable.
	 *  @returns {boolean} true if this version of DataTables is greater or equal to the required
	 *    version, or false if this version of DataTales is not suitable
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    alert( $.fn.dataTable.fnVersionCheck( '1.9.0' ) );
	 */
	DataTable.fnVersionCheck = function( sVersion )
	{
		/* This is cheap, but effective */
		var fnZPad = function (Zpad, count)
		{
			while(Zpad.length < count) {
				Zpad += '0';
			}
			return Zpad;
		};
		var aThis = DataTable.ext.sVersion.split('.');
		var aThat = sVersion.split('.');
		var sThis = '', sThat = '';
		
		for ( var i=0, iLen=aThat.length ; i<iLen ; i++ )
		{
			sThis += fnZPad( aThis[i], 3 );
			sThat += fnZPad( aThat[i], 3 );
		}
		
		return parseInt(sThis, 10) >= parseInt(sThat, 10);
	};
	
	
	/**
	 * Check if a TABLE node is a DataTable table already or not.
	 *  @param {node} nTable The TABLE node to check if it is a DataTable or not (note that other
	 *    node types can be passed in, but will always return false).
	 *  @returns {boolean} true the table given is a DataTable, or false otherwise
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    var ex = document.getElementById('example');
	 *    if ( ! $.fn.DataTable.fnIsDataTable( ex ) ) {
	 *      $(ex).dataTable();
	 *    }
	 */
	DataTable.fnIsDataTable = function ( nTable )
	{
		var o = DataTable.settings;
	
		for ( var i=0 ; i<o.length ; i++ )
		{
			if ( o[i].nTable === nTable || o[i].nScrollHead === nTable || o[i].nScrollFoot === nTable )
			{
				return true;
			}
		}
	
		return false;
	};
	
	
	/**
	 * Get all DataTable tables that have been initialised - optionally you can select to
	 * get only currently visible tables.
	 *  @param {boolean} [bVisible=false] Flag to indicate if you want all (default) or 
	 *    visible tables only.
	 *  @returns {array} Array of TABLE nodes (not DataTable instances) which are DataTables
	 *  @static
	 *  @dtopt API-Static
	 *
	 *  @example
	 *    var table = $.fn.dataTable.fnTables(true);
	 *    if ( table.length > 0 ) {
	 *      $(table).dataTable().fnAdjustColumnSizing();
	 *    }
	 */
	DataTable.fnTables = function ( bVisible )
	{
		var out = [];
	
		jQuery.each( DataTable.settings, function (i, o) {
			if ( !bVisible || (bVisible === true && $(o.nTable).is(':visible')) )
			{
				out.push( o.nTable );
			}
		} );
	
		return out;
	};
	

	/**
	 * Version string for plug-ins to check compatibility. Allowed format is
	 * a.b.c.d.e where: a:int, b:int, c:int, d:string(dev|beta), e:int. d and
	 * e are optional
	 *  @member
	 *  @type string
	 *  @default Version number
	 */
	DataTable.version = "1.9.4";

	/**
	 * Private data store, containing all of the settings objects that are created for the
	 * tables on a given page.
	 * 
	 * Note that the <i>DataTable.settings</i> object is aliased to <i>jQuery.fn.dataTableExt</i> 
	 * through which it may be accessed and manipulated, or <i>jQuery.fn.dataTable.settings</i>.
	 *  @member
	 *  @type array
	 *  @default []
	 *  @private
	 */
	DataTable.settings = [];

	/**
	 * Object models container, for the various models that DataTables has available
	 * to it. These models define the objects that are used to hold the active state 
	 * and configuration of the table.
	 *  @namespace
	 */
	DataTable.models = {};
	
	
	/**
	 * DataTables extension options and plug-ins. This namespace acts as a collection "area"
	 * for plug-ins that can be used to extend the default DataTables behaviour - indeed many
	 * of the build in methods use this method to provide their own capabilities (sorting methods
	 * for example).
	 * 
	 * Note that this namespace is aliased to jQuery.fn.dataTableExt so it can be readily accessed
	 * and modified by plug-ins.
	 *  @namespace
	 */
	DataTable.models.ext = {
		/**
		 * Plug-in filtering functions - this method of filtering is complimentary to the default
		 * type based filtering, and a lot more comprehensive as it allows you complete control
		 * over the filtering logic. Each element in this array is a function (parameters
		 * described below) that is called for every row in the table, and your logic decides if
		 * it should be included in the filtered data set or not.
		 *   <ul>
		 *     <li>
		 *       Function input parameters:
		 *       <ul>
		 *         <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
		 *         <li>{array|object} Data for the row to be processed (same as the original format
		 *           that was passed in as the data source, or an array from a DOM data source</li>
		 *         <li>{int} Row index in aoData ({@link DataTable.models.oSettings.aoData}), which can
		 *           be useful to retrieve the TR element if you need DOM interaction.</li>
		 *       </ul>
		 *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{boolean} Include the row in the filtered result set (true) or not (false)</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *  @type array
		 *  @default []
		 *
		 *  @example
		 *    // The following example shows custom filtering being applied to the fourth column (i.e.
		 *    // the aData[3] index) based on two input values from the end-user, matching the data in 
		 *    // a certain range.
		 *    $.fn.dataTableExt.afnFiltering.push(
		 *      function( oSettings, aData, iDataIndex ) {
		 *        var iMin = document.getElementById('min').value * 1;
		 *        var iMax = document.getElementById('max').value * 1;
		 *        var iVersion = aData[3] == "-" ? 0 : aData[3]*1;
		 *        if ( iMin == "" && iMax == "" ) {
		 *          return true;
		 *        }
		 *        else if ( iMin == "" && iVersion < iMax ) {
		 *          return true;
		 *        }
		 *        else if ( iMin < iVersion && "" == iMax ) {
		 *          return true;
		 *        }
		 *        else if ( iMin < iVersion && iVersion < iMax ) {
		 *          return true;
		 *        }
		 *        return false;
		 *      }
		 *    );
		 */
		"afnFiltering": [],
	
	
		/**
		 * Plug-in sorting functions - this method of sorting is complimentary to the default type
		 * based sorting that DataTables does automatically, allowing much greater control over the
		 * the data that is being used to sort a column. This is useful if you want to do sorting
		 * based on live data (for example the contents of an 'input' element) rather than just the
		 * static string that DataTables knows of. The way these plug-ins work is that you create
		 * an array of the values you wish to be sorted for the column in question and then return
		 * that array. Which pre-sorting function is run here depends on the sSortDataType parameter
		 * that is used for the column (if any). This is the corollary of <i>ofnSearch</i> for sort 
		 * data.
		 *   <ul>
	     *     <li>
	     *       Function input parameters:
	     *       <ul>
		 *         <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
	     *         <li>{int} Target column index</li>
	     *       </ul>
	     *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{array} Data for the column to be sorted upon</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *  
		 * Note that as of v1.9, it is typically preferable to use <i>mData</i> to prepare data for
		 * the different uses that DataTables can put the data to. Specifically <i>mData</i> when
		 * used as a function will give you a 'type' (sorting, filtering etc) that you can use to 
		 * prepare the data as required for the different types. As such, this method is deprecated.
		 *  @type array
		 *  @default []
		 *  @deprecated
		 *
		 *  @example
		 *    // Updating the cached sorting information with user entered values in HTML input elements
		 *    jQuery.fn.dataTableExt.afnSortData['dom-text'] = function ( oSettings, iColumn )
		 *    {
		 *      var aData = [];
		 *      $( 'td:eq('+iColumn+') input', oSettings.oApi._fnGetTrNodes(oSettings) ).each( function () {
		 *        aData.push( this.value );
		 *      } );
		 *      return aData;
		 *    }
		 */
		"afnSortData": [],
	
	
		/**
		 * Feature plug-ins - This is an array of objects which describe the feature plug-ins that are
		 * available to DataTables. These feature plug-ins are accessible through the sDom initialisation
		 * option. As such, each feature plug-in must describe a function that is used to initialise
		 * itself (fnInit), a character so the feature can be enabled by sDom (cFeature) and the name
		 * of the feature (sFeature). Thus the objects attached to this method must provide:
		 *   <ul>
		 *     <li>{function} fnInit Initialisation of the plug-in
		 *       <ul>
	     *         <li>
	     *           Function input parameters:
	     *           <ul>
		 *             <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
	     *           </ul>
	     *         </li>
		 *         <li>
		 *           Function return:
		 *           <ul>
		 *             <li>{node|null} The element which contains your feature. Note that the return
		 *                may also be void if your plug-in does not require to inject any DOM elements 
		 *                into DataTables control (sDom) - for example this might be useful when 
		 *                developing a plug-in which allows table control via keyboard entry.</li>
		 *           </ul>
		 *         </il>
		 *       </ul>
		 *     </li>
		 *     <li>{character} cFeature Character that will be matched in sDom - case sensitive</li>
		 *     <li>{string} sFeature Feature name</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 * 
		 *  @example
		 *    // How TableTools initialises itself.
		 *    $.fn.dataTableExt.aoFeatures.push( {
		 *      "fnInit": function( oSettings ) {
		 *        return new TableTools( { "oDTSettings": oSettings } );
		 *      },
		 *      "cFeature": "T",
		 *      "sFeature": "TableTools"
		 *    } );
		 */
		"aoFeatures": [],
	
	
		/**
		 * Type detection plug-in functions - DataTables utilises types to define how sorting and
		 * filtering behave, and types can be either  be defined by the developer (sType for the
		 * column) or they can be automatically detected by the methods in this array. The functions
		 * defined in the array are quite simple, taking a single parameter (the data to analyse) 
		 * and returning the type if it is a known type, or null otherwise.
		 *   <ul>
	     *     <li>
	     *       Function input parameters:
	     *       <ul>
		 *         <li>{*} Data from the column cell to be analysed</li>
	     *       </ul>
	     *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{string|null} Data type detected, or null if unknown (and thus pass it
		 *           on to the other type detection functions.</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *  @type array
		 *  @default []
		 *  
		 *  @example
		 *    // Currency type detection plug-in:
		 *    jQuery.fn.dataTableExt.aTypes.push(
		 *      function ( sData ) {
		 *        var sValidChars = "0123456789.-";
		 *        var Char;
		 *        
		 *        // Check the numeric part
		 *        for ( i=1 ; i<sData.length ; i++ ) {
		 *          Char = sData.charAt(i); 
		 *          if (sValidChars.indexOf(Char) == -1) {
		 *            return null;
		 *          }
		 *        }
		 *        
		 *        // Check prefixed by currency
		 *        if ( sData.charAt(0) == '$' || sData.charAt(0) == '&pound;' ) {
		 *          return 'currency';
		 *        }
		 *        return null;
		 *      }
		 *    );
		 */
		"aTypes": [],
	
	
		/**
		 * Provide a common method for plug-ins to check the version of DataTables being used, 
		 * in order to ensure compatibility.
		 *  @type function
		 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note 
		 *    that the formats "X" and "X.Y" are also acceptable.
		 *  @returns {boolean} true if this version of DataTables is greater or equal to the 
		 *    required version, or false if this version of DataTales is not suitable
		 *
		 *  @example
		 *    $(document).ready(function() {
		 *      var oTable = $('#example').dataTable();
		 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
		 *    } );
		 */
		"fnVersionCheck": DataTable.fnVersionCheck,
	
	
		/**
		 * Index for what 'this' index API functions should use
		 *  @type int
		 *  @default 0
		 */
		"iApiIndex": 0,
	
	
		/**
		 * Pre-processing of filtering data plug-ins - When you assign the sType for a column
		 * (or have it automatically detected for you by DataTables or a type detection plug-in), 
		 * you will typically be using this for custom sorting, but it can also be used to provide 
		 * custom filtering by allowing you to pre-processing the data and returning the data in
		 * the format that should be filtered upon. This is done by adding functions this object 
		 * with a parameter name which matches the sType for that target column. This is the
		 * corollary of <i>afnSortData</i> for filtering data.
		 *   <ul>
	     *     <li>
	     *       Function input parameters:
	     *       <ul>
		 *         <li>{*} Data from the column cell to be prepared for filtering</li>
	     *       </ul>
	     *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{string|null} Formatted string that will be used for the filtering.</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 * 
		 * Note that as of v1.9, it is typically preferable to use <i>mData</i> to prepare data for
		 * the different uses that DataTables can put the data to. Specifically <i>mData</i> when
		 * used as a function will give you a 'type' (sorting, filtering etc) that you can use to 
		 * prepare the data as required for the different types. As such, this method is deprecated.
		 *  @type object
		 *  @default {}
		 *  @deprecated
		 *
		 *  @example
		 *    $.fn.dataTableExt.ofnSearch['title-numeric'] = function ( sData ) {
		 *      return sData.replace(/\n/g," ").replace( /<.*?>/g, "" );
		 *    }
		 */
		"ofnSearch": {},
	
	
		/**
		 * Container for all private functions in DataTables so they can be exposed externally
		 *  @type object
		 *  @default {}
		 */
		"oApi": {},
	
	
		/**
		 * Storage for the various classes that DataTables uses
		 *  @type object
		 *  @default {}
		 */
		"oStdClasses": {},
		
	
		/**
		 * Storage for the various classes that DataTables uses - jQuery UI suitable
		 *  @type object
		 *  @default {}
		 */
		"oJUIClasses": {},
	
	
		/**
		 * Pagination plug-in methods - The style and controls of the pagination can significantly 
		 * impact on how the end user interacts with the data in your table, and DataTables allows 
		 * the addition of pagination controls by extending this object, which can then be enabled
		 * through the <i>sPaginationType</i> initialisation parameter. Each pagination type that
		 * is added is an object (the property name of which is what <i>sPaginationType</i> refers
		 * to) that has two properties, both methods that are used by DataTables to update the
		 * control's state.
		 *   <ul>
		 *     <li>
		 *       fnInit -  Initialisation of the paging controls. Called only during initialisation 
		 *         of the table. It is expected that this function will add the required DOM elements 
		 *         to the page for the paging controls to work. The element pointer 
		 *         'oSettings.aanFeatures.p' array is provided by DataTables to contain the paging 
		 *         controls (note that this is a 2D array to allow for multiple instances of each 
		 *         DataTables DOM element). It is suggested that you add the controls to this element 
		 *         as children
		 *       <ul>
	     *         <li>
	     *           Function input parameters:
	     *           <ul>
		 *             <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
		 *             <li>{node} Container into which the pagination controls must be inserted</li>
		 *             <li>{function} Draw callback function - whenever the controls cause a page
		 *               change, this method must be called to redraw the table.</li>
	     *           </ul>
	     *         </li>
		 *         <li>
		 *           Function return:
		 *           <ul>
		 *             <li>No return required</li>
		 *           </ul>
		 *         </il>
		 *       </ul>
		 *     </il>
		 *     <li>
		 *       fnInit -  This function is called whenever the paging status of the table changes and is
		 *         typically used to update classes and/or text of the paging controls to reflex the new 
		 *         status.
		 *       <ul>
	     *         <li>
	     *           Function input parameters:
	     *           <ul>
		 *             <li>{object} DataTables settings object: see {@link DataTable.models.oSettings}.</li>
		 *             <li>{function} Draw callback function - in case you need to redraw the table again
		 *               or attach new event listeners</li>
	     *           </ul>
	     *         </li>
		 *         <li>
		 *           Function return:
		 *           <ul>
		 *             <li>No return required</li>
		 *           </ul>
		 *         </il>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    $.fn.dataTableExt.oPagination.four_button = {
		 *      "fnInit": function ( oSettings, nPaging, fnCallbackDraw ) {
		 *        nFirst = document.createElement( 'span' );
		 *        nPrevious = document.createElement( 'span' );
		 *        nNext = document.createElement( 'span' );
		 *        nLast = document.createElement( 'span' );
		 *        
		 *        nFirst.appendChild( document.createTextNode( oSettings.oLanguage.oPaginate.sFirst ) );
		 *        nPrevious.appendChild( document.createTextNode( oSettings.oLanguage.oPaginate.sPrevious ) );
		 *        nNext.appendChild( document.createTextNode( oSettings.oLanguage.oPaginate.sNext ) );
		 *        nLast.appendChild( document.createTextNode( oSettings.oLanguage.oPaginate.sLast ) );
		 *        
		 *        nFirst.className = "paginate_button first";
		 *        nPrevious.className = "paginate_button previous";
		 *        nNext.className="paginate_button next";
		 *        nLast.className = "paginate_button last";
		 *        
		 *        nPaging.appendChild( nFirst );
		 *        nPaging.appendChild( nPrevious );
		 *        nPaging.appendChild( nNext );
		 *        nPaging.appendChild( nLast );
		 *        
		 *        $(nFirst).click( function () {
		 *          oSettings.oApi._fnPageChange( oSettings, "first" );
		 *          fnCallbackDraw( oSettings );
		 *        } );
		 *        
		 *        $(nPrevious).click( function() {
		 *          oSettings.oApi._fnPageChange( oSettings, "previous" );
		 *          fnCallbackDraw( oSettings );
		 *        } );
		 *        
		 *        $(nNext).click( function() {
		 *          oSettings.oApi._fnPageChange( oSettings, "next" );
		 *          fnCallbackDraw( oSettings );
		 *        } );
		 *        
		 *        $(nLast).click( function() {
		 *          oSettings.oApi._fnPageChange( oSettings, "last" );
		 *          fnCallbackDraw( oSettings );
		 *        } );
		 *        
		 *        $(nFirst).bind( 'selectstart', function () { return false; } );
		 *        $(nPrevious).bind( 'selectstart', function () { return false; } );
		 *        $(nNext).bind( 'selectstart', function () { return false; } );
		 *        $(nLast).bind( 'selectstart', function () { return false; } );
		 *      },
		 *      
		 *      "fnUpdate": function ( oSettings, fnCallbackDraw ) {
		 *        if ( !oSettings.aanFeatures.p ) {
		 *          return;
		 *        }
		 *        
		 *        // Loop over each instance of the pager
		 *        var an = oSettings.aanFeatures.p;
		 *        for ( var i=0, iLen=an.length ; i<iLen ; i++ ) {
		 *          var buttons = an[i].getElementsByTagName('span');
		 *          if ( oSettings._iDisplayStart === 0 ) {
		 *            buttons[0].className = "paginate_disabled_previous";
		 *            buttons[1].className = "paginate_disabled_previous";
		 *          }
		 *          else {
		 *            buttons[0].className = "paginate_enabled_previous";
		 *            buttons[1].className = "paginate_enabled_previous";
		 *          }
		 *          
		 *          if ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() ) {
		 *            buttons[2].className = "paginate_disabled_next";
		 *            buttons[3].className = "paginate_disabled_next";
		 *          }
		 *          else {
		 *            buttons[2].className = "paginate_enabled_next";
		 *            buttons[3].className = "paginate_enabled_next";
		 *          }
		 *        }
		 *      }
		 *    };
		 */
		"oPagination": {},
	
	
		/**
		 * Sorting plug-in methods - Sorting in DataTables is based on the detected type of the
		 * data column (you can add your own type detection functions, or override automatic 
		 * detection using sType). With this specific type given to the column, DataTables will 
		 * apply the required sort from the functions in the object. Each sort type must provide
		 * two mandatory methods, one each for ascending and descending sorting, and can optionally
		 * provide a pre-formatting method that will help speed up sorting by allowing DataTables
		 * to pre-format the sort data only once (rather than every time the actual sort functions
		 * are run). The two sorting functions are typical Javascript sort methods:
		 *   <ul>
	     *     <li>
	     *       Function input parameters:
	     *       <ul>
		 *         <li>{*} Data to compare to the second parameter</li>
		 *         <li>{*} Data to compare to the first parameter</li>
	     *       </ul>
	     *     </li>
		 *     <li>
		 *       Function return:
		 *       <ul>
		 *         <li>{int} Sorting match: <0 if first parameter should be sorted lower than
		 *           the second parameter, ===0 if the two parameters are equal and >0 if
		 *           the first parameter should be sorted height than the second parameter.</li>
		 *       </ul>
		 *     </il>
		 *   </ul>
		 *  @type object
		 *  @default {}
		 *
		 *  @example
		 *    // Case-sensitive string sorting, with no pre-formatting method
		 *    $.extend( $.fn.dataTableExt.oSort, {
		 *      "string-case-asc": function(x,y) {
		 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		 *      },
		 *      "string-case-desc": function(x,y) {
		 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		 *      }
		 *    } );
		 *
		 *  @example
		 *    // Case-insensitive string sorting, with pre-formatting
		 *    $.extend( $.fn.dataTableExt.oSort, {
		 *      "string-pre": function(x) {
		 *        return x.toLowerCase();
		 *      },
		 *      "string-asc": function(x,y) {
		 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		 *      },
		 *      "string-desc": function(x,y) {
		 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		 *      }
		 *    } );
		 */
		"oSort": {},
	
	
		/**
		 * Version string for plug-ins to check compatibility. Allowed format is
		 * a.b.c.d.e where: a:int, b:int, c:int, d:string(dev|beta), e:int. d and
		 * e are optional
		 *  @type string
		 *  @default Version number
		 */
		"sVersion": DataTable.version,
	
	
		/**
		 * How should DataTables report an error. Can take the value 'alert' or 'throw'
		 *  @type string
		 *  @default alert
		 */
		"sErrMode": "alert",
	
	
		/**
		 * Store information for DataTables to access globally about other instances
		 *  @namespace
		 *  @private
		 */
		"_oExternConfig": {
			/* int:iNextUnique - next unique number for an instance */
			"iNextUnique": 0
		}
	};
	
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * search information for the global filter and individual column filters.
	 *  @namespace
	 */
	DataTable.models.oSearch = {
		/**
		 * Flag to indicate if the filtering should be case insensitive or not
		 *  @type boolean
		 *  @default true
		 */
		"bCaseInsensitive": true,
	
		/**
		 * Applied search term
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sSearch": "",
	
		/**
		 * Flag to indicate if the search term should be interpreted as a
		 * regular expression (true) or not (false) and therefore and special
		 * regex characters escaped.
		 *  @type boolean
		 *  @default false
		 */
		"bRegex": false,
	
		/**
		 * Flag to indicate if DataTables is to use its smart filtering or not.
		 *  @type boolean
		 *  @default true
		 */
		"bSmart": true
	};
	
	
	
	
	/**
	 * Template object for the way in which DataTables holds information about
	 * each individual row. This is the object format used for the settings 
	 * aoData array.
	 *  @namespace
	 */
	DataTable.models.oRow = {
		/**
		 * TR element for the row
		 *  @type node
		 *  @default null
		 */
		"nTr": null,
	
		/**
		 * Data object from the original data source for the row. This is either
		 * an array if using the traditional form of DataTables, or an object if
		 * using mData options. The exact type will depend on the passed in
		 * data from the data source, or will be an array if using DOM a data 
		 * source.
		 *  @type array|object
		 *  @default []
		 */
		"_aData": [],
	
		/**
		 * Sorting data cache - this array is ostensibly the same length as the
		 * number of columns (although each index is generated only as it is 
		 * needed), and holds the data that is used for sorting each column in the
		 * row. We do this cache generation at the start of the sort in order that
		 * the formatting of the sort data need be done only once for each cell
		 * per sort. This array should not be read from or written to by anything
		 * other than the master sorting methods.
		 *  @type array
		 *  @default []
		 *  @private
		 */
		"_aSortData": [],
	
		/**
		 * Array of TD elements that are cached for hidden rows, so they can be
		 * reinserted into the table if a column is made visible again (or to act
		 * as a store if a column is made hidden). Only hidden columns have a 
		 * reference in the array. For non-hidden columns the value is either
		 * undefined or null.
		 *  @type array nodes
		 *  @default []
		 *  @private
		 */
		"_anHidden": [],
	
		/**
		 * Cache of the class name that DataTables has applied to the row, so we
		 * can quickly look at this variable rather than needing to do a DOM check
		 * on className for the nTr property.
		 *  @type string
		 *  @default <i>Empty string</i>
		 *  @private
		 */
		"_sRowStripe": ""
	};
	
	
	
	/**
	 * Template object for the column information object in DataTables. This object
	 * is held in the settings aoColumns array and contains all the information that
	 * DataTables needs about each individual column.
	 * 
	 * Note that this object is related to {@link DataTable.defaults.columns} 
	 * but this one is the internal data store for DataTables's cache of columns.
	 * It should NOT be manipulated outside of DataTables. Any configuration should
	 * be done through the initialisation options.
	 *  @namespace
	 */
	DataTable.models.oColumn = {
		/**
		 * A list of the columns that sorting should occur on when this column
		 * is sorted. That this property is an array allows multi-column sorting
		 * to be defined for a column (for example first name / last name columns
		 * would benefit from this). The values are integers pointing to the
		 * columns to be sorted on (typically it will be a single integer pointing
		 * at itself, but that doesn't need to be the case).
		 *  @type array
		 */
		"aDataSort": null,
	
		/**
		 * Define the sorting directions that are applied to the column, in sequence
		 * as the column is repeatedly sorted upon - i.e. the first value is used
		 * as the sorting direction when the column if first sorted (clicked on).
		 * Sort it again (click again) and it will move on to the next index.
		 * Repeat until loop.
		 *  @type array
		 */
		"asSorting": null,
		
		/**
		 * Flag to indicate if the column is searchable, and thus should be included
		 * in the filtering or not.
		 *  @type boolean
		 */
		"bSearchable": null,
		
		/**
		 * Flag to indicate if the column is sortable or not.
		 *  @type boolean
		 */
		"bSortable": null,
		
		/**
		 * <code>Deprecated</code> When using fnRender, you have two options for what 
		 * to do with the data, and this property serves as the switch. Firstly, you 
		 * can have the sorting and filtering use the rendered value (true - default), 
		 * or you can have the sorting and filtering us the original value (false).
		 *
		 * Please note that this option has now been deprecated and will be removed
		 * in the next version of DataTables. Please use mRender / mData rather than
		 * fnRender.
		 *  @type boolean
		 *  @deprecated
		 */
		"bUseRendered": null,
		
		/**
		 * Flag to indicate if the column is currently visible in the table or not
		 *  @type boolean
		 */
		"bVisible": null,
		
		/**
		 * Flag to indicate to the type detection method if the automatic type
		 * detection should be used, or if a column type (sType) has been specified
		 *  @type boolean
		 *  @default true
		 *  @private
		 */
		"_bAutoType": true,
		
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 *  @type function
		 *  @param {element} nTd The TD node that has been created
		 *  @param {*} sData The Data for the cell
		 *  @param {array|object} oData The data for the whole row
		 *  @param {int} iRow The row index for the aoData data store
		 *  @default null
		 */
		"fnCreatedCell": null,
		
		/**
		 * Function to get data from a cell in a column. You should <b>never</b>
		 * access data directly through _aData internally in DataTables - always use
		 * the method attached to this property. It allows mData to function as
		 * required. This function is automatically assigned by the column 
		 * initialisation method
		 *  @type function
		 *  @param {array|object} oData The data array/object for the array 
		 *    (i.e. aoData[]._aData)
		 *  @param {string} sSpecific The specific data type you want to get - 
		 *    'display', 'type' 'filter' 'sort'
		 *  @returns {*} The data for the cell from the given row's data
		 *  @default null
		 */
		"fnGetData": null,
		
		/**
		 * <code>Deprecated</code> Custom display function that will be called for the 
		 * display of each cell in this column.
		 *
		 * Please note that this option has now been deprecated and will be removed
		 * in the next version of DataTables. Please use mRender / mData rather than
		 * fnRender.
		 *  @type function
		 *  @param {object} o Object with the following parameters:
		 *  @param {int}    o.iDataRow The row in aoData
		 *  @param {int}    o.iDataColumn The column in question
		 *  @param {array}  o.aData The data for the row in question
		 *  @param {object} o.oSettings The settings object for this DataTables instance
		 *  @returns {string} The string you which to use in the display
		 *  @default null
		 *  @deprecated
		 */
		"fnRender": null,
		
		/**
		 * Function to set data for a cell in the column. You should <b>never</b> 
		 * set the data directly to _aData internally in DataTables - always use
		 * this method. It allows mData to function as required. This function
		 * is automatically assigned by the column initialisation method
		 *  @type function
		 *  @param {array|object} oData The data array/object for the array 
		 *    (i.e. aoData[]._aData)
		 *  @param {*} sValue Value to set
		 *  @default null
		 */
		"fnSetData": null,
		
		/**
		 * Property to read the value for the cells in the column from the data 
		 * source array / object. If null, then the default content is used, if a
		 * function is given then the return from the function is used.
		 *  @type function|int|string|null
		 *  @default null
		 */
		"mData": null,
		
		/**
		 * Partner property to mData which is used (only when defined) to get
		 * the data - i.e. it is basically the same as mData, but without the
		 * 'set' option, and also the data fed to it is the result from mData.
		 * This is the rendering method to match the data method of mData.
		 *  @type function|int|string|null
		 *  @default null
		 */
		"mRender": null,
		
		/**
		 * Unique header TH/TD element for this column - this is what the sorting
		 * listener is attached to (if sorting is enabled.)
		 *  @type node
		 *  @default null
		 */
		"nTh": null,
		
		/**
		 * Unique footer TH/TD element for this column (if there is one). Not used 
		 * in DataTables as such, but can be used for plug-ins to reference the 
		 * footer for each column.
		 *  @type node
		 *  @default null
		 */
		"nTf": null,
		
		/**
		 * The class to apply to all TD elements in the table's TBODY for the column
		 *  @type string
		 *  @default null
		 */
		"sClass": null,
		
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer 
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 *  @type string
		 */
		"sContentPadding": null,
		
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mData
		 * is set to null, or because the data source itself is null).
		 *  @type string
		 *  @default null
		 */
		"sDefaultContent": null,
		
		/**
		 * Name for the column, allowing reference to the column by name as well as
		 * by index (needs a lookup to work by name).
		 *  @type string
		 */
		"sName": null,
		
		/**
		 * Custom sorting data type - defines which of the available plug-ins in
		 * afnSortData the custom sorting will use - if any is defined.
		 *  @type string
		 *  @default std
		 */
		"sSortDataType": 'std',
		
		/**
		 * Class to be applied to the header element when sorting on this column
		 *  @type string
		 *  @default null
		 */
		"sSortingClass": null,
		
		/**
		 * Class to be applied to the header element when sorting on this column -
		 * when jQuery UI theming is used.
		 *  @type string
		 *  @default null
		 */
		"sSortingClassJUI": null,
		
		/**
		 * Title of the column - what is seen in the TH element (nTh).
		 *  @type string
		 */
		"sTitle": null,
		
		/**
		 * Column sorting and filtering type
		 *  @type string
		 *  @default null
		 */
		"sType": null,
		
		/**
		 * Width of the column
		 *  @type string
		 *  @default null
		 */
		"sWidth": null,
		
		/**
		 * Width of the column when it was first "encountered"
		 *  @type string
		 *  @default null
		 */
		"sWidthOrig": null
	};
	
	
	
	/**
	 * Initialisation options that can be given to DataTables at initialisation 
	 * time.
	 *  @namespace
	 */
	DataTable.defaults = {
		/**
		 * An array of data to use for the table, passed in at initialisation which 
		 * will be used in preference to any data which is already in the DOM. This is
		 * particularly useful for constructing tables purely in Javascript, for
		 * example with a custom Ajax call.
		 *  @type array
		 *  @default null
		 *  @dtopt Option
		 * 
		 *  @example
		 *    // Using a 2D array data source
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "aaData": [
		 *          ['Trident', 'Internet Explorer 4.0', 'Win 95+', 4, 'X'],
		 *          ['Trident', 'Internet Explorer 5.0', 'Win 95+', 5, 'C'],
		 *        ],
		 *        "aoColumns": [
		 *          { "sTitle": "Engine" },
		 *          { "sTitle": "Browser" },
		 *          { "sTitle": "Platform" },
		 *          { "sTitle": "Version" },
		 *          { "sTitle": "Grade" }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using an array of objects as a data source (mData)
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "aaData": [
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 4.0",
		 *            "platform": "Win 95+",
		 *            "version":  4,
		 *            "grade":    "X"
		 *          },
		 *          {
		 *            "engine":   "Trident",
		 *            "browser":  "Internet Explorer 5.0",
		 *            "platform": "Win 95+",
		 *            "version":  5,
		 *            "grade":    "C"
		 *          }
		 *        ],
		 *        "aoColumns": [
		 *          { "sTitle": "Engine",   "mData": "engine" },
		 *          { "sTitle": "Browser",  "mData": "browser" },
		 *          { "sTitle": "Platform", "mData": "platform" },
		 *          { "sTitle": "Version",  "mData": "version" },
		 *          { "sTitle": "Grade",    "mData": "grade" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"aaData": null,
	
	
		/**
		 * If sorting is enabled, then DataTables will perform a first pass sort on 
		 * initialisation. You can define which column(s) the sort is performed upon, 
		 * and the sorting direction, with this variable. The aaSorting array should 
		 * contain an array for each column to be sorted initially containing the 
		 * column's index and a direction string ('asc' or 'desc').
		 *  @type array
		 *  @default [[0,'asc']]
		 *  @dtopt Option
		 * 
		 *  @example
		 *    // Sort by 3rd column first, and then 4th column
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aaSorting": [[2,'asc'], [3,'desc']]
		 *      } );
		 *    } );
		 *    
		 *    // No initial sorting
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aaSorting": []
		 *      } );
		 *    } );
		 */
		"aaSorting": [[0,'asc']],
	
	
		/**
		 * This parameter is basically identical to the aaSorting parameter, but 
		 * cannot be overridden by user interaction with the table. What this means 
		 * is that you could have a column (visible or hidden) which the sorting will 
		 * always be forced on first - any sorting after that (from the user) will 
		 * then be performed as required. This can be useful for grouping rows 
		 * together.
		 *  @type array
		 *  @default null
		 *  @dtopt Option
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aaSortingFixed": [[0,'asc']]
		 *      } );
		 *    } )
		 */
		"aaSortingFixed": null,
	
	
		/**
		 * This parameter allows you to readily specify the entries in the length drop
		 * down menu that DataTables shows when pagination is enabled. It can be 
		 * either a 1D array of options which will be used for both the displayed 
		 * option and the value, or a 2D array which will use the array in the first 
		 * position as the value, and the array in the second position as the 
		 * displayed options (useful for language strings such as 'All').
		 *  @type array
		 *  @default [ 10, 25, 50, 100 ]
		 *  @dtopt Option
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aLengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
		 *      } );
		 *    } );
		 *  
		 *  @example
		 *    // Setting the default display length as well as length menu
		 *    // This is likely to be wanted if you remove the '10' option which
		 *    // is the iDisplayLength default.
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "iDisplayLength": 25,
		 *        "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]]
		 *      } );
		 *    } );
		 */
		"aLengthMenu": [ 10, 25, 50, 100 ],
	
	
		/**
		 * The aoColumns option in the initialisation parameter allows you to define
		 * details about the way individual columns behave. For a full list of
		 * column options that can be set, please see 
		 * {@link DataTable.defaults.columns}. Note that if you use aoColumns to
		 * define your columns, you must have an entry in the array for every single
		 * column that you have in your table (these can be null if you don't which
		 * to specify any options).
		 *  @member
		 */
		"aoColumns": null,
	
		/**
		 * Very similar to aoColumns, aoColumnDefs allows you to target a specific 
		 * column, multiple columns, or all columns, using the aTargets property of 
		 * each object in the array. This allows great flexibility when creating 
		 * tables, as the aoColumnDefs arrays can be of any length, targeting the 
		 * columns you specifically want. aoColumnDefs may use any of the column 
		 * options available: {@link DataTable.defaults.columns}, but it _must_
		 * have aTargets defined in each object in the array. Values in the aTargets
		 * array may be:
		 *   <ul>
		 *     <li>a string - class name will be matched on the TH for the column</li>
		 *     <li>0 or a positive integer - column index counting from the left</li>
		 *     <li>a negative integer - column index counting from the right</li>
		 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
		 *   </ul>
		 *  @member
		 */
		"aoColumnDefs": null,
	
	
		/**
		 * Basically the same as oSearch, this parameter defines the individual column
		 * filtering state at initialisation time. The array must be of the same size 
		 * as the number of columns, and each element be an object with the parameters
		 * "sSearch" and "bEscapeRegex" (the latter is optional). 'null' is also
		 * accepted and the default will be used.
		 *  @type array
		 *  @default []
		 *  @dtopt Option
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoSearchCols": [
		 *          null,
		 *          { "sSearch": "My filter" },
		 *          null,
		 *          { "sSearch": "^[0-9]", "bEscapeRegex": false }
		 *        ]
		 *      } );
		 *    } )
		 */
		"aoSearchCols": [],
	
	
		/**
		 * An array of CSS classes that should be applied to displayed rows. This 
		 * array may be of any length, and DataTables will apply each class 
		 * sequentially, looping when required.
		 *  @type array
		 *  @default null <i>Will take the values determined by the oClasses.sStripe*
		 *    options</i>
		 *  @dtopt Option
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "asStripeClasses": [ 'strip1', 'strip2', 'strip3' ]
		 *      } );
		 *    } )
		 */
		"asStripeClasses": null,
	
	
		/**
		 * Enable or disable automatic column width calculation. This can be disabled
		 * as an optimisation (it takes some time to calculate the widths) if the
		 * tables widths are passed in using aoColumns.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bAutoWidth": false
		 *      } );
		 *    } );
		 */
		"bAutoWidth": true,
	
	
		/**
		 * Deferred rendering can provide DataTables with a huge speed boost when you
		 * are using an Ajax or JS data source for the table. This option, when set to
		 * true, will cause DataTables to defer the creation of the table elements for
		 * each row until they are needed for a draw - saving a significant amount of
		 * time.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sAjaxSource": "sources/arrays.txt",
		 *        "bDeferRender": true
		 *      } );
		 *    } );
		 */
		"bDeferRender": false,
	
	
		/**
		 * Replace a DataTable which matches the given selector and replace it with 
		 * one which has the properties of the new initialisation object passed. If no
		 * table matches the selector, then the new DataTable will be constructed as
		 * per normal.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false
		 *      } );
		 *      
		 *      // Some time later....
		 *      $('#example').dataTable( {
		 *        "bFilter": false,
		 *        "bDestroy": true
		 *      } );
		 *    } );
		 */
		"bDestroy": false,
	
	
		/**
		 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
		 * that it allows the end user to input multiple words (space separated) and
		 * will match a row containing those words, even if not in the order that was
		 * specified (this allow matching across multiple columns). Note that if you
		 * wish to use filtering in DataTables this must remain 'true' - to remove the
		 * default filtering input box and retain filtering abilities, please use
		 * {@link DataTable.defaults.sDom}.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bFilter": false
		 *      } );
		 *    } );
		 */
		"bFilter": true,
	
	
		/**
		 * Enable or disable the table information display. This shows information 
		 * about the data that is currently visible on the page, including information
		 * about filtered data if that action is being performed.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bInfo": false
		 *      } );
		 *    } );
		 */
		"bInfo": true,
	
	
		/**
		 * Enable jQuery UI ThemeRoller support (required as ThemeRoller requires some
		 * slightly different and additional mark-up from what DataTables has
		 * traditionally used).
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bJQueryUI": true
		 *      } );
		 *    } );
		 */
		"bJQueryUI": false,
	
	
		/**
		 * Allows the end user to select the size of a formatted page from a select
		 * menu (sizes are 10, 25, 50 and 100). Requires pagination (bPaginate).
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bLengthChange": false
		 *      } );
		 *    } );
		 */
		"bLengthChange": true,
	
	
		/**
		 * Enable or disable pagination.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bPaginate": false
		 *      } );
		 *    } );
		 */
		"bPaginate": true,
	
	
		/**
		 * Enable or disable the display of a 'processing' indicator when the table is
		 * being processed (e.g. a sort). This is particularly useful for tables with
		 * large amounts of data where it can take a noticeable amount of time to sort
		 * the entries.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bProcessing": true
		 *      } );
		 *    } );
		 */
		"bProcessing": false,
	
	
		/**
		 * Retrieve the DataTables object for the given selector. Note that if the
		 * table has already been initialised, this parameter will cause DataTables
		 * to simply return the object that has already been set up - it will not take
		 * account of any changes you might have made to the initialisation object
		 * passed to DataTables (setting this parameter to true is an acknowledgement
		 * that you understand this). bDestroy can be used to reinitialise a table if
		 * you need.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      initTable();
		 *      tableActions();
		 *    } );
		 *    
		 *    function initTable ()
		 *    {
		 *      return $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false,
		 *        "bRetrieve": true
		 *      } );
		 *    }
		 *    
		 *    function tableActions ()
		 *    {
		 *      var oTable = initTable();
		 *      // perform API operations with oTable 
		 *    }
		 */
		"bRetrieve": false,
	
	
		/**
		 * Indicate if DataTables should be allowed to set the padding / margin
		 * etc for the scrolling header elements or not. Typically you will want
		 * this.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bScrollAutoCss": false,
		 *        "sScrollY": "200px"
		 *      } );
		 *    } );
		 */
		"bScrollAutoCss": true,
	
	
		/**
		 * When vertical (y) scrolling is enabled, DataTables will force the height of
		 * the table's viewport to the given height at all times (useful for layout).
		 * However, this can look odd when filtering data down to a small data set,
		 * and the footer is left "floating" further down. This parameter (when
		 * enabled) will cause DataTables to collapse the table's viewport down when
		 * the result set will fit within the given Y height.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sScrollY": "200",
		 *        "bScrollCollapse": true
		 *      } );
		 *    } );
		 */
		"bScrollCollapse": false,
	
	
		/**
		 * Enable infinite scrolling for DataTables (to be used in combination with
		 * sScrollY). Infinite scrolling means that DataTables will continually load
		 * data as a user scrolls through a table, which is very useful for large
		 * dataset. This cannot be used with pagination, which is automatically
		 * disabled. Note - the Scroller extra for DataTables is recommended in
		 * in preference to this option.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bScrollInfinite": true,
		 *        "bScrollCollapse": true,
		 *        "sScrollY": "200px"
		 *      } );
		 *    } );
		 */
		"bScrollInfinite": false,
	
	
		/**
		 * Configure DataTables to use server-side processing. Note that the
		 * sAjaxSource parameter must also be given in order to give DataTables a
		 * source to obtain the required data for each draw.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 *  @dtopt Server-side
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bServerSide": true,
		 *        "sAjaxSource": "xhr.php"
		 *      } );
		 *    } );
		 */
		"bServerSide": false,
	
	
		/**
		 * Enable or disable sorting of columns. Sorting of individual columns can be
		 * disabled by the "bSortable" option for each column.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bSort": false
		 *      } );
		 *    } );
		 */
		"bSort": true,
	
	
		/**
		 * Allows control over whether DataTables should use the top (true) unique
		 * cell that is found for a single column, or the bottom (false - default).
		 * This is useful when using complex headers.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bSortCellsTop": true
		 *      } );
		 *    } );
		 */
		"bSortCellsTop": false,
	
	
		/**
		 * Enable or disable the addition of the classes 'sorting_1', 'sorting_2' and
		 * 'sorting_3' to the columns which are currently being sorted on. This is
		 * presented as a feature switch as it can increase processing time (while
		 * classes are removed and added) so for large data sets you might want to
		 * turn this off.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bSortClasses": false
		 *      } );
		 *    } );
		 */
		"bSortClasses": true,
	
	
		/**
		 * Enable or disable state saving. When enabled a cookie will be used to save
		 * table display information such as pagination information, display length,
		 * filtering and sorting. As such when the end user reloads the page the
		 * display display will match what thy had previously set up.
		 *  @type boolean
		 *  @default false
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true
		 *      } );
		 *    } );
		 */
		"bStateSave": false,
	
	
		/**
		 * Customise the cookie and / or the parameters being stored when using
		 * DataTables with state saving enabled. This function is called whenever
		 * the cookie is modified, and it expects a fully formed cookie string to be
		 * returned. Note that the data object passed in is a Javascript object which
		 * must be converted to a string (JSON.stringify for example).
		 *  @type function
		 *  @param {string} sName Name of the cookie defined by DataTables
		 *  @param {object} oData Data to be stored in the cookie
		 *  @param {string} sExpires Cookie expires string
		 *  @param {string} sPath Path of the cookie to set
		 *  @returns {string} Cookie formatted string (which should be encoded by
		 *    using encodeURIComponent())
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function () {
		 *      $('#example').dataTable( {
		 *        "fnCookieCallback": function (sName, oData, sExpires, sPath) {
		 *          // Customise oData or sName or whatever else here
		 *          return sName + "="+JSON.stringify(oData)+"; expires=" + sExpires +"; path=" + sPath;
		 *        }
		 *      } );
		 *    } );
		 */
		"fnCookieCallback": null,
	
	
		/**
		 * This function is called when a TR element is created (and all TD child
		 * elements have been inserted), or registered if using a DOM source, allowing
		 * manipulation of the TR element (adding classes etc).
		 *  @type function
		 *  @param {node} nRow "TR" element for the current row
		 *  @param {array} aData Raw data array for this row
		 *  @param {int} iDataIndex The index of this row in aoData
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnCreatedRow": function( nRow, aData, iDataIndex ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( aData[4] == "A" )
		 *          {
		 *            $('td:eq(4)', nRow).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnCreatedRow": null,
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify any aspect you want about the created DOM.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnDrawCallback": function( oSettings ) {
		 *          alert( 'DataTables has redrawn the table' );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnDrawCallback": null,
	
	
		/**
		 * Identical to fnHeaderCallback() but for the table footer this function
		 * allows you to modify the table footer on every 'draw' even.
		 *  @type function
		 *  @param {node} nFoot "TR" element for the footer
		 *  @param {array} aData Full table data (as derived from the original HTML)
		 *  @param {int} iStart Index for the current display starting point in the 
		 *    display array
		 *  @param {int} iEnd Index for the current display ending point in the 
		 *    display array
		 *  @param {array int} aiDisplay Index array to translate the visual position
		 *    to the full data array
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnFooterCallback": function( nFoot, aData, iStart, iEnd, aiDisplay ) {
		 *          nFoot.getElementsByTagName('th')[0].innerHTML = "Starting index is "+iStart;
		 *        }
		 *      } );
		 *    } )
		 */
		"fnFooterCallback": null,
	
	
		/**
		 * When rendering large numbers in the information element for the table
		 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
		 * to have a comma separator for the 'thousands' units (e.g. 1 million is
		 * rendered as "1,000,000") to help readability for the end user. This
		 * function will override the default method DataTables uses.
		 *  @type function
		 *  @member
		 *  @param {int} iIn number to be formatted
		 *  @returns {string} formatted string for DataTables to show the number
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnFormatNumber": function ( iIn ) {
		 *          if ( iIn &lt; 1000 ) {
		 *            return iIn;
		 *          } else {
		 *            var 
		 *              s=(iIn+""), 
		 *              a=s.split(""), out="", 
		 *              iLen=s.length;
		 *            
		 *            for ( var i=0 ; i&lt;iLen ; i++ ) {
		 *              if ( i%3 === 0 &amp;&amp; i !== 0 ) {
		 *                out = "'"+out;
		 *              }
		 *              out = a[iLen-i-1]+out;
		 *            }
		 *          }
		 *          return out;
		 *        };
		 *      } );
		 *    } );
		 */
		"fnFormatNumber": function ( iIn ) {
			if ( iIn < 1000 )
			{
				// A small optimisation for what is likely to be the majority of use cases
				return iIn;
			}
	
			var s=(iIn+""), a=s.split(""), out="", iLen=s.length;
			
			for ( var i=0 ; i<iLen ; i++ )
			{
				if ( i%3 === 0 && i !== 0 )
				{
					out = this.oLanguage.sInfoThousands+out;
				}
				out = a[iLen-i-1]+out;
			}
			return out;
		},
	
	
		/**
		 * This function is called on every 'draw' event, and allows you to
		 * dynamically modify the header row. This can be used to calculate and
		 * display useful information about the table.
		 *  @type function
		 *  @param {node} nHead "TR" element for the header
		 *  @param {array} aData Full table data (as derived from the original HTML)
		 *  @param {int} iStart Index for the current display starting point in the
		 *    display array
		 *  @param {int} iEnd Index for the current display ending point in the
		 *    display array
		 *  @param {array int} aiDisplay Index array to translate the visual position
		 *    to the full data array
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnHeaderCallback": function( nHead, aData, iStart, iEnd, aiDisplay ) {
		 *          nHead.getElementsByTagName('th')[0].innerHTML = "Displaying "+(iEnd-iStart)+" records";
		 *        }
		 *      } );
		 *    } )
		 */
		"fnHeaderCallback": null,
	
	
		/**
		 * The information element can be used to convey information about the current
		 * state of the table. Although the internationalisation options presented by
		 * DataTables are quite capable of dealing with most customisations, there may
		 * be times where you wish to customise the string further. This callback
		 * allows you to do exactly that.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {int} iStart Starting position in data for the draw
		 *  @param {int} iEnd End position in data for the draw
		 *  @param {int} iMax Total number of rows in the table (regardless of
		 *    filtering)
		 *  @param {int} iTotal Total number of rows in the data set, after filtering
		 *  @param {string} sPre The string that DataTables has formatted using it's
		 *    own rules
		 *  @returns {string} The string to be displayed in the information element.
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $('#example').dataTable( {
		 *      "fnInfoCallback": function( oSettings, iStart, iEnd, iMax, iTotal, sPre ) {
		 *        return iStart +" to "+ iEnd;
		 *      }
		 *    } );
		 */
		"fnInfoCallback": null,
	
	
		/**
		 * Called when the table has been initialised. Normally DataTables will
		 * initialise sequentially and there will be no need for this function,
		 * however, this does not hold true when using external language information
		 * since that is obtained using an async XHR call.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} json The JSON object request from the server - only
		 *    present if client-side Ajax sourced data is used
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnInitComplete": function(oSettings, json) {
		 *          alert( 'DataTables has finished its initialisation.' );
		 *        }
		 *      } );
		 *    } )
		 */
		"fnInitComplete": null,
	
	
		/**
		 * Called at the very start of each table draw and can be used to cancel the
		 * draw by returning false, any other return (including undefined) results in
		 * the full draw occurring).
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @returns {boolean} False will cancel the draw, anything else (including no
		 *    return) will allow it to complete.
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnPreDrawCallback": function( oSettings ) {
		 *          if ( $('#test').val() == 1 ) {
		 *            return false;
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnPreDrawCallback": null,
	
	
		/**
		 * This function allows you to 'post process' each row after it have been
		 * generated for each table draw, but before it is rendered on screen. This
		 * function might be used for setting the row class name etc.
		 *  @type function
		 *  @param {node} nRow "TR" element for the current row
		 *  @param {array} aData Raw data array for this row
		 *  @param {int} iDisplayIndex The display index for the current table draw
		 *  @param {int} iDisplayIndexFull The index of the data in the full list of
		 *    rows (after filtering)
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
		 *          // Bold the grade for all 'A' grade browsers
		 *          if ( aData[4] == "A" )
		 *          {
		 *            $('td:eq(4)', nRow).html( '<b>A</b>' );
		 *          }
		 *        }
		 *      } );
		 *    } );
		 */
		"fnRowCallback": null,
	
	
		/**
		 * This parameter allows you to override the default function which obtains
		 * the data from the server ($.getJSON) so something more suitable for your
		 * application. For example you could use POST data, or pull information from
		 * a Gears or AIR database.
		 *  @type function
		 *  @member
		 *  @param {string} sSource HTTP source to obtain the data from (sAjaxSource)
		 *  @param {array} aoData A key/value pair object containing the data to send
		 *    to the server
		 *  @param {function} fnCallback to be called on completion of the data get
		 *    process that will draw the data on the page.
		 *  @param {object} oSettings DataTables settings object
		 *  @dtopt Callbacks
		 *  @dtopt Server-side
		 * 
		 *  @example
		 *    // POST data to server
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bProcessing": true,
		 *        "bServerSide": true,
		 *        "sAjaxSource": "xhr.php",
		 *        "fnServerData": function ( sSource, aoData, fnCallback, oSettings ) {
		 *          oSettings.jqXHR = $.ajax( {
		 *            "dataType": 'json', 
		 *            "type": "POST", 
		 *            "url": sSource, 
		 *            "data": aoData, 
		 *            "success": fnCallback
		 *          } );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnServerData": function ( sUrl, aoData, fnCallback, oSettings ) {
			oSettings.jqXHR = $.ajax( {
				"url":  sUrl,
				"data": aoData,
				"success": function (json) {
					if ( json.sError ) {
						oSettings.oApi._fnLog( oSettings, 0, json.sError );
					}
					
					$(oSettings.oInstance).trigger('xhr', [oSettings, json]);
					fnCallback( json );
				},
				"dataType": "json",
				"cache": false,
				"type": oSettings.sServerMethod,
				"error": function (xhr, error, thrown) {
					if ( error == "parsererror" ) {
						oSettings.oApi._fnLog( oSettings, 0, "DataTables warning: JSON data from "+
							"server could not be parsed. This is caused by a JSON formatting error." );
					}
				}
			} );
		},
	
	
		/**
		 * It is often useful to send extra data to the server when making an Ajax
		 * request - for example custom filtering information, and this callback
		 * function makes it trivial to send extra information to the server. The
		 * passed in parameter is the data set that has been constructed by
		 * DataTables, and you can add to this or modify it as you require.
		 *  @type function
		 *  @param {array} aoData Data array (array of objects which are name/value
		 *    pairs) that has been constructed by DataTables and will be sent to the
		 *    server. In the case of Ajax sourced data with server-side processing
		 *    this will be an empty array, for server-side processing there will be a
		 *    significant number of parameters!
		 *  @returns {undefined} Ensure that you modify the aoData array passed in,
		 *    as this is passed by reference.
		 *  @dtopt Callbacks
		 *  @dtopt Server-side
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bProcessing": true,
		 *        "bServerSide": true,
		 *        "sAjaxSource": "scripts/server_processing.php",
		 *        "fnServerParams": function ( aoData ) {
		 *          aoData.push( { "name": "more_data", "value": "my_value" } );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnServerParams": null,
	
	
		/**
		 * Load the table state. With this function you can define from where, and how, the
		 * state of a table is loaded. By default DataTables will load from its state saving
		 * cookie, but you might wish to use local storage (HTML5) or a server-side database.
		 *  @type function
		 *  @member
		 *  @param {object} oSettings DataTables settings object
		 *  @return {object} The DataTables state object to be loaded
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateLoad": function (oSettings) {
		 *          var o;
		 *          
		 *          // Send an Ajax request to the server to get the data. Note that
		 *          // this is a synchronous request.
		 *          $.ajax( {
		 *            "url": "/state_load",
		 *            "async": false,
		 *            "dataType": "json",
		 *            "success": function (json) {
		 *              o = json;
		 *            }
		 *          } );
		 *          
		 *          return o;
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateLoad": function ( oSettings ) {
			var sData = this.oApi._fnReadCookie( oSettings.sCookiePrefix+oSettings.sInstance );
			var oData;
	
			try {
				oData = (typeof $.parseJSON === 'function') ? 
					$.parseJSON(sData) : eval( '('+sData+')' );
			} catch (e) {
				oData = null;
			}
	
			return oData;
		},
	
	
		/**
		 * Callback which allows modification of the saved state prior to loading that state.
		 * This callback is called when the table is loading state from the stored data, but
		 * prior to the settings object being modified by the saved state. Note that for 
		 * plug-in authors, you should use the 'stateLoadParams' event to load parameters for 
		 * a plug-in.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} oData The state object that is to be loaded
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    // Remove a saved filter, so filtering is never loaded
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateLoadParams": function (oSettings, oData) {
		 *          oData.oSearch.sSearch = "";
		 *        }
		 *      } );
		 *    } );
		 * 
		 *  @example
		 *    // Disallow state loading by returning false
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateLoadParams": function (oSettings, oData) {
		 *          return false;
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateLoadParams": null,
	
	
		/**
		 * Callback that is called when the state has been loaded from the state saving method
		 * and the DataTables settings object has been modified as a result of the loaded state.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} oData The state object that was loaded
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    // Show an alert with the filtering value that was saved
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateLoaded": function (oSettings, oData) {
		 *          alert( 'Saved filter was: '+oData.oSearch.sSearch );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateLoaded": null,
	
	
		/**
		 * Save the table state. This function allows you to define where and how the state
		 * information for the table is stored - by default it will use a cookie, but you
		 * might want to use local storage (HTML5) or a server-side database.
		 *  @type function
		 *  @member
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} oData The state object to be saved
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateSave": function (oSettings, oData) {
		 *          // Send an Ajax request to the server with the state object
		 *          $.ajax( {
		 *            "url": "/state_save",
		 *            "data": oData,
		 *            "dataType": "json",
		 *            "method": "POST"
		 *            "success": function () {}
		 *          } );
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateSave": function ( oSettings, oData ) {
			this.oApi._fnCreateCookie( 
				oSettings.sCookiePrefix+oSettings.sInstance, 
				this.oApi._fnJsonString(oData), 
				oSettings.iCookieDuration, 
				oSettings.sCookiePrefix, 
				oSettings.fnCookieCallback
			);
		},
	
	
		/**
		 * Callback which allows modification of the state to be saved. Called when the table 
		 * has changed state a new state save is required. This method allows modification of
		 * the state saving object prior to actually doing the save, including addition or 
		 * other state properties or modification. Note that for plug-in authors, you should 
		 * use the 'stateSaveParams' event to save parameters for a plug-in.
		 *  @type function
		 *  @param {object} oSettings DataTables settings object
		 *  @param {object} oData The state object to be saved
		 *  @dtopt Callbacks
		 * 
		 *  @example
		 *    // Remove a saved filter, so filtering is never saved
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bStateSave": true,
		 *        "fnStateSaveParams": function (oSettings, oData) {
		 *          oData.oSearch.sSearch = "";
		 *        }
		 *      } );
		 *    } );
		 */
		"fnStateSaveParams": null,
	
	
		/**
		 * Duration of the cookie which is used for storing session information. This
		 * value is given in seconds.
		 *  @type int
		 *  @default 7200 <i>(2 hours)</i>
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "iCookieDuration": 60*60*24; // 1 day
		 *      } );
		 *    } )
		 */
		"iCookieDuration": 7200,
	
	
		/**
		 * When enabled DataTables will not make a request to the server for the first
		 * page draw - rather it will use the data already on the page (no sorting etc
		 * will be applied to it), thus saving on an XHR at load time. iDeferLoading
		 * is used to indicate that deferred loading is required, but it is also used
		 * to tell DataTables how many records there are in the full table (allowing
		 * the information element and pagination to be displayed correctly). In the case
		 * where a filtering is applied to the table on initial load, this can be
		 * indicated by giving the parameter as an array, where the first element is
		 * the number of records available after filtering and the second element is the
		 * number of records without filtering (allowing the table information element
		 * to be shown correctly).
		 *  @type int | array
		 *  @default null
		 *  @dtopt Options
		 * 
		 *  @example
		 *    // 57 records available in the table, no filtering applied
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bServerSide": true,
		 *        "sAjaxSource": "scripts/server_processing.php",
		 *        "iDeferLoading": 57
		 *      } );
		 *    } );
		 * 
		 *  @example
		 *    // 57 records after filtering, 100 without filtering (an initial filter applied)
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bServerSide": true,
		 *        "sAjaxSource": "scripts/server_processing.php",
		 *        "iDeferLoading": [ 57, 100 ],
		 *        "oSearch": {
		 *          "sSearch": "my_filter"
		 *        }
		 *      } );
		 *    } );
		 */
		"iDeferLoading": null,
	
	
		/**
		 * Number of rows to display on a single page when using pagination. If
		 * feature enabled (bLengthChange) then the end user will be able to override
		 * this to a custom setting using a pop-up menu.
		 *  @type int
		 *  @default 10
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "iDisplayLength": 50
		 *      } );
		 *    } )
		 */
		"iDisplayLength": 10,
	
	
		/**
		 * Define the starting point for data display when using DataTables with
		 * pagination. Note that this parameter is the number of records, rather than
		 * the page number, so if you have 10 records per page and want to start on
		 * the third page, it should be "20".
		 *  @type int
		 *  @default 0
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "iDisplayStart": 20
		 *      } );
		 *    } )
		 */
		"iDisplayStart": 0,
	
	
		/**
		 * The scroll gap is the amount of scrolling that is left to go before
		 * DataTables will load the next 'page' of data automatically. You typically
		 * want a gap which is big enough that the scrolling will be smooth for the
		 * user, while not so large that it will load more data than need.
		 *  @type int
		 *  @default 100
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bScrollInfinite": true,
		 *        "bScrollCollapse": true,
		 *        "sScrollY": "200px",
		 *        "iScrollLoadGap": 50
		 *      } );
		 *    } );
		 */
		"iScrollLoadGap": 100,
	
	
		/**
		 * By default DataTables allows keyboard navigation of the table (sorting, paging,
		 * and filtering) by adding a tabindex attribute to the required elements. This
		 * allows you to tab through the controls and press the enter key to activate them.
		 * The tabindex is default 0, meaning that the tab follows the flow of the document.
		 * You can overrule this using this parameter if you wish. Use a value of -1 to
		 * disable built-in keyboard navigation.
		 *  @type int
		 *  @default 0
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "iTabIndex": 1
		 *      } );
		 *    } );
		 */
		"iTabIndex": 0,
	
	
		/**
		 * All strings that DataTables uses in the user interface that it creates
		 * are defined in this object, allowing you to modified them individually or
		 * completely replace them all as required.
		 *  @namespace
		 */
		"oLanguage": {
			/**
			 * Strings that are used for WAI-ARIA labels and controls only (these are not
			 * actually visible on the page, but will be read by screenreaders, and thus
			 * must be internationalised as well).
			 *  @namespace
			 */
			"oAria": {
				/**
				 * ARIA label that is added to the table headers when the column may be
				 * sorted ascending by activing the column (click or return when focused).
				 * Note that the column header is prefixed to this string.
				 *  @type string
				 *  @default : activate to sort column ascending
				 *  @dtopt Language
				 * 
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oAria": {
				 *            "sSortAscending": " - click/return to sort ascending"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sSortAscending": ": activate to sort column ascending",
	
				/**
				 * ARIA label that is added to the table headers when the column may be
				 * sorted descending by activing the column (click or return when focused).
				 * Note that the column header is prefixed to this string.
				 *  @type string
				 *  @default : activate to sort column ascending
				 *  @dtopt Language
				 * 
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oAria": {
				 *            "sSortDescending": " - click/return to sort descending"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sSortDescending": ": activate to sort column descending"
			},
	
			/**
			 * Pagination string used by DataTables for the two built-in pagination
			 * control types ("two_button" and "full_numbers")
			 *  @namespace
			 */
			"oPaginate": {
				/**
				 * Text to use when using the 'full_numbers' type of pagination for the
				 * button to take the user to the first page.
				 *  @type string
				 *  @default First
				 *  @dtopt Language
				 * 
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oPaginate": {
				 *            "sFirst": "First page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sFirst": "First",
			
			
				/**
				 * Text to use when using the 'full_numbers' type of pagination for the
				 * button to take the user to the last page.
				 *  @type string
				 *  @default Last
				 *  @dtopt Language
				 * 
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oPaginate": {
				 *            "sLast": "Last page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sLast": "Last",
			
			
				/**
				 * Text to use for the 'next' pagination button (to take the user to the 
				 * next page).
				 *  @type string
				 *  @default Next
				 *  @dtopt Language
				 * 
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oPaginate": {
				 *            "sNext": "Next page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sNext": "Next",
			
			
				/**
				 * Text to use for the 'previous' pagination button (to take the user to  
				 * the previous page).
				 *  @type string
				 *  @default Previous
				 *  @dtopt Language
				 * 
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "oLanguage": {
				 *          "oPaginate": {
				 *            "sPrevious": "Previous page"
				 *          }
				 *        }
				 *      } );
				 *    } );
				 */
				"sPrevious": "Previous"
			},
		
			/**
			 * This string is shown in preference to sZeroRecords when the table is
			 * empty of data (regardless of filtering). Note that this is an optional
			 * parameter - if it is not given, the value of sZeroRecords will be used
			 * instead (either the default or given value).
			 *  @type string
			 *  @default No data available in table
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sEmptyTable": "No data available in table"
			 *        }
			 *      } );
			 *    } );
			 */
			"sEmptyTable": "No data available in table",
		
		
			/**
			 * This string gives information to the end user about the information that 
			 * is current on display on the page. The _START_, _END_ and _TOTAL_ 
			 * variables are all dynamically replaced as the table display updates, and 
			 * can be freely moved or removed as the language requirements change.
			 *  @type string
			 *  @default Showing _START_ to _END_ of _TOTAL_ entries
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfo": "Got a total of _TOTAL_ entries to show (_START_ to _END_)"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
		
		
			/**
			 * Display information string for when the table is empty. Typically the 
			 * format of this string should match sInfo.
			 *  @type string
			 *  @default Showing 0 to 0 of 0 entries
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfoEmpty": "No entries to show"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoEmpty": "Showing 0 to 0 of 0 entries",
		
		
			/**
			 * When a user filters the information in a table, this string is appended 
			 * to the information (sInfo) to give an idea of how strong the filtering 
			 * is. The variable _MAX_ is dynamically updated.
			 *  @type string
			 *  @default (filtered from _MAX_ total entries)
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfoFiltered": " - filtering from _MAX_ records"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoFiltered": "(filtered from _MAX_ total entries)",
		
		
			/**
			 * If can be useful to append extra information to the info string at times,
			 * and this variable does exactly that. This information will be appended to
			 * the sInfo (sInfoEmpty and sInfoFiltered in whatever combination they are
			 * being used) at all times.
			 *  @type string
			 *  @default <i>Empty string</i>
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfoPostFix": "All records shown are derived from real information."
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoPostFix": "",
		
		
			/**
			 * DataTables has a build in number formatter (fnFormatNumber) which is used
			 * to format large numbers that are used in the table information. By
			 * default a comma is used, but this can be trivially changed to any
			 * character you wish with this parameter.
			 *  @type string
			 *  @default ,
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sInfoThousands": "'"
			 *        }
			 *      } );
			 *    } );
			 */
			"sInfoThousands": ",",
		
		
			/**
			 * Detail the action that will be taken when the drop down menu for the
			 * pagination length option is changed. The '_MENU_' variable is replaced
			 * with a default select list of 10, 25, 50 and 100, and can be replaced
			 * with a custom select box if required.
			 *  @type string
			 *  @default Show _MENU_ entries
			 *  @dtopt Language
			 * 
			 *  @example
			 *    // Language change only
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sLengthMenu": "Display _MENU_ records"
			 *        }
			 *      } );
			 *    } );
			 *    
			 *  @example
			 *    // Language and options change
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sLengthMenu": 'Display <select>'+
			 *            '<option value="10">10</option>'+
			 *            '<option value="20">20</option>'+
			 *            '<option value="30">30</option>'+
			 *            '<option value="40">40</option>'+
			 *            '<option value="50">50</option>'+
			 *            '<option value="-1">All</option>'+
			 *            '</select> records'
			 *        }
			 *      } );
			 *    } );
			 */
			"sLengthMenu": "Show _MENU_ entries",
		
		
			/**
			 * When using Ajax sourced data and during the first draw when DataTables is
			 * gathering the data, this message is shown in an empty row in the table to
			 * indicate to the end user the the data is being loaded. Note that this
			 * parameter is not used when loading data by server-side processing, just
			 * Ajax sourced data with client-side processing.
			 *  @type string
			 *  @default Loading...
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sLoadingRecords": "Please wait - loading..."
			 *        }
			 *      } );
			 *    } );
			 */
			"sLoadingRecords": "Loading...",
		
		
			/**
			 * Text which is displayed when the table is processing a user action
			 * (usually a sort command or similar).
			 *  @type string
			 *  @default Processing...
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sProcessing": "DataTables is currently busy"
			 *        }
			 *      } );
			 *    } );
			 */
			"sProcessing": "Processing...",
		
		
			/**
			 * Details the actions that will be taken when the user types into the
			 * filtering input text box. The variable "_INPUT_", if used in the string,
			 * is replaced with the HTML text box for the filtering input allowing
			 * control over where it appears in the string. If "_INPUT_" is not given
			 * then the input box is appended to the string automatically.
			 *  @type string
			 *  @default Search:
			 *  @dtopt Language
			 * 
			 *  @example
			 *    // Input text box will be appended at the end automatically
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sSearch": "Filter records:"
			 *        }
			 *      } );
			 *    } );
			 *    
			 *  @example
			 *    // Specify where the filter should appear
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sSearch": "Apply filter _INPUT_ to table"
			 *        }
			 *      } );
			 *    } );
			 */
			"sSearch": "Search:",
		
		
			/**
			 * All of the language information can be stored in a file on the
			 * server-side, which DataTables will look up if this parameter is passed.
			 * It must store the URL of the language file, which is in a JSON format,
			 * and the object has the same properties as the oLanguage object in the
			 * initialiser object (i.e. the above parameters). Please refer to one of
			 * the example language files to see how this works in action.
			 *  @type string
			 *  @default <i>Empty string - i.e. disabled</i>
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sUrl": "http://www.sprymedia.co.uk/dataTables/lang.txt"
			 *        }
			 *      } );
			 *    } );
			 */
			"sUrl": "",
		
		
			/**
			 * Text shown inside the table records when the is no information to be
			 * displayed after filtering. sEmptyTable is shown when there is simply no
			 * information in the table at all (regardless of filtering).
			 *  @type string
			 *  @default No matching records found
			 *  @dtopt Language
			 * 
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "oLanguage": {
			 *          "sZeroRecords": "No records to display"
			 *        }
			 *      } );
			 *    } );
			 */
			"sZeroRecords": "No matching records found"
		},
	
	
		/**
		 * This parameter allows you to have define the global filtering state at
		 * initialisation time. As an object the "sSearch" parameter must be
		 * defined, but all other parameters are optional. When "bRegex" is true,
		 * the search string will be treated as a regular expression, when false
		 * (default) it will be treated as a straight string. When "bSmart"
		 * DataTables will use it's smart filtering methods (to word match at
		 * any point in the data), when false this will not be done.
		 *  @namespace
		 *  @extends DataTable.models.oSearch
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "oSearch": {"sSearch": "Initial search"}
		 *      } );
		 *    } )
		 */
		"oSearch": $.extend( {}, DataTable.models.oSearch ),
	
	
		/**
		 * By default DataTables will look for the property 'aaData' when obtaining
		 * data from an Ajax source or for server-side processing - this parameter
		 * allows that property to be changed. You can use Javascript dotted object
		 * notation to get a data source for multiple levels of nesting.
		 *  @type string
		 *  @default aaData
		 *  @dtopt Options
		 *  @dtopt Server-side
		 * 
		 *  @example
		 *    // Get data from { "data": [...] }
		 *    $(document).ready( function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sAjaxSource": "sources/data.txt",
		 *        "sAjaxDataProp": "data"
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Get data from { "data": { "inner": [...] } }
		 *    $(document).ready( function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sAjaxSource": "sources/data.txt",
		 *        "sAjaxDataProp": "data.inner"
		 *      } );
		 *    } );
		 */
		"sAjaxDataProp": "aaData",
	
	
		/**
		 * You can instruct DataTables to load data from an external source using this
		 * parameter (use aData if you want to pass data in you already have). Simply
		 * provide a url a JSON object can be obtained from. This object must include
		 * the parameter 'aaData' which is the data source for the table.
		 *  @type string
		 *  @default null
		 *  @dtopt Options
		 *  @dtopt Server-side
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sAjaxSource": "http://www.sprymedia.co.uk/dataTables/json.php"
		 *      } );
		 *    } )
		 */
		"sAjaxSource": null,
	
	
		/**
		 * This parameter can be used to override the default prefix that DataTables
		 * assigns to a cookie when state saving is enabled.
		 *  @type string
		 *  @default SpryMedia_DataTables_
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sCookiePrefix": "my_datatable_",
		 *      } );
		 *    } );
		 */
		"sCookiePrefix": "SpryMedia_DataTables_",
	
	
		/**
		 * This initialisation variable allows you to specify exactly where in the
		 * DOM you want DataTables to inject the various controls it adds to the page
		 * (for example you might want the pagination controls at the top of the
		 * table). DIV elements (with or without a custom class) can also be added to
		 * aid styling. The follow syntax is used:
		 *   <ul>
		 *     <li>The following options are allowed:	
		 *       <ul>
		 *         <li>'l' - Length changing</li
		 *         <li>'f' - Filtering input</li>
		 *         <li>'t' - The table!</li>
		 *         <li>'i' - Information</li>
		 *         <li>'p' - Pagination</li>
		 *         <li>'r' - pRocessing</li>
		 *       </ul>
		 *     </li>
		 *     <li>The following constants are allowed:
		 *       <ul>
		 *         <li>'H' - jQueryUI theme "header" classes ('fg-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix')</li>
		 *         <li>'F' - jQueryUI theme "footer" classes ('fg-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix')</li>
		 *       </ul>
		 *     </li>
		 *     <li>The following syntax is expected:
		 *       <ul>
		 *         <li>'&lt;' and '&gt;' - div elements</li>
		 *         <li>'&lt;"class" and '&gt;' - div with a class</li>
		 *         <li>'&lt;"#id" and '&gt;' - div with an ID</li>
		 *       </ul>
		 *     </li>
		 *     <li>Examples:
		 *       <ul>
		 *         <li>'&lt;"wrapper"flipt&gt;'</li>
		 *         <li>'&lt;lf&lt;t&gt;ip&gt;'</li>
		 *       </ul>
		 *     </li>
		 *   </ul>
		 *  @type string
		 *  @default lfrtip <i>(when bJQueryUI is false)</i> <b>or</b> 
		 *    <"H"lfr>t<"F"ip> <i>(when bJQueryUI is true)</i>
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sDom": '&lt;"top"i&gt;rt&lt;"bottom"flp&gt;&lt;"clear"&gt;'
		 *      } );
		 *    } );
		 */
		"sDom": "lfrtip",
	
	
		/**
		 * DataTables features two different built-in pagination interaction methods
		 * ('two_button' or 'full_numbers') which present different page controls to
		 * the end user. Further methods can be added using the API (see below).
		 *  @type string
		 *  @default two_button
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sPaginationType": "full_numbers"
		 *      } );
		 *    } )
		 */
		"sPaginationType": "two_button",
	
	
		/**
		 * Enable horizontal scrolling. When a table is too wide to fit into a certain
		 * layout, or you have a large number of columns in the table, you can enable
		 * x-scrolling to show the table in a viewport, which can be scrolled. This
		 * property can be any CSS unit, or a number (in which case it will be treated
		 * as a pixel measurement).
		 *  @type string
		 *  @default <i>blank string - i.e. disabled</i>
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sScrollX": "100%",
		 *        "bScrollCollapse": true
		 *      } );
		 *    } );
		 */
		"sScrollX": "",
	
	
		/**
		 * This property can be used to force a DataTable to use more width than it
		 * might otherwise do when x-scrolling is enabled. For example if you have a
		 * table which requires to be well spaced, this parameter is useful for
		 * "over-sizing" the table, and thus forcing scrolling. This property can by
		 * any CSS unit, or a number (in which case it will be treated as a pixel
		 * measurement).
		 *  @type string
		 *  @default <i>blank string - i.e. disabled</i>
		 *  @dtopt Options
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sScrollX": "100%",
		 *        "sScrollXInner": "110%"
		 *      } );
		 *    } );
		 */
		"sScrollXInner": "",
	
	
		/**
		 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
		 * to the given height, and enable scrolling for any data which overflows the
		 * current viewport. This can be used as an alternative to paging to display
		 * a lot of data in a small area (although paging and scrolling can both be
		 * enabled at the same time). This property can be any CSS unit, or a number
		 * (in which case it will be treated as a pixel measurement).
		 *  @type string
		 *  @default <i>blank string - i.e. disabled</i>
		 *  @dtopt Features
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "sScrollY": "200px",
		 *        "bPaginate": false
		 *      } );
		 *    } );
		 */
		"sScrollY": "",
	
	
		/**
		 * Set the HTTP method that is used to make the Ajax call for server-side
		 * processing or Ajax sourced data.
		 *  @type string
		 *  @default GET
		 *  @dtopt Options
		 *  @dtopt Server-side
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "bServerSide": true,
		 *        "sAjaxSource": "scripts/post.php",
		 *        "sServerMethod": "POST"
		 *      } );
		 *    } );
		 */
		"sServerMethod": "GET"
	};
	
	
	
	/**
	 * Column options that can be given to DataTables at initialisation time.
	 *  @namespace
	 */
	DataTable.defaults.columns = {
		/**
		 * Allows a column's sorting to take multiple columns into account when 
		 * doing a sort. For example first name / last name columns make sense to 
		 * do a multi-column sort over the two columns.
		 *  @type array
		 *  @default null <i>Takes the value of the column index automatically</i>
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "aDataSort": [ 0, 1 ], "aTargets": [ 0 ] },
		 *          { "aDataSort": [ 1, 0 ], "aTargets": [ 1 ] },
		 *          { "aDataSort": [ 2, 3, 4 ], "aTargets": [ 2 ] }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          { "aDataSort": [ 0, 1 ] },
		 *          { "aDataSort": [ 1, 0 ] },
		 *          { "aDataSort": [ 2, 3, 4 ] },
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"aDataSort": null,
	
	
		/**
		 * You can control the default sorting direction, and even alter the behaviour
		 * of the sort handler (i.e. only allow ascending sorting etc) using this
		 * parameter.
		 *  @type array
		 *  @default [ 'asc', 'desc' ]
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "asSorting": [ "asc" ], "aTargets": [ 1 ] },
		 *          { "asSorting": [ "desc", "asc", "asc" ], "aTargets": [ 2 ] },
		 *          { "asSorting": [ "desc" ], "aTargets": [ 3 ] }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          null,
		 *          { "asSorting": [ "asc" ] },
		 *          { "asSorting": [ "desc", "asc", "asc" ] },
		 *          { "asSorting": [ "desc" ] },
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"asSorting": [ 'asc', 'desc' ],
	
	
		/**
		 * Enable or disable filtering on the data in this column.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          { "bSearchable": false, "aTargets": [ 0 ] }
		 *        ] } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          { "bSearchable": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
		 */
		"bSearchable": true,
	
	
		/**
		 * Enable or disable sorting on this column.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          { "bSortable": false, "aTargets": [ 0 ] }
		 *        ] } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          { "bSortable": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
		 */
		"bSortable": true,
	
	
		/**
		 * <code>Deprecated</code> When using fnRender() for a column, you may wish 
		 * to use the original data (before rendering) for sorting and filtering 
		 * (the default is to used the rendered data that the user can see). This 
		 * may be useful for dates etc.
		 * 
		 * Please note that this option has now been deprecated and will be removed
		 * in the next version of DataTables. Please use mRender / mData rather than
		 * fnRender.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Columns
		 *  @deprecated
		 */
		"bUseRendered": true,
	
	
		/**
		 * Enable or disable the display of this column.
		 *  @type boolean
		 *  @default true
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          { "bVisible": false, "aTargets": [ 0 ] }
		 *        ] } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          { "bVisible": false },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ] } );
		 *    } );
		 */
		"bVisible": true,
		
		
		/**
		 * Developer definable function that is called whenever a cell is created (Ajax source,
		 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
		 * allowing you to modify the DOM element (add background colour for example) when the
		 * element is available.
		 *  @type function
		 *  @param {element} nTd The TD node that has been created
		 *  @param {*} sData The Data for the cell
		 *  @param {array|object} oData The data for the whole row
		 *  @param {int} iRow The row index for the aoData data store
		 *  @param {int} iCol The column index for aoColumns
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ {
		 *          "aTargets": [3],
		 *          "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
		 *            if ( sData == "1.7" ) {
		 *              $(nTd).css('color', 'blue')
		 *            }
		 *          }
		 *        } ]
		 *      });
		 *    } );
		 */
		"fnCreatedCell": null,
	
	
		/**
		 * <code>Deprecated</code> Custom display function that will be called for the 
		 * display of each cell in this column.
		 *
		 * Please note that this option has now been deprecated and will be removed
		 * in the next version of DataTables. Please use mRender / mData rather than
		 * fnRender.
		 *  @type function
		 *  @param {object} o Object with the following parameters:
		 *  @param {int}    o.iDataRow The row in aoData
		 *  @param {int}    o.iDataColumn The column in question
		 *  @param {array}  o.aData The data for the row in question
		 *  @param {object} o.oSettings The settings object for this DataTables instance
		 *  @param {object} o.mDataProp The data property used for this column
		 *  @param {*}      val The current cell value
		 *  @returns {string} The string you which to use in the display
		 *  @dtopt Columns
		 *  @deprecated
		 */
		"fnRender": null,
	
	
		/**
		 * The column index (starting from 0!) that you wish a sort to be performed
		 * upon when this column is selected for sorting. This can be used for sorting
		 * on hidden columns for example.
		 *  @type int
		 *  @default -1 <i>Use automatically calculated column index</i>
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          { "iDataSort": 1, "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          { "iDataSort": 1 },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"iDataSort": -1,
	
	
		/**
		 * This parameter has been replaced by mData in DataTables to ensure naming
		 * consistency. mDataProp can still be used, as there is backwards compatibility
		 * in DataTables for this option, but it is strongly recommended that you use
		 * mData in preference to mDataProp.
		 *  @name DataTable.defaults.columns.mDataProp
		 */
	
	
		/**
		 * This property can be used to read data from any JSON data source property,
		 * including deeply nested objects / properties. mData can be given in a
		 * number of different ways which effect its behaviour:
		 *   <ul>
		 *     <li>integer - treated as an array index for the data source. This is the
		 *       default that DataTables uses (incrementally increased for each column).</li>
		 *     <li>string - read an object property from the data source. Note that you can
		 *       use Javascript dotted notation to read deep properties / arrays from the
		 *       data source.</li>
		 *     <li>null - the sDefaultContent option will be used for the cell (null
		 *       by default, so you will need to specify the default content you want -
		 *       typically an empty string). This can be useful on generated columns such 
		 *       as edit / delete action columns.</li>
		 *     <li>function - the function given will be executed whenever DataTables 
		 *       needs to set or get the data for a cell in the column. The function 
		 *       takes three parameters:
		 *       <ul>
		 *         <li>{array|object} The data source for the row</li>
		 *         <li>{string} The type call data requested - this will be 'set' when
		 *           setting data or 'filter', 'display', 'type', 'sort' or undefined when 
		 *           gathering data. Note that when <i>undefined</i> is given for the type
		 *           DataTables expects to get the raw data for the object back</li>
		 *         <li>{*} Data to set when the second parameter is 'set'.</li>
		 *       </ul>
		 *       The return value from the function is not required when 'set' is the type
		 *       of call, but otherwise the return is what will be used for the data
		 *       requested.</li>
		 *    </ul>
		 *
		 * Note that prior to DataTables 1.9.2 mData was called mDataProp. The name change
		 * reflects the flexibility of this property and is consistent with the naming of
		 * mRender. If 'mDataProp' is given, then it will still be used by DataTables, as
		 * it automatically maps the old name to the new if required.
		 *  @type string|int|function|null
		 *  @default null <i>Use automatically calculated column index</i>
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Read table data from objects
		 *    $(document).ready( function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sAjaxSource": "sources/deep.txt",
		 *        "aoColumns": [
		 *          { "mData": "engine" },
		 *          { "mData": "browser" },
		 *          { "mData": "platform.inner" },
		 *          { "mData": "platform.details.0" },
		 *          { "mData": "platform.details.1" }
		 *        ]
		 *      } );
		 *    } );
		 * 
		 *  @example
		 *    // Using mData as a function to provide different information for
		 *    // sorting, filtering and display. In this case, currency (price)
		 *    $(document).ready( function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "aoColumnDefs": [ {
		 *          "aTargets": [ 0 ],
		 *          "mData": function ( source, type, val ) {
		 *            if (type === 'set') {
		 *              source.price = val;
		 *              // Store the computed dislay and filter values for efficiency
		 *              source.price_display = val=="" ? "" : "$"+numberFormat(val);
		 *              source.price_filter  = val=="" ? "" : "$"+numberFormat(val)+" "+val;
		 *              return;
		 *            }
		 *            else if (type === 'display') {
		 *              return source.price_display;
		 *            }
		 *            else if (type === 'filter') {
		 *              return source.price_filter;
		 *            }
		 *            // 'sort', 'type' and undefined all just use the integer
		 *            return source.price;
		 *          }
		 *        } ]
		 *      } );
		 *    } );
		 */
		"mData": null,
	
	
		/**
		 * This property is the rendering partner to mData and it is suggested that
		 * when you want to manipulate data for display (including filtering, sorting etc)
		 * but not altering the underlying data for the table, use this property. mData
		 * can actually do everything this property can and more, but this parameter is
		 * easier to use since there is no 'set' option. Like mData is can be given
		 * in a number of different ways to effect its behaviour, with the addition of 
		 * supporting array syntax for easy outputting of arrays (including arrays of
		 * objects):
		 *   <ul>
		 *     <li>integer - treated as an array index for the data source. This is the
		 *       default that DataTables uses (incrementally increased for each column).</li>
		 *     <li>string - read an object property from the data source. Note that you can
		 *       use Javascript dotted notation to read deep properties / arrays from the
		 *       data source and also array brackets to indicate that the data reader should
		 *       loop over the data source array. When characters are given between the array
		 *       brackets, these characters are used to join the data source array together.
		 *       For example: "accounts[, ].name" would result in a comma separated list with
		 *       the 'name' value from the 'accounts' array of objects.</li>
		 *     <li>function - the function given will be executed whenever DataTables 
		 *       needs to set or get the data for a cell in the column. The function 
		 *       takes three parameters:
		 *       <ul>
		 *         <li>{array|object} The data source for the row (based on mData)</li>
		 *         <li>{string} The type call data requested - this will be 'filter', 'display', 
		 *           'type' or 'sort'.</li>
		 *         <li>{array|object} The full data source for the row (not based on mData)</li>
		 *       </ul>
		 *       The return value from the function is what will be used for the data
		 *       requested.</li>
		 *    </ul>
		 *  @type string|int|function|null
		 *  @default null <i>Use mData</i>
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Create a comma separated list from an array of objects
		 *    $(document).ready( function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "sAjaxSource": "sources/deep.txt",
		 *        "aoColumns": [
		 *          { "mData": "engine" },
		 *          { "mData": "browser" },
		 *          {
		 *            "mData": "platform",
		 *            "mRender": "[, ].name"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 * 
		 *  @example
		 *    // Use as a function to create a link from the data source
		 *    $(document).ready( function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *        {
		 *          "aTargets": [ 0 ],
		 *          "mData": "download_link",
		 *          "mRender": function ( data, type, full ) {
		 *            return '<a href="'+data+'">Download</a>';
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 */
		"mRender": null,
	
	
		/**
		 * Change the cell type created for the column - either TD cells or TH cells. This
		 * can be useful as TH cells have semantic meaning in the table body, allowing them
		 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
		 *  @type string
		 *  @default td
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Make the first column use TH cells
		 *    $(document).ready( function() {
		 *      var oTable = $('#example').dataTable( {
		 *        "aoColumnDefs": [ {
		 *          "aTargets": [ 0 ],
		 *          "sCellType": "th"
		 *        } ]
		 *      } );
		 *    } );
		 */
		"sCellType": "td",
	
	
		/**
		 * Class to give to each cell in this column.
		 *  @type string
		 *  @default <i>Empty string</i>
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          { "sClass": "my_class", "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          { "sClass": "my_class" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sClass": "",
		
		/**
		 * When DataTables calculates the column widths to assign to each column,
		 * it finds the longest string in each column and then constructs a
		 * temporary table and reads the widths from that. The problem with this
		 * is that "mmm" is much wider then "iiii", but the latter is a longer 
		 * string - thus the calculation can go wrong (doing it properly and putting
		 * it into an DOM object and measuring that is horribly(!) slow). Thus as
		 * a "work around" we provide this option. It will append its value to the
		 * text that is found to be the longest string for the column - i.e. padding.
		 * Generally you shouldn't need this, and it is not documented on the 
		 * general DataTables.net documentation
		 *  @type string
		 *  @default <i>Empty string<i>
		 *  @dtopt Columns
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          null,
		 *          null,
		 *          null,
		 *          {
		 *            "sContentPadding": "mmm"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sContentPadding": "",
	
	
		/**
		 * Allows a default value to be given for a column's data, and will be used
		 * whenever a null data source is encountered (this can be because mData
		 * is set to null, or because the data source itself is null).
		 *  @type string
		 *  @default null
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          {
		 *            "mData": null,
		 *            "sDefaultContent": "Edit",
		 *            "aTargets": [ -1 ]
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          null,
		 *          null,
		 *          null,
		 *          {
		 *            "mData": null,
		 *            "sDefaultContent": "Edit"
		 *          }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sDefaultContent": null,
	
	
		/**
		 * This parameter is only used in DataTables' server-side processing. It can
		 * be exceptionally useful to know what columns are being displayed on the
		 * client side, and to map these to database fields. When defined, the names
		 * also allow DataTables to reorder information from the server if it comes
		 * back in an unexpected order (i.e. if you switch your columns around on the
		 * client-side, your server-side code does not also need updating).
		 *  @type string
		 *  @default <i>Empty string</i>
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          { "sName": "engine", "aTargets": [ 0 ] },
		 *          { "sName": "browser", "aTargets": [ 1 ] },
		 *          { "sName": "platform", "aTargets": [ 2 ] },
		 *          { "sName": "version", "aTargets": [ 3 ] },
		 *          { "sName": "grade", "aTargets": [ 4 ] }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          { "sName": "engine" },
		 *          { "sName": "browser" },
		 *          { "sName": "platform" },
		 *          { "sName": "version" },
		 *          { "sName": "grade" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sName": "",
	
	
		/**
		 * Defines a data source type for the sorting which can be used to read
		 * real-time information from the table (updating the internally cached
		 * version) prior to sorting. This allows sorting to occur on user editable
		 * elements such as form inputs.
		 *  @type string
		 *  @default std
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [
		 *          { "sSortDataType": "dom-text", "aTargets": [ 2, 3 ] },
		 *          { "sType": "numeric", "aTargets": [ 3 ] },
		 *          { "sSortDataType": "dom-select", "aTargets": [ 4 ] },
		 *          { "sSortDataType": "dom-checkbox", "aTargets": [ 5 ] }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [
		 *          null,
		 *          null,
		 *          { "sSortDataType": "dom-text" },
		 *          { "sSortDataType": "dom-text", "sType": "numeric" },
		 *          { "sSortDataType": "dom-select" },
		 *          { "sSortDataType": "dom-checkbox" }
		 *        ]
		 *      } );
		 *    } );
		 */
		"sSortDataType": "std",
	
	
		/**
		 * The title of this column.
		 *  @type string
		 *  @default null <i>Derived from the 'TH' value for this column in the 
		 *    original HTML table.</i>
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          { "sTitle": "My column title", "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          { "sTitle": "My column title" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sTitle": null,
	
	
		/**
		 * The type allows you to specify how the data for this column will be sorted.
		 * Four types (string, numeric, date and html (which will strip HTML tags
		 * before sorting)) are currently available. Note that only date formats
		 * understood by Javascript's Date() object will be accepted as type date. For
		 * example: "Mar 26, 2008 5:03 PM". May take the values: 'string', 'numeric',
		 * 'date' or 'html' (by default). Further types can be adding through
		 * plug-ins.
		 *  @type string
		 *  @default null <i>Auto-detected from raw data</i>
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          { "sType": "html", "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          { "sType": "html" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sType": null,
	
	
		/**
		 * Defining the width of the column, this parameter may take any CSS value
		 * (3em, 20px etc). DataTables apples 'smart' widths to columns which have not
		 * been given a specific width through this interface ensuring that the table
		 * remains readable.
		 *  @type string
		 *  @default null <i>Automatic</i>
		 *  @dtopt Columns
		 * 
		 *  @example
		 *    // Using aoColumnDefs
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumnDefs": [ 
		 *          { "sWidth": "20%", "aTargets": [ 0 ] }
		 *        ]
		 *      } );
		 *    } );
		 *    
		 *  @example
		 *    // Using aoColumns
		 *    $(document).ready( function() {
		 *      $('#example').dataTable( {
		 *        "aoColumns": [ 
		 *          { "sWidth": "20%" },
		 *          null,
		 *          null,
		 *          null,
		 *          null
		 *        ]
		 *      } );
		 *    } );
		 */
		"sWidth": null
	};
	
	
	
	/**
	 * DataTables settings object - this holds all the information needed for a
	 * given table, including configuration, data and current application of the
	 * table options. DataTables does not have a single instance for each DataTable
	 * with the settings attached to that instance, but rather instances of the
	 * DataTable "class" are created on-the-fly as needed (typically by a 
	 * $().dataTable() call) and the settings object is then applied to that
	 * instance.
	 * 
	 * Note that this object is related to {@link DataTable.defaults} but this 
	 * one is the internal data store for DataTables's cache of columns. It should
	 * NOT be manipulated outside of DataTables. Any configuration should be done
	 * through the initialisation options.
	 *  @namespace
	 *  @todo Really should attach the settings object to individual instances so we
	 *    don't need to create new instances on each $().dataTable() call (if the
	 *    table already exists). It would also save passing oSettings around and
	 *    into every single function. However, this is a very significant 
	 *    architecture change for DataTables and will almost certainly break
	 *    backwards compatibility with older installations. This is something that
	 *    will be done in 2.0.
	 */
	DataTable.models.oSettings = {
		/**
		 * Primary features of DataTables and their enablement state.
		 *  @namespace
		 */
		"oFeatures": {
			
			/**
			 * Flag to say if DataTables should automatically try to calculate the
			 * optimum table and columns widths (true) or not (false).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bAutoWidth": null,
	
			/**
			 * Delay the creation of TR and TD elements until they are actually
			 * needed by a driven page draw. This can give a significant speed
			 * increase for Ajax source and Javascript source data, but makes no
			 * difference at all fro DOM and server-side processing tables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bDeferRender": null,
			
			/**
			 * Enable filtering on the table or not. Note that if this is disabled
			 * then there is no filtering at all on the table, including fnFilter.
			 * To just remove the filtering input use sDom and remove the 'f' option.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bFilter": null,
			
			/**
			 * Table information element (the 'Showing x of y records' div) enable
			 * flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bInfo": null,
			
			/**
			 * Present a user control allowing the end user to change the page size
			 * when pagination is enabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bLengthChange": null,
	
			/**
			 * Pagination enabled or not. Note that if this is disabled then length
			 * changing must also be disabled.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bPaginate": null,
			
			/**
			 * Processing indicator enable flag whenever DataTables is enacting a
			 * user request - typically an Ajax request for server-side processing.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bProcessing": null,
			
			/**
			 * Server-side processing enabled flag - when enabled DataTables will
			 * get all data from the server for every draw - there is no filtering,
			 * sorting or paging done on the client-side.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bServerSide": null,
			
			/**
			 * Sorting enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSort": null,
			
			/**
			 * Apply a class to the columns which are being sorted to provide a
			 * visual highlight or not. This can slow things down when enabled since
			 * there is a lot of DOM interaction.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSortClasses": null,
			
			/**
			 * State saving enablement flag.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bStateSave": null
		},
		
	
		/**
		 * Scrolling settings for a table.
		 *  @namespace
		 */
		"oScroll": {
			/**
			 * Indicate if DataTables should be allowed to set the padding / margin
			 * etc for the scrolling header elements or not. Typically you will want
			 * this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bAutoCss": null,
			
			/**
			 * When the table is shorter in height than sScrollY, collapse the
			 * table container down to the height of the table (when true).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bCollapse": null,
			
			/**
			 * Infinite scrolling enablement flag. Now deprecated in favour of
			 * using the Scroller plug-in.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bInfinite": null,
			
			/**
			 * Width of the scrollbar for the web-browser's platform. Calculated
			 * during table initialisation.
			 *  @type int
			 *  @default 0
			 */
			"iBarWidth": 0,
			
			/**
			 * Space (in pixels) between the bottom of the scrolling container and 
			 * the bottom of the scrolling viewport before the next page is loaded
			 * when using infinite scrolling.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type int
			 */
			"iLoadGap": null,
			
			/**
			 * Viewport width for horizontal scrolling. Horizontal scrolling is 
			 * disabled if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sX": null,
			
			/**
			 * Width to expand the table to when using x-scrolling. Typically you
			 * should not need to use this.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @deprecated
			 */
			"sXInner": null,
			
			/**
			 * Viewport height for vertical scrolling. Vertical scrolling is disabled
			 * if an empty string.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sY": null
		},
		
		/**
		 * Language information for the table.
		 *  @namespace
		 *  @extends DataTable.defaults.oLanguage
		 */
		"oLanguage": {
			/**
			 * Information callback function. See 
			 * {@link DataTable.defaults.fnInfoCallback}
			 *  @type function
			 *  @default null
			 */
			"fnInfoCallback": null
		},
		
		/**
		 * Browser support parameters
		 *  @namespace
		 */
		"oBrowser": {
			/**
			 * Indicate if the browser incorrectly calculates width:100% inside a
			 * scrolling element (IE6/7)
			 *  @type boolean
			 *  @default false
			 */
			"bScrollOversize": false
		},
		
		/**
		 * Array referencing the nodes which are used for the features. The 
		 * parameters of this object match what is allowed by sDom - i.e.
		 *   <ul>
		 *     <li>'l' - Length changing</li>
		 *     <li>'f' - Filtering input</li>
		 *     <li>'t' - The table!</li>
		 *     <li>'i' - Information</li>
		 *     <li>'p' - Pagination</li>
		 *     <li>'r' - pRocessing</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aanFeatures": [],
		
		/**
		 * Store data information - see {@link DataTable.models.oRow} for detailed
		 * information.
		 *  @type array
		 *  @default []
		 */
		"aoData": [],
		
		/**
		 * Array of indexes which are in the current display (after filtering etc)
		 *  @type array
		 *  @default []
		 */
		"aiDisplay": [],
		
		/**
		 * Array of indexes for display - no filtering
		 *  @type array
		 *  @default []
		 */
		"aiDisplayMaster": [],
		
		/**
		 * Store information about each column that is in use
		 *  @type array
		 *  @default []
		 */
		"aoColumns": [],
		
		/**
		 * Store information about the table's header
		 *  @type array
		 *  @default []
		 */
		"aoHeader": [],
		
		/**
		 * Store information about the table's footer
		 *  @type array
		 *  @default []
		 */
		"aoFooter": [],
		
		/**
		 * Search data array for regular expression searching
		 *  @type array
		 *  @default []
		 */
		"asDataSearch": [],
		
		/**
		 * Store the applied global search information in case we want to force a 
		 * research or compare the old search to a new one.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @namespace
		 *  @extends DataTable.models.oSearch
		 */
		"oPreviousSearch": {},
		
		/**
		 * Store the applied search for each column - see 
		 * {@link DataTable.models.oSearch} for the format that is used for the
		 * filtering information for each column.
		 *  @type array
		 *  @default []
		 */
		"aoPreSearchCols": [],
		
		/**
		 * Sorting that is applied to the table. Note that the inner arrays are
		 * used in the following manner:
		 * <ul>
		 *   <li>Index 0 - column number</li>
		 *   <li>Index 1 - current sorting direction</li>
		 *   <li>Index 2 - index of asSorting for this column</li>
		 * </ul>
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @todo These inner arrays should really be objects
		 */
		"aaSorting": null,
		
		/**
		 * Sorting that is always applied to the table (i.e. prefixed in front of
		 * aaSorting).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array|null
		 *  @default null
		 */
		"aaSortingFixed": null,
		
		/**
		 * Classes to use for the striping of a table.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"asStripeClasses": null,
		
		/**
		 * If restoring a table - we should restore its striping classes as well
		 *  @type array
		 *  @default []
		 */
		"asDestroyStripes": [],
		
		/**
		 * If restoring a table - we should restore its width 
		 *  @type int
		 *  @default 0
		 */
		"sDestroyWidth": 0,
		
		/**
		 * Callback functions array for every time a row is inserted (i.e. on a draw).
		 *  @type array
		 *  @default []
		 */
		"aoRowCallback": [],
		
		/**
		 * Callback functions for the header on each draw.
		 *  @type array
		 *  @default []
		 */
		"aoHeaderCallback": [],
		
		/**
		 * Callback function for the footer on each draw.
		 *  @type array
		 *  @default []
		 */
		"aoFooterCallback": [],
		
		/**
		 * Array of callback functions for draw callback functions
		 *  @type array
		 *  @default []
		 */
		"aoDrawCallback": [],
		
		/**
		 * Array of callback functions for row created function
		 *  @type array
		 *  @default []
		 */
		"aoRowCreatedCallback": [],
		
		/**
		 * Callback functions for just before the table is redrawn. A return of 
		 * false will be used to cancel the draw.
		 *  @type array
		 *  @default []
		 */
		"aoPreDrawCallback": [],
		
		/**
		 * Callback functions for when the table has been initialised.
		 *  @type array
		 *  @default []
		 */
		"aoInitComplete": [],
	
		
		/**
		 * Callbacks for modifying the settings to be stored for state saving, prior to
		 * saving state.
		 *  @type array
		 *  @default []
		 */
		"aoStateSaveParams": [],
		
		/**
		 * Callbacks for modifying the settings that have been stored for state saving
		 * prior to using the stored values to restore the state.
		 *  @type array
		 *  @default []
		 */
		"aoStateLoadParams": [],
		
		/**
		 * Callbacks for operating on the settings object once the saved state has been
		 * loaded
		 *  @type array
		 *  @default []
		 */
		"aoStateLoaded": [],
		
		/**
		 * Cache the table ID for quick access
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sTableId": "",
		
		/**
		 * The TABLE node for the main table
		 *  @type node
		 *  @default null
		 */
		"nTable": null,
		
		/**
		 * Permanent ref to the thead element
		 *  @type node
		 *  @default null
		 */
		"nTHead": null,
		
		/**
		 * Permanent ref to the tfoot element - if it exists
		 *  @type node
		 *  @default null
		 */
		"nTFoot": null,
		
		/**
		 * Permanent ref to the tbody element
		 *  @type node
		 *  @default null
		 */
		"nTBody": null,
		
		/**
		 * Cache the wrapper node (contains all DataTables controlled elements)
		 *  @type node
		 *  @default null
		 */
		"nTableWrapper": null,
		
		/**
		 * Indicate if when using server-side processing the loading of data 
		 * should be deferred until the second draw.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 *  @default false
		 */
		"bDeferLoading": false,
		
		/**
		 * Indicate if all required information has been read in
		 *  @type boolean
		 *  @default false
		 */
		"bInitialised": false,
		
		/**
		 * Information about open rows. Each object in the array has the parameters
		 * 'nTr' and 'nParent'
		 *  @type array
		 *  @default []
		 */
		"aoOpenRows": [],
		
		/**
		 * Dictate the positioning of DataTables' control elements - see
		 * {@link DataTable.model.oInit.sDom}.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default null
		 */
		"sDom": null,
		
		/**
		 * Which type of pagination should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string 
		 *  @default two_button
		 */
		"sPaginationType": "two_button",
		
		/**
		 * The cookie duration (for bStateSave) in seconds.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type int
		 *  @default 0
		 */
		"iCookieDuration": 0,
		
		/**
		 * The cookie name prefix.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default <i>Empty string</i>
		 */
		"sCookiePrefix": "",
		
		/**
		 * Callback function for cookie creation.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 *  @default null
		 */
		"fnCookieCallback": null,
		
		/**
		 * Array of callback functions for state saving. Each array element is an 
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings
		 *       and the JSON string to save that has been thus far created. Returns
		 *       a JSON string to be inserted into a json object 
		 *       (i.e. '"param": [ 0, 1, 2]')</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aoStateSave": [],
		
		/**
		 * Array of callback functions for state loading. Each array element is an 
		 * object with the following parameters:
		 *   <ul>
		 *     <li>function:fn - function to call. Takes two parameters, oSettings 
		 *       and the object stored. May return false to cancel state loading</li>
		 *     <li>string:sName - name of callback</li>
		 *   </ul>
		 *  @type array
		 *  @default []
		 */
		"aoStateLoad": [],
		
		/**
		 * State that was loaded from the cookie. Useful for back reference
		 *  @type object
		 *  @default null
		 */
		"oLoadedState": null,
		
		/**
		 * Source url for AJAX data for the table.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 *  @default null
		 */
		"sAjaxSource": null,
		
		/**
		 * Property from a given object from which to read the table data from. This
		 * can be an empty string (when not server-side processing), in which case 
		 * it is  assumed an an array is given directly.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 */
		"sAjaxDataProp": null,
		
		/**
		 * Note if draw should be blocked while getting data
		 *  @type boolean
		 *  @default true
		 */
		"bAjaxDataGet": true,
		
		/**
		 * The last jQuery XHR object that was used for server-side data gathering. 
		 * This can be used for working with the XHR information in one of the 
		 * callbacks
		 *  @type object
		 *  @default null
		 */
		"jqXHR": null,
		
		/**
		 * Function to get the server-side data.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 */
		"fnServerData": null,
		
		/**
		 * Functions which are called prior to sending an Ajax request so extra 
		 * parameters can easily be sent to the server
		 *  @type array
		 *  @default []
		 */
		"aoServerParams": [],
		
		/**
		 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if 
		 * required).
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type string
		 */
		"sServerMethod": null,
		
		/**
		 * Format numbers for display.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type function
		 */
		"fnFormatNumber": null,
		
		/**
		 * List of options that can be used for the user selectable length menu.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type array
		 *  @default []
		 */
		"aLengthMenu": null,
		
		/**
		 * Counter for the draws that the table does. Also used as a tracker for
		 * server-side processing
		 *  @type int
		 *  @default 0
		 */
		"iDraw": 0,
		
		/**
		 * Indicate if a redraw is being done - useful for Ajax
		 *  @type boolean
		 *  @default false
		 */
		"bDrawing": false,
		
		/**
		 * Draw index (iDraw) of the last error when parsing the returned data
		 *  @type int
		 *  @default -1
		 */
		"iDrawError": -1,
		
		/**
		 * Paging display length
		 *  @type int
		 *  @default 10
		 */
		"_iDisplayLength": 10,
	
		/**
		 * Paging start point - aiDisplay index
		 *  @type int
		 *  @default 0
		 */
		"_iDisplayStart": 0,
	
		/**
		 * Paging end point - aiDisplay index. Use fnDisplayEnd rather than
		 * this property to get the end point
		 *  @type int
		 *  @default 10
		 *  @private
		 */
		"_iDisplayEnd": 10,
		
		/**
		 * Server-side processing - number of records in the result set
		 * (i.e. before filtering), Use fnRecordsTotal rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 *  @type int
		 *  @default 0
		 *  @private
		 */
		"_iRecordsTotal": 0,
	
		/**
		 * Server-side processing - number of records in the current display set
		 * (i.e. after filtering). Use fnRecordsDisplay rather than
		 * this property to get the value of the number of records, regardless of
		 * the server-side processing setting.
		 *  @type boolean
		 *  @default 0
		 *  @private
		 */
		"_iRecordsDisplay": 0,
		
		/**
		 * Flag to indicate if jQuery UI marking and classes should be used.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 */
		"bJUI": null,
		
		/**
		 * The classes to use for the table
		 *  @type object
		 *  @default {}
		 */
		"oClasses": {},
		
		/**
		 * Flag attached to the settings object so you can check in the draw 
		 * callback if filtering has been done in the draw. Deprecated in favour of
		 * events.
		 *  @type boolean
		 *  @default false
		 *  @deprecated
		 */
		"bFiltered": false,
		
		/**
		 * Flag attached to the settings object so you can check in the draw 
		 * callback if sorting has been done in the draw. Deprecated in favour of
		 * events.
		 *  @type boolean
		 *  @default false
		 *  @deprecated
		 */
		"bSorted": false,
		
		/**
		 * Indicate that if multiple rows are in the header and there is more than 
		 * one unique cell per column, if the top one (true) or bottom one (false) 
		 * should be used for sorting / title by DataTables.
		 * Note that this parameter will be set by the initialisation routine. To
		 * set a default use {@link DataTable.defaults}.
		 *  @type boolean
		 */
		"bSortCellsTop": null,
		
		/**
		 * Initialisation object that is used for the table
		 *  @type object
		 *  @default null
		 */
		"oInit": null,
		
		/**
		 * Destroy callback functions - for plug-ins to attach themselves to the
		 * destroy so they can clean up markup and events.
		 *  @type array
		 *  @default []
		 */
		"aoDestroyCallback": [],
	
		
		/**
		 * Get the number of records in the current record set, before filtering
		 *  @type function
		 */
		"fnRecordsTotal": function ()
		{
			if ( this.oFeatures.bServerSide ) {
				return parseInt(this._iRecordsTotal, 10);
			} else {
				return this.aiDisplayMaster.length;
			}
		},
		
		/**
		 * Get the number of records in the current record set, after filtering
		 *  @type function
		 */
		"fnRecordsDisplay": function ()
		{
			if ( this.oFeatures.bServerSide ) {
				return parseInt(this._iRecordsDisplay, 10);
			} else {
				return this.aiDisplay.length;
			}
		},
		
		/**
		 * Set the display end point - aiDisplay index
		 *  @type function
		 *  @todo Should do away with _iDisplayEnd and calculate it on-the-fly here
		 */
		"fnDisplayEnd": function ()
		{
			if ( this.oFeatures.bServerSide ) {
				if ( this.oFeatures.bPaginate === false || this._iDisplayLength == -1 ) {
					return this._iDisplayStart+this.aiDisplay.length;
				} else {
					return Math.min( this._iDisplayStart+this._iDisplayLength, 
						this._iRecordsDisplay );
				}
			} else {
				return this._iDisplayEnd;
			}
		},
		
		/**
		 * The DataTables object for this table
		 *  @type object
		 *  @default null
		 */
		"oInstance": null,
		
		/**
		 * Unique identifier for each instance of the DataTables object. If there
		 * is an ID on the table node, then it takes that value, otherwise an
		 * incrementing internal counter is used.
		 *  @type string
		 *  @default null
		 */
		"sInstance": null,
	
		/**
		 * tabindex attribute value that is added to DataTables control elements, allowing
		 * keyboard navigation of the table and its controls.
		 */
		"iTabIndex": 0,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollHead": null,
	
		/**
		 * DIV container for the footer scrolling table if scrolling
		 */
		"nScrollFoot": null
	};

	/**
	 * Extension object for DataTables that is used to provide all extension options.
	 * 
	 * Note that the <i>DataTable.ext</i> object is available through
	 * <i>jQuery.fn.dataTable.ext</i> where it may be accessed and manipulated. It is
	 * also aliased to <i>jQuery.fn.dataTableExt</i> for historic reasons.
	 *  @namespace
	 *  @extends DataTable.models.ext
	 */
	DataTable.ext = $.extend( true, {}, DataTable.models.ext );
	
	$.extend( DataTable.ext.oStdClasses, {
		"sTable": "dataTable",
	
		/* Two buttons buttons */
		"sPagePrevEnabled": "paginate_enabled_previous",
		"sPagePrevDisabled": "paginate_disabled_previous",
		"sPageNextEnabled": "paginate_enabled_next",
		"sPageNextDisabled": "paginate_disabled_next",
		"sPageJUINext": "",
		"sPageJUIPrev": "",
		
		/* Full numbers paging buttons */
		"sPageButton": "paginate_button",
		"sPageButtonActive": "paginate_active",
		"sPageButtonStaticDisabled": "paginate_button paginate_button_disabled",
		"sPageFirst": "first",
		"sPagePrevious": "previous",
		"sPageNext": "next",
		"sPageLast": "last",
		
		/* Striping classes */
		"sStripeOdd": "odd",
		"sStripeEven": "even",
		
		/* Empty row */
		"sRowEmpty": "dataTables_empty",
		
		/* Features */
		"sWrapper": "dataTables_wrapper",
		"sFilter": "dataTables_filter",
		"sInfo": "dataTables_info",
		"sPaging": "dataTables_paginate paging_", /* Note that the type is postfixed */
		"sLength": "dataTables_length",
		"sProcessing": "dataTables_processing",
		
		/* Sorting */
		"sSortAsc": "sorting_asc",
		"sSortDesc": "sorting_desc",
		"sSortable": "sorting", /* Sortable in both directions */
		"sSortableAsc": "sorting_asc_disabled",
		"sSortableDesc": "sorting_desc_disabled",
		"sSortableNone": "sorting_disabled",
		"sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */
		"sSortJUIAsc": "",
		"sSortJUIDesc": "",
		"sSortJUI": "",
		"sSortJUIAscAllowed": "",
		"sSortJUIDescAllowed": "",
		"sSortJUIWrapper": "",
		"sSortIcon": "",
		
		/* Scrolling */
		"sScrollWrapper": "dataTables_scroll",
		"sScrollHead": "dataTables_scrollHead",
		"sScrollHeadInner": "dataTables_scrollHeadInner",
		"sScrollBody": "dataTables_scrollBody",
		"sScrollFoot": "dataTables_scrollFoot",
		"sScrollFootInner": "dataTables_scrollFootInner",
		
		/* Misc */
		"sFooterTH": "",
		"sJUIHeader": "",
		"sJUIFooter": ""
	} );
	
	
	$.extend( DataTable.ext.oJUIClasses, DataTable.ext.oStdClasses, {
		/* Two buttons buttons */
		"sPagePrevEnabled": "fg-button ui-button ui-state-default ui-corner-left",
		"sPagePrevDisabled": "fg-button ui-button ui-state-default ui-corner-left ui-state-disabled",
		"sPageNextEnabled": "fg-button ui-button ui-state-default ui-corner-right",
		"sPageNextDisabled": "fg-button ui-button ui-state-default ui-corner-right ui-state-disabled",
		"sPageJUINext": "ui-icon ui-icon-circle-arrow-e",
		"sPageJUIPrev": "ui-icon ui-icon-circle-arrow-w",
		
		/* Full numbers paging buttons */
		"sPageButton": "fg-button ui-button ui-state-default",
		"sPageButtonActive": "fg-button ui-button ui-state-default ui-state-disabled",
		"sPageButtonStaticDisabled": "fg-button ui-button ui-state-default ui-state-disabled",
		"sPageFirst": "first ui-corner-tl ui-corner-bl",
		"sPageLast": "last ui-corner-tr ui-corner-br",
		
		/* Features */
		"sPaging": "dataTables_paginate fg-buttonset ui-buttonset fg-buttonset-multi "+
			"ui-buttonset-multi paging_", /* Note that the type is postfixed */
		
		/* Sorting */
		"sSortAsc": "ui-state-default",
		"sSortDesc": "ui-state-default",
		"sSortable": "ui-state-default",
		"sSortableAsc": "ui-state-default",
		"sSortableDesc": "ui-state-default",
		"sSortableNone": "ui-state-default",
		"sSortJUIAsc": "css_right ui-icon ui-icon-triangle-1-n",
		"sSortJUIDesc": "css_right ui-icon ui-icon-triangle-1-s",
		"sSortJUI": "css_right ui-icon ui-icon-carat-2-n-s",
		"sSortJUIAscAllowed": "css_right ui-icon ui-icon-carat-1-n",
		"sSortJUIDescAllowed": "css_right ui-icon ui-icon-carat-1-s",
		"sSortJUIWrapper": "DataTables_sort_wrapper",
		"sSortIcon": "DataTables_sort_icon",
		
		/* Scrolling */
		"sScrollHead": "dataTables_scrollHead ui-state-default",
		"sScrollFoot": "dataTables_scrollFoot ui-state-default",
		
		/* Misc */
		"sFooterTH": "ui-state-default",
		"sJUIHeader": "fg-toolbar ui-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix",
		"sJUIFooter": "fg-toolbar ui-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix"
	} );
	
	/*
	 * Variable: oPagination
	 * Purpose:  
	 * Scope:    jQuery.fn.dataTableExt
	 */
	$.extend( DataTable.ext.oPagination, {
		/*
		 * Variable: two_button
		 * Purpose:  Standard two button (forward/back) pagination
		 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"two_button": {
			/*
			 * Function: oPagination.two_button.fnInit
			 * Purpose:  Initialise dom elements required for pagination with forward/back buttons only
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           node:nPaging - the DIV which contains this pagination control
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnInit": function ( oSettings, nPaging, fnCallbackDraw )
			{
				var oLang = oSettings.oLanguage.oPaginate;
				var oClasses = oSettings.oClasses;
				var fnClickHandler = function ( e ) {
					if ( oSettings.oApi._fnPageChange( oSettings, e.data.action ) )
					{
						fnCallbackDraw( oSettings );
					}
				};
	
				var sAppend = (!oSettings.bJUI) ?
					'<a class="'+oSettings.oClasses.sPagePrevDisabled+'" tabindex="'+oSettings.iTabIndex+'" role="button">'+oLang.sPrevious+'</a>'+
					'<a class="'+oSettings.oClasses.sPageNextDisabled+'" tabindex="'+oSettings.iTabIndex+'" role="button">'+oLang.sNext+'</a>'
					:
					'<a class="'+oSettings.oClasses.sPagePrevDisabled+'" tabindex="'+oSettings.iTabIndex+'" role="button"><span class="'+oSettings.oClasses.sPageJUIPrev+'"></span></a>'+
					'<a class="'+oSettings.oClasses.sPageNextDisabled+'" tabindex="'+oSettings.iTabIndex+'" role="button"><span class="'+oSettings.oClasses.sPageJUINext+'"></span></a>';
				$(nPaging).append( sAppend );
				
				var els = $('a', nPaging);
				var nPrevious = els[0],
					nNext = els[1];
				
				oSettings.oApi._fnBindAction( nPrevious, {action: "previous"}, fnClickHandler );
				oSettings.oApi._fnBindAction( nNext,     {action: "next"},     fnClickHandler );
				
				/* ID the first elements only */
				if ( !oSettings.aanFeatures.p )
				{
					nPaging.id = oSettings.sTableId+'_paginate';
					nPrevious.id = oSettings.sTableId+'_previous';
					nNext.id = oSettings.sTableId+'_next';
	
					nPrevious.setAttribute('aria-controls', oSettings.sTableId);
					nNext.setAttribute('aria-controls', oSettings.sTableId);
				}
			},
			
			/*
			 * Function: oPagination.two_button.fnUpdate
			 * Purpose:  Update the two button pagination at the end of the draw
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function to call on page change
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw )
			{
				if ( !oSettings.aanFeatures.p )
				{
					return;
				}
				
				var oClasses = oSettings.oClasses;
				var an = oSettings.aanFeatures.p;
				var nNode;
	
				/* Loop over each instance of the pager */
				for ( var i=0, iLen=an.length ; i<iLen ; i++ )
				{
					nNode = an[i].firstChild;
					if ( nNode )
					{
						/* Previous page */
						nNode.className = ( oSettings._iDisplayStart === 0 ) ?
						    oClasses.sPagePrevDisabled : oClasses.sPagePrevEnabled;
						    
						/* Next page */
						nNode = nNode.nextSibling;
						nNode.className = ( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() ) ?
						    oClasses.sPageNextDisabled : oClasses.sPageNextEnabled;
					}
				}
			}
		},
		
		
		/*
		 * Variable: iFullNumbersShowPages
		 * Purpose:  Change the number of pages which can be seen
		 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"iFullNumbersShowPages": 5,
		
		/*
		 * Variable: full_numbers
		 * Purpose:  Full numbers pagination
		 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"full_numbers": {
			/*
			 * Function: oPagination.full_numbers.fnInit
			 * Purpose:  Initialise dom elements required for pagination with a list of the pages
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           node:nPaging - the DIV which contains this pagination control
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnInit": function ( oSettings, nPaging, fnCallbackDraw )
			{
				var oLang = oSettings.oLanguage.oPaginate;
				var oClasses = oSettings.oClasses;
				var fnClickHandler = function ( e ) {
					if ( oSettings.oApi._fnPageChange( oSettings, e.data.action ) )
					{
						fnCallbackDraw( oSettings );
					}
				};
	
				$(nPaging).append(
					'<a  tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPageFirst+'">'+oLang.sFirst+'</a>'+
					'<a  tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPagePrevious+'">'+oLang.sPrevious+'</a>'+
					'<span></span>'+
					'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPageNext+'">'+oLang.sNext+'</a>'+
					'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+" "+oClasses.sPageLast+'">'+oLang.sLast+'</a>'
				);
				var els = $('a', nPaging);
				var nFirst = els[0],
					nPrev = els[1],
					nNext = els[2],
					nLast = els[3];
				
				oSettings.oApi._fnBindAction( nFirst, {action: "first"},    fnClickHandler );
				oSettings.oApi._fnBindAction( nPrev,  {action: "previous"}, fnClickHandler );
				oSettings.oApi._fnBindAction( nNext,  {action: "next"},     fnClickHandler );
				oSettings.oApi._fnBindAction( nLast,  {action: "last"},     fnClickHandler );
				
				/* ID the first elements only */
				if ( !oSettings.aanFeatures.p )
				{
					nPaging.id = oSettings.sTableId+'_paginate';
					nFirst.id =oSettings.sTableId+'_first';
					nPrev.id =oSettings.sTableId+'_previous';
					nNext.id =oSettings.sTableId+'_next';
					nLast.id =oSettings.sTableId+'_last';
				}
			},
			
			/*
			 * Function: oPagination.full_numbers.fnUpdate
			 * Purpose:  Update the list of page buttons shows
			 * Returns:  -
			 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function to call on page change
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw )
			{
				if ( !oSettings.aanFeatures.p )
				{
					return;
				}
				
				var iPageCount = DataTable.ext.oPagination.iFullNumbersShowPages;
				var iPageCountHalf = Math.floor(iPageCount / 2);
				var iPages = Math.ceil((oSettings.fnRecordsDisplay()) / oSettings._iDisplayLength);
				var iCurrentPage = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength) + 1;
				var sList = "";
				var iStartButton, iEndButton, i, iLen;
				var oClasses = oSettings.oClasses;
				var anButtons, anStatic, nPaginateList, nNode;
				var an = oSettings.aanFeatures.p;
				var fnBind = function (j) {
					oSettings.oApi._fnBindAction( this, {"page": j+iStartButton-1}, function(e) {
						/* Use the information in the element to jump to the required page */
						oSettings.oApi._fnPageChange( oSettings, e.data.page );
						fnCallbackDraw( oSettings );
						e.preventDefault();
					} );
				};
				
				/* Pages calculation */
				if ( oSettings._iDisplayLength === -1 )
				{
					iStartButton = 1;
					iEndButton = 1;
					iCurrentPage = 1;
				}
				else if (iPages < iPageCount)
				{
					iStartButton = 1;
					iEndButton = iPages;
				}
				else if (iCurrentPage <= iPageCountHalf)
				{
					iStartButton = 1;
					iEndButton = iPageCount;
				}
				else if (iCurrentPage >= (iPages - iPageCountHalf))
				{
					iStartButton = iPages - iPageCount + 1;
					iEndButton = iPages;
				}
				else
				{
					iStartButton = iCurrentPage - Math.ceil(iPageCount / 2) + 1;
					iEndButton = iStartButton + iPageCount - 1;
				}
	
				
				/* Build the dynamic list */
				for ( i=iStartButton ; i<=iEndButton ; i++ )
				{
					sList += (iCurrentPage !== i) ?
						'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButton+'">'+oSettings.fnFormatNumber(i)+'</a>' :
						'<a tabindex="'+oSettings.iTabIndex+'" class="'+oClasses.sPageButtonActive+'">'+oSettings.fnFormatNumber(i)+'</a>';
				}
				
				/* Loop over each instance of the pager */
				for ( i=0, iLen=an.length ; i<iLen ; i++ )
				{
					nNode = an[i];
					if ( !nNode.hasChildNodes() )
					{
						continue;
					}
					
					/* Build up the dynamic list first - html and listeners */
					$('span:eq(0)', nNode)
						.html( sList )
						.children('a').each( fnBind );
					
					/* Update the permanent button's classes */
					anButtons = nNode.getElementsByTagName('a');
					anStatic = [
						anButtons[0], anButtons[1], 
						anButtons[anButtons.length-2], anButtons[anButtons.length-1]
					];
	
					$(anStatic).removeClass( oClasses.sPageButton+" "+oClasses.sPageButtonActive+" "+oClasses.sPageButtonStaticDisabled );
					$([anStatic[0], anStatic[1]]).addClass( 
						(iCurrentPage==1) ?
							oClasses.sPageButtonStaticDisabled :
							oClasses.sPageButton
					);
					$([anStatic[2], anStatic[3]]).addClass(
						(iPages===0 || iCurrentPage===iPages || oSettings._iDisplayLength===-1) ?
							oClasses.sPageButtonStaticDisabled :
							oClasses.sPageButton
					);
				}
			}
		}
	} );
	
	$.extend( DataTable.ext.oSort, {
		/*
		 * text sorting
		 */
		"string-pre": function ( a )
		{
			if ( typeof a != 'string' ) {
				a = (a !== null && a.toString) ? a.toString() : '';
			}
			return a.toLowerCase();
		},
	
		"string-asc": function ( x, y )
		{
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
		
		"string-desc": function ( x, y )
		{
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},
		
		
		/*
		 * html sorting (ignore html tags)
		 */
		"html-pre": function ( a )
		{
			return a.replace( /<.*?>/g, "" ).toLowerCase();
		},
		
		"html-asc": function ( x, y )
		{
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
		
		"html-desc": function ( x, y )
		{
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},
		
		
		/*
		 * date sorting
		 */
		"date-pre": function ( a )
		{
			var x = Date.parse( a );
			
			if ( isNaN(x) || x==="" )
			{
				x = Date.parse( "01/01/1970 00:00:00" );
			}
			return x;
		},
	
		"date-asc": function ( x, y )
		{
			return x - y;
		},
		
		"date-desc": function ( x, y )
		{
			return y - x;
		},
		
		
		/*
		 * numerical sorting
		 */
		"numeric-pre": function ( a )
		{
			return (a=="-" || a==="") ? 0 : a*1;
		},
	
		"numeric-asc": function ( x, y )
		{
			return x - y;
		},
		
		"numeric-desc": function ( x, y )
		{
			return y - x;
		}
	} );
	
	
	$.extend( DataTable.ext.aTypes, [
		/*
		 * Function: -
		 * Purpose:  Check to see if a string is numeric
		 * Returns:  string:'numeric' or null
		 * Inputs:   mixed:sText - string to check
		 */
		function ( sData )
		{
			/* Allow zero length strings as a number */
			if ( typeof sData === 'number' )
			{
				return 'numeric';
			}
			else if ( typeof sData !== 'string' )
			{
				return null;
			}
			
			var sValidFirstChars = "0123456789-";
			var sValidChars = "0123456789.";
			var Char;
			var bDecimal = false;
			
			/* Check for a valid first char (no period and allow negatives) */
			Char = sData.charAt(0); 
			if (sValidFirstChars.indexOf(Char) == -1) 
			{
				return null;
			}
			
			/* Check all the other characters are valid */
			for ( var i=1 ; i<sData.length ; i++ ) 
			{
				Char = sData.charAt(i); 
				if (sValidChars.indexOf(Char) == -1) 
				{
					return null;
				}
				
				/* Only allowed one decimal place... */
				if ( Char == "." )
				{
					if ( bDecimal )
					{
						return null;
					}
					bDecimal = true;
				}
			}
			
			return 'numeric';
		},
		
		/*
		 * Function: -
		 * Purpose:  Check to see if a string is actually a formatted date
		 * Returns:  string:'date' or null
		 * Inputs:   string:sText - string to check
		 */
		function ( sData )
		{
			var iParse = Date.parse(sData);
			if ( (iParse !== null && !isNaN(iParse)) || (typeof sData === 'string' && sData.length === 0) )
			{
				return 'date';
			}
			return null;
		},
		
		/*
		 * Function: -
		 * Purpose:  Check to see if a string should be treated as an HTML string
		 * Returns:  string:'html' or null
		 * Inputs:   string:sText - string to check
		 */
		function ( sData )
		{
			if ( typeof sData === 'string' && sData.indexOf('<') != -1 && sData.indexOf('>') != -1 )
			{
				return 'html';
			}
			return null;
		}
	] );
	

	// jQuery aliases
	$.fn.DataTable = DataTable;
	$.fn.dataTable = DataTable;
	$.fn.dataTableSettings = DataTable.settings;
	$.fn.dataTableExt = DataTable.ext;


	// Information about events fired by DataTables - for documentation.
	/**
	 * Draw event, fired whenever the table is redrawn on the page, at the same point as
	 * fnDrawCallback. This may be useful for binding events or performing calculations when
	 * the table is altered at all.
	 *  @name DataTable#draw
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Filter event, fired when the filtering applied to the table (using the build in global
	 * global filter, or column filters) is altered.
	 *  @name DataTable#filter
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Page change event, fired when the paging of the table is altered.
	 *  @name DataTable#page
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * Sort event, fired when the sorting applied to the table is altered.
	 *  @name DataTable#sort
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */

	/**
	 * DataTables initialisation complete event, fired when the table is fully drawn,
	 * including Ajax data loaded, if Ajax data is required.
	 *  @name DataTable#init
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The JSON object request from the server - only
	 *    present if client-side Ajax sourced data is used</li></ol>
	 */

	/**
	 * State save event, fired when the table has changed state a new state save is required.
	 * This method allows modification of the state saving object prior to actually doing the
	 * save, including addition or other state properties (for plug-ins) or modification
	 * of a DataTables core property.
	 *  @name DataTable#stateSaveParams
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The state information to be saved
	 */

	/**
	 * State load event, fired when the table is loading state from the stored data, but
	 * prior to the settings object being modified by the saved state - allowing modification
	 * of the saved state is required or loading of state for a plug-in.
	 *  @name DataTable#stateLoadParams
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The saved state information
	 */

	/**
	 * State loaded event, fired when state has been loaded from stored data and the settings
	 * object has been modified by the loaded data.
	 *  @name DataTable#stateLoaded
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {object} json The saved state information
	 */

	/**
	 * Processing event, fired when DataTables is doing some kind of processing (be it,
	 * sort, filter or anything else). Can be used to indicate to the end user that
	 * there is something happening, or that something has finished.
	 *  @name DataTable#processing
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} oSettings DataTables settings object
	 *  @param {boolean} bShow Flag for if DataTables is doing processing or not
	 */

	/**
	 * Ajax (XHR) event, fired whenever an Ajax request is completed from a request to 
	 * made to the server for new data (note that this trigger is called in fnServerData,
	 * if you override fnServerData and which to use this event, you need to trigger it in
	 * you success function).
	 *  @name DataTable#xhr
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 *  @param {object} json JSON returned from the server
	 */

	/**
	 * Destroy event, fired when the DataTable is destroyed by calling fnDestroy or passing
	 * the bDestroy:true parameter in the initialisation object. This can be used to remove
	 * bound events, added DOM nodes, etc.
	 *  @name DataTable#destroy
	 *  @event
	 *  @param {event} e jQuery event object
	 *  @param {object} o DataTables settings object {@link DataTable.models.oSettings}
	 */
}));

}(window, document));


/* Set the defaults for DataTables initialisation */
$.extend( true, $.fn.dataTable.defaults, {
    "sDom": "<'row'<'col-xs-6'l><'col-xs-6'f>r>t<'row'<'col-xs-6'i><'col-xs-6'p>>",
    "sPaginationType": "bootstrap",
    "oLanguage": {
        "sLengthMenu": "_MENU_ records per page"
    }
} );




/* Default class modification */
$.extend( $.fn.dataTableExt.oStdClasses, {
    "sWrapper": "dataTables_wrapper form-inline",
    "sFilterInput": "form-control input-sm",
    "sLengthSelect": "form-control input-sm"
} );


/* API method to get paging information */
$.fn.dataTableExt.oApi.fnPagingInfo = function ( oSettings )
{
    return {
        "iStart":         oSettings._iDisplayStart,
        "iEnd":           oSettings.fnDisplayEnd(),
        "iLength":        oSettings._iDisplayLength,
        "iTotal":         oSettings.fnRecordsTotal(),
        "iFilteredTotal": oSettings.fnRecordsDisplay(),
        "iPage":          oSettings._iDisplayLength === -1 ?
            0 : Math.ceil( oSettings._iDisplayStart / oSettings._iDisplayLength ),
        "iTotalPages":    oSettings._iDisplayLength === -1 ?
            0 : Math.ceil( oSettings.fnRecordsDisplay() / oSettings._iDisplayLength )
    };
};


/* Bootstrap style pagination control */
$.extend( $.fn.dataTableExt.oPagination, {
    "bootstrap": {
        "fnInit": function( oSettings, nPaging, fnDraw ) {
            var oLang = oSettings.oLanguage.oPaginate;
            var fnClickHandler = function ( e ) {
                e.preventDefault();
                if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
                    fnDraw( oSettings );
                }
            };

            $(nPaging).append(
                '<ul class="pagination">'+
                    '<li class="prev disabled"><a href="#">&larr; '+oLang.sPrevious+'</a></li>'+
                    '<li class="next disabled"><a href="#">'+oLang.sNext+' &rarr; </a></li>'+
                    '</ul>'
            );
            var els = $('a', nPaging);
            $(els[0]).bind( 'click.DT', { action: "previous" }, fnClickHandler );
            $(els[1]).bind( 'click.DT', { action: "next" }, fnClickHandler );
        },

        "fnUpdate": function ( oSettings, fnDraw ) {
            var iListLength = 5;
            var oPaging = oSettings.oInstance.fnPagingInfo();
            var an = oSettings.aanFeatures.p;
            var i, ien, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

            if ( oPaging.iTotalPages < iListLength) {
                iStart = 1;
                iEnd = oPaging.iTotalPages;
            }
            else if ( oPaging.iPage <= iHalf ) {
                iStart = 1;
                iEnd = iListLength;
            } else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
                iStart = oPaging.iTotalPages - iListLength + 1;
                iEnd = oPaging.iTotalPages;
            } else {
                iStart = oPaging.iPage - iHalf + 1;
                iEnd = iStart + iListLength - 1;
            }

            for ( i=0, ien=an.length ; i<ien ; i++ ) {
                // Remove the middle elements
                $('li:gt(0)', an[i]).filter(':not(:last)').remove();

                // Add the new list items and their event handlers
                for ( j=iStart ; j<=iEnd ; j++ ) {
                    sClass = (j==oPaging.iPage+1) ? 'class="active"' : '';
                    $('<li '+sClass+'><a href="#">'+j+'</a></li>')
                        .insertBefore( $('li:last', an[i])[0] )
                        .bind('click', function (e) {
                            e.preventDefault();
                            oSettings._iDisplayStart = (parseInt($('a', this).text(),10)-1) * oPaging.iLength;
                            fnDraw( oSettings );
                        } );
                }

                // Add / remove disabled classes from the static elements
                if ( oPaging.iPage === 0 ) {
                    $('li:first', an[i]).addClass('disabled');
                } else {
                    $('li:first', an[i]).removeClass('disabled');
                }

                if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
                    $('li:last', an[i]).addClass('disabled');
                } else {
                    $('li:last', an[i]).removeClass('disabled');
                }
            }
        }
    }
} );


/*
 * TableTools Bootstrap compatibility
 * Required TableTools 2.1+
 */
if ( $.fn.DataTable.TableTools ) {
    // Set the classes that TableTools uses to something suitable for Bootstrap
    $.extend( true, $.fn.DataTable.TableTools.classes, {
        "container": "DTTT btn-group",
        "buttons": {
            "normal": "btn btn-default",
            "disabled": "disabled"
        },
        "collection": {
            "container": "DTTT_dropdown dropdown-menu",
            "buttons": {
                "normal": "",
                "disabled": "disabled"
            }
        },
        "print": {
            "info": "DTTT_print_info modal"
        },
        "select": {
            "row": "active"
        }
    } );

    // Have the collection use a bootstrap compatible dropdown
    $.extend( true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
        "collection": {
            "container": "ul",
            "button": "li",
            "liner": "a"
        }
    } );
}

/*
 * File:        KeyTable.min.js
 * Version:     1.1.7
 * Author:      Allan Jardine (www.sprymedia.co.uk)
 * 
 * Copyright 2009-2011 Allan Jardine, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD (3 point) style license, as supplied with this software.
 * 
 * This source file is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 */
function KeyTable(n){function G(a){return function(d,c,j){(null===d||"number"==typeof d)&&(null===c||"number"==typeof c)&&"function"==typeof j?i[a].push({x:d,y:c,fn:j}):"object"==typeof d&&"function"==typeof c?(d=A(d),i[a].push({x:d[0],y:d[1],fn:c})):alert("Unhandable event type was added: x"+d+"  y:"+c+"  z:"+j)}}function H(a){return function(d,c,j){(null===d||"number"==typeof d)&&(null===c||"number"==typeof c)?"function"==typeof j?w(a,d,c,j):w(a,d,c):"object"==typeof d?(d=A(d),"function"==typeof c?
w(a,d[0],d[1],c):w(a,d[0],d[1])):alert("Unhandable event type was removed: x"+d+"  y:"+c+"  z:"+j)}}function w(a,d,c,j){for(var b=0,e=0,g=i[a].length;e<g-b;e++)if("undefined"!=typeof j)i[a][e-b].x==d&&(i[a][e-b].y==c&&i[a][e-b].fn==j)&&(i[a].splice(e-b,1),b++);else if(i[a][e-b].x==d&&i[a][e-b].y==c)return i[a].splice(e,1),1;return b}function x(a,d,c){for(var b=0,a=i[a],h=0;h<a.length;h++)if(a[h].x==d&&a[h].y==c||null===a[h].x&&a[h].y==c||a[h].x==d&&null===a[h].y||null===a[h].x&&null===a[h].y)a[h].fn(t(d,
c),d,c),b++;return b}function l(a,d){if(r!=a){"undefined"==typeof d&&(d=!0);null!==r&&B(r);jQuery(a).addClass(u);jQuery(a).parent().addClass(u);var c;if(k){c=k.fnSettings();for(var b=C(a)[1],h=o;b>=c.fnDisplayEnd();)0<=c._iDisplayLength?c._iDisplayStart+c._iDisplayLength<c.fnRecordsDisplay()&&(c._iDisplayStart+=c._iDisplayLength):c._iDisplayStart=0,k.oApi._fnCalculateEnd(c);for(;b<c._iDisplayStart;)c._iDisplayStart=0<=c._iDisplayLength?c._iDisplayStart-c._iDisplayLength:0,0>c._iDisplayStart&&(c._iDisplayStart=
0),k.oApi._fnCalculateEnd(c);k.oApi._fnDraw(c);o=h}b=A(a);r=a;m=b[0];g=b[1];var e,i,l,n,f;if(d){e=document.documentElement.clientHeight;b=document.documentElement.clientWidth;i=document.body.scrollTop||document.documentElement.scrollTop;h=document.body.scrollLeft||document.documentElement.scrollLeft;l=a.offsetHeight;n=a.offsetWidth;f=a;var p=0,q=0;if(f.offsetParent){p=f.offsetLeft;q=f.offsetTop;for(f=f.offsetParent;f;)p+=f.offsetLeft,q+=f.offsetTop,f=f.offsetParent}f=[p,q];if(k&&"undefined"!=typeof c.oScroll&&
(""!==c.oScroll.sX||""!==c.oScroll.sY))f[1]-=$(c.nTable.parentNode).scrollTop(),f[0]-=$(c.nTable.parentNode).scrollLeft();f[1]+l>i+e?(e=f[1]+l-e,document.documentElement.scrollTop=e,document.body.scrollTop=e):f[1]<i&&(e=f[1],document.documentElement.scrollTop=e,document.body.scrollTop=e);f[0]+n>h+b?(b=f[0]+n-b,document.documentElement.scrollLeft=b,document.body.scrollLeft=b):f[0]<h&&(b=f[0],document.documentElement.scrollLeft=b,document.body.scrollLeft=b)}if(k&&"undefined"!=typeof c.oScroll&&(""!==
c.oScroll.sX||""!==c.oScroll.sY))(c=c.nTable.parentNode,e=c.clientHeight,b=c.clientWidth,i=c.scrollTop,h=c.scrollLeft,l=a.offsetHeight,n=a.offsetWidth,a.offsetTop+l>e+i?c.scrollTop=a.offsetTop+l-e:a.offsetTop<i&&(c.scrollTop=a.offsetTop),a.offsetLeft+n>b+h)?c.scrollLeft=a.offsetLeft+n-b:a.offsetLeft<h&&(c.scrollLeft=a.offsetLeft);o||(o=!0);x("focus",m,g)}}function y(){B(r);r=g=m=null;o=!1}function B(a){jQuery(a).removeClass(u);jQuery(a).parent().removeClass(u);x("blur",m,g)}function D(){for(var a=
this;"TD"!=a.nodeName;)a=a.parentNode;l(a);o||(o=!0)}function E(a){if(F.block||!o||a.metaKey||a.altKey||a.ctrlKey)return!0;var b;b=v.getElementsByTagName("tr")[0].getElementsByTagName("td").length;var c;if(k){c=k.fnSettings().aiDisplay.length;var j=C(r);if(null===j)return;m=j[0];g=j[1]}else c=v.getElementsByTagName("tr").length;j=9==a.keyCode&&a.shiftKey?-1:a.keyCode;switch(j){case 13:return a.preventDefault(),a.stopPropagation(),x("action",m,g),!0;case 27:if(!x("esc",m,g)){y();return}a=m;b=g;break;
case -1:case 37:if(0<m)a=m-1,b=g;else if(0<g)a=b-1,b=g-1;else return-1==j&&z?(q=!0,p.focus(),setTimeout(function(){q=!1},0),o=!1,y(),!0):!1;break;case 38:if(0<g)a=m,b=g-1;else return!1;break;case 9:case 39:if(m<b-1)a=m+1,b=g;else if(g<c-1)a=0,b=g+1;else return 9==j&&z?(q=!0,p.focus(),setTimeout(function(){q=!1},0),o=!1,y(),!0):!1;break;case 40:if(g<c-1)a=m,b=g+1;else return!1;break;default:return!0}l(t(a,b));return!1}function t(a,b){if(k){var c=k.fnSettings();return"undefined"!=typeof c.aoData[c.aiDisplay[b]]?
c.aoData[c.aiDisplay[b]].nTr.getElementsByTagName("td")[a]:null}return jQuery("tr:eq("+b+")>td:eq("+a+")",v)[0]}function A(a){if(k){var b=k.fnSettings();return[jQuery("td",a.parentNode).index(a),jQuery("tr",a.parentNode.parentNode).index(a.parentNode)+b._iDisplayStart]}return[jQuery("td",a.parentNode).index(a),jQuery("tr",a.parentNode.parentNode).index(a.parentNode)]}function C(a){for(var b=k.fnSettings(),c=0,g=b.aiDisplay.length;c<g;c++)for(var h=b.aoData[b.aiDisplay[c]].nTr.getElementsByTagName("td"),
e=0,i=h.length;e<i;e++)if(h[e]==a)return[e,c];return null}this.block=!1;this.event={remove:{}};this.fnGetCurrentPosition=function(){return[m,g]};this.fnGetCurrentData=function(){return r.innerHTML};this.fnGetCurrentTD=function(){return r};this.fnSetPosition=function(a,b){"object"==typeof a&&a.nodeName?l(a):l(t(a,b))};var v=null,r=null,m=null,g=null,F=null,u="focus",o=!1,i={action:[],esc:[],focus:[],blur:[]},k=null,z,p,q=!1,s;for(s in i)s&&(this.event[s]=G(s),this.event.remove[s]=H(s));var b=n,F=this;
"undefined"==typeof b&&(b={});"undefined"==typeof b.focus&&(b.focus=[0,0]);"undefined"==typeof b.table?b.table=jQuery("table.KeyTable")[0]:$(b.table).addClass("KeyTable");"undefined"!=typeof b.focusClass&&(u=b.focusClass);"undefined"!=typeof b.datatable&&(k=b.datatable);"undefined"==typeof b.initScroll&&(b.initScroll=!0);"undefined"==typeof b.form&&(b.form=!1);z=b.form;v=b.table.getElementsByTagName("tbody")[0];z?(n=document.createElement("div"),p=document.createElement("input"),n.style.height="1px",
n.style.width="0px",n.style.overflow="hidden","undefined"!=typeof b.tabIndex&&(p.tabIndex=b.tabIndex),n.appendChild(p),b.table.parentNode.insertBefore(n,b.table.nextSibling),jQuery(p).focus(function(){if(!q){o=true;q=false;typeof b.focus.nodeName!="undefined"?l(b.focus,b.initScroll):l(t(b.focus[0],b.focus[1]),b.initScroll);setTimeout(function(){p.blur()},0)}}),o=!1):("undefined"!=typeof b.focus.nodeName?l(b.focus,b.initScroll):l(t(b.focus[0],b.focus[1]),b.initScroll),o||(o=!0));jQuery.browser.mozilla||
jQuery.browser.opera?jQuery(document).bind("keypress",E):jQuery(document).bind("keydown",E);k?jQuery("tbody td",k.fnSettings().nTable).live("click",D):jQuery("td",v).live("click",D);jQuery(document).click(function(a){for(var a=a.target,d=false;a;){if(a==b.table){d=true;break}a=a.parentNode}d||y()})};

/*
 * File:        dataTables.editor.min.js
 * Version:     1.2.3
 * Author:      SpryMedia (www.sprymedia.co.uk)
 * Info:        http://editor.datatables.net
 * 
 * Copyright 2012 SpryMedia, all rights reserved.
 * License: DataTables Editor - http://editor.datatables.net/license
 */
/*
 DataTables Editor: http://editor.datatables.net/license
 */
(function(m,o,n,e,j){var f=function(a){!this instanceof f&&alert("DataTables Editor must be initilaised as a 'new' instance'");this._constructor(a)};j.Editor=f;f.models={};f.models.displayController={init:function(){},open:function(){},close:function(){}};f.models.field={className:"",name:null,dataProp:"",label:"",id:"",type:"text",fieldInfo:"",labelInfo:"","default":"",dataSourceGet:null,dataSourceSet:null,el:null,_fieldMessage:null,_fieldInfo:null,_fieldError:null,_labelInfo:null};f.models.fieldType=
{create:function(){},get:function(){},set:function(){},enable:function(){},disable:function(){}};f.models.settings={ajaxUrl:"",ajax:null,domTable:null,dbTable:"",opts:null,displayController:null,fields:[],order:[],id:-1,displayed:!1,processing:!1,editRow:null,removeRows:null,action:null,idSrc:null,events:{onProcessing:[],onPreOpen:[],onOpen:[],onPreClose:[],onClose:[],onPreSubmit:[],onPostSubmit:[],onSubmitComplete:[],onSubmitSuccess:[],onSubmitError:[],onInitCreate:[],onPreCreate:[],onCreate:[],
    onPostCreate:[],onInitEdit:[],onPreEdit:[],onEdit:[],onPostEdit:[],onInitRemove:[],onPreRemove:[],onRemove:[],onPostRemove:[],onSetData:[],onInitComplete:[]}};f.models.button={label:null,fn:null,className:null};f.display={};var k=jQuery,g;f.display.lightbox=k.extend(!0,{},f.models.displayController,{init:function(){g._init();return g},open:function(a,c,b){if(g._shown)b&&b();else{g._dte=a;k(g._dom.content).children().detach();g._dom.content.appendChild(c);g._dom.content.appendChild(g._dom.close);g._shown=
    true;g._show(b)}},close:function(a,c){if(g._shown){g._dte=a;g._hide(c);g._shown=false}else c&&c()},_init:function(){if(!g._ready){g._dom.content=k("div.DTED_Lightbox_Content",g._dom.wrapper)[0];o.body.appendChild(g._dom.background);o.body.appendChild(g._dom.wrapper);g._dom.background.style.visbility="hidden";g._dom.background.style.display="block";g._cssBackgroundOpacity=k(g._dom.background).css("opacity");g._dom.background.style.display="none";g._dom.background.style.visbility="visible"}},_show:function(a){a||
(a=function(){});g._dom.content.style.height="auto";var c=g._dom.wrapper.style;c.opacity=0;c.display="block";g._heightCalc();c.display="none";c.opacity=1;k(g._dom.wrapper).fadeIn();g._dom.background.style.opacity=0;g._dom.background.style.display="block";k(g._dom.background).animate({opacity:g._cssBackgroundOpacity},"normal",a);k(g._dom.close).bind("click.DTED_Lightbox",function(){g._dte.close("icon")});k(g._dom.background).bind("click.DTED_Lightbox",function(){g._dte.close("background")});k("div.DTED_Lightbox_Content_Wrapper",
    g._dom.wrapper).bind("click.DTED_Lightbox",function(a){k(a.target).hasClass("DTED_Lightbox_Content_Wrapper")&&g._dte.close("background")});k(m).bind("resize.DTED_Lightbox",function(){g._heightCalc()})},_heightCalc:function(){g.conf.heightCalc?g.conf.heightCalc(g._dom.wrapper):k(g._dom.content).children().height();var a=k(m).height()-g.conf.windowPadding*2-k("div.DTE_Header",g._dom.wrapper).outerHeight()-k("div.DTE_Footer",g._dom.wrapper).outerHeight();k("div.DTE_Body_Content",g._dom.wrapper).css("maxHeight",
    a)},_hide:function(a){a||(a=function(){});k([g._dom.wrapper,g._dom.background]).fadeOut("normal",a);k(g._dom.close).unbind("click.DTED_Lightbox");k(g._dom.background).unbind("click.DTED_Lightbox");k("div.DTED_Lightbox_Content_Wrapper",g._dom.wrapper).unbind("click.DTED_Lightbox");k(m).unbind("resize.DTED_Lightbox")},_dte:null,_ready:!1,_shown:!1,_cssBackgroundOpacity:1,_dom:{wrapper:k('<div class="DTED_Lightbox_Wrapper"><div class="DTED_Lightbox_Container"><div class="DTED_Lightbox_Content_Wrapper"><div class="DTED_Lightbox_Content"></div></div></div></div>')[0],
    background:k('<div class="DTED_Lightbox_Background"></div>')[0],close:k('<div class="DTED_Lightbox_Close"></div>')[0],content:null}});g=f.display.lightbox;g.conf={windowPadding:100,heightCalc:null};var i=jQuery,d;f.display.envelope=i.extend(!0,{},f.models.displayController,{init:function(a){d._dte=a;d._init();return d},open:function(a,c,b){d._dte=a;i(d._dom.content).children().detach();d._dom.content.appendChild(c);d._dom.content.appendChild(d._dom.close);d._show(b)},close:function(a,c){d._dte=a;
    d._hide(c)},_init:function(){if(!d._ready){d._dom.content=i("div.DTED_Envelope_Container",d._dom.wrapper)[0];o.body.appendChild(d._dom.background);o.body.appendChild(d._dom.wrapper);d._dom.background.style.visbility="hidden";d._dom.background.style.display="block";d._cssBackgroundOpacity=i(d._dom.background).css("opacity");d._dom.background.style.display="none";d._dom.background.style.visbility="visible"}},_show:function(a){a||(a=function(){});d._dom.content.style.height="auto";var c=d._dom.wrapper.style;
    c.opacity=0;c.display="block";var b=d._findAttachRow(),e=d._heightCalc(),h=b.offsetWidth;c.display="none";c.opacity=1;d._dom.wrapper.style.width=h+"px";d._dom.wrapper.style.marginLeft=-(h/2)+"px";d._dom.wrapper.style.top=i(b).offset().top+b.offsetHeight+"px";d._dom.content.style.top=-1*e-20+"px";d._dom.background.style.opacity=0;d._dom.background.style.display="block";i(d._dom.background).animate({opacity:d._cssBackgroundOpacity},"normal");i(d._dom.wrapper).fadeIn();d.conf.windowScroll?i("html,body").animate({scrollTop:i(b).offset().top+
        b.offsetHeight-d.conf.windowPadding},function(){i(d._dom.content).animate({top:0},600,a)}):i(d._dom.content).animate({top:0},600,a);i(d._dom.close).bind("click.DTED_Envelope",function(){d._dte.close("icon")});i(d._dom.background).bind("click.DTED_Envelope",function(){d._dte.close("background")});i("div.DTED_Lightbox_Content_Wrapper",d._dom.wrapper).bind("click.DTED_Envelope",function(a){i(a.target).hasClass("DTED_Envelope_Content_Wrapper")&&d._dte.close("background")});i(m).bind("resize.DTED_Envelope",
        function(){d._heightCalc()})},_heightCalc:function(){d.conf.heightCalc?d.conf.heightCalc(d._dom.wrapper):i(d._dom.content).children().height();var a=i(m).height()-d.conf.windowPadding*2-i("div.DTE_Header",d._dom.wrapper).outerHeight()-i("div.DTE_Footer",d._dom.wrapper).outerHeight();i("div.DTE_Body_Content",d._dom.wrapper).css("maxHeight",a);return i(d._dte.dom.wrapper).outerHeight()},_hide:function(a){a||(a=function(){});i(d._dom.content).animate({top:-(d._dom.content.offsetHeight+50)},600,function(){i([d._dom.wrapper,
    d._dom.background]).fadeOut("normal",a)});i(d._dom.close).unbind("click.DTED_Lightbox");i(d._dom.background).unbind("click.DTED_Lightbox");i("div.DTED_Lightbox_Content_Wrapper",d._dom.wrapper).unbind("click.DTED_Lightbox");i(m).unbind("resize.DTED_Lightbox")},_findAttachRow:function(){if(d.conf.attach==="head"||d._dte.s.action==="create")return i(d._dte.s.domTable).dataTable().fnSettings().nTHead;if(d._dte.s.action==="edit")return d._dte.s.editRow;if(d._dte.s.action==="remove")return d._dte.s.removeRows[0]},
    _dte:null,_ready:!1,_cssBackgroundOpacity:1,_dom:{wrapper:i('<div class="DTED_Envelope_Wrapper"><div class="DTED_Envelope_ShadowLeft"></div><div class="DTED_Envelope_ShadowRight"></div><div class="DTED_Envelope_Container"></div></div>')[0],background:i('<div class="DTED_Envelope_Background"></div>')[0],close:i('<div class="DTED_Envelope_Close">&times;</div>')[0],content:null}});d=f.display.envelope;d.conf={windowPadding:50,heightCalc:null,attach:"row",windowScroll:!0};f.prototype.add=function(a){var c=
    this,b=this.classes.field;if(e.isArray(a))for(var b=0,d=a.length;b<d;b++)this.add(a[b]);else a=e.extend(!0,{},f.models.field,a),a.id="DTE_Field_"+a.name,""===a.dataProp&&(a.dataProp=a.name),a.dataSourceGet=function(){var b=e(c.s.domTable).dataTable().oApi._fnGetObjectDataFn(a.dataProp);a.dataSourceGet=b;return b.apply(c,arguments)},a.dataSourceSet=function(){var b=e(c.s.domTable).dataTable().oApi._fnSetObjectDataFn(a.dataProp);a.dataSourceSet=b;return b.apply(c,arguments)},b=e('<div class="'+b.wrapper+
    " "+b.typePrefix+a.type+" "+b.namePrefix+a.name+" "+a.className+'"><label data-dte-e="label" class="'+b.label+'" for="'+a.id+'">'+a.label+'<div data-dte-e="msg-label" class="'+b["msg-label"]+'">'+a.labelInfo+'</div></label><div data-dte-e="input" class="'+b.input+'"><div data-dte-e="msg-error" class="'+b["msg-error"]+'"></div><div data-dte-e="msg-message" class="'+b["msg-message"]+'"></div><div data-dte-e="msg-info" class="'+b["msg-info"]+'">'+a.fieldInfo+"</div></div></div>")[0],d=f.fieldTypes[a.type].create.call(this,
    a),null!==d?this._$("input",b).prepend(d):b.style.display="none",this.dom.formContent.appendChild(b),this.dom.formContent.appendChild(this.dom.formClear),a.el=b,a._fieldInfo=this._$("msg-info",b)[0],a._labelInfo=this._$("msg-label",b)[0],a._fieldError=this._$("msg-error",b)[0],a._fieldMessage=this._$("msg-message",b)[0],this.s.fields.push(a),this.s.order.push(a.name)};f.prototype.buttons=function(a){var c=this,b,d,h;if(e.isArray(a)){e(this.dom.buttons).empty();var f=function(a){return function(b){b.preventDefault();
    a.fn&&a.fn.call(c)}};b=0;for(d=a.length;b<d;b++)h=o.createElement("button"),a[b].label&&(h.innerHTML=a[b].label),a[b].className&&(h.className=a[b].className),e(h).click(f(a[b])),this.dom.buttons.appendChild(h)}else this.buttons([a])};f.prototype.clear=function(a){if(a)if(e.isArray(a))for(var c=0,b=a.length;c<b;c++)this.clear(a[c]);else c=this._findFieldIndex(a),c!==n&&(e(this.s.fields[c].el).remove(),this.s.fields.splice(c,1),a=e.inArray(a,this.s.order),this.s.order.splice(a,1));else e("div."+this.classes.field.wrapper,
    this.dom.wrapper).remove(),this.s.fields.splice(0,this.s.fields.length),this.s.order.splice(0,this.s.order.length)};f.prototype.close=function(a){var c=this;this._display("close",function(){c._clearDynamicInfo()},a)};f.prototype.create=function(a,c,b){var d=this,h=this.s.fields;this.s.id="";this.s.action="create";this.dom.form.style.display="block";this._actionClass();a&&this.title(a);c&&this.buttons(c);a=0;for(c=h.length;a<c;a++)this.field(h[a].name).set(h[a]["default"]);this._callbackFire("onInitCreate");
    (b===n||b)&&this._display("open",function(){e("input,select,textarea",d.dom.wrapper).filter(":visible").filter(":enabled").filter(":eq(0)").focus()})};f.prototype.disable=function(a){if(e.isArray(a))for(var c=0,b=a.length;c<b;c++)this.disable(a[c]);else this.field(a).disable()};f.prototype.edit=function(a,c,b,d){var h=this;this.s.id=this._rowId(a);this.s.editRow=a;this.s.action="edit";this.dom.form.style.display="block";this._actionClass();c&&this.title(c);b&&this.buttons(b);a=e(this.s.domTable).dataTable()._(a)[0];
    c=0;for(b=this.s.fields.length;c<b;c++){var f=this.s.fields[c],g=f.dataSourceGet(a,"editor");this.field(f.name).set(""!==f.dataProp&&g!==n?g:f["default"])}this._callbackFire("onInitEdit");(d===n||d)&&this._display("open",function(){e("input,select,textarea",h.dom.wrapper).filter(":visible").filter(":enabled").filter(":eq(0)").focus()})};f.prototype.enable=function(a){if(e.isArray(a))for(var c=0,b=a.length;c<b;c++)this.enable(a[c]);else this.field(a).enable()};f.prototype.error=function(a,c){if(c===
    n)this._message(this.dom.formError,"fade",a);else{var b=this._findField(a);b&&(this._message(b._fieldError,"slide",c),e(b.el).addClass(this.classes.field.error))}};f.prototype.field=function(a){var c=this,b={},d=this._findField(a),h=f.fieldTypes[d.type];e.each(h,function(a,e){b[a]="function"===typeof e?function(){var b=[].slice.call(arguments);b.unshift(d);return h[a].apply(c,b)}:e});return b};f.prototype.fields=function(){for(var a=[],c=0,b=this.s.fields.length;c<b;c++)a.push(this.s.fields[c].name);
    return a};f.prototype.get=function(a){var c=this,b={};return a===n?(e.each(this.fields(),function(a,e){b[e]=c.get(e)}),b):this.field(a).get()};f.prototype.hide=function(a){var c,b;if(a)if(e.isArray(a)){c=0;for(b=a.length;c<b;c++)this.hide(a[c])}else{if(a=this._findField(a))this.s.displayed?e(a.el).slideUp():a.el.style.display="none"}else{c=0;for(b=this.s.fields.length;c<b;c++)this.hide(this.s.fields[c].name)}};f.prototype.message=function(a,c){if(c===n)this._message(this.dom.formInfo,"fade",a);else{var b=
    this._findField(a);this._message(b._fieldMessage,"slide",c)}};f.prototype.node=function(a){return(a=this._findField(a))?a.el:n};f.prototype.off=function(a,c){"function"===typeof e().off?e(this).off(a,c):e(this).unbind(a,c)};f.prototype.on=function(a,c){if("function"===typeof e().on)e(this).on(a,c);else e(this).bind(a,c)};f.prototype.open=function(){this._display("open")};f.prototype.order=function(a){if(!a)return this.s.order;1<arguments.length&&!e.isArray(a)&&(a=Array.prototype.slice.call(arguments));
    if(this.s.order.slice().sort().join("-")!==a.slice().sort().join("-"))throw"All fields, and no additional fields, must be provided for ordering.";e.extend(this.s.order,a)};f.prototype.remove=function(a,c,b,d){e.isArray(a)?(this.s.id="",this.s.action="remove",this.s.removeRows=a,this.dom.form.style.display="none",this._actionClass(),c&&this.title(c),b&&this.buttons(b),this._callbackFire("onInitRemove"),(d===n||d)&&this._display("open")):this.remove([a],c,b,d)};f.prototype.set=function(a,c){this.field(a).set(c)};
    f.prototype.show=function(a){var c,b;if(a)if(e.isArray(a)){c=0;for(b=a.length;c<b;c++)this.show(a[c])}else{if(a=this._findField(a))this.s.displayed?e(a.el).slideDown():a.el.style.display="block"}else{c=0;for(b=this.s.fields.length;c<b;c++)this.show(this.s.fields[c].name)}};f.prototype.submit=function(a,c,b,d){var h=this,f=!0;if(!this.s.processing&&this.s.action){this._processing(!0);var g=e('div[data-dte-e="msg-error"]:visible',this.dom.wrapper);0<g.length?g.slideUp(function(){f&&(h._submit(a,c,b,
        d),f=!1)}):this._submit(a,c,b,d);e("div."+this.classes.field.error,this.dom.wrapper).removeClass(this.classes.field.error);e(this.dom.formError).fadeOut()}};f.prototype.title=function(a){this.dom.header.innerHTML=a};f.prototype._constructor=function(a){a=e.extend(!0,{},f.defaults,a);this.s=e.extend(!0,{},f.models.settings);this.classes=e.extend(!0,{},f.classes);var c=this,b=this.classes;this.dom={wrapper:e('<div class="'+b.wrapper+'"><div data-dte-e="processing" class="'+b.processing.indicator+'"></div><div data-dte-e="head" class="'+
        b.header.wrapper+'"><div data-dte-e="head_content" class="'+b.header.content+'"></div></div><div data-dte-e="body" class="'+b.body.wrapper+'"><div data-dte-e="body_content" class="'+b.body.content+'"><div data-dte-e="form_info" class="'+b.form.info+'"></div><form data-dte-e="form" class="'+b.form.tag+'"><div data-dte-e="form_content" class="'+b.form.content+'"><div data-dte-e="form_clear" class="'+b.form.clear+'"></div></div></form></div></div><div data-dte-e="foot" class="'+b.footer.wrapper+'"><div data-dte-e="foot_content" class="'+
        b.footer.content+'"><div data-dte-e="form_error" class="'+b.form.error+'"></div><div data-dte-e="form_buttons" class="'+b.form.buttons+'"></div></div></div></div>')[0],form:null,formClear:null,formError:null,formInfo:null,formContent:null,header:null,body:null,bodyContent:null,footer:null,processing:null,buttons:null};this.s.domTable=a.domTable;this.s.dbTable=a.dbTable;this.s.ajaxUrl=a.ajaxUrl;this.s.ajax=a.ajax;this.s.idSrc=a.idSrc;this.i18n=a.i18n;if(m.TableTools){var d=m.TableTools.BUTTONS,h=this.i18n;
        e.each(["create","edit","remove"],function(a,c){d["editor_"+c].sButtonText=h[c].button;d["editor_"+c].formTitle=h[c].title;d["editor_"+c].formButtons[0].label=h[c].submit});d.editor_remove.question=function(a){return("string"===h.remove.confirm?h.remove.confirm:h.remove.confirm[a]?h.remove.confirm[a]:h.remove.confirm._).replace(/%d/g,a)}}e.each(a.events,function(a,b){c._callbackReg(a,b,"User")});var b=this.dom,g=b.wrapper;b.form=this._$("form",g)[0];b.formClear=this._$("form_clear",g)[0];b.formError=
        this._$("form_error",g)[0];b.formInfo=this._$("form_info",g)[0];b.formContent=this._$("form_content",g)[0];b.header=this._$("head_content",g)[0];b.body=this._$("body",g)[0];b.bodyContent=this._$("body_content",g)[0];b.footer=this._$("foot",g)[0];b.processing=this._$("processing",g)[0];b.buttons=this._$("form_buttons",g)[0];""!==this.s.dbTable&&e(this.dom.wrapper).addClass("DTE_Table_Name_"+this.s.dbTable);if(a.fields){b=0;for(g=a.fields.length;b<g;b++)this.add(a.fields[b])}e(this.dom.form).submit(function(a){c.submit();
        a.preventDefault()});this.s.displayController=f.display[a.display].init(this);this._callbackFire("onInitComplete",[])};f.prototype._$=function(a,c){c===n&&(c=o);return e('*[data-dte-e="'+a+'"]',c)};f.prototype._actionClass=function(){var a=this.classes.actions;e(this.dom.wrapper).removeClass([a.create,a.edit,a.remove].join(" "));"create"===this.s.action?e(this.dom.wrapper).addClass(a.create):"edit"===this.s.action?e(this.dom.wrapper).addClass(a.edit):"remove"===this.s.action&&e(this.dom.wrapper).addClass(a.remove)};
    f.prototype._callbackFire=function(a,c){var b,d;c===n&&(c=[]);if(e.isArray(a))for(b=0;b<a.length;b++)this._callbackFire(a[b],c);else{var h=this.s.events[a],f=[];b=0;for(d=h.length;b<d;b++)f.push(h[b].fn.apply(this,c));null!==a&&(b=e.Event(a),e(this).trigger(b,c),f.push(b.result));return f}};f.prototype._callbackReg=function(a,c,b){c&&this.s.events[a].push({fn:c,name:b})};f.prototype._clearDynamicInfo=function(){e("div."+this.classes.field.error,this.dom.wrapper).removeClass(this.classes.field.error);
        this._$("msg-error",this.dom.wrapper).html("").css("display","none");this.error("");this.message("")};f.prototype._display=function(a,c,b){var d=this;"open"===a?(a=this._callbackFire("onPreOpen",[b]),-1===e.inArray(!1,a)&&(e.each(d.s.order,function(a,c){d.dom.formContent.appendChild(d.node(c))}),d.dom.formContent.appendChild(d.dom.formClear),d.s.displayed=!0,this.s.displayController.open(this,this.dom.wrapper,function(){c&&c()}),this._callbackFire("onOpen"))):"close"===a&&(a=this._callbackFire("onPreClose",
        [b]),-1===e.inArray(!1,a)&&(this.s.displayController.close(this,function(){d.s.displayed=!1;c&&c()}),this._callbackFire("onClose")))};f.prototype._findField=function(a){for(var c=0,b=this.s.fields.length;c<b;c++)if(this.s.fields[c].name===a)return this.s.fields[c];return n};f.prototype._findFieldIndex=function(a){for(var c=0,b=this.s.fields.length;c<b;c++)if(this.s.fields[c].name===a)return c;return n};f.prototype._message=function(a,c,b){""===b&&this.s.displayed?"slide"===c?e(a).slideUp():e(a).fadeOut():
        ""===b?a.style.display="none":this.s.displayed?"slide"===c?e(a).html(b).slideDown():e(a).html(b).fadeIn():(e(a).html(b),a.style.display="block")};f.prototype._processing=function(a){(this.s.processing=a)?(this.dom.processing.style.display="block",e(this.dom.wrapper).addClass(this.classes.processing.active)):(this.dom.processing.style.display="none",e(this.dom.wrapper).removeClass(this.classes.processing.active));this._callbackFire("onProcessing",[a])};f.prototype._ajaxUri=function(a){a="create"===
        this.s.action&&this.s.ajaxUrl.create?this.s.ajaxUrl.create:"edit"===this.s.action&&this.s.ajaxUrl.edit?this.s.ajaxUrl.edit.replace(/_id_/,this.s.id):"remove"===this.s.action&&this.s.ajaxUrl.remove?this.s.ajaxUrl.remove.replace(/_id_/,a.join(",")):this.s.ajaxUrl;return-1!==a.indexOf(" ")?(a=a.split(" "),{method:a[0],url:a[1]}):{method:"POST",url:a}};f.prototype._submit=function(a,c,b,d){var h=this,f,g,i,k=e(this.s.domTable).dataTable(),l={action:this.s.action,table:this.s.dbTable,id:this.s.id,data:{}};
        "create"===this.s.action||"edit"===this.s.action?e.each(this.s.fields,function(a,c){i=k.oApi._fnSetObjectDataFn(c.name);i(l.data,h.get(c.name))}):l.data=this._rowId(this.s.removeRows);b&&b(l);b=this._callbackFire("onPreSubmit",[l]);-1!==e.inArray(!1,b)?this._processing(!1):(b=this._ajaxUri(l.data),this.s.ajax(b.method,b.url,l,function(b){h._callbackFire("onPostSubmit",[b,l]);b.error||(b.error="");b.fieldErrors||(b.fieldErrors=[]);if(""!==b.error||0!==b.fieldErrors.length){h.error(b.error);f=0;for(g=
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  b.fieldErrors.length;f<g;f++)h._findField(b.fieldErrors[f].name),h.error(b.fieldErrors[f].name,b.fieldErrors[f].status||"Error");var j=e("div."+h.classes.field.error+":eq(0)");0<b.fieldErrors.length&&0<j.length&&e(h.dom.bodyContent,h.s.wrapper).animate({scrollTop:j.position().top},600);c&&c.call(h,b)}else{j=b.row?b.row:{};if(!b.row){f=0;for(g=h.s.fields.length;f<g;f++){var m=h.s.fields[f];null!==m.dataProp&&m.dataSourceSet(j,h.field(m.name).get())}}h._callbackFire("onSetData",[b,j,h.s.action]);if(k.fnSettings().oFeatures.bServerSide)k.fnDraw();
        else if("create"===h.s.action)null===h.s.idSrc?j.DT_RowId=b.id:(i=k.oApi._fnSetObjectDataFn(h.s.idSrc),i(j,b.id)),h._callbackFire("onPreCreate",[b,j]),k.fnAddData(j),h._callbackFire(["onCreate","onPostCreate"],[b,j]);else if("edit"===h.s.action)h._callbackFire("onPreEdit",[b,j]),k.fnUpdate(j,h.s.editRow),h._callbackFire(["onEdit","onPostEdit"],[b,j]);else if("remove"===h.s.action){h._callbackFire("onPreRemove",[b]);f=0;for(g=h.s.removeRows.length;f<g;f++)k.fnDeleteRow(h.s.removeRows[f],!1);k.fnDraw();
            h._callbackFire(["onRemove","onPostRemove"],[b])}h.s.action=null;(d===n||d)&&h._display("close",function(){h._clearDynamicInfo()},"submit");a&&a.call(h,b);h._callbackFire(["onSubmitSuccess","onSubmitComplete"],[b,j])}h._processing(!1)},function(a,b,e){h._callbackFire("onPostSubmit",[a,b,e,l]);h.error(h.i18n.error.system);h._processing(!1);c&&c.call(h,a,b,e);h._callbackFire(["onSubmitError","onSubmitComplete"],[a,b,e,l])}))};f.prototype._rowId=function(a,c,b){c=e(this.s.domTable).dataTable();b=c._(a)[0];
        c=c.oApi._fnGetObjectDataFn(this.s.idSrc);if(e.isArray(a)){for(var d=[],f=0,g=a.length;f<g;f++)d.push(this._rowId(a[f],c,b));return d}return null===this.s.idSrc?a.id:c(b)};f.defaults={domTable:null,ajaxUrl:"",fields:[],dbTable:"",display:"lightbox",ajax:function(a,c,b,d,f){e.ajax({type:a,url:c,data:b,dataType:"json",success:function(a){d(a)},error:function(a,b,c){f(a,b,c)}})},idSrc:null,events:{onProcessing:null,onOpen:null,onPreOpen:null,onClose:null,onPreClose:null,onPreSubmit:null,onPostSubmit:null,
        onSubmitComplete:null,onSubmitSuccess:null,onSubmitError:null,onInitCreate:null,onPreCreate:null,onCreate:null,onPostCreate:null,onInitEdit:null,onPreEdit:null,onEdit:null,onPostEdit:null,onInitRemove:null,onPreRemove:null,onRemove:null,onPostRemove:null,onSetData:null,onInitComplete:null},i18n:{create:{button:"New",title:"Create new entry",submit:"Create"},edit:{button:"Edit",title:"Edit entry",submit:"Update"},remove:{button:"Delete",title:"Delete",submit:"Delete",confirm:{_:"Are you sure you wish to delete %d rows?",
        1:"Are you sure you wish to delete 1 row?"}},error:{system:"An error has occurred - Please contact the system administrator"}}};f.classes={wrapper:"DTE",processing:{indicator:"DTE_Processing_Indicator",active:"DTE_Processing"},header:{wrapper:"DTE_Header",content:"DTE_Header_Content"},body:{wrapper:"DTE_Body",content:"DTE_Body_Content"},footer:{wrapper:"DTE_Footer",content:"DTE_Footer_Content"},form:{wrapper:"DTE_Form",content:"DTE_Form_Content",tag:"",info:"DTE_Form_Info",clear:"DTE_Form_Clear",
        error:"DTE_Form_Error",buttons:"DTE_Form_Buttons"},field:{wrapper:"DTE_Field",typePrefix:"DTE_Field_Type_",namePrefix:"DTE_Field_Name_",label:"DTE_Label",input:"DTE_Field_Input",error:"DTE_Field_StateError","msg-label":"DTE_Label_Info","msg-error":"DTE_Field_Error","msg-message":"DTE_Field_Message","msg-info":"DTE_Field_Info"},actions:{create:"DTE_Action_Create",edit:"DTE_Action_Edit",remove:"DTE_Action_Remove"}};m.TableTools&&(j=m.TableTools.BUTTONS,j.editor_create=e.extend(!0,j.text,{sButtonText:null,
        editor:null,formTitle:null,formButtons:[{label:null,fn:function(){this.submit()}}],fnClick:function(a,c){c.editor.create(c.formTitle,c.formButtons)}}),j.editor_edit=e.extend(!0,j.select_single,{sButtonText:null,editor:null,formTitle:null,formButtons:[{label:null,fn:function(){this.submit()}}],fnClick:function(a,c){var b=this.fnGetSelected();b.length===1&&c.editor.edit(b[0],c.formTitle,c.formButtons)}}),j.editor_remove=e.extend(!0,j.select,{sButtonText:null,editor:null,formTitle:null,formButtons:[{label:null,
        fn:function(){var a=this;this.submit(function(){m.TableTools.fnGetInstance(e(a.s.domTable)[0]).fnSelectNone()})}}],question:null,fnClick:function(a,c){var b=this.fnGetSelected();if(b.length!==0){c.editor.message(typeof c.question==="function"?c.question(b.length):c.question);c.editor.remove(b,c.formTitle,c.formButtons)}}}));f.fieldTypes={};var p=function(a){return e.isPlainObject(a)?{val:a.value!==n?a.value:a.label,label:a.label}:{val:a,label:a}},l=f.fieldTypes,j=e.extend(!0,{},f.models.fieldType,
        {get:function(a){return a._input.val()},set:function(a,c){a._input.val(c)},enable:function(a){a._input.prop("disabled",false)},disable:function(a){a._input.prop("disabled",true)}});l.hidden=e.extend(!0,{},j,{create:function(a){a._val=a.value;return null},get:function(a){return a._val},set:function(a,c){a._val=c}});l.readonly=e.extend(!0,{},j,{create:function(a){a._input=e("<input/>").attr(e.extend({id:a.id,type:"text",readonly:"readonly"},a.attr||{}));return a._input[0]}});l.text=e.extend(!0,{},j,
        {create:function(a){a._input=e("<input/>").attr(e.extend({id:a.id,type:"text"},a.attr||{}));return a._input[0]}});l.password=e.extend(!0,{},j,{create:function(a){a._input=e("<input/>").attr(e.extend({id:a.id,type:"password"},a.attr||{}));return a._input[0]}});l.textarea=e.extend(!0,{},j,{create:function(a){a._input=e("<textarea/>").attr(e.extend({id:a.id},a.attr||{}));return a._input[0]}});l.select=e.extend(!0,{},j,{_addOptions:function(a,c){var b=a._input[0].options;b.length=0;if(c)for(var e=0,d=
        c.length;e<d;e++){var f=p(c[e]);b[e]=new Option(f.label,f.val)}},create:function(a){a._input=e("<select/>").attr(e.extend({id:a.id},a.attr||{}));l.select._addOptions(a,a.ipOpts);return a._input[0]},update:function(a,c){var b=e(a._input).val();l.select._addOptions(a,c);e(a._input).val(b)}});l.checkbox=e.extend(!0,{},j,{_addOptions:function(a,c){var b=a._input.empty();if(c)for(var e=0,d=c.length;e<d;e++){var f=p(c[e]);b.append('<div><input id="'+a.id+"_"+e+'" type="checkbox" value="'+f.val+'" /><label for="'+
        a.id+"_"+e+'">'+f.label+"</label></div>")}},create:function(a){a._input=e("<div />");l.checkbox._addOptions(a,a.ipOpts);return a._input[0]},get:function(a){var c=[];a._input.find("input:checked").each(function(){c.push(this.value)});return a.separator?c.join(a.separator):c},set:function(a,c){var b=a._input.find("input");!e.isArray(c)&&typeof c==="string"?c=c.split(a.separator||"|"):e.isArray(c)||(c=[c]);var d,f=c.length,g;b.each(function(){g=false;for(d=0;d<f;d++)if(this.value==c[d]){g=true;break}this.checked=
        g})},enable:function(a){a._input.find("input").prop("disabled",false)},disable:function(a){a._input.find("input").prop("disabled",true)},update:function(a,c){var b=l.checkbox.get(a);l.checkbox._addOptions(a,c);l.checkbox.get(a,b)}});l.radio=e.extend(!0,{},j,{_addOptions:function(a,c){var b=a._input.empty();if(c)for(var d=0,f=c.length;d<f;d++){var g=p(c[d]);b.append('<div><input id="'+a.id+"_"+d+'" type="radio" name="'+a.name+'" /><label for="'+a.id+"_"+d+'">'+g.label+"</label></div>");e("input:last",
        b).attr("value",g.val)}},create:function(a){a._input=e("<div />");l.radio._addOptions(a,a.ipOpts);this.on("onOpen",function(){a._input.find("input").each(function(){if(this._preChecked)this.checked=true})});return a._input[0]},get:function(a){return a._input.find("input:checked").val()},set:function(a,c){a._input.find("input").each(function(){this._preChecked=false;if(this.value==c)this._preChecked=this.checked=true})},enable:function(a){a._input.find("input").prop("disabled",false)},disable:function(a){a._input.find("input").prop("disabled",
        true)},update:function(a,c){var b=l.radio.get(a);l.radio._addOptions(a,c);l.radio.get(a,b)}});l.date=e.extend(!0,{},j,{create:function(a){a._input=e("<input />").attr(e.extend({id:a.id},a.attr||{}));if(!a.dateFormat)a.dateFormat=e.datepicker.RFC_2822;if(!a.dateImage)a.dateImage="../media/images/calender.png";e(this).bind("onInitComplete",function(){e(a._input).datepicker({showOn:"both",dateFormat:a.dateFormat,buttonImage:a.dateImage,buttonImageOnly:true});e("#ui-datepicker-div").css("display","none")});
        return a._input[0]},set:function(a,c){a._input.datepicker("setDate",c)},enable:function(a){a._input.datepicker("enable")},disable:function(a){a._input.datepicker("disable")}});f.prototype.CLASS="Editor";f.VERSION="1.2.3";f.prototype.VERSION=f.VERSION})(window,document,void 0,jQuery,jQuery.fn.dataTable);

/*
 Input Mask plugin for jquery
 http://github.com/RobinHerbots/jquery.inputmask
 Copyright (c) 2010 - 2014 Robin Herbots
 Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 Version: 3.0.0
*/
(function(d){if(void 0===d.fn.inputmask){var a=function(a){var e=document.createElement("input");a="on"+a;var d=a in e;d||(e.setAttribute(a,"return;"),d="function"==typeof e[a]);return d},c=function(a,e,b){return(a=b.aliases[a])?(a.alias&&c(a.alias,void 0,b),d.extend(!0,b,a),d.extend(!0,b,e),!0):!1},h=function(a){function b(d){function e(a,b,d){this.matches=[];this.isGroup=a||!1;this.isOptional=b||!1;this.isQuantifier=d||!1;this.quantifier={min:1,max:1}}function h(e,b,d){var l=a.definitions[b];d=
void 0!=d?d:e.matches.length;if(l&&!n){for(var c=l.prevalidator,g=c?c.length:0,f=1;f<l.cardinality;f++){var k=g>=f?c[f-1]:[],y=k.validator,k=k.cardinality;e.matches.splice(d++,0,{fn:y?"string"==typeof y?RegExp(y):new function(){this.test=y}:/./,cardinality:k?k:1,optionality:e.isOptional,casing:l.casing,def:l.definitionSymbol||b})}e.matches.splice(d++,0,{fn:l.validator?"string"==typeof l.validator?RegExp(l.validator):new function(){this.test=l.validator}:/./,cardinality:l.cardinality,optionality:e.isOptional,
casing:l.casing,def:l.definitionSymbol||b})}else e.matches.splice(d++,0,{fn:null,cardinality:0,optionality:e.isOptional,casing:null,def:b}),n=!1}for(var c=/(?:[?*+]|\{[0-9]+(?:,[0-9\+\*]*)?\})\??|[^.?*+^${[]()|\\]+|./g,n=!1,g=new e,l,f=[],y=[];l=c.exec(d);)switch(l=l[0],l.charAt(0)){case a.optionalmarker.end:case a.groupmarker.end:var k=f.pop();0<f.length?f[f.length-1].matches.push(k):g.matches.push(k);break;case a.optionalmarker.start:f.push(new e(!1,!0));break;case a.groupmarker.start:f.push(new e(!0));
break;case a.quantifiermarker.start:k=new e(!1,!1,!0);l=l.replace(/[{}]/g,"");var u=l.split(",");l=isNaN(u[0])?u[0]:parseInt(u[0]);u=1==u.length?l:isNaN(u[1])?u[1]:parseInt(u[1]);k.quantifier={min:l,max:u};if("*"==u||"+"==u)a.greedy=!1;if(0<f.length){u=f[f.length-1].matches;l=u.pop();if(!l.isGroup){var v=new e(!0);v.matches.push(l);l=v}u.push(l);u.push(k)}else l=g.matches.pop(),l.isGroup||(v=new e(!0),v.matches.push(l),l=v),g.matches.push(l),g.matches.push(k);break;case a.escapeChar:n=!0;break;default:0<
f.length?h(f[f.length-1],l):(0<g.matches.length&&(k=g.matches[g.matches.length-1],k.isGroup&&(k.isGroup=!1,h(k,a.groupmarker.start,0),h(k,a.groupmarker.end))),h(g,l))}0<g.matches.length&&y.push(g);return y}function h(c,g){a.numericInput&&(c=c.split("").reverse().join(""));if(void 0!=c&&""!=c){if(0<a.repeat||"*"==a.repeat||"+"==a.repeat)c=a.groupmarker.start+c+a.groupmarker.end+a.quantifiermarker.start+("*"==a.repeat?0:"+"==a.repeat?1:a.repeat)+","+a.repeat+a.quantifiermarker.end;void 0==d.inputmask.masksCache[c]&&
(d.inputmask.masksCache[c]={mask:c,maskToken:b(c),validPositions:{},_buffer:void 0,buffer:void 0,tests:{},metadata:g});return d.extend(!0,{},d.inputmask.masksCache[c])}}var c=[];d.isFunction(a.mask)&&(a.mask=a.mask.call(this,a));d.isArray(a.mask)?d.each(a.mask,function(a,e){void 0!=e.mask?c.push(h(e.mask.toString(),e)):c.push(h(e.toString()))}):(1==a.mask.length&&!1==a.greedy&&0!=a.repeat&&(a.placeholder=""),c=void 0!=a.mask.mask?h(a.mask.mask.toString(),a.mask):h(a.mask.toString()));return c},g=
"function"===typeof ScriptEngineMajorVersion?ScriptEngineMajorVersion():10<=(new Function("/*@cc_on return @_jscript_version; @*/"))(),b=navigator.userAgent,f=null!==b.match(/iphone/i),k=null!==b.match(/android.*safari.*/i),m=null!==b.match(/android.*chrome.*/i),s=null!==b.match(/android.*firefox.*/i),P=/Kindle/i.test(b)||/Silk/i.test(b)||/KFTT/i.test(b)||/KFOT/i.test(b)||/KFJWA/i.test(b)||/KFJWI/i.test(b)||/KFSOWI/i.test(b)||/KFTHWA/i.test(b)||/KFTHWI/i.test(b)||/KFAPWA/i.test(b)||/KFAPWI/i.test(b),
Q=a("paste")?"paste":a("input")?"input":"propertychange",t=function(a,e,b){function c(p,b,d){b=b||0;var l=[],h,g=0,f;do{if(!0===p&&a.validPositions[g]){var n=a.validPositions[g];f=n.match;h=n.locator.slice();l.push(null==f.fn?f.def:!0===d?n.input:e.placeholder.charAt(g%e.placeholder.length))}else h=N(g,!1,h,g-1),h=h[e.greedy||b>g?0:h.length-1],f=h.match,h=h.locator.slice(),l.push(null==f.fn?f.def:e.placeholder.charAt(g%e.placeholder.length));g++}while((void 0==K||g-1<K)&&null!=f.fn||null==f.fn&&""!=
f.def||b>=g);l.pop();return l}function h(p){var b=a;b.buffer=void 0;b.tests={};!0!==p&&(b._buffer=void 0,b.validPositions={},b.p=-1)}function z(p){var b=a;p=-1;for(var e in b.validPositions)b=parseInt(e),b>p&&(p=b);return p}function v(p,b,l,h){if(e.insertMode&&void 0!=a.validPositions[p]&&void 0==h){h=d.extend(!0,{},a.validPositions);for(var c=I(J());c>p&&0<=c;c--)if(u(c)){var g=I(c),f=a.validPositions[g];void 0!=f&&t(c).def==t(g).def&&void 0==a.validPositions[c]&&!1!==T(c,f.input,l,!0)&&delete a.validPositions[g]}if(void 0==
a.validPositions[p])a.validPositions[p]=b;else return a.validPositions=d.extend(!0,{},h),!1}else a.validPositions[p]=b;return!0}function t(p){return a.validPositions[p]?a.validPositions[p].match:N(p)[0].match}function N(p,b,e,d){function c(a,b,e,d){function l(e,d,A){var C=h;if(h==p&&void 0==e.matches)return g.push({match:e,locator:d.reverse()}),!0;if(void 0!=e.matches)if(e.isGroup&&!0!==A){if(e=l(a.matches[E+1],d))return!0}else if(e.isOptional){var n=e;if(e=c(e,b,d,A))e=g[g.length-1].match,(e=0==
n.matches.indexOf(e))&&(f=!0),h=C}else if(e.isQuantifier&&!0!==A)for(C=e,A=0<b.length&&!0!==A?b.shift():0;A<(isNaN(C.quantifier.max)?A+1:C.quantifier.max)&&h<=p;A++){if(n=a.matches[a.matches.indexOf(C)-1],e=l(n,[A].concat(d),!0))if(e=g[g.length-1].match,A>C.quantifier.min-1&&(e.optionalQuantifier=!0),e=0==n.matches.indexOf(e))if(A>C.quantifier.min-1){f=!0;h=p;break}else return!0;else return!0}else{if(e=c(e,b,d,A))return!0}else h++}for(var E=0<b.length?b.shift():0;E<a.matches.length;E++)if(!0!==a.matches[E].isQuantifier){var A=
l(a.matches[E],[E].concat(e),d);if(A&&h==p)return A;if(h>p)break}}var l=a.maskToken,h=e?d:0;d=e||[0];var g=[],f=!1;if(!0!==b&&a.tests[p]&&!a.validPositions[p])return a.tests[p];if(void 0==e){for(b=p-1;void 0==(e=a.validPositions[b])&&-1<b;)b--;if(void 0!=e&&-1<b)h=b,d=e.locator.slice();else{for(b=p-1;void 0==(e=a.tests[b])&&-1<b;)b--;void 0!=e&&-1<b&&(h=b,d=e[0].locator.slice())}}for(b=d.shift();b<l.length&&!(c(l[b],d,[b])&&h==p||h>p);b++);(0==g.length||f&&2>g.length)&&g.push({match:{fn:null,cardinality:0,
optionality:!0,casing:null,def:""},locator:[]});return a.tests[p]=g}function G(){void 0==a._buffer&&(a._buffer=c(!1,1));return a._buffer}function l(){void 0==a.buffer&&(a.buffer=c(!0,z(),!0));return a.buffer}function r(a,b){for(var e=l(),h=a;h<b;h++)if(e[h]!=S(h)){var c=N(h,!1)[0];v(h,d.extend({},c,{input:H(e[h],c.match)}),!0)}}function H(a,b){switch(b.casing){case "upper":a=a.toUpperCase();break;case "lower":a=a.toLowerCase()}return a}function T(b,c,g,f){function n(b,p,c,g){var f=!1;d.each(N(b,!c),
function(A,E){for(var n=E.match,C=p?1:0,k="",D=l(),y=n.cardinality;y>C;y--)k+=void 0==a.validPositions[b-(y-1)]?S(b-(y-1)):a.validPositions[b-(y-1)].input;p&&(k+=p);f=null!=n.fn?n.fn.test(k,D,b,c,e):p!=n.def&&p!=e.skipOptionalPartCharacter||""==n.def?!1:{c:n.def,pos:b};if(!1!==f)return C=void 0!=f.c?f.c:p,C=C==e.skipOptionalPartCharacter?n.def:C,k=b,f.refreshFromBuffer?(D=f.refreshFromBuffer,c=!0,k=void 0!=f.pos?f.pos:b,E=N(k,!c)[0],!0===D?(a.validPositions={},r(0,l().length)):r(D.start,D.end)):!0!==
f&&f.pos!=b&&(v(b,d.extend({},E,{input:H(D[b],n)}),c),k=f.pos,r(b+1,k),E=N(k,!c)[0]),0<A&&h(!0),v(k,d.extend({},E,{input:H(C,n)}),c,g)||(f=!1),!1});return f}g=!0===g;var D=n(b,c,g,f);if(!g&&(e.insertMode||void 0==a.validPositions[B(b)])&&!1===D&&!u(b))for(var k=b+1,y=B(b);k<=y;k++)if(D=n(k,c,g,f),!1!==D){b=k;break}!0===D&&(D={pos:b});return D}function u(a){a=t(a);return null!=a.fn?a.fn:!1}function J(){var b;K=q.prop("maxLength");-1==K&&(K=void 0);if(!1==e.greedy){b=z()+1;for(var d=t(b);null!=d.fn||
""!=d.def;)d=t(++b),!0!==d.optionality&&(d=N(b),d=d[d.length-1].match);b=c(!0,b).length;a.tests={}}else b=l().length;return void 0==K||b<K?b:K}function B(a){var b=J();if(a>=b)return b;for(;++a<b&&!u(a)&&(!0!==e.nojumps||e.nojumpsThreshold>a););return a}function I(a){if(0>=a)return 0;for(;0<--a&&!u(a););return a}function F(a,b,e){a._valueSet(b.join(""));void 0!=e&&w(a,e)}function S(a){var b=t(a);return null==b.fn?b.def:e.placeholder.charAt(a%e.placeholder.length)}function O(b,e,c,l,g){l=void 0!=l?
l.slice():ea(b._valueGet()).split("");h();e&&b._valueSet("");d.each(l,function(h,l){if(!0===g){var f=a.p,f=-1==f?f:I(f),n=-1==f?h:B(f);-1==d.inArray(l,G().slice(f+1,n))&&U.call(b,void 0,!0,l.charCodeAt(0),e,c,h)}else U.call(b,void 0,!0,l.charCodeAt(0),e,c,h),c=c||0<h&&h>a.p})}function Z(a){return d.inputmask.escapeRegex.call(this,a)}function ea(a){return a.replace(RegExp("("+Z(G().join(""))+")*$"),"")}function V(a){var b=l().slice(),e;for(e=b.length-1;0<=e;e--){var d=t(e);if((d.optionality||d.optionalQuantifier)&&
b[e]==S(e))b.pop();else break}F(a,b)}function fa(a,b){if(!a.data("_inputmask")||!0!==b&&a.hasClass("hasDatepicker"))return a[0]._valueGet();var h=d.map(l(),function(a,b){return u(b)&&T(b,a,!0)?a:null}),h=(x?h.reverse():h).join(""),c=(x?l().reverse():l()).join("");return d.isFunction(e.onUnMask)?e.onUnMask.call(a,c,h,e):h}function L(a){!x||"number"!=typeof a||e.greedy&&""==e.placeholder||(a=l().length-a);return a}function w(a,b,h){a=a.jquery&&0<a.length?a[0]:a;if("number"==typeof b){b=L(b);h=L(h);
h="number"==typeof h?h:b;var c=d(a).data("_inputmask")||{};c.caret={begin:b,end:h};d(a).data("_inputmask",c);d(a).is(":visible")&&(a.scrollLeft=a.scrollWidth,!1==e.insertMode&&b==h&&h++,a.setSelectionRange?(a.selectionStart=b,a.selectionEnd=h):a.createTextRange&&(a=a.createTextRange(),a.collapse(!0),a.moveEnd("character",h),a.moveStart("character",b),a.select()))}else return c=d(a).data("_inputmask"),!d(a).is(":visible")&&c&&void 0!=c.caret?(b=c.caret.begin,h=c.caret.end):a.setSelectionRange?(b=a.selectionStart,
h=a.selectionEnd):document.selection&&document.selection.createRange&&(a=document.selection.createRange(),b=0-a.duplicate().moveStart("character",-1E5),h=b+a.text.length),b=L(b),h=L(h),{begin:b,end:h}}function R(a){if(d.isFunction(e.isComplete))return e.isComplete.call(q,a,e);if("*"!=e.repeat){var b=!1,h=I(J());if(z()==h)for(var b=!0,c=0;c<=h;c++){var l=u(c);if(l&&(void 0==a[c]||a[c]==S(c))||!l&&a[c]!=S(c)){b=!1;break}}return b}}function ga(a){a=d._data(a).events;d.each(a,function(a,b){d.each(b,function(a,
b){if("inputmask"==b.namespace&&"setvalue"!=b.type){var e=b.handler;b.handler=function(a){if(this.readOnly||this.disabled)a.preventDefault;else return e.apply(this,arguments)}}})})}function ha(a){function b(a){if(void 0==d.valHooks[a]||!0!=d.valHooks[a].inputmaskpatch){var e=d.valHooks[a]&&d.valHooks[a].get?d.valHooks[a].get:function(a){return a.value},h=d.valHooks[a]&&d.valHooks[a].set?d.valHooks[a].set:function(a,b){a.value=b;return a};d.valHooks[a]={get:function(a){var b=d(a);if(b.data("_inputmask")){if(b.data("_inputmask").opts.autoUnmask)return b.inputmask("unmaskedvalue");
a=e(a);b=(b=b.data("_inputmask").maskset._buffer)?b.join(""):"";return a!=b?a:""}return e(a)},set:function(a,b){var e=d(a),c=h(a,b);e.data("_inputmask")&&e.triggerHandler("setvalue.inputmask");return c},inputmaskpatch:!0}}}var e;Object.getOwnPropertyDescriptor&&(e=Object.getOwnPropertyDescriptor(a,"value"));if(e&&e.get){if(!a._valueGet){var h=e.get,c=e.set;a._valueGet=function(){return x?h.call(this).split("").reverse().join(""):h.call(this)};a._valueSet=function(a){c.call(this,x?a.split("").reverse().join(""):
a)};Object.defineProperty(a,"value",{get:function(){var a=d(this),b=d(this).data("_inputmask"),e=b.maskset;return b&&b.opts.autoUnmask?a.inputmask("unmaskedvalue"):h.call(this)!=e._buffer.join("")?h.call(this):""},set:function(a){c.call(this,a);d(this).triggerHandler("setvalue.inputmask")}})}}else document.__lookupGetter__&&a.__lookupGetter__("value")?a._valueGet||(h=a.__lookupGetter__("value"),c=a.__lookupSetter__("value"),a._valueGet=function(){return x?h.call(this).split("").reverse().join(""):
h.call(this)},a._valueSet=function(a){c.call(this,x?a.split("").reverse().join(""):a)},a.__defineGetter__("value",function(){var a=d(this),b=d(this).data("_inputmask"),e=b.maskset;return b&&b.opts.autoUnmask?a.inputmask("unmaskedvalue"):h.call(this)!=e._buffer.join("")?h.call(this):""}),a.__defineSetter__("value",function(a){c.call(this,a);d(this).triggerHandler("setvalue.inputmask")})):(a._valueGet||(a._valueGet=function(){return x?this.value.split("").reverse().join(""):this.value},a._valueSet=
function(a){this.value=x?a.split("").reverse().join(""):a}),b(a.type))}function $(b,d,c){if(e.numericInput||x){switch(d){case e.keyCode.BACKSPACE:d=e.keyCode.DELETE;break;case e.keyCode.DELETE:d=e.keyCode.BACKSPACE}x&&(b=c.end,c.end=c.begin,c.begin=b)}c.begin==c.end?(b=d==e.keyCode.BACKSPACE?c.begin-1:c.begin,e.isNumeric&&""!=e.radixPoint&&l()[b]==e.radixPoint&&(c.begin=l().length-1==b?c.begin:d==e.keyCode.BACKSPACE?b:B(b),c.end=c.begin),d==e.keyCode.BACKSPACE?c.begin=I(c.begin):d==e.keyCode.DELETE&&
c.end++):1!=c.end-c.begin||e.insertMode||d==e.keyCode.BACKSPACE&&c.begin--;b=c.begin;var f=c.end;for(d=B(b-1);b<f;b++)delete a.validPositions[b];b=f;for(f=J();b<f;b++){var g=a.validPositions[b],n=a.validPositions[d];void 0!=g&&void 0==n&&(t(d).def==g.match.def&&!1!==T(d,g.input,!0)&&delete a.validPositions[b],d=B(d))}h(!0);d=B(-1);z()<d?a.p=d:a.p=c.begin}function W(b){X=!1;var c=this,h=d(c),g=b.keyCode,n=w(c);g==e.keyCode.BACKSPACE||g==e.keyCode.DELETE||f&&127==g||b.ctrlKey&&88==g?(b.preventDefault(),
88==g&&(M=l().join("")),$(c,g,n),F(c,l(),a.p),c._valueGet()==G().join("")&&h.trigger("cleared"),e.showTooltip&&h.prop("title",a.mask)):g==e.keyCode.END||g==e.keyCode.PAGE_DOWN?setTimeout(function(){var a=B(z());e.insertMode||a!=J()||b.shiftKey||a--;w(c,b.shiftKey?n.begin:a,a)},0):g==e.keyCode.HOME&&!b.shiftKey||g==e.keyCode.PAGE_UP?w(c,0,b.shiftKey?n.begin:0):g==e.keyCode.ESCAPE||90==g&&b.ctrlKey?(O(c,!0,!1,M.split("")),h.click()):g!=e.keyCode.INSERT||b.shiftKey||b.ctrlKey?!1!=e.insertMode||b.shiftKey||
(g==e.keyCode.RIGHT?setTimeout(function(){var a=w(c);w(c,a.begin)},0):g==e.keyCode.LEFT&&setTimeout(function(){var a=w(c);w(c,a.begin-1)},0)):(e.insertMode=!e.insertMode,w(c,e.insertMode||n.begin!=J()?n.begin:n.begin-1));var h=w(c),k=e.onKeyDown.call(this,b,l(),e);k&&!0===k.refreshFromBuffer&&(a.validPositions={},r(0,l().length),w(c,h.begin,h.end));aa=-1!=d.inArray(g,e.ignorables)}function U(b,c,g,f,n,k){if(void 0==g&&X)return!1;X=!0;var y=d(this);b=b||window.event;g=c?g:b.which||b.charCode||b.keyCode;
if(!(!0===c||b.ctrlKey&&b.altKey)&&(b.ctrlKey||b.metaKey||aa))return!0;if(g){!0!==c&&46==g&&!1==b.shiftKey&&","==e.radixPoint&&(g=44);var r,H;g=String.fromCharCode(g);c?(k=n?k:z()+1,r={begin:k,end:k}):r=w(this);if(k=x?1<r.begin-r.end||1==r.begin-r.end&&e.insertMode:1<r.end-r.begin||1==r.end-r.begin&&e.insertMode)a.undoPositions=d.extend(!0,{},a.validPositions),$(this,e.keyCode.DELETE,r),e.insertMode||(e.insertMode=!e.insertMode,v(r.begin,void 0,n),e.insertMode=!e.insertMode),k=!e.multi;var u=l().join("").indexOf(e.radixPoint);
e.isNumeric&&!0!==c&&-1!=u&&(e.greedy&&r.begin<=u?(r.begin=I(r.begin),r.end=r.begin):g==e.radixPoint&&(r.begin=u,r.end=r.begin));a.writeOutBuffer=!0;r=r.begin;var t=T(r,g,n);!1!==t&&(!0!==t&&(r=void 0!=t.pos?t.pos:r,g=void 0!=t.c?t.c:g),h(!0),H=B(r),a.p=H);if(!1!==f){var m=this;setTimeout(function(){e.onKeyValidation.call(m,t,e)},0);if(a.writeOutBuffer&&!1!==t){var q=l();f=c?void 0:e.numericInput?r>u?I(H):g==e.radixPoint?H-1:I(H-1):H;F(this,q,f);!0!==c&&setTimeout(function(){!0===R(q)&&y.trigger("complete");
Y=!0;y.trigger("input")},0)}else k&&(a.buffer=void 0,a.validPositions=a.undoPositions)}else k&&(a.buffer=void 0,a.validPositions=a.undoPositions);e.showTooltip&&y.prop("title",a.mask);b&&(b.preventDefault?b.preventDefault():b.returnValue=!1)}}function ba(b){var c=d(this),g=b.keyCode,f=l();(b=e.onKeyUp.call(this,b,f,e))&&!0===b.refreshFromBuffer&&(a.validPositions={},r(0,l().length));g==e.keyCode.TAB&&e.showMaskOnFocus&&(c.hasClass("focus.inputmask")&&0==this._valueGet().length?(h(),f=l(),F(this,f),
w(this,0),M=l().join("")):(F(this,f),f.join("")==G().join("")&&-1!=d.inArray(e.radixPoint,f)?(w(this,L(0)),c.click()):w(this,L(0),L(J()))))}function ca(a){if(!0===Y&&"input"==a.type)return Y=!1,!0;var b=this,c=d(b);if("propertychange"==a.type&&b._valueGet().length<=J())return!0;setTimeout(function(){var a=d.isFunction(e.onBeforePaste)?e.onBeforePaste.call(b,b._valueGet(),e):b._valueGet();O(b,!1,!1,a.split(""),!0);F(b,l());!0===R(l())&&c.trigger("complete");c.click()},0)}function ia(a){var b=d(this),
c=w(this),h=this._valueGet(),h=h.replace(RegExp("("+Z(G().join(""))+")*"),"");c.begin>h.length&&(w(this,h.length),c=w(this));1!=l().length-h.length||h.charAt(c.begin)==l()[c.begin]||h.charAt(c.begin+1)==l()[c.begin]||u(c.begin)?(O(this,!1,!1,h.split("")),F(this,l()),!0===R(l())&&b.trigger("complete"),b.click()):(a.keyCode=e.keyCode.BACKSPACE,W.call(this,a));a.preventDefault()}function ja(b){q=d(b);if(q.is(":input")){q.data("_inputmask",{maskset:a,opts:e,isRTL:!1});e.showTooltip&&q.prop("title",a.mask);
ha(b);e.numericInput&&(e.isNumeric=e.numericInput);("rtl"==b.dir||e.numericInput&&e.rightAlignNumerics||e.isNumeric&&e.rightAlignNumerics)&&q.css("text-align","right");if("rtl"==b.dir||e.numericInput){b.dir="ltr";q.removeAttr("dir");var c=q.data("_inputmask");c.isRTL=!0;q.data("_inputmask",c);x=!0}q.unbind(".inputmask");q.removeClass("focus.inputmask");q.closest("form").bind("submit",function(){M!=l().join("")&&q.change()}).bind("reset",function(){setTimeout(function(){q.trigger("setvalue")},0)});
q.bind("mouseenter.inputmask",function(){!d(this).hasClass("focus.inputmask")&&e.showMaskOnHover&&this._valueGet()!=l().join("")&&F(this,l())}).bind("blur.inputmask",function(){var a=d(this),b=this._valueGet(),c=l();a.removeClass("focus.inputmask");M!=l().join("")&&a.change();e.clearMaskOnLostFocus&&""!=b&&(b==G().join("")?this._valueSet(""):V(this));!1===R(c)&&(a.trigger("incomplete"),e.clearIncomplete&&(h(),e.clearMaskOnLostFocus?this._valueSet(""):(c=G().slice(),F(this,c))))}).bind("focus.inputmask",
function(){var a=d(this),b=this._valueGet();e.showMaskOnFocus&&!a.hasClass("focus.inputmask")&&(!e.showMaskOnHover||e.showMaskOnHover&&""==b)&&this._valueGet()!=l().join("")&&F(this,l(),B(z()));a.addClass("focus.inputmask");M=l().join("")}).bind("mouseleave.inputmask",function(){var a=d(this);e.clearMaskOnLostFocus&&(a.hasClass("focus.inputmask")||this._valueGet()==a.attr("placeholder")||(this._valueGet()==G().join("")||""==this._valueGet()?this._valueSet(""):V(this)))}).bind("click.inputmask",function(){var a=
this;setTimeout(function(){var b=w(a),c=l();if(b.begin==b.end){var b=x?L(b.begin):b.begin,h=z(b),c=e.isNumeric?!1===e.skipRadixDance&&""!=e.radixPoint&&-1!=d.inArray(e.radixPoint,c)?e.numericInput?B(d.inArray(e.radixPoint,c)):d.inArray(e.radixPoint,c):B(h):B(h);b<c?u(b)?w(a,b):w(a,B(b)):w(a,c)}},0)}).bind("dblclick.inputmask",function(){var a=this;setTimeout(function(){w(a,0,B(z()))},0)}).bind(Q+".inputmask dragdrop.inputmask drop.inputmask",ca).bind("setvalue.inputmask",function(){O(this,!0);M=l().join("");
this._valueGet()==G().join("")&&this._valueSet("")}).bind("complete.inputmask",e.oncomplete).bind("incomplete.inputmask",e.onincomplete).bind("cleared.inputmask",e.oncleared);q.bind("keydown.inputmask",W).bind("keypress.inputmask",U).bind("keyup.inputmask",ba);if(k||s||m||P)if(q.attr("autocomplete","off").attr("autocorrect","off").attr("autocapitalize","off").attr("spellcheck",!1),s||P)q.unbind("keydown.inputmask",W).unbind("keypress.inputmask",U).unbind("keyup.inputmask",ba),"input"==Q&&q.unbind(Q+
".inputmask"),q.bind("input.inputmask",ia);g&&q.bind("input.inputmask",ca);c=d.isFunction(e.onBeforeMask)?e.onBeforeMask.call(b,b._valueGet(),e):b._valueGet();O(b,!0,!1,c.split(""),!0);M=l().join("");var f;try{f=document.activeElement}catch(n){}f===b?(q.addClass("focus.inputmask"),w(b,B(z()))):e.clearMaskOnLostFocus?l().join("")==G().join("")?b._valueSet(""):V(b):F(b,l());ga(b)}}var x=!1,M=l().join(""),q,X=!1,Y=!1,aa=!1,K;if(void 0!=b)switch(b.action){case "isComplete":return q=d(b.el),R(b.buffer);
case "unmaskedvalue":return q=b.$input,x=b.$input.data("_inputmask").isRTL,fa(b.$input,b.skipDatepickerCheck);case "mask":ja(b.el);break;case "format":return q=d({}),q.data("_inputmask",{maskset:a,opts:e,isRTL:e.numericInput}),e.numericInput&&(e.isNumeric=e.numericInput,x=!0),b=b.value.split(""),O(q,!1,!1,x?b.reverse():b,!0),x?l().reverse().join(""):l().join("");case "isValid":return q=d({}),q.data("_inputmask",{maskset:a,opts:e,isRTL:e.numericInput}),e.numericInput&&(e.isNumeric=e.numericInput,x=
!0),b=b.value.split(""),O(q,!1,!0,x?b.reverse():b),R(l())}},v=function(a,b,c){function h(b,e,f){b=b.jquery&&0<b.length?b[0]:b;if("number"==typeof e){e=g(e);f=g(f);f="number"==typeof f?f:e;if(b!=a){var k=d(b).data("_inputmask")||{};k.caret={begin:e,end:f};d(b).data("_inputmask",k)}d(b).is(":visible")&&(b.scrollLeft=b.scrollWidth,!1==c.insertMode&&e==f&&f++,b.setSelectionRange?(b.selectionStart=e,b.selectionEnd=f):b.createTextRange&&(b=b.createTextRange(),b.collapse(!0),b.moveEnd("character",f),b.moveStart("character",
e),b.select()))}else return d(b).is(":visible")||void 0==d(b).data("_inputmask").caret?b.setSelectionRange?(e=b.selectionStart,f=b.selectionEnd):document.selection&&document.selection.createRange&&(b=document.selection.createRange(),e=0-b.duplicate().moveStart("character",-1E5),f=e+b.text.length):(k=d(b).data("_inputmask"),e=k.caret.begin,f=k.caret.end),e=g(e),f=g(f),{begin:e,end:f}}function g(b){!v||"number"!=typeof b||c.greedy&&""==c.placeholder||(b=a.value.length-b);return b}function f(b,e){if("multiMaskScope"!=
b){var g=-1,v=-1,t=-1;d.each(e,function(a,b){var c=d(b).data("_inputmask").maskset,e=-1,f=0,l=h(b).begin,k;for(k in c.validPositions)c=parseInt(k),c>e&&(e=c),f++;if(f>g||f==g&&v>l&&t>e||f==g&&v==l&&t<e)g=f,v=l,m=a,t=e});d.isFunction(c.determineActiveMasksetIndex)&&(m=c.determineActiveMasksetIndex.call(k,b,e));var z=k.data("_inputmask-multi")||{activeMasksetIndex:0,elmasks:e};z.activeMasksetIndex=m;k.data("_inputmask-multi",z)}-1==["focus"].indexOf(b)&&a.value!=e[m]._valueGet()&&(z=""==d(e[m]).val()?
e[m]._valueGet():d(e[m]).val(),k.val(z));-1==["blur","focus"].indexOf(b)&&d(e[m]).hasClass("focus.inputmask")&&(z=h(e[m]),h(a,z.begin,z.end))}c.multi=!0;var k=d(a),v="rtl"==a.dir||c.numericInput,m=0,s=d.map(b,function(a,b){var e='<input type="text" ';k.attr("value")&&(e+='value="'+k.attr("value")+'" ');k.attr("dir")&&(e+='dir="'+k.attr("dir")+'" ');e=d(e+"/>")[0];t(d.extend(!0,{},a),c,{action:"mask",el:e});return e});k.data("_inputmask-multi",{activeMasksetIndex:0,elmasks:s});("rtl"==a.dir||c.numericInput&&
c.rightAlignNumerics||c.isNumeric&&c.rightAlignNumerics)&&k.css("text-align","right");a.dir="ltr";k.removeAttr("dir");k.bind("mouseenter blur focus mouseleave click dblclick keydown keypress keypress",function(b){var e=h(a),k,v=!0;if("keydown"==b.type){k=b.keyCode;if(k==c.keyCode.DOWN&&m<s.length-1)return m++,f("multiMaskScope",s),!1;if(k==c.keyCode.UP&&0<m)return m--,f("multiMaskScope",s),!1;if(b.ctrlKey||b.shiftKey||b.altKey)return!0}else if("keypress"==b.type&&(b.ctrlKey||b.shiftKey||b.altKey))return!0;
d.each(s,function(a,f){if("keydown"==b.type){k=b.keyCode;if(k==c.keyCode.BACKSPACE&&f._valueGet().length<e.begin)return;if(k==c.keyCode.TAB)v=!1;else{if(k==c.keyCode.RIGHT){h(f,e.begin+1,e.end+1);v=!1;return}if(k==c.keyCode.LEFT){h(f,e.begin-1,e.end-1);v=!1;return}}}if(-1!=["click"].indexOf(b.type)&&(h(f,g(e.begin),g(e.end)),e.begin!=e.end)){v=!1;return}-1!=["keydown"].indexOf(b.type)&&e.begin!=e.end&&h(f,e.begin,e.end);d(f).triggerHandler(b)});v&&setTimeout(function(){f(b.type,s)},0)});k.bind(Q+
" dragdrop drop setvalue.inputmaskmulti",function(b){h(a);setTimeout(function(){d.each(s,function(e,c){c._valueSet(a.value);d(c).triggerHandler(b)});setTimeout(function(){f(b.type,s)},0)},0)});(function(a){if(void 0==d.valHooks[a]||!0!=d.valHooks[a].inputmaskmultipatch){var b=d.valHooks[a]&&d.valHooks[a].get?d.valHooks[a].get:function(a){return a.value},e=d.valHooks[a]&&d.valHooks[a].set?d.valHooks[a].set:function(a,b){a.value=b;return a};d.valHooks[a]={get:function(a){var e=d(a);return e.data("_inputmask-multi")?
(a=e.data("_inputmask-multi"),b(a.elmasks[a.activeMasksetIndex])):b(a)},set:function(a,b){var c=d(a),h=e(a,b);c.data("_inputmask-multi")&&c.triggerHandler("setvalue.inputmaskmulti");return h},inputmaskmultipatch:!0}}})(a.type);""!=k.attr("value")&&setTimeout(function(){f("init",s)},0)};d.inputmask={defaults:{placeholder:"_",optionalmarker:{start:"[",end:"]"},quantifiermarker:{start:"{",end:"}"},groupmarker:{start:"(",end:")"},escapeChar:"\\",mask:null,oncomplete:d.noop,onincomplete:d.noop,oncleared:d.noop,
repeat:0,greedy:!0,autoUnmask:!1,clearMaskOnLostFocus:!0,insertMode:!0,clearIncomplete:!1,aliases:{},onKeyUp:d.noop,onKeyDown:d.noop,onBeforeMask:void 0,onBeforePaste:void 0,onUnMask:void 0,showMaskOnFocus:!0,showMaskOnHover:!0,onKeyValidation:d.noop,skipOptionalPartCharacter:" ",showTooltip:!1,numericInput:!1,isNumeric:!1,radixPoint:"",skipRadixDance:!1,rightAlignNumerics:!0,definitions:{9:{validator:"[0-9]",cardinality:1,definitionSymbol:"*"},a:{validator:"[A-Za-z\u0410-\u044f\u0401\u0451]",cardinality:1,
definitionSymbol:"*"},"*":{validator:"[A-Za-z\u0410-\u044f\u0401\u04510-9]",cardinality:1}},keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91},ignorables:[8,9,13,19,27,33,34,
35,36,37,38,39,40,45,46,93,112,113,114,115,116,117,118,119,120,121,122,123],isComplete:void 0,multi:!1,nojumps:!1,nojumpsThreshold:0,determineActiveMasksetIndex:void 0},masksCache:{},escapeRegex:function(a){return a.replace(RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\)","gim"),"\\$1")},format:function(a,b){var f=d.extend(!0,{},d.inputmask.defaults,b);c(f.alias,b,f);return t(h(f),f,{action:"format",value:a})},isValid:function(a,b){var f=d.extend(!0,{},d.inputmask.defaults,b);c(f.alias,
b,f);return t(h(f),f,{action:"isValid",value:a})}};d.fn.inputmask=function(a,b){var f=d.extend(!0,{},d.inputmask.defaults,b),g;if("string"===typeof a)switch(a){case "mask":return c(f.alias,b,f),g=h(f),0==g.length?this:this.each(function(){d.isArray(g)?v(this,g,f):t(d.extend(!0,{},g),f,{action:"mask",el:this})});case "unmaskedvalue":var k=d(this);return k.data("_inputmask")?(g=k.data("_inputmask").maskset,f=k.data("_inputmask").opts,t(g,f,{action:"unmaskedvalue",$input:k})):k.val();case "remove":return this.each(function(){var a=
d(this);if(a.data("_inputmask")){g=a.data("_inputmask").maskset;f=a.data("_inputmask").opts;this._valueSet(t(g,f,{action:"unmaskedvalue",$input:a,skipDatepickerCheck:!0}));a.removeData("_inputmask");a.unbind(".inputmask");a.removeClass("focus.inputmask");var b;Object.getOwnPropertyDescriptor&&(b=Object.getOwnPropertyDescriptor(this,"value"));b&&b.get?this._valueGet&&Object.defineProperty(this,"value",{get:this._valueGet,set:this._valueSet}):document.__lookupGetter__&&this.__lookupGetter__("value")&&
this._valueGet&&(this.__defineGetter__("value",this._valueGet),this.__defineSetter__("value",this._valueSet));try{delete this._valueGet,delete this._valueSet}catch(c){this._valueSet=this._valueGet=void 0}}});case "getemptymask":return this.data("_inputmask")?(g=this.data("_inputmask").maskset,g._buffer.join("")):"";case "hasMaskedValue":return this.data("_inputmask")?!this.data("_inputmask").opts.autoUnmask:!1;case "isComplete":return this.data("_inputmask")?(g=this.data("_inputmask").maskset,f=this.data("_inputmask").opts,
t(g,f,{action:"isComplete",buffer:this[0]._valueGet().split(""),el:this})):!0;case "getmetadata":if(this.data("_inputmask"))return g=this.data("_inputmask").maskset,g.metadata;break;default:return c(a,b,f)||(f.mask=a),g=h(f),void 0==g?this:this.each(function(){d.isArray(g)?v(this,g,f):t(d.extend(!0,{},g),f,{action:"mask",el:this})})}else{if("object"==typeof a)return f=d.extend(!0,{},d.inputmask.defaults,a),c(f.alias,a,f),g=h(f),void 0==g?this:this.each(function(){d.isArray(g)?v(this,g,f):t(d.extend(!0,
{},g),f,{action:"mask",el:this})});if(void 0==a)return this.each(function(){var a=d(this).attr("data-inputmask");if(a&&""!=a)try{var a=a.replace(RegExp("'","g"),'"'),h=d.parseJSON("{"+a+"}");d.extend(!0,h,b);f=d.extend(!0,{},d.inputmask.defaults,h);c(f.alias,h,f);f.alias=void 0;d(this).inputmask(f)}catch(g){}})}}}})(jQuery);
(function(d){d.extend(d.inputmask.defaults.definitions,{A:{validator:"[A-Za-z]",cardinality:1,casing:"upper"},"#":{validator:"[A-Za-z\u0410-\u044f\u0401\u04510-9]",cardinality:1,casing:"upper"}});d.extend(d.inputmask.defaults.aliases,{url:{mask:"ir",placeholder:"",separator:"",defaultPrefix:"http://",regex:{urlpre1:/[fh]/,urlpre2:/(ft|ht)/,urlpre3:/(ftp|htt)/,urlpre4:/(ftp:|http|ftps)/,urlpre5:/(ftp:\/|ftps:|http:|https)/,urlpre6:/(ftp:\/\/|ftps:\/|http:\/|https:)/,urlpre7:/(ftp:\/\/|ftps:\/\/|http:\/\/|https:\/)/,
urlpre8:/(ftp:\/\/|ftps:\/\/|http:\/\/|https:\/\/)/},definitions:{i:{validator:function(a,c,h,d,b){return!0},cardinality:8,prevalidator:function(){for(var a=[],c=0;8>c;c++)a[c]=function(){var a=c;return{validator:function(c,b,f,d,m){if(m.regex["urlpre"+(a+1)]){var s=c;0<a+1-c.length&&(s=b.join("").substring(0,a+1-c.length)+""+s);c=m.regex["urlpre"+(a+1)].test(s);if(!d&&!c){f-=a;for(d=0;d<m.defaultPrefix.length;d++)b[f]=m.defaultPrefix[d],f++;for(d=0;d<s.length-1;d++)b[f]=s[d],f++;return{pos:f}}return c}return!1},
cardinality:a}}();return a}()},r:{validator:".",cardinality:50}},insertMode:!1,autoUnmask:!1},ip:{mask:"i[i[i]].i[i[i]].i[i[i]].i[i[i]]",definitions:{i:{validator:function(a,c,h,d,b){-1<h-1&&"."!=c[h-1]?(a=c[h-1]+a,a=-1<h-2&&"."!=c[h-2]?c[h-2]+a:"0"+a):a="00"+a;return/25[0-5]|2[0-4][0-9]|[01][0-9][0-9]/.test(a)},cardinality:1}}},email:{mask:"*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}.*{2,6}[.*{1,2}]",greedy:!1}})})(jQuery);
(function(d){d.extend(d.inputmask.defaults.definitions,{h:{validator:"[01][0-9]|2[0-3]",cardinality:2,prevalidator:[{validator:"[0-2]",cardinality:1}]},s:{validator:"[0-5][0-9]",cardinality:2,prevalidator:[{validator:"[0-5]",cardinality:1}]},d:{validator:"0[1-9]|[12][0-9]|3[01]",cardinality:2,prevalidator:[{validator:"[0-3]",cardinality:1}]},m:{validator:"0[1-9]|1[012]",cardinality:2,prevalidator:[{validator:"[01]",cardinality:1}]},y:{validator:"(19|20)\\d{2}",cardinality:4,prevalidator:[{validator:"[12]",
cardinality:1},{validator:"(19|20)",cardinality:2},{validator:"(19|20)\\d",cardinality:3}]}});d.extend(d.inputmask.defaults.aliases,{"dd/mm/yyyy":{mask:"1/2/y",placeholder:"dd/mm/yyyy",regex:{val1pre:/[0-3]/,val1:/0[1-9]|[12][0-9]|3[01]/,val2pre:function(a){a=d.inputmask.escapeRegex.call(this,a);return RegExp("((0[1-9]|[12][0-9]|3[01])"+a+"[01])")},val2:function(a){a=d.inputmask.escapeRegex.call(this,a);return RegExp("((0[1-9]|[12][0-9])"+a+"(0[1-9]|1[012]))|(30"+a+"(0[13-9]|1[012]))|(31"+a+"(0[13578]|1[02]))")}},
leapday:"29/02/",separator:"/",yearrange:{minyear:1900,maxyear:2099},isInYearRange:function(a,c,h){if(isNaN(a))return!1;var d=parseInt(a.concat(c.toString().slice(a.length)));a=parseInt(a.concat(h.toString().slice(a.length)));return(isNaN(d)?!1:c<=d&&d<=h)||(isNaN(a)?!1:c<=a&&a<=h)},determinebaseyear:function(a,c,h){var d=(new Date).getFullYear();if(a>d)return a;if(c<d){for(var d=c.toString().slice(0,2),b=c.toString().slice(2,4);c<d+h;)d--;c=d+b;return a>c?a:c}return d},onKeyUp:function(a,c,h){c=
d(this);a.ctrlKey&&a.keyCode==h.keyCode.RIGHT&&(a=new Date,c.val(a.getDate().toString()+(a.getMonth()+1).toString()+a.getFullYear().toString()))},definitions:{1:{validator:function(a,c,d,g,b){var f=b.regex.val1.test(a);return g||f||a.charAt(1)!=b.separator&&-1=="-./".indexOf(a.charAt(1))||!(f=b.regex.val1.test("0"+a.charAt(0)))?f:(c[d-1]="0",{pos:d,c:a.charAt(0)})},cardinality:2,prevalidator:[{validator:function(a,c,d,g,b){var f=b.regex.val1pre.test(a);return g||f||!(f=b.regex.val1.test("0"+a))?f:
(c[d]="0",d++,{pos:d})},cardinality:1}]},2:{validator:function(a,c,d,g,b){var f=c.join("").substr(0,3);-1!=f.indexOf(b.placeholder[0])&&(f="01"+b.separator);var k=b.regex.val2(b.separator).test(f+a);return g||k||a.charAt(1)!=b.separator&&-1=="-./".indexOf(a.charAt(1))||!(k=b.regex.val2(b.separator).test(f+"0"+a.charAt(0)))?k:(c[d-1]="0",{pos:d,c:a.charAt(0)})},cardinality:2,prevalidator:[{validator:function(a,c,d,g,b){var f=c.join("").substr(0,3);-1!=f.indexOf(b.placeholder[0])&&(f="01"+b.separator);
var k=b.regex.val2pre(b.separator).test(f+a);return g||k||!(k=b.regex.val2(b.separator).test(f+"0"+a))?k:(c[d]="0",d++,{pos:d})},cardinality:1}]},y:{validator:function(a,c,d,g,b){if(b.isInYearRange(a,b.yearrange.minyear,b.yearrange.maxyear)){if(c.join("").substr(0,6)!=b.leapday)return!0;a=parseInt(a,10);return 0===a%4?0===a%100?0===a%400?!0:!1:!0:!1}return!1},cardinality:4,prevalidator:[{validator:function(a,c,d,g,b){var f=b.isInYearRange(a,b.yearrange.minyear,b.yearrange.maxyear);if(!g&&!f){g=b.determinebaseyear(b.yearrange.minyear,
b.yearrange.maxyear,a+"0").toString().slice(0,1);if(f=b.isInYearRange(g+a,b.yearrange.minyear,b.yearrange.maxyear))return c[d++]=g[0],{pos:d};g=b.determinebaseyear(b.yearrange.minyear,b.yearrange.maxyear,a+"0").toString().slice(0,2);if(f=b.isInYearRange(g+a,b.yearrange.minyear,b.yearrange.maxyear))return c[d++]=g[0],c[d++]=g[1],{pos:d}}return f},cardinality:1},{validator:function(a,c,d,g,b){var f=b.isInYearRange(a,b.yearrange.minyear,b.yearrange.maxyear);if(!g&&!f){g=b.determinebaseyear(b.yearrange.minyear,
b.yearrange.maxyear,a).toString().slice(0,2);if(f=b.isInYearRange(a[0]+g[1]+a[1],b.yearrange.minyear,b.yearrange.maxyear))return c[d++]=g[1],{pos:d};g=b.determinebaseyear(b.yearrange.minyear,b.yearrange.maxyear,a).toString().slice(0,2);b.isInYearRange(g+a,b.yearrange.minyear,b.yearrange.maxyear)?c.join("").substr(0,6)!=b.leapday?f=!0:(b=parseInt(a,10),f=0===b%4?0===b%100?0===b%400?!0:!1:!0:!1):f=!1;if(f)return c[d-1]=g[0],c[d++]=g[1],c[d++]=a[0],{pos:d}}return f},cardinality:2},{validator:function(a,
c,d,g,b){return b.isInYearRange(a,b.yearrange.minyear,b.yearrange.maxyear)},cardinality:3}]}},insertMode:!1,autoUnmask:!1},"mm/dd/yyyy":{placeholder:"mm/dd/yyyy",alias:"dd/mm/yyyy",regex:{val2pre:function(a){a=d.inputmask.escapeRegex.call(this,a);return RegExp("((0[13-9]|1[012])"+a+"[0-3])|(02"+a+"[0-2])")},val2:function(a){a=d.inputmask.escapeRegex.call(this,a);return RegExp("((0[1-9]|1[012])"+a+"(0[1-9]|[12][0-9]))|((0[13-9]|1[012])"+a+"30)|((0[13578]|1[02])"+a+"31)")},val1pre:/[01]/,val1:/0[1-9]|1[012]/},
leapday:"02/29/",onKeyUp:function(a,c,h){c=d(this);a.ctrlKey&&a.keyCode==h.keyCode.RIGHT&&(a=new Date,c.val((a.getMonth()+1).toString()+a.getDate().toString()+a.getFullYear().toString()))}},"yyyy/mm/dd":{mask:"y/1/2",placeholder:"yyyy/mm/dd",alias:"mm/dd/yyyy",leapday:"/02/29",onKeyUp:function(a,c,h){c=d(this);a.ctrlKey&&a.keyCode==h.keyCode.RIGHT&&(a=new Date,c.val(a.getFullYear().toString()+(a.getMonth()+1).toString()+a.getDate().toString()))},definitions:{2:{validator:function(a,c,d,g,b){var f=
c.join("").substr(5,3);-1!=f.indexOf(b.placeholder[5])&&(f="01"+b.separator);var k=b.regex.val2(b.separator).test(f+a);if(!(g||k||a.charAt(1)!=b.separator&&-1=="-./".indexOf(a.charAt(1)))&&(k=b.regex.val2(b.separator).test(f+"0"+a.charAt(0))))return c[d-1]="0",{pos:d,c:a.charAt(0)};if(k){if(c.join("").substr(4,4)+a!=b.leapday)return!0;a=parseInt(c.join("").substr(0,4),10);return 0===a%4?0===a%100?0===a%400?!0:!1:!0:!1}return k},cardinality:2,prevalidator:[{validator:function(a,c,d,g,b){var f=c.join("").substr(5,
3);-1!=f.indexOf(b.placeholder[5])&&(f="01"+b.separator);var k=b.regex.val2pre(b.separator).test(f+a);return g||k||!(k=b.regex.val2(b.separator).test(f+"0"+a))?k:(c[d]="0",d++,{pos:d})},cardinality:1}]}}},"dd.mm.yyyy":{mask:"1.2.y",placeholder:"dd.mm.yyyy",leapday:"29.02.",separator:".",alias:"dd/mm/yyyy"},"dd-mm-yyyy":{mask:"1-2-y",placeholder:"dd-mm-yyyy",leapday:"29-02-",separator:"-",alias:"dd/mm/yyyy"},"mm.dd.yyyy":{mask:"1.2.y",placeholder:"mm.dd.yyyy",leapday:"02.29.",separator:".",alias:"mm/dd/yyyy"},
"mm-dd-yyyy":{mask:"1-2-y",placeholder:"mm-dd-yyyy",leapday:"02-29-",separator:"-",alias:"mm/dd/yyyy"},"yyyy.mm.dd":{mask:"y.1.2",placeholder:"yyyy.mm.dd",leapday:".02.29",separator:".",alias:"yyyy/mm/dd"},"yyyy-mm-dd":{mask:"y-1-2",placeholder:"yyyy-mm-dd",leapday:"-02-29",separator:"-",alias:"yyyy/mm/dd"},datetime:{mask:"1/2/y h:s",placeholder:"dd/mm/yyyy hh:mm",alias:"dd/mm/yyyy",regex:{hrspre:/[012]/,hrs24:/2[0-4]|1[3-9]/,hrs:/[01][0-9]|2[0-4]/,ampm:/^[a|p|A|P][m|M]/},timeseparator:":",hourFormat:"24",
definitions:{h:{validator:function(a,c,d,g,b){if("24"==b.hourFormat&&24==parseInt(a,10))return c[d-1]="0",c[d]="0",{refreshFromBuffer:{start:d-1,end:d},c:"0"};var f=b.regex.hrs.test(a);return g||f||a.charAt(1)!=b.timeseparator&&-1=="-.:".indexOf(a.charAt(1))||!(f=b.regex.hrs.test("0"+a.charAt(0)))?f&&"24"!==b.hourFormat&&b.regex.hrs24.test(a)?(a=parseInt(a,10),c[d+5]=24==a?"a":"p",c[d+6]="m",a-=12,10>a?(c[d]=a.toString(),c[d-1]="0"):(c[d]=a.toString().charAt(1),c[d-1]=a.toString().charAt(0)),{refreshFromBuffer:{start:d-
1,end:d+6},c:c[d]}):f:(c[d-1]="0",c[d]=a.charAt(0),d++,{refreshFromBuffer:{start:d-2,end:d},pos:d,c:b.timeseparator})},cardinality:2,prevalidator:[{validator:function(a,c,d,g,b){var f=b.regex.hrspre.test(a);return g||f||!(f=b.regex.hrs.test("0"+a))?f:(c[d]="0",d++,{pos:d})},cardinality:1}]},t:{validator:function(a,c,d,g,b){return b.regex.ampm.test(a+"m")},casing:"lower",cardinality:1}},insertMode:!1,autoUnmask:!1},datetime12:{mask:"1/2/y h:s t\\m",placeholder:"dd/mm/yyyy hh:mm xm",alias:"datetime",
hourFormat:"12"},"hh:mm t":{mask:"h:s t\\m",placeholder:"hh:mm xm",alias:"datetime",hourFormat:"12"},"h:s t":{mask:"h:s t\\m",placeholder:"hh:mm xm",alias:"datetime",hourFormat:"12"},"hh:mm:ss":{mask:"h:s:s",autoUnmask:!1},"hh:mm":{mask:"h:s",autoUnmask:!1},date:{alias:"dd/mm/yyyy"},"mm/yyyy":{mask:"1/y",placeholder:"mm/yyyy",leapday:"donotuse",separator:"/",alias:"mm/dd/yyyy"}})})(jQuery);
(function(d){d.extend(d.inputmask.defaults.aliases,{decimal:{mask:"~",placeholder:"",repeat:"*",greedy:!1,numericInput:!1,isNumeric:!0,digits:"*",groupSeparator:"",radixPoint:".",groupSize:3,autoGroup:!1,allowPlus:!0,allowMinus:!0,integerDigits:"*",defaultValue:"",prefix:"",suffix:"",postFormat:function(a,c,h,g){if(""==g.groupSeparator)return c;var b=a.slice();d.inArray(g.radixPoint,a);h||b.splice(c,0,"?");b=b.join("");if(g.autoGroup||h&&-1!=b.indexOf(g.groupSeparator)){for(var f=d.inputmask.escapeRegex.call(this,
g.groupSeparator),b=b.replace(RegExp(f,"g"),""),f=b.split(g.radixPoint),b=f[0],k=RegExp("([-+]?[\\d?]+)([\\d?]{"+g.groupSize+"})");k.test(b);)b=b.replace(k,"$1"+g.groupSeparator+"$2"),b=b.replace(g.groupSeparator+g.groupSeparator,g.groupSeparator);1<f.length&&(b+=g.radixPoint+f[1])}a.length=b.length;g=0;for(f=b.length;g<f;g++)a[g]=b.charAt(g);b=d.inArray("?",a);h||a.splice(b,1);return h?c:b},regex:{number:function(a){var c=d.inputmask.escapeRegex.call(this,a.radixPoint),h=isNaN(a.digits)?a.digits:
"{0,"+a.digits+"}",g=isNaN(a.integerDigits)?a.integerDigits:"{1,"+a.integerDigits+"}";return RegExp("^"+(a.allowPlus||a.allowMinus?"["+(a.allowPlus?"+":"")+(a.allowMinus?"-":"")+"]?":"")+"\\d"+g+"("+c+"\\d"+h+")?$")}},onKeyDown:function(a,c,h){var g=d(this);if(a.keyCode==h.keyCode.TAB){if(a=d.inArray(h.radixPoint,c),-1!=a){for(var b=g.data("_inputmask").masksets,g=g.data("_inputmask").activeMasksetIndex,f=1;f<=h.digits&&f<h.getMaskLength(b[g]._buffer,h.greedy,h.repeat,c,h);f++)if(void 0==c[a+f]||
""==c[a+f])c[a+f]="0";return{refreshFromBuffer:!0}}}else if(a.keyCode==h.keyCode.DELETE||a.keyCode==h.keyCode.BACKSPACE)return h.postFormat(c,0,!0,h),this._valueSet(c.join("")),{refreshFromBuffer:!0}},definitions:{"~":{validator:function(a,c,h,g,b){var f=d.extend({},b,{digits:g?"*":b.digits});if(""==a)return!1;if(!g&&1>=h&&"0"===c[0]&&/[\d-]/.test(a)&&1==c.join("").length)return c[0]="",{pos:0};var k=g?c.slice(0,h):c.slice();k.splice(h,0,a);var k=k.join(""),m=d.inputmask.escapeRegex.call(this,b.groupSeparator),
k=k.replace(RegExp(m,"g"),"");g&&k.lastIndexOf(b.radixPoint)==k.length-1&&(m=d.inputmask.escapeRegex.call(this,b.radixPoint),k=k.replace(RegExp(m,"g"),""));if(!g&&""==k)return!1;m=b.regex.number(f).test(k);if(!m&&(k+="0",m=b.regex.number(f).test(k),!m)){m=k.lastIndexOf(b.groupSeparator);for(m=k.length-m;3>=m;m++)k+="0";m=b.regex.number(f).test(k);if(!m&&!g&&a==b.radixPoint&&(m=b.regex.number(f).test("0"+k+"0")))return c[h]="0",h++,{pos:h}}return!1==m||g||a==b.radixPoint?m:{pos:b.postFormat(c,h,"-"==
a||"+"==a?!0:!1,b),refreshFromBuffer:!0}},cardinality:1,prevalidator:null}},insertMode:!0,autoUnmask:!1},integer:{regex:{number:function(a){var c=d.inputmask.escapeRegex.call(this,a.groupSeparator);return RegExp("^"+(a.allowPlus||a.allowMinus?"["+(a.allowPlus?"+":"")+(a.allowMinus?"-":"")+"]?":"")+"(\\d+|\\d{1,"+a.groupSize+"}(("+c+"\\d{"+a.groupSize+"})?)+)$")}},alias:"decimal"}})})(jQuery);
(function(d){d.extend(d.inputmask.defaults.aliases,{Regex:{mask:"r",greedy:!1,repeat:"*",regex:null,regexTokens:null,tokenizer:/\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,quantifierFilter:/[0-9]+[^,]/,isComplete:function(a,c){return RegExp(c.regex).test(a.join(""))},definitions:{r:{validator:function(a,c,d,g,b){function f(a,b){this.matches=
[];this.isGroup=a||!1;this.isQuantifier=b||!1;this.quantifier={min:1,max:1};this.repeaterPart=void 0}function k(){var a=new f,c,d=[];for(b.regexTokens=[];c=b.tokenizer.exec(b.regex);)switch(c=c[0],c.charAt(0)){case "(":d.push(new f(!0));break;case ")":var e=d.pop();0<d.length?d[d.length-1].matches.push(e):a.matches.push(e);break;case "{":case "+":case "*":var g=new f(!1,!0);c=c.replace(/[{}]/g,"");e=c.split(",");c=isNaN(e[0])?e[0]:parseInt(e[0]);e=1==e.length?c:isNaN(e[1])?e[1]:parseInt(e[1]);g.quantifier=
{min:c,max:e};if(0<d.length){var h=d[d.length-1].matches;c=h.pop();c.isGroup||(e=new f(!0),e.matches.push(c),c=e);h.push(c);h.push(g)}else c=a.matches.pop(),c.isGroup||(e=new f(!0),e.matches.push(c),c=e),a.matches.push(c),a.matches.push(g);break;default:0<d.length?d[d.length-1].matches.push(c):a.matches.push(c)}0<a.matches.length&&b.regexTokens.push(a)}function m(a,b){var c=!1;b&&(s+="(",P++);for(var d=0;d<a.matches.length;d++){var f=a.matches[d];if(!0==f.isGroup)c=m(f,!0);else if(!0==f.isQuantifier){var g=
a.matches.indexOf(f),g=a.matches[g-1],h=s;if(isNaN(f.quantifier.max)){for(;f.repeaterPart&&f.repeaterPart!=s&&f.repeaterPart.length>s.length&&!(c=m(g,!0)););(c=c||m(g,!0))&&(f.repeaterPart=s);s=h+f.quantifier.max}else{for(var k=0,da=f.quantifier.max-1;k<da&&!(c=m(g,!0));k++);s=h+"{"+f.quantifier.min+","+f.quantifier.max+"}"}}else if(void 0!=f.matches)for(g=0;g<f.length&&!(c=m(f[g],b));g++);else{if("["==f[0]){c=s;c+=f;for(k=0;k<P;k++)c+=")";c=RegExp("^("+c+")$");c=c.test(Q)}else for(g=0,h=f.length;g<
h;g++)if("\\"!=f[g]){c=s;c+=f.substr(0,g+1);c=c.replace(/\|$/,"");for(k=0;k<P;k++)c+=")";c=RegExp("^("+c+")$");if(c=c.test(Q))break}s+=f}if(c)break}b&&(s+=")",P--);return c}null==b.regexTokens&&k();g=c.slice();var s="";c=!1;var P=0;g.splice(d,0,a);var Q=g.join("");for(a=0;a<b.regexTokens.length&&!(f=b.regexTokens[a],c=m(f,f.isGroup));a++);return c},cardinality:1}}}})})(jQuery);
(function(d){d.extend(d.inputmask.defaults.aliases,{phone:{url:"phone-codes/phone-codes.json",mask:function(a){a.definitions={p:{validator:function(){return!1},cardinality:1},"#":{validator:"[0-9]",cardinality:1}};var c=[];d.ajax({url:a.url,async:!1,dataType:"json",success:function(a){c=a}});c.splice(0,0,"+p(ppp)ppp-pppp");return c},nojumps:!0,nojumpsThreshold:1},phonebe:{url:"phone-codes/phone-be.json",mask:function(a){a.definitions={p:{validator:function(){return!1},cardinality:1},"#":{validator:"[0-9]",
cardinality:1}};var c=[];d.ajax({url:a.url,async:!1,dataType:"json",success:function(a){c=a}});c.splice(0,0,"+32(ppp)ppp-pppp");return c},nojumps:!0,nojumpsThreshold:4}})})(jQuery);

/**
 * @requires ../lib/bootstrap/js/transition.js
 * @requires ../lib/bootstrap/js/alert.js
 * @requires ../lib/bootstrap/js/button.js
 * @requires ../lib/bootstrap/js/carousel.js
 * @requires ../lib/bootstrap/js/collapse.js
 * @requires ../lib/bootstrap/js/dropdown.js
 * @requires ../lib/bootstrap/js/modal.js
 * @requires ../lib/bootstrap/js/tooltip.js
 * @requires ../lib/bootstrap/js/popover.js
 * @requires ../lib/bootstrap/js/tab.js
 * @requires ../lib/moment/min/moment.min.js
 * @requires ../lib/moment-timezone/moment-timezone.js
 * @requires ../lib/later/later.min.js
 * @requires ../lib/underscore/underscore.js
 * @requires ../lib/jquery-cron/cron/jquery-cron.js
 * @requires ../lib/prettycron/prettycron.js
 * @requires ../lib/watable/jquery.watable.js
 * @requires ../lib/bootstrapvalidator/dist/js/bootstrapValidator.min.js
 * @requires ../lib/smokejs/smoke.min.js
 * @requires ../lib/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker.js
 * @requires ../lib/fastclick/lib/fastclick.js
 * @requires ../lib/debugging/debug.js
 * @requires ../lib/application/navigation.js
 * @requires ../lib/application/tabs.js
 * @requires ../lib/jquery/jquery-migrate.min.js
 * @requires ../lib/datatables/jquery.dataTables.js
 * @requires ../lib/datatables/DTBootstrap.js)
 * @requires ../lib/datatables/KeyTable.min.js
 * @requires ../lib/datatables/dataTables.editor.min.js
 * @requires ../lib/jquery.inputmask/dist/jquery.inputmask.bundle.min.js
 */