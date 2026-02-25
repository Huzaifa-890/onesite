var G5Plus = G5Plus || {};
(function ($) {
    "use strict";

    var $window = $(window),
        $body = $('body'),
        isRTL = $body.hasClass('rtl'),
        deviceAgent = navigator.userAgent.toLowerCase(),
        isMobile = deviceAgent.match(/(iphone|ipod|android|iemobile)/),
        isMobileAlt = deviceAgent.match(/(iphone|ipod|ipad|android|iemobile)/),
        isAppleDevice = deviceAgent.match(/(iphone|ipod|ipad)/),
        isIEMobile = deviceAgent.match(/(iemobile)/);

    G5Plus.common = {
        init: function () {
            this.owlCarousel();
            this.lightGallery();
            this.canvasSidebar();
            this.customTab();
			this.counterUp();
            this.initVCTab();
	        this.adminBarProcess();
	        setTimeout(G5Plus.common.owlCarouselRefresh,1000);
	        setTimeout(G5Plus.common.owlCarouselCenter,1000);
	        this.tooltip();
			this.count_down();
			this.owlCarouselInstagram();
        },
        windowResized: function () {
            this.canvasSidebar();
	        this.adminBarProcess();
	        setTimeout(G5Plus.common.owlCarouselRefresh,1000);
	        setTimeout(G5Plus.common.owlCarouselCenter,1000);
        },
        lightGallery: function () {
            $("[data-rel='lightGallery']").each(function () {
                var $this = $(this),
                    galleryId = $this.data('gallery-id');
                $this.on('click', function (event) {
                    event.preventDefault();
                    var _data = [];
                    var $index = 0;
                    var $current_src = $(this).attr('href');
                    var $current_thumb_src = $(this).data('thumb-src');

                    if (typeof galleryId != 'undefined') {
                        $('[data-gallery-id="' + galleryId + '"]').each(function (index) {
                            var src = $(this).attr('href'),
                                thumb = $(this).data('thumb-src'),
                                subHtml = $(this).attr('title');
                            if(src==$current_src && thumb==$current_thumb_src){
                                $index = index;
                            }
                            if(typeof(subHtml)=='undefined')
                                subHtml = '';
                            _data.push({
                                'src': src,
                                'downloadUrl': src,
                                'thumb': thumb,
                                'subHtml': subHtml
                            });
                        });
                        $this.lightGallery({
                            hash: false,
                            galleryId: galleryId,
                            dynamic: true,
                            dynamicEl: _data,
                            thumbWidth: 80,
                            index: $index
                        })
                    }
                });
            });
            $('a.view-video').on('click',function (event) {
                event.preventDefault();
                var $src = $(this).attr('data-src');
                $(this).lightGallery({
                    dynamic: true,
                    dynamicEl: [{
                        'src': $src,
                        'thumb': '',
                        'subHtml': ''
                    }]
                });
            });
        },
        owlCarousel: function () {
            $('.owl-carousel:not(.manual):not(.owl-loaded)').each(function () {
                var slider = $(this);
                var defaults = {
                    items: 4,
                    nav: false,
                    navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
                    dots: false,
                    loop: false,
                    center: false,
                    mouseDrag: true,
                    touchDrag: true,
                    pullDrag: true,
                    freeDrag: false,
                    margin: 0,
                    stagePadding: 0,
                    merge: false,
                    mergeFit: true,
                    autoWidth: false,
                    startPosition: 0,
                    rtl: isRTL,
                    smartSpeed: 250,
                    fluidSpeed: false,
                    dragEndSpeed: false,
                    autoplayHoverPause: true
                };
                var config = $.extend({}, defaults, slider.data("plugin-options"));
                // Initialize Slider
                slider.owlCarousel(config);

	            slider.on('changed.owl.carousel',function(e){
		            G5Plus.blog.masonryLayoutRefresh();
	            });
            });
        },
	    owlCarouselRefresh : function(){
		    $('.owl-carousel.owl-loaded').each(function(){
			    var $this = $(this),
				    $slider = $this.data('owl.carousel');
			    if (typeof ($slider) != 'undefined') {
				    if ($slider.options.autoHeight) {
					    var maxHeight = 0;
					    $('.owl-item.active',$this).each(function(){
						    if ($(this).outerHeight() > maxHeight) {
							    maxHeight = $(this).outerHeight();
						    }
					    });

					    $('.owl-height',$this).css('height', maxHeight + 'px');
				    }
			    }
		    });
	    },
	    owlCarouselCenter: function(){
		    $('.product-listing > .owl-nav-center').each(function(){
			    var $this = $(this);
			    $this.imagesLoaded({background: true},function(){
				    var top = $('img',$this).height() / 2  ;
				    if (window.matchMedia('(min-width: 1350px)').matches) {
					    $('.owl-nav > div',$this).css('top', top +  'px');
				    } else {
					    $('.owl-nav > div',$this).css('top','');
				    }
			    });
		    });
	    },
        canvasSidebar: function () {
            var canvas_sidebar_mobile = $('.sidebar-mobile-canvas');
            var changed_class = 'changed';
            if (canvas_sidebar_mobile.length > 0) {
                if (!$('body').find('#wrapper').next().hasClass('overlay-canvas-sidebar')) {
                    $('#wrapper').after('<div class="overlay-canvas-sidebar"></div>');
                }
                if (!G5Plus.common.isDesktop()) {
                    canvas_sidebar_mobile.css('height', $(window).height() + 'px');
                    canvas_sidebar_mobile.css('overflow-y', 'auto');
                    if ($.isFunction($.fn.perfectScrollbar)) {
                        canvas_sidebar_mobile.perfectScrollbar({
                            wheelSpeed: 0.5,
                            suppressScrollX: true
                        });
                    }
                } else {
                    canvas_sidebar_mobile.css('overflow-y', 'hidden');
                    canvas_sidebar_mobile.css('height', 'auto');
                    canvas_sidebar_mobile.scrollTop(0);
                    if ($.isFunction($.fn.perfectScrollbar) && canvas_sidebar_mobile.hasClass('ps-active-y')) {
                        canvas_sidebar_mobile.perfectScrollbar('destroy');
                    }
                    canvas_sidebar_mobile.removeAttr('style');
                    $('.overlay-canvas-sidebar').removeClass(changed_class);
                    $('.sidebar-mobile-canvas', '#wrapper').removeClass(changed_class);
                    $('.sidebar-mobile-canvas-icon', '#wrapper').removeClass(changed_class);

                }
                $('.sidebar-mobile-canvas-icon').on('click', function () {
                    var $canvas_sidebar = $(this).parent().children('.sidebar-mobile-canvas');
                    $(this).addClass(changed_class);
                    $canvas_sidebar.addClass(changed_class);
                    $('.overlay-canvas-sidebar').addClass(changed_class);

                });
                $('.overlay-canvas-sidebar').on('click', function () {
                    if ($('.sidebar-mobile-canvas-icon').hasClass(changed_class)) {
                        $(this).removeClass(changed_class);
                        $('.sidebar-mobile-canvas', '#wrapper').removeClass(changed_class);
                        $('.sidebar-mobile-canvas-icon', '#wrapper').removeClass(changed_class);
                    }
                });
            }
        },
        customTab: function () {
            var tabStyle = $('.vc_tta-style-no_border');
            tabStyle.each(function () {
                var elm = $('.vc_tta-tabs-container', $(this));
                elm.wrap('<div class="tab-background"><div class="container"></div></div>');
                elm = $('.vc_tta-panels-container', $(this));
                elm.wrap('<div class="container"></div>');
            });
        },
        isDesktop: function () {
            var responsive_breakpoint = 991;
            var $menu = $('.x-nav-menu');
            if (($menu.length > 0) && (typeof ($menu.attr('responsive-breakpoint')) != "undefined" ) && !isNaN(parseInt($menu.attr('responsive-breakpoint'), 10))) {
                responsive_breakpoint = parseInt($menu.attr('responsive-breakpoint'), 10);
            }
            return window.matchMedia('(min-width: ' + (responsive_breakpoint + 1) + 'px)').matches;
        },
		counterUp : function(){
			$('.counter').each(function(){
				var $counter = $(this);
				var defaults = {
					delay: 10,
					time: 1000
				};
				var config = $.extend({}, defaults, $counter.data("counter-config"));
				$counter.counterUp(config);
			});
		},
        initVCTab:function(){
            /**
             * process tab click
             */
            var $is_handle_tab = 0;
			var $check = true;
            $('a','.vc_tta-tabs ul.vc_tta-tabs-list').off('click').each(function() {
                $(this).on('click',function (e) {
                    if ($(this).parent().hasClass('vc_active')) {
                        $is_handle_tab = 1;
                    } else {
                        $is_handle_tab = 0;
                    }
                    e.preventDefault();
                    if ($is_handle_tab == 1 || $check == false) {
                        return false;
                    }
					$check = false;
                    $is_handle_tab = 1;
                    var $ul = $(this).parent().parent();
                    var $current_tab = $($(this).attr('href'), '.vc_tta-panels-container');
                    var $tab_id = '';
                    var $tab_active = '';
                    if ($ul.length > 0) {
                        $('li', $ul).removeClass('vc_active');
                        $(this).parent().addClass('vc_active');
                        $('li a', $ul).each(function () {
                            $tab_id = $(this).attr('href');
                            if ($($tab_id + '.vc_active', '.vc_tta-panels-container').length > 0) {
                                $tab_active = $($tab_id + '.vc_active', '.vc_tta-panels-container');
                            }
                        });
                        $tab_active.fadeOut(400, function () {
                            $tab_active.removeClass('vc_active');
                            $tab_active.fadeIn();
                            $current_tab.fadeIn(0, function () {
                                $current_tab.addClass('vc_active');
                                $is_handle_tab = 0;
								$check = true;
                            });
                        })
                    }
                    $(this).on('click');
                    return false;
                });
            });
        },
	    adminBarProcess: function() {
		    if (window.matchMedia('(max-width: 600px)').matches) {
				$('#wpadminbar').css('top', '-46px');
		    }
		    else {
			    $('#wpadminbar').css('top', '');
		    }
	    },
	    tooltip: function() {
		    if ($().tooltip && !isMobileAlt) {
			    if (!$body.hasClass('woocommerce-compare-page')) {
				    $('[data-toggle="tooltip"]').tooltip();
			    }

			    $('.yith-wcwl-wishlistexistsbrowse,.yith-wcwl-add-button,.yith-wcwl-wishlistaddedbrowse', '.product-actions').each(function(){
				    var title = $('a',$(this)).text().trim();
				    $(this).tooltip({
					    title: title
				    });
			    });

			    $('.compare','.product-actions').each(function(){
				    var title = $(this).text().trim();
				    $(this).tooltip({
					    title: title
				    });
			    });
		    }
	    },
		count_down: function () {
			$('.g5plus-countdown').each(function () {
				var date_end = $(this).data('date-end');
				var $this = $(this);
				$this.countdown(date_end, function (event) {
					count_down_callback(event, $this);
				}).on('update.countdown', function (event) {
					count_down_callback(event, $this);
				}).on('finish.countdown', function (event) {
					$('.countdown-seconds', $this).html('00');
					var $url_redirect = $this.attr('data-url-redirect');
					if (typeof $url_redirect != 'undefined' && $url_redirect != '') {
						window.location.href = $url_redirect;
					}
				});
			});

			function count_down_callback(event, $this) {
				var seconds = parseInt(event.offset.seconds);
				var minutes = parseInt(event.offset.minutes);
				var hours = parseInt(event.offset.hours);
				var days = parseInt(event.offset.totalDays);

				if ((seconds == 0) && (minutes == 0) && (hours == 0) && (days == 0) && (months == 0)) {
					var $url_redirect = $this.attr('data-url-redirect');
					if (typeof $url_redirect != 'undefined' && $url_redirect != '') {
						window.location.href = $url_redirect;
					}
					return;
				}
				if (days < 10) days = '0' + days;
				if (hours < 10) hours = '0' + hours;
				if (minutes < 10) minutes = '0' + minutes;
				if (seconds < 10) seconds = '0' + seconds;

				$('.countdown-day', $this).text(days);
				$('.countdown-hours', $this).text(hours);
				$('.countdown-minutes', $this).text(minutes);
				$('.countdown-seconds', $this).text(seconds);
			}
		},
		owlCarouselInstagram: function () {
			var obj = $('ul', '.instagram-footer');
			if(obj.length != 0) {
				obj.addClass('owl-carousel manual');
				var config = {
					items: 7,
					navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
					nav: false,
					dots: false,
					loop: false,
					center: false,
					mouseDrag: true,
					touchDrag: true,
					pullDrag: true,
					freeDrag: false,
					margin: 0,
					stagePadding: 0,
					merge: false,
					mergeFit: true,
					autoWidth: false,
					startPosition: 0,
					rtl: isRTL,
					smartSpeed: 250,
					fluidSpeed: false,
					dragEndSpeed: false,
					autoplayHoverPause: true,
					autoHeight: true,
					responsive: {
						0: {items : 1 },
						400: {items : 2 },
						600: {items : 3 },
						768: {items : 4 },
						992: {items : 5 },
						1200: {items : 7 }
					}
				};
				// Initialize Slider
				obj.owlCarousel(config);
			}
		}
    };

    G5Plus.page = {
        init: function () {
            this.parallax();
            this.parallaxDisable();
            this.footerParallax();
            this.footerWidgetCollapse();
            this.events();
            this.page404();
            this.pageTransition();
	        this.backToTop();
			this.goToTop();
	        setTimeout(G5Plus.page.fixFullWidthRow,1000);
        },
        events: function () {
            $(document).on('vc-full-width-row', function (event,$elements) {
                G5Plus.page.fixFullWidthRow();
	            setTimeout(G5Plus.page.fixFullWidthRow,1000);
            });
        },
        windowLoad: function () {
            this.fadePageIn();
        },
        windowResized: function () {
            this.parallaxDisable();
            this.footerParallax();
            this.footerWidgetCollapse();
            this.wpb_image_grid();
            this.page404();
        },
        parallax: function () {
            $.stellar({
                horizontalScrolling: false,
                scrollProperty: 'scroll',
                positionProperty: 'position',
                responsive: false
            });
        },
        parallaxDisable: function () {
            if (G5Plus.common.isDesktop()) {
                $('.parallax').removeClass('parallax-disabled');
            } else {
                $('.parallax').addClass('parallax-disabled');
            }
        },
        footerParallax: function () {
            if (window.matchMedia('(max-width: 767px)').matches) {
                $body.css('margin-bottom', '');
            }
            else {
                setTimeout(function () {
                    var $footer = $('footer.main-footer-wrapper');
                    if ($footer.hasClass('enable-parallax')) {
                        var headerSticky = $('header.main-header .sticky-wrapper').length > 0 ? 55 : 0,
                            $adminBar = $('#wpadminbar'),
                            $adminBarHeight = $adminBar.length > 0 ? $adminBar.outerHeight() : 0;
                        if (($window.height() >= ($footer.outerHeight() + headerSticky + $adminBarHeight))) {
                            $body.css('margin-bottom', ($footer.outerHeight()) + 'px');
                            $footer.removeClass('static');
                        } else {
                            $body.css('margin-bottom', '');
                            $footer.addClass('static');
                        }
                    }
                }, 100);
            }

        },
        footerWidgetCollapse: function () {
            if (window.matchMedia('(max-width: 767px)').matches) {
                $('footer.footer-collapse-able aside.widget').each(function () {
                    var $title = $('h4.widget-title', this);
                    var $content = $title.next();
                    $title.addClass('title-collapse');
                    if ($content.length > 0) {
                        $content.hide();
                    }
                    $title.off();
                    $title.on('click', function () {
                        var $content = $(this).next();

                        if ($(this).hasClass('title-expanded')) {
                            $(this).removeClass('title-expanded');
                            $title.addClass('title-collapse');
                            $content.slideUp();
                        }
                        else {
                            $(this).addClass('title-expanded');
                            $title.removeClass('title-collapse');
                            $content.slideDown();
                        }

                    });

                });
            } else {
                $('footer aside.widget').each(function () {
                    var $title = $('h4.widget-title', this);
                    $title.off();
                    var $content = $title.next();
                    $title.removeClass('collapse');
                    $title.removeClass('expanded');
                    $content.show();
                });
            }
        },
        fullWidthRow: function () {
            $('[data-vc-full-width="true"]').each(function () {
                var $this = $(this),
                    $wrapper = $('#wrapper');
                $this.addClass("vc_hidden");
                $this.attr('style', '');
                if (!$body.hasClass('has-sidebar')) {
                    var $el_full = $this.next(".vc_row-full-width");
                    $el_full.length || ($el_full = $this.parent().next(".vc_row-full-width"));
                    var el_margin_left = parseInt($this.css("margin-left"), 10),
                        el_margin_right = parseInt($this.css("margin-right"), 10),
                        offset = $wrapper.offset().left - $el_full.offset().left - el_margin_left,
                        width = $wrapper.width();
                    $this.css({
                        position: "relative",
                        left: offset,
                        "box-sizing": "border-box",
                        width: $wrapper.width()
                    });

                    if (!$this.data("vcStretchContent")) {
                        var padding = -1 * offset;
                        if (padding < 0) {
                            padding = 0;
                        }
                        var paddingRight = width - padding - $el_full.width() + el_margin_left + el_margin_right;
                        if (paddingRight < 0) {
                            paddingRight = 0;
                        }
                        $this.css({
                            "padding-left": padding + "px",
                            "padding-right": paddingRight + "px"
                        });
                    }
                }
                $this.removeClass("vc_hidden");
            });
        },
        fullWidthRowRTL: function () {
            $('[data-vc-full-width="true"]').each(function () {
                var offset = $(this).css('left');
                $(this).css({
                    left: 'auto',
                    right: offset
                });
            });
        },
        wpb_image_grid: function () {
            $(".wpb_gallery_slides.wpb_image_grid .wpb_image_grid_ul").each(function (index) {
                var $imagesGrid = $(this);
                setTimeout(function () {
                    $imagesGrid.isotope('layout');
                }, 1000);
            });
        },
        page404: function () {
            if (!$body.hasClass('error404')) return;
            var windowHeight = $window.outerHeight();
            var page404Height = 0;
            var $header = null;
            if (G5Plus.common.isDesktop()) {
                $header = $('header.main-header');
            }
            else {
                $header = $('header.header-mobile');
            }
            if ($header.length == 0) return;
            page404Height = windowHeight - $header.offset().top - $header.outerHeight() - $('body.error404 .content-wrap').outerHeight();
            if (page404Height < 200) {
                page404Height = 200;
            }
            page404Height /= 2;
            $('body.error404 .page404').css('padding', page404Height + 'px 0');
        },
        pageTransition: function () {
            if ($body.hasClass('page-transitions')) {
                var linkElement = '.animsition-link, a[href]:not([target="_blank"]):not([href^="#"]):not([href*="javascript"]):not([href*=".jpg"]):not([href*=".jpeg"]):not([href*=".gif"]):not([href*=".png"]):not([href*=".mov"]):not([href*=".swf"]):not([href*=".mp4"]):not([href*=".flv"]):not([href*=".avi"]):not([href*=".mp3"]):not([href^="mailto:"]):not([class*="no-animation"]):not([class*="prettyPhoto"]):not([class*="add_to_wishlist"]):not([class*="add_to_cart_button"]):not([class*="compare"])';
                $(linkElement).on('click', function (event) {
                    if ($(event.target).closest($('b.x-caret', this)).length > 0) {
                        event.preventDefault();
                        return;
                    }
                    event.preventDefault();
                    var $self = $(this);
                    var url = $self.attr('href');

                    // middle mouse button issue #24
                    // if(middle mouse button || command key || shift key || win control key)
                    if (event.which === 2 || event.metaKey || event.shiftKey || navigator.platform.toUpperCase().indexOf('WIN') !== -1 && event.ctrlKey) {
                        window.open(url, '_blank');
                    } else {
                        G5Plus.page.fadePageOut(url);
                    }

                });
            }
        },
        fadePageIn: function () {
            if ($body.hasClass('page-loading')) {
                var preloadTime = 1000,
                    $loading = $('.site-loading');
                $loading.css('opacity', '0');
                setTimeout(function () {
                    $loading.css('display', 'none');
                }, preloadTime);
            }
        },
        fadePageOut: function (link) {

            $('.site-loading').css('display', 'block').animate({
                opacity: 1,
                delay: 200
            }, 600, "linear");

            $('html,body').animate({scrollTop: '0px'}, 800);

            setTimeout(function () {
                window.location = link;
            }, 600);
        },
	    backToTop : function() {
		    var $backToTop = $('.back-to-top');
		    if ($backToTop.length > 0) {
			    $backToTop.on('click',function(event) {
				    event.preventDefault();
				    $('html,body').animate({scrollTop: '0px'},800);
			    });
			    $window.on('scroll', function (event) {
				    var scrollPosition = $window.scrollTop();
				    var windowHeight = $window.height() / 2;
				    if (scrollPosition > windowHeight) {
					    $backToTop.addClass('in');
				    }
				    else {
					    $backToTop.removeClass('in');
				    }
			    });
		    }
	    },
		goToTop : function() {
			var $goToTop = $('.go-to-top .vc_icon_element-icon');
			if ($goToTop.length > 0) {
				$goToTop.on('click',function(event) {
					event.preventDefault();
					$('html,body').animate({scrollTop: '0px'},800);
				});
			}
		},
	    fixFullWidthRow: function() {
		    if ($body.hasClass('boxed') || $body.hasClass('header-is-left')) {
			    G5Plus.page.fullWidthRow();
		    }
		    if (isRTL) {
			    G5Plus.page.fullWidthRowRTL();
		    }
		    $('.owl-carousel.owl-loaded',$('[data-vc-full-width="true"]')).each(function(){
			    $(this).data('owl.carousel').onResize();
		    });
	    }
    };

    G5Plus.blog = {
        init: function () {
            this.masonryLayout();
            setTimeout(this.masonryLayout, 300);
            this.loadMore();
            this.infiniteScroll();
            this.commentReplyTitle();
	        this.postMetaShare();
	        this.processQuote();
        },
        windowResized: function () {
	        G5Plus.blog.masonryLayoutRefresh();
	        this.postMetaShare();
	        this.processQuote();

        },
        loadMore: function () {
            $('.paging-navigation').on('click', '.blog-load-more', function (event) {
                event.preventDefault();
                var $this = $(this).button('loading'),
                    link = $(this).attr('data-href'),
                    contentWrapper = '.blog-wrap',
                    element = '.blog-wrap article';

                $.get(link, function (data) {
                    var next_href = $('.blog-load-more', data).attr('data-href'),
                        $newElems = $(element, data).css({
                            opacity: 0
                        });
                    $(contentWrapper).append($newElems);

                    $newElems.imagesLoaded({background: true}, function () {
                        G5Plus.common.owlCarousel();
	                    G5Plus.blog.postMetaShare();
	                    G5Plus.blog.processQuote();
	                    G5Plus.common.lightGallery();
                        $newElems.animate({
                            opacity: 1
                        });

                        if ($(contentWrapper).hasClass('blog-masonry') || $(contentWrapper).hasClass('blog-1-large-image-masonry')) {
                            $(contentWrapper).isotope('appended', $newElems);
                            setTimeout(function () {
                                $(contentWrapper).isotope('layout');
                            }, 400);
	                        setTimeout(function () {
		                        $(contentWrapper).isotope('layout');
	                        }, 1000);
	                        setTimeout(function () {
		                        $(contentWrapper).isotope('layout');
	                        }, 2000);
                        }
                    });

                    if (typeof(next_href) == 'undefined') {
                        $this.parent().remove();
                    } else {
                        $this.button('reset');
                        $this.attr('data-href', next_href);
                    }
                });
            });

        },
        infiniteScroll: function () {
            var $container = $('.blog-wrap');
            $container.infinitescroll({
                navSelector: '#infinite_scroll_button',    // selector for the paged navigation
                nextSelector: '#infinite_scroll_button a',  // selector for the NEXT link (to page 2)
                itemSelector: '.blog-wrap article',     // selector for all items you'll retrieve
                animate: true,
                loading: {
                    finishedMsg: 'No more pages to load.',
                    selector: '#infinite_scroll_loading',
                    img: g5plus_app_variable.theme_url + 'assets/images/ajax-loader.gif',
                    msgText: 'Loading...'
                }
            }, function (newElements) {
                var $newElems = $(newElements).css({
                    opacity: 0
                });

                $newElems.imagesLoaded({background: true}, function () {
                    G5Plus.common.owlCarousel();
	                G5Plus.blog.postMetaShare();
	                G5Plus.blog.processQuote();
	                G5Plus.common.lightGallery();
                    $newElems.animate({
                        opacity: 1
                    });

	                if ($($container).hasClass('blog-masonry') || $($container).hasClass('blog-1-large-image-masonry')) {
                        $container.isotope('appended', $newElems);
                        setTimeout(function () {
                            $container.isotope('layout');
                        }, 400);
		                setTimeout(function () {
			                $container.isotope('layout');
		                }, 1000);
		                setTimeout(function () {
			                $container.isotope('layout');
		                }, 2000);
                    }
                });
            });
        },
        masonryLayout: function () {
            var $container = $('.blog-masonry,.blog-1-large-image-masonry');
            $container.imagesLoaded({background: true}, function () {
                $container.isotope({
                    itemSelector: 'article',
                    layoutMode: 'masonry',
                    isOriginLeft: !isRTL,
	                percentPosition: true,
	                masonry: {
		                columnWidth: '.gf-item-wrap'
	                }
                });
                setTimeout(function () {
                    $container.isotope('layout');
                }, 500);
            });

        },
        commentReplyTitle: function () {
            var $replyTitle = $('h3#reply-title');
            $replyTitle.addClass('block-title mg-top-100');
            var $smallTag = $('small', $replyTitle);
            $smallTag.remove();
            $replyTitle.html($replyTitle.text());
            $replyTitle.append($smallTag);
        },
	    masonryLayoutRefresh: function(){
		    var $container = $('.blog-masonry,.blog-1-large-image-masonry');
		    setTimeout(function () {
			    $container.isotope('layout');
		    }, 500);
	    },
	    postMetaShare: function() {
		    $('article.post-large-image .entry-content-footer').each(function(){
			    var $this = $(this),
				    $moreLink = $('.btn',$this),
				    $share = $('.social-share',$this);
			    $this.removeClass('left');
			    if (($moreLink.outerWidth() + $share.outerWidth() + 10) > $this.outerWidth()) {
				    $this.addClass('left');
			    }
		    });
	    },
	    processQuote : function() {
		    $('article.format-quote:not(.post-masonry),article.format-link:not(.post-masonry)').each(function(){
			    var $wrap = $('.entry-thumb-wrap',$(this)),
				    $container = $('.entry-quote-content',$(this)),
				    $content = $('.block-center-inner',$(this));
			    $wrap.removeClass('quote');
			    if ($content.height() > $container.height()) {
				    $wrap.addClass('quote');
			    }
		    });
	    }
    };

    G5Plus.header = {
        timeOutSearch: null,
        xhrSearchAjax: null,
        init: function () {
            this.anchoPreventDefault();
            this.topDrawerToggle();
            this.switchMenu();
            this.sticky();
            this.searchButton();
            this.closeButton();
            this.searchAjaxButtonClick();
            this.closestElement();
            this.menuMobileToggle();
            $('[data-search="ajax"]').each(function () {
                G5Plus.header.searchAjax($(this));
            });

            this.escKeyPress();
            this.mobileNavOverlay();
	        this.menuOnePage();
	        this.canvasMenu();
	        this.pageTitleHeaderFloat();
	        this.headerLeftHeight();
	        this.headerLeftScrollBar();
	        this.header3Width();
	        this.retinaLogo();
        },
        windowsScroll: function () {
            this.sticky();
            this.menuDropFlyPosition();
        },
        windowResized: function () {
            this.sticky();
            this.menuDropFlyPosition();
	        this.pageTitleHeaderFloat();
	        this.headerLeftHeight();
	        this.header3Width();
        },
        windowLoad: function () {
        },
        topDrawerToggle: function () {
            $('.top-drawer-toggle').on('click', function () {
                $('.top-drawer-inner').slideToggle();
                $('.top-drawer-wrapper').toggleClass('in');
            });
        },
        switchMenu: function () {
            $('header .menu-switch').on('click', function () {
                $('.header-nav-hidden').toggleClass('in');
            });
        },
        sticky: function () {
            $('.sticky-wrapper').each(function () {
                var $this = $(this);
                var stickyHeight = 60;
                if (G5Plus.common.isDesktop()) {
                    stickyHeight = 55;
                }
                if ($(document).outerHeight() - $this.outerHeight() - $this.offset().top <= $window.outerHeight() - stickyHeight) {
                    $this.removeClass('is-sticky');
                    $('.sticky-region', $this).css('top', '');
                    return;
                }

                var adminBarHeight = 0,
	                $adminBar = $('#wpadminbar');
                if ($adminBar.length > 0 && ($adminBar.css('position') == 'fixed')) {
                    adminBarHeight = $adminBar.outerHeight();
                }
                if ($(window).scrollTop() > $this.offset().top - adminBarHeight) {
                    $this.addClass('is-sticky');
                    $('.sticky-region', $this).css('top', adminBarHeight + 'px');
                }
                else {
                    $this.removeClass('is-sticky');
                    $('.sticky-region', $this).css('top', '');
                }
            });
        },
        searchButton: function () {
            var $itemSearch = $('.header-customize-item.item-search > a, .mobile-search-button > a');
            if (!$itemSearch.length) {
                return;
            }
            var $searchPopup = $('#search_popup_wrapper');
            if (!$searchPopup.length) {
                return;
            }
            if ($itemSearch.hasClass('search-ajax')) {
                $itemSearch.on('click', function () {
                    $window.scrollTop(0);
                    $searchPopup.addClass('in');
                    $('body').addClass('overflow-hidden');
                    var $input = $('input[type="text"]', $searchPopup);
                    $input.focus();
                    $input.val('');

                    var $result = $('.search-ajax-result', $searchPopup);
                    $result.html('');
                });
            }
            else {
                var dlgSearch = new DialogFx($searchPopup[0]);
                $itemSearch.on('click', dlgSearch.toggle.bind(dlgSearch));
                $itemSearch.on('click', function () {
                    var $input = $('input[type="text"]', $searchPopup);

                    $input.focus();
                    $input.val('');
                });
            }
        },
        searchAjax: function ($wrapper) {
            $('input[type="text"]', $wrapper).on('keyup', function (event) {
                if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
                    return;
                }
                var keys = ["Control", "Alt", "Shift"];
                if (keys.indexOf(event.key) != -1) return;
                switch (event.which) {
                    case 27:	// ESC
                        $('.search-ajax-result', $wrapper).html('');
                        $wrapper.removeClass('in');
                        $(this).val('');
                        break;
                    case 38:	// UP
                        G5Plus.header.searchAjaxKeyUp($wrapper);
                        event.preventDefault();
                        break;
                    case 40:	// DOWN
                        G5Plus.header.searchAjaxKeyDown($wrapper);
                        event.preventDefault();
                        break;
                    case 13:
                        G5Plus.header.searchAjaxKeyEnter($wrapper);
                        break;
                    default:
                        clearTimeout(G5Plus.header.timeOutSearch);
                        G5Plus.header.timeOutSearch = setTimeout(G5Plus.header.searchAjaxSearchProcess, 500, $wrapper, false);
                        break;
                }
            });
        },
        searchAjaxKeyUp: function ($wrapper) {
            var $item = $('.search-ajax-result li.selected', $wrapper);
            if ($('.search-ajax-result li', $wrapper).length < 2) return;
            var $prev = $item.prev();
            $item.removeClass('selected');
            if ($prev.length) {
                $prev.addClass('selected');
            }
            else {
                $('.search-ajax-result li:last', $wrapper).addClass('selected');
                $prev = $('.search-ajax-result li:last', $wrapper);
            }
            if ($prev.position().top < $('.ajax-search-result', $wrapper).scrollTop()) {
                $('.ajax-search-result', $wrapper).scrollTop($prev.position().top);
            }
            else if ($prev.position().top + $prev.outerHeight() > $('.ajax-search-result', $wrapper).scrollTop() + $('.ajax-search-result', $wrapper).height()) {
                $('.ajax-search-result', $wrapper).scrollTop($prev.position().top - $('.ajax-search-result', $wrapper).height() + $prev.outerHeight());
            }
        },
        searchAjaxKeyDown: function ($wrapper) {
            var $item = $('.search-ajax-result li.selected', $wrapper);
            if ($('.search-ajax-result li', $wrapper).length < 2) return;
            var $next = $item.next();
            $item.removeClass('selected');
            if ($next.length) {
                $next.addClass('selected');
            }
            else {
                $('.search-ajax-result li:first', $wrapper).addClass('selected');
                $next = $('.search-ajax-result li:first', $wrapper);
            }
            if ($next.position().top < $('.search-ajax-result', $wrapper).scrollTop()) {
                $('.search-ajax-result', $wrapper).scrollTop($next.position().top);
            }
            else if ($next.position().top + $next.outerHeight() > $('.search-ajax-result', $wrapper).scrollTop() + $('.search-ajax-result', $wrapper).height()) {
                $('.search-ajax-result', $wrapper).scrollTop($next.position().top - $('.search-ajax-result', $wrapper).height() + $next.outerHeight());
            }
        },
        searchAjaxKeyEnter: function ($wrapper) {
            var $item = $('.search-ajax-result li.selected a', $wrapper);
            if ($item.length > 0) {
                window.location = $item.attr('href');
            }
        },
        searchAjaxSearchProcess: function ($wrapper, isButtonClick) {
            var keyword = $('input[type="text"]', $wrapper).val();
            if (!isButtonClick && keyword.length < 3) {
                $('.search-ajax-result', $wrapper).html('');
                return;
            }
            $('.search-button i', $wrapper).addClass('fa-spinner fa-spin');
            $('.search-button i', $wrapper).removeClass('fa-search');
            if (G5Plus.header.xhrSearchAjax) {
                G5Plus.header.xhrSearchAjax.abort();
            }
            var action = $wrapper.attr('data-ajax-action');
            var data = 'action=' + action + '&keyword=' + keyword;

            G5Plus.header.xhrSearchAjax = $.ajax({
                type: 'POST',
                data: data,
                url: g5plus_app_variable.ajax_url,
                success: function (data) {
                    $('.search-button i', $wrapper).removeClass('fa-spinner fa-spin');
                    $('.search-button i', $wrapper).addClass('fa-search');
                    $wrapper.addClass('in');
                    $('.search-ajax-result', $wrapper).html(data);
                },
                error: function (data) {
                    if (data && (data.statusText == 'abort')) {
                        return;
                    }
                    $('.search-button i', $wrapper).removeClass('fa-spinner fa-spin');
                    $('.search-button i', $wrapper).addClass('fa-search');
                }
            });
        },
        searchAjaxButtonClick: function () {
            $('.search-button').on('click', function () {
                var $wrapper = $($(this).attr('data-search-wrapper'));
                G5Plus.header.searchAjaxSearchProcess($wrapper, true);
            });
        },
        menuMobileToggle: function () {
            $('.toggle-icon-wrapper > .toggle-icon').on('click', function () {
                var $this = $(this);
                var $parent = $this.parent();
                var dropType = $parent.attr('data-drop-type');
                $parent.toggleClass('in');
                if (dropType == 'menu-drop-fly') {
                    $('body').toggleClass('mobile-nav-in');
                }
                else {
                    $('.nav-menu-mobile').slideToggle();
                }
            });
        },
        escKeyPress: function () {
            $(document).on('keyup', function (event) {
                if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
                    return;
                }
                var keys = ["Control", "Alt", "Shift"];
                if (keys.indexOf(event.key) != -1) return;
                if (event.which == 27) {
                    if ($('#search_popup_wrapper').hasClass('in')) {
                        $('#search_popup_wrapper').removeClass('in');
                        setTimeout(function () {
                            $('body').removeClass('overflow-hidden');
                        }, 500);

                    }

                }
            });
        },
        anchoPreventDefault: function () {
            $('.prevent-default').on('click', function (event) {
                event.preventDefault();
            });
        },
        closeButton: function () {
            $('.close-button').on('click', function () {
                var $closeButton = $(this);
                var ref = $closeButton.attr('data-ref');
                if ($('#search_popup_wrapper').hasClass('in')) {
                    setTimeout(function () {
                        $('body').removeClass('overflow-hidden');
                    }, 500);
                }
                $(ref).removeClass('in');
            });

        },
        closestElement: function () {
            $($window).on('click',function (event) {
                if ($(event.target).closest('.search-product-wrapper .categories').length == 0) {
                    $('.search-product-wrapper .search-category-dropdown').slideUp();
                    $('.search-product-wrapper .categories > span').removeClass('in');
                }

                if ($(event.target).closest('.search-product-wrapper').length == 0) {
                    $('.search-ajax-result').html('');
                    $('.search-product-wrapper').removeClass('in');
                    $('input[type="text"]', '.search-product-wrapper').val('');
                }
            });
        },
        mobileNavOverlay: function () {
            $('.mobile-nav-overlay').on('click', function () {
                $('body').removeClass('mobile-nav-in');
                $('.toggle-mobile-menu').removeClass('in');
            })
        },
        menuDropFlyPosition: function () {
            var adminBarHeight = 0;
            if ($('#wpadminbar').length && ($('#wpadminbar').css('position') == 'fixed')) {
                adminBarHeight = $('#wpadminbar').outerHeight();
            }
            $('.header-mobile-nav.menu-drop-fly').css('top', adminBarHeight + 'px');
        },
	    menuOnePage : function() {
		    $('.menu-one-page').onePageNav({
			    currentClass: 'menu-current',
			    changeHash: false,
			    scrollSpeed: 750,
			    scrollThreshold: 0,
			    filter: '',
			    easing: 'swing'
		    });
	    },
	    canvasMenu: function () {
		    $('nav.canvas-menu-wrapper').perfectScrollbar({
			    wheelSpeed: 0.5,
			    suppressScrollX: true
		    });

		    $(document).on('click', function(event) {
			    if (($(event.target).closest('nav.canvas-menu-wrapper').length == 0)
				    && ($(event.target).closest('.canvas-menu-toggle')).length == 0) {
				    $('nav.canvas-menu-wrapper').removeClass('in');
			    }
		    });

		    $('.canvas-menu-toggle').on('click', function (event) {
			    event.preventDefault();
			    $('nav.canvas-menu-wrapper').toggleClass('in');
		    });
		    $('.canvas-menu-close').on('click', function (event) {
			    event.preventDefault();
			    $('nav.canvas-menu-wrapper').removeClass('in');
		    });
	    },
	    pageTitleHeaderFloat: function(){
			var $header = $('.main-header'),
				isFloat = $header.hasClass('float-header'),
				isNavigationFloat = $('.header-nav-wrapper').hasClass('header-nav-float'),
				$pageTitle = $('#wrapper-content > .page-title'),
				headerLayout = $body.data('header'),
				pageTitleLayout = $pageTitle.data('layout');
		    if (($header.length == 0)  || ($pageTitle.length == 0) || (!isFloat && ((headerLayout != 'header-3') || (headerLayout == 'header-3' && !isNavigationFloat) ))) {
			    return;
		    }

		    if (G5Plus.common.isDesktop()) {
			    if (pageTitleLayout === 'centered' || $pageTitle.hasClass('page-title-background')) {
				    $pageTitle.css('padding-top','');
				    var headerHeight = $header.height();
				    if (headerLayout == 'header-3' && isNavigationFloat) {
					    if (isFloat) {
						    headerHeight += $('.main-header .header-nav-wrapper').height() + parseInt($('.main-header .header-nav-wrapper').css('margin-top').replace('px',''),10);
					    } else  {
						    headerHeight = $('.main-header .header-nav-wrapper').height() + parseInt($('.main-header .header-nav-wrapper').css('margin-top').replace('px',''),10);
					    }
				    }

				    var paddingTop = parseInt($pageTitle.css('padding-top').replace('px',''),10) + headerHeight;
				    $pageTitle.css('padding-top',paddingTop);
			    } else {
				    $header.addClass('float-header-none');
			    }
		    } else {
			    if (pageTitleLayout === 'centered' || $pageTitle.hasClass('page-title-background')) {
				    $pageTitle.css('padding-top','');
			    } else {
				    $header.removeClass('float-header-none');
			    }

		    }
	    },
	    headerLeftScrollBar: function () {
		    $('header.header-left .primary-menu').perfectScrollbar({
			    wheelSpeed: 0.5,
			    suppressScrollX: true
		    });
	    },
	    headerLeftHeight: function(){
		    var $headerLeft = $('header.header-left');
		    if ($headerLeft.length > 0) {
				var menuHeight = $headerLeft.height() - $('.header-above-wrapper').height() - parseInt($('.header-above-wrapper').css('margin-bottom').replace('px',''),10) - $('.header-customize-wrapper').height();
			    $('header.header-left .primary-menu').css('height',menuHeight + 'px');
		    }
	    },
	    header3Width: function(){
			var $header = $('header.main-header'),
		        $navigationFloat = $('header.main-header .header-nav-float');
		    if ($header.length > 0 && $navigationFloat.length > 0 && G5Plus.common.isDesktop()) {
			    var menuWidth = $('.main-menu',$header).width() + $('.header-customize-wrapper',$header).width() + 200;
			    if (menuWidth < 850) {
				    menuWidth = 850;
			    }
			    var margin = ($('.header-nav-wrapper .container-inner',$header).width() - menuWidth) / 2;
			    if (margin < 0) {
				    margin = 0;
			    }

			    $('.primary-menu',$header).css({
				   'margin-left' : margin,
				    'margin-right': margin
			    });
		    }
	    },
	    retinaLogo: function () {
		    if (window.matchMedia('only screen and (min--moz-device-pixel-ratio: 1.5)').matches
			    || window.matchMedia('only screen and (-o-min-device-pixel-ratio: 3/2)').matches
			    || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.5)').matches
			    || window.matchMedia('only screen and (min-device-pixel-ratio: 1.5)').matches) {
			    $('img[data-retina]').each(function() {
				    $(this).attr('src', $(this).attr('data-retina'));
			    });
		    }
	    }
    };

	G5Plus.menu = {
		init: function () {
			this.processMobileMenu();
			this.mobileMenuItemClick();
		},
		processMobileMenu: function() {
			$('.nav-menu-mobile:not(.x-nav-menu) li > a').each(function() {
				var $this = $(this);
				var html = '<span>' + $this.html() + '</span>';
				if ($('> ul', $this.parent()).length) {
					html += '<b class="menu-caret"></b>';
				}
				$this.html(html);
			});
		},
		mobileMenuItemClick: function() {
			$('.nav-menu-mobile:not(.x-nav-menu) li').on('click', function() {
				if ($('> ul', this).length == 0) {
					return;
				}
				if ($( event.target ).closest($('> ul', this)).length > 0 ) {
					return;
				}

				if ($( event.target ).closest($('> a > span', this)).length > 0) {
					var baseUri = '';
					if ((typeof (event.target) != "undefined") && (event.target != null) && (typeof (event.target.baseURI) != "undefined") && (event.target.baseURI != null)) {
						var arrBaseUri = event.target.baseURI.split('#');
						if (arrBaseUri.length > 0) {
							baseUri = arrBaseUri[0];
						}

						var $aClicked = $('> a', this);
						if ($aClicked.length > 0) {
							var clickUrl = $aClicked.attr('href');
							if (clickUrl != '#') {
								if ((typeof (clickUrl) != "undefined") && (clickUrl != null)) {
									clickUrl = clickUrl.split('#')[0];
								}
								if (baseUri != clickUrl) {
									return;
								}
							}

						}
					}
				}

				event.preventDefault();
				$(this).toggleClass('menu-open');
				$('> ul', this).slideToggle();
			});
		}
	};

	G5Plus.widget = {
		init: function() {
			this.categoryCaret();

		},
		categoryCaret: function() {
			$('li', '.widget_categories, .widget_pages, .widget_nav_menu, .widget_product_categories, .product-categories').each(function() {
				if ($(' > ul', this).length > 0) {
					$(this).append('<span class="li-caret fa fa-plus"></span>');
				}
			});
			$('.li-caret').on('click', function(){
				$(this).toggleClass('in');
				$(' > ul', $(this).parent()).slideToggle();
			});
		}
	};

	G5Plus.shoppingCart = {
		init: function() {
			this.perfectScroll();
		},
		perfectScroll: function() {
			var $cartContent = $('.shopping-cart-list .cart_list');
			$cartContent.perfectScrollbar({
				wheelSpeed: 0.5,
				suppressScrollX: true
			});
		}
	};

	G5Plus.woocommerce = {
		init: function(){
			this.sale_countdown();
			this.addCartQuantity();
			this.updateShippingMethod();
			this.quickView();
			$(document).on('yith-wcan-ajax-filtered', G5Plus.common.tooltip);
			this.processTitle();
			var $productImageWrap = $('#single-product-image');
			this.singleProductImage($productImageWrap);
			if (!$body.hasClass('woocommerce-compare-page')) {
				this.addToCart();
			}
			this.addToWishlist();
			this.compare();
		},
		windowResized: function(){
			setTimeout(function(){
				G5Plus.woocommerce.sale_countdown_width();
			},500);

		},
		windowLoad: function(){

		},
		sale_countdown: function(){
			$('.product-deal-countdown').each(function(){
				var date_end = $(this).data('date-end');
				var $this = $(this);
				$this.countdown(date_end,function(event){
					count_down_callback(event,$this);
				}).on('update.countdown', function(event) {
					count_down_callback(event,$this);
				});
			});

			function count_down_callback(event,$this) {
				var seconds = parseInt(event.offset.seconds);
				var minutes = parseInt(event.offset.minutes);
				var hours = parseInt(event.offset.hours);
				var days = parseInt(event.offset.totalDays);

				//if ((seconds == 0)&& (minutes == 0) && (hours == 0) && (days == 0)) {
				//	$this.remove();
				//	return;
				//}

				if (days < 10) days = '0' + days;
				if (hours < 10) hours = '0' + hours;
				if (minutes < 10) minutes = '0' + minutes;
				if (seconds < 10) seconds = '0' + seconds;


				$('.countdown-day',$this).text(days);
				$('.countdown-hours',$this).text(hours);
				$('.countdown-minutes',$this).text(minutes);
				$('.countdown-seconds',$this).text(seconds);
			}

			G5Plus.woocommerce.sale_countdown_width();

		},
		sale_countdown_width: function(){
			$('.product-deal-countdown').each(function(){
				var innerWidth = 0;
				$(this).removeClass('small');
				$('.countdown-section',$(this)).each(function(){
					innerWidth += $(this).outerWidth() + parseInt($(this).css('margin-right').replace("px", ''),10);
				});
				if (innerWidth > $(this).outerWidth()) {
					$(this).addClass('small');
				}
			});
		},
		addCartQuantity: function(){
			$(document).off('click', '.quantity .btn-number').on('click', '.quantity .btn-number', function (event) {
				event.preventDefault();
				var type = $(this).data('type'),
					input = $('input', $(this).parent()),
					current_value = parseFloat(input.val()),
					max  = parseFloat(input.attr('max')),
					min = parseFloat(input.attr('min')),
					step = parseFloat(input.attr('step')),
					stepLength = 0;
				if (input.attr('step').indexOf('.') > 0) {
					stepLength = input.attr('step').split('.')[1].length;
				}

				if (isNaN(max)) {
					max = 1000;
				}
				if (isNaN(min)) {
					min = 0;
				}
				if (isNaN(step)) {
					step = 1;
					stepLength = 0;
				}

				if (!isNaN(current_value)) {
					if (type == 'minus') {
						if (current_value > min) {
							current_value = (current_value - step).toFixed(stepLength);
							input.val(current_value).change();
						}

						if (parseFloat(input.val()) <= min) {
							input.val(min).change();
							$(this).attr('disabled', true);
						}
					}

					if (type == 'plus') {
						if (current_value < max) {
							current_value = (current_value + step).toFixed(stepLength);
							input.val(current_value).change();
						}
						if (parseFloat(input.val()) >= max) {
							input.val(max).change();
							$(this).attr('disabled', true);
						}
					}
				} else {
					input.val(min);
				}
			});


			$('input', '.quantity').on('focusin',function () {
				$(this).data('oldValue', $(this).val());
			});

			$('input', '.quantity').on('change', function () {
				var input = $(this),
					max = parseFloat(input.attr('max')),
					min = parseFloat(input.attr('min')),
					current_value = parseFloat(input.val()),
					step = parseFloat(input.attr('step'));

				if (isNaN(max)) {
					max = 100;
				}
				if (isNaN(min)) {
					min = 0;
				}

				if (isNaN(step)) {
					step = 1;
				}


				var btn_add_to_cart = $('.add_to_cart_button', $(this).parent().parent().parent());
				if (current_value >= min) {
					$(".btn-number[data-type='minus']", $(this).parent()).removeAttr('disabled');
					if (btn_add_to_cart.length > 0) {
						btn_add_to_cart.attr('data-quantity', current_value);
					}

				} else {
					alert('Sorry, the minimum value was reached');
					$(this).val($(this).data('oldValue'));

					if (btn_add_to_cart.length > 0) {
						btn_add_to_cart.attr('data-quantity', $(this).data('oldValue'));
					}
				}

				if (current_value <= max) {
					$(".btn-number[data-type='plus']", $(this).parent()).removeAttr('disabled');
					if (btn_add_to_cart.length > 0) {
						btn_add_to_cart.attr('data-quantity', current_value);
					}
				} else {
					alert('Sorry, the maximum value was reached');
					$(this).val($(this).data('oldValue'));
					if (btn_add_to_cart.length > 0) {
						btn_add_to_cart.attr('data-quantity', $(this).data('oldValue'));
					}
				}

			});
		},
		singleProductImage: function($productImageWrap){
			var $sliderMain = $productImageWrap.find('.single-product-image-main'),
				$sliderThumb = $productImageWrap.find('.single-product-image-thumb');

			$sliderMain.owlCarousel({
				items: 1,
				nav:false,
				dots:false,
				loop: false,
				rtl: isRTL
			}).on('changed.owl.carousel', syncPosition);

			$sliderThumb.on('initialized.owl.carousel', function () {
				$sliderThumb.find(".owl-item").eq(0).addClass("current");
			}).owlCarousel({
				items : 4,
				nav: false,
				dots: false,
				rtl: isRTL,
				margin: 10,
				responsive: {
					992 : {
						items : 4
					},
					768 : {
						items : 3
					}
				}
			}).on('changed.owl.carousel', syncPosition2);

			function syncPosition(el){
				//if you set loop to false, you have to restore this next line
				var current = el.item.index;

				$sliderThumb
					.find(".owl-item")
					.removeClass("current")
					.eq(current)
					.addClass("current");
				var onscreen = $sliderThumb.find('.owl-item.active').length - 1;
				var start = $sliderThumb.find('.owl-item.active').first().index();
				var end = $sliderThumb.find('.owl-item.active').last().index();

				if (current > end) {
					$sliderThumb.data('owl.carousel').to(current, 100, true);
				}
				if (current < start) {
					$sliderThumb.data('owl.carousel').to(current - onscreen, 100, true);
				}
			}

			function syncPosition2(el) {
				var number = el.item.index;
				$sliderMain.data('owl.carousel').to(number, 100, true);
			}

			$sliderThumb.on("click", ".owl-item", function(e){
				e.preventDefault();
				if ($(this).hasClass('current')) return;
				var number = $(this).index();
				$sliderMain.data('owl.carousel').to(number, 300, true);
			});

			$(document).on('found_variation',function(event,variation){
				var $product = $(event.target).closest('.product');
				if ((typeof variation !== 'undefined') && (typeof variation.variation_id !== 'undefined')) {

					var variation_id = variation.variation_id;
					var index = parseInt($('a[data-variation_id*="|'+variation_id+'|"]',$sliderMain).data('index'),10) ;
					if (!isNaN(index) ) {
						$sliderMain.data('owl.carousel').to(index, 300, true);
					}
				}
			});

			$(document).on('reset_data',function(event){
				$sliderMain.data('owl.carousel').to(0, 300, true);
			});


		},
		updateShippingMethod : function() {
			$body.on('updated_shipping_method',function(){
				$('select.country_to_state, input.country_to_state').change();
			});
		},
		quickView: function(){
			var is_click_quick_view = false;
			$(document).on('click', '.product-quick-view', function (event) {
				event.preventDefault();
				if (is_click_quick_view) return;
				is_click_quick_view = true;
				var product_id = $(this).data('product_id'),
					popupWrapper = '#popup-product-quick-view-wrapper',
					$icon = $(this).find('i'),
					iconClass = $icon.attr('class'),
					productWrap = $(this).parent().parent().parent().parent(),
					button = $(this);
				productWrap.addClass('active');

				$icon.attr('class','fa fa-refresh fa-spin');
				$.ajax({
					url: g5plus_app_variable.ajax_url,
					data: {
						action: 'product_quick_view',
						id: product_id
					},
					success: function (html) {
						productWrap.removeClass('active');
						$icon.attr('class',iconClass);
						if ($(popupWrapper).length) {
							$(popupWrapper).remove();
						}
						$('body').append(html);
						G5Plus.woocommerce.addCartQuantity();
						G5Plus.common.tooltip();
						G5Plus.woocommerce.sale_countdown();

						var $productImageWrap = $('#quick-view-product-image');
						G5Plus.woocommerce.singleProductImage($productImageWrap);

						if( typeof $.fn.wc_variation_form !== 'undefined' ) {
							var form_variation = $(popupWrapper).find( '.variations_form' );
							var form_variation_select = $(popupWrapper).find( '.variations_form .variations select' );
							form_variation.wc_variation_form();
							form_variation.trigger( 'check_variations' );
							form_variation_select.change();
						}

						$(popupWrapper).modal();
						is_click_quick_view = false;
						G5Plus.common.lightGallery();
					},
					error: function (html) {
						is_click_quick_view = false;
					}
				});

			});
		},
		processTitle: function(){
			$('.woocommerce-account .woocommerce h3,.woocommerce-account .woocommerce h2,.woocommerce-checkout .woocommerce h3,.woocommerce-checkout .woocommerce h2,.wishlist-title h2').each(function(){
				$(this).addClass('woocommerce-block-title');
			});
		},
		addToCart: function(){
			$(document).on('click', '.add_to_cart_button', function () {
				var button = $(this);
				if (!button.hasClass('single_add_to_cart_button') && button.is( '.product_type_simple' )) {
					var productWrap = button.parent().parent().parent();
					if (typeof(productWrap) == 'undefined') {
						return;
					}
					productWrap.addClass('active');
				}
			});

			$body.on("added_to_cart", function (event, fragments, cart_hash, $thisbutton) {
				G5Plus.shoppingCart.perfectScroll();
				var is_single_product = $thisbutton.hasClass('single_add_to_cart_button');

				if (is_single_product) return;

				var button = $thisbutton,
					productWrap = button.parent().parent().parent();

				setTimeout(function () {
					productWrap.removeClass('active');
				}, 700);

			});
		},
		addToWishlist : function() {
			$(document).on('click', '.add_to_wishlist', function () {
				var button = $(this),
					buttonWrap = button.parent().parent();

				if (!buttonWrap.parent().hasClass('single-product-function')) {
					button.addClass("added-spinner");
					var productWrap = buttonWrap.parent().parent().parent().parent();
					if (typeof(productWrap) == 'undefined') {
						return;
					}
					productWrap.addClass('active');
				}

			});

			$body.on("added_to_wishlist", function (event, fragments, cart_hash, $thisbutton) {
				var button = $('.added-spinner.add_to_wishlist'),
					buttonWrap = button.parent().parent();
				if (!buttonWrap.parent().hasClass('single-product-function')) {
					var productWrap = buttonWrap.parent().parent().parent().parent();
					if (typeof(productWrap) == 'undefined') {
						return;
					}
					setTimeout(function () {
						productWrap.removeClass('active');
						button.removeClass('added-spinner');
					}, 700);
				}

			});
		},
		compare: function(){
			$(document).on( 'click', 'a.compare:not(.added)', function(e){
				var button = $(this),
					buttonWrap = button.parent();
				if (!buttonWrap.hasClass('single-product-function')) {
					var productWrap = buttonWrap.parent().parent().parent();
					if (typeof(productWrap) == 'undefined') {
						return;
					}
					productWrap.addClass('active');
				}
			});

			$body.on("yith_woocompare_open_popup", function (event,obj) {
				var button = obj.button,
					buttonWrap = button.parent();
				if (!buttonWrap.hasClass('single-product-function')) {
					var productWrap = buttonWrap.parent().parent().parent();
					if (typeof(productWrap) == 'undefined') {
						return;
					}
					setTimeout(function () {
						productWrap.removeClass('active');
					}, 700);
				}

			});
		}
	};

    G5Plus.onReady = {
        init: function () {
            G5Plus.common.init();
	        G5Plus.menu.init();
            G5Plus.page.init();
            G5Plus.header.init();
            G5Plus.blog.init();
	        G5Plus.widget.init();
	        G5Plus.shoppingCart.init();
	        G5Plus.woocommerce.init();
        }
    };

    G5Plus.onLoad = {
        init: function () {
            G5Plus.header.windowLoad();
            G5Plus.page.windowLoad();
	        G5Plus.woocommerce.windowLoad();
        }
    };

    G5Plus.onResize = {
        init: function () {
            G5Plus.header.windowResized();
            G5Plus.common.windowResized();
            G5Plus.page.windowResized();
            G5Plus.blog.windowResized();
	        G5Plus.woocommerce.windowResized();
        }
    };

    G5Plus.onScroll = {
        init: function () {
            G5Plus.header.windowsScroll();
        }
    };

    $(window).resize(G5Plus.onResize.init);
    $(window).scroll(G5Plus.onScroll.init);
    $(document).ready(G5Plus.onReady.init);
    $(window).load(G5Plus.onLoad.init);

})(jQuery);

