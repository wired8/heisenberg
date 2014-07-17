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
 * Bootstrap: button.js v3.2.0
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.2.0'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    $el[val](data[state] == null ? this.options[state] : data[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    Plugin.call($btn, 'toggle')
    e.preventDefault()
  })

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
 * Bootstrap: collapse.js v3.2.0
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.2.0'

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      Plugin.call(actives, 'hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var href
    var $this   = $(this)
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    Plugin.call($target, option)
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
 * Bootstrap: scrollspy.js v3.2.0
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var process  = $.proxy(this.process, this)

    this.$body          = $('body')
    this.$scrollElement = $(element).is('body') ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', process)
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.2.0'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = 'offset'
    var offsetBase   = 0

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.offsets = []
    this.targets = []
    this.scrollHeight = this.getScrollHeight()

    var self     = this

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')

    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

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

/* ========================================================================
 * Bootstrap: affix.js v3.2.0
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.2.0'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin != null) this.$element.css('top', '')

    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - this.$element.height() - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

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
$(document).ready(function() {

    // This code could be used to set active (selected) navigation elements but it is kind of a hack.
    // $('.nav [href="'+ window.location.pathname +'"]').closest('li').toggleClass('active');
    // *Instead* we set the active menu item in the jade template via passing in the URL.

    // To handle facebook URL junk:
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