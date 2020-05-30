/*
kModal.js Plugin v1.0.1
(c) 2020 Kiku Solé. (http://dev.kikusole.cat/kmodal)
*/

(function ($) {

    // Constants
    var MODAL_CLASS = 'k-modal',
        MODAL_CONTAINER_CLASS = 'k-container';
        MODAL_CLOSE_BTN = 'close-btn',
        MODAL_ADD_CLOSE_BTN = 'add-close-btn',
        MODAL_IMAGE_CLASS = 'k-image-modal',
        MODAL_IMAGE_CONTAINER_CLASS = 'k-image-container';
        MODAL_AJAX_CLASS = 'k-ajax-modal',
        MODAL_AJAX_CONTAINER_CLASS = 'k-ajax-container';
        MODAL_EMBED_CLASS = 'k-embed-modal',
        MODAL_EMBED_CONTAINER_CLASS = 'k-embed-container';
        MODAL_APPENDED_CLASS = 'k-appended';

    // Container Animations
    var containerAnimations = ['fadeIn','flipX','flipY','zoom','fadeInUp','fadeInDown','fadeInLeft','fadeInRight'];
    var modalStyles = ['fancy-blue','dark-black','yellow-lime','yellow-freedom'];

    var $body = $('body');
    var appended = false;

    // Init
    $.kModal = function(el, options) {
        var t = this;
        if (options.onReadyOpen) {
            t.open(options);
        }
        if (window.location.hash == options.hash) {
            t.open(options);
        }
        el.click(function(e) {
            var th = $(this);
            var href = th.attr('href');
            var animation = th.attr('k-animation');
            var style = th.attr('k-style');
            var role = th.attr('k-role');
            var embedType = t.defineEmbedType(th);
            e.preventDefault();
            t.open(options, href, embedType, animation, style, role);
        });
    }

    // Prototype
    $.kModal.prototype = {

        constructor: $.kModal,

        // Open
        open: function(options, href, embedType, animation, style, role) {
            
            // Settings
            var settings = $.extend({
                modalClass: '.' + MODAL_CLASS,
                type: 'simple',
                href: false,
                animation: false,
                style: false,
                role: 'standard',
                delay: 0,
                showClose: true,
                addCloseBtn: false,
                closeBtnText: 'Close',
                disableClose: false,
                hash: false,
                autoclose: false,
                autoplay: true,
                autofocus: false,
                storeCookie: false,
                setCookieType: false, // on-open or on-close
                cookieName: false,
                cookieValue: false,
                cookieExpires: 'session', // days
            }, options);

            // Clean var names
            var modalClass = settings.modalClass;
            var containerClass = '.' + MODAL_CONTAINER_CLASS;
            var type = settings.type;
            var delay = settings.delay;
            var showClose = settings.showClose;
            var addCloseBtn = settings.addCloseBtn;
            var closeBtnText = settings.closeBtnText;
            var disableClose = settings.disableClose;
            var hash = settings.hash;
            var autoclose = settings.autoclose;
            var autoplay = settings.autoplay;
            var autofocus = settings.autofocus;
            var storeCookie = settings.storeCookie;
            var setCookieType = settings.setCookieType;
            var cookieName = settings.cookieName;
            var cookieValue = settings.cookieValue;
            var cookieExpires = settings.cookieExpires;

            // href and embedType variables
            href = (settings.href) ? settings.href : href;
            embedType = (settings.embedType) ? settings.embedType : embedType;
            animation = (settings.animation) ? settings.animation : animation;
            style = (settings.style) ? settings.style : style;
            role = (settings.role) ? settings.role : role;
            
            if (type == 'embed') {
                var modalClass = '.' + MODAL_EMBED_CLASS;
                var containerClass = '.' + MODAL_EMBED_CONTAINER_CLASS;
            }
            if (type == 'ajax') {
                var modalClass = '.' + MODAL_AJAX_CLASS;
                var containerClass = '.' + MODAL_AJAX_CONTAINER_CLASS;
            }
            if (type == 'image') {
                var modalClass = '.' + MODAL_IMAGE_CLASS;
                var containerClass = '.' + MODAL_IMAGE_CONTAINER_CLASS;
            }

            // Prevent wrong styles
            if (jQuery.inArray(style, modalStyles) === -1) {
                style = 'default';
            }

            // Define this
            var t = this;

            // Check the cookies
            var cookieSetValue = t.getCookie(cookieName);
            if ((storeCookie == false) || (storeCookie == true && cookieSetValue != cookieValue)) {

                // Set delay
                setTimeout(function() {

                    // Style
                    t.setStyle(modalClass, style);
                    
                    // Type
                    t.types(modalClass, type, href, embedType, autoplay, autofocus);

                    // Animations
                    t.animations(modalClass, containerClass, animation);

                    // Hash
                    if (hash) {
                        t.hashModal(hash);
                    }

                    // Role
                    if (role) {
                        t.setRole(modalClass, role);
                    }
                    
                    // Close Btn 'X'
                    if (showClose == true && disableClose == false) {
                        t.closeBtn(modalClass, containerClass);
                    }

                    // Standard close function
                    if (disableClose == false) {
                        t.close(hash, modalClass, containerClass, animation, storeCookie, setCookieType, cookieName, cookieValue, cookieExpires);
                    }

                    // Add Close Btn
                    if (addCloseBtn == true) {
                        t.addCloseBtn(modalClass, containerClass, closeBtnText);
                    }

                    // If addCloseBtnn exists
                    if (disableClose == true && addCloseBtn == true) {
                        t.closeWithButton(hash, modalClass, containerClass, animation, storeCookie, setCookieType, cookieName, cookieValue, cookieExpires);
                    }

                    // Autoclose
                    if (autoclose) {
                        t.closeAction(hash, modalClass, containerClass, animation, autoclose, storeCookie, setCookieType, cookieName, cookieValue, cookieExpires);
                    }

                    // Store cookie on open
                    if (storeCookie == true && setCookieType == 'on-open') {
                        t.setCookie(cookieName, cookieValue, cookieExpires);
                    }

                }, delay);

            }

        },

        // Close Action (passing autoclose value)
        closeAction: function(hash, modalClass, containerClass, animation, autoclose, storeCookie, setCookieType, cookieName, cookieValue, cookieExpires) {
            var t = this;
            style = $(modalClass).attr('k-style');
            setTimeout(function() {
                $(modalClass).removeClass('openedModal');
                $(modalClass).removeClass(style);
                $(modalClass).attr('k-style','');
                $(containerClass).removeClass(animation);
                $('.' + MODAL_CLOSE_BTN).remove();
                $('.' + MODAL_ADD_CLOSE_BTN).remove();
                // Hash
                if (hash) {
                    var base = window.location.origin + window.location.pathname;
                    history.pushState('hash', 'hash', base);
                }
                // Appended
                if (appended) {
                    $('.' + MODAL_APPENDED_CLASS).remove();
                    appended = false;
                }
                // Animation variable
                if (jQuery.inArray(animation, containerAnimations) !== -1) {
                    $(containerClass).removeClass(animation);
                } else {
                    $(modalClass).removeClass(animation);
                }
                // Store cookie on close
                if (storeCookie == true && setCookieType == 'on-close') {
                    t.setCookie(cookieName, cookieValue, cookieExpires);
                }
            }, autoclose);
        },

        // Close
        close: function(hash, modalClass, containerClass, animation, storeCookie, setCookieType, cookieName, cookieValue, cookieExpires) {
            var t = this;
            $(modalClass).click(function(event) {
                var target = $(event.target);
                var autoclose = 0;
                if (target.hasClass(MODAL_CLOSE_BTN) || target.hasClass(MODAL_ADD_CLOSE_BTN) || target.is(modalClass)) {
                    t.closeAction(hash, modalClass, containerClass, animation, autoclose, storeCookie, setCookieType, cookieName, cookieValue, cookieExpires);
                }
            });
        },

        // Close with button
        closeWithButton: function(hash, modalClass, containerClass, animation, storeCookie, setCookieType, cookieName, cookieValue, cookieExpires) {
            var t = this;
            $(modalClass).click(function(event) {
                var target = $(event.target);
                var autoclose = 0;
                if (target.hasClass(MODAL_ADD_CLOSE_BTN)) {
                    t.closeAction(hash, modalClass, containerClass, animation, autoclose, storeCookie, setCookieType, cookieName, cookieValue, cookieExpires);
                }
            });
        },

        // Set Style
        setStyle: function(modalClass, style) {
            if (style != 'default') {
                $(modalClass).attr('k-style','k-'+ style);
                $(modalClass).addClass('k-'+ style);
            }
        },

        // Define role Style
        setRole: function(modalClass, role) {
            $(modalClass).addClass('k-' + role);
        },

        // Filter Types
        types: function(modalClass, type, href, embedType, autoplay, autofocus) {
            switch (type) {
                case 'embed': this.embedModal(href, embedType, autoplay); break;
                case 'form': this.formModal(modalClass, autofocus); break;
                case 'ajax': this.ajaxModal(href); break;
                case 'image': this.imageModal(href); break;
            }
        },

        // Animations
        animations: function(modalClass, containerClass, animation) {
            if (jQuery.inArray(animation, containerAnimations) !== -1) {
                $(modalClass).addClass('openedModal');
                $(containerClass).addClass(animation);
            } else {
                $(modalClass).addClass('openedModal').addClass(animation);
            }
        },

        // Define Embed type by Class
        defineEmbedType: function(th) {
            if (th.hasClass('k-youtube')) {
                return 'youtube';
            } else if (th.hasClass('k-vimeo')) {
                return 'vimeo';
            } else if (th.hasClass('k-googlemaps')) {
                return 'googlemaps';
            }
        },
        
        // Embed Modal - Youtube, Vimeo, Google Maps
        embedModal: function(href, embedType, autoplay) {
            switch (embedType) {
                case 'youtube':
                    var youtubeRegex = /(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/;
                    var parsed = href.match(youtubeRegex);
                    var videoID = parsed[1];
                    autoplay = (autoplay) ? '&autoplay=1' : '';
                    var iframe = '<iframe src="https://www.youtube.com/embed/'+ videoID +'?wmode=transparent'+ autoplay +'" frameborder="0" allowfullscreen wmode="Opaque"></iframe>';
                break;
                case 'vimeo':
                    var vimeoRegex = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
                    var parsed = href.match(vimeoRegex);
                    var videoID = parsed[1];
                    autoplay = (autoplay) ? '&autoplay=true' : '';
                    var iframe = '<iframe src="https://player.vimeo.com/video/'+ videoID +'?'+ autoplay +'" width="640" height="360" frameborder="0" allowfullscreen></iframe>';
                break;
                case 'googlemaps':
                    var gmsrc = 'https://maps.google.com/maps?&amp;q='+ encodeURIComponent(href) +'&amp;output=embed';
                    var iframe = '<iframe frameborder="0" style="border:0" src="'+ gmsrc +'"></iframe>'
                break;
            }
            $body.append('<div class="k-modal '+ MODAL_APPENDED_CLASS +' ' + MODAL_EMBED_CLASS +'"><div class="'+ MODAL_EMBED_CONTAINER_CLASS +'">'+ iframe +'</div></div>');
            appended = true;
        },

        // Form Modal
        formModal: function(modalClass, autofocus) {
            $(modalClass).addClass('k-form-modal');
            if (autofocus) {
                // Prevent animation delay
                setTimeout(function() {
                    if ($('.k-form-modal form input').length) {
                        $('.k-form-modal form input:first').focus();
                    } else if ($('.k-form-modal form textarea').length) {
                        $('.k-form-modal form textarea').focus();
                    }
                }, 100);
            }
        },

        // History Modal
        hashModal: function(hash) {
            history.pushState('hash', 'hash', hash);
        },

        // AJAX Modal
        ajaxModal: function(href) {
            $body.append('<div class="k-modal '+ MODAL_APPENDED_CLASS + ' ' + MODAL_AJAX_CLASS +'"><div class="'+ MODAL_AJAX_CONTAINER_CLASS +'"></div></div>');
            $.get(href, function(data) {
                $('.' + MODAL_AJAX_CONTAINER_CLASS).html(data);
                appended = true;
            });
        },
        
        // Image Modal
        imageModal: function(href) {
            $body.append('<div class="k-modal '+ MODAL_APPENDED_CLASS +' ' + MODAL_IMAGE_CLASS +'"><div class="'+ MODAL_IMAGE_CONTAINER_CLASS +'"><img src="'+ href + '"></div></div>');
            appended = true;
        },

        // Attach Close Button
        closeBtn: function(modalClass) {
            $(modalClass).append('<div class="' + MODAL_CLOSE_BTN + '">' + svgClose + '</div>');
        },

        // Add Close Button
        addCloseBtn: function(modalClass, containerClass, closeBtnText) {
            $(containerClass).append('<div class="' + MODAL_ADD_CLOSE_BTN + '">' + closeBtnText + '</div>');
        },

        // Set Cookie
        setCookie: function(name,value,expires) {
            if (expires == 'session') {
                expires = '';
            }
            if (expires) {
                var date = new Date();
                date.setTime(date.getTime() + (expires*24*60*60*1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "")  + expires + "; path=/";
        },

        // Get Cookie
        getCookie: function(name) {
            var name_equal = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(name_equal) == 0) return c.substring(name_equal.length,c.length);
            }
            return null;
        },

    };

    // Create kModal function
    $.fn.kModal = function(params) {
        if (this.length >= 1) {
            new $.kModal(this, params);
        }
        return this;
    };

    // SVGs
    var svgClose = '<?xml version="1.0" encoding="iso-8859-1"?><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="612px" height="612px" viewBox="0 0 612 612" style="enable-background:new 0 0 612 612;" xml:space="preserve"><polygon points="612,36.004 576.521,0.603 306,270.608 35.478,0.603 0,36.004 270.522,306.011 0,575.997 35.478,611.397 306,341.411 576.521,611.397 612,575.997 341.459,306.011"/></svg>';
        
}(jQuery));