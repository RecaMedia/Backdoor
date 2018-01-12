/*
@category   WebApplicationKit
@package    Web Application Starter Kit
@author     Shannon Reca
@copyright  2017 Shannon Reca
@since      04/18/17
*/

import $ from 'jquery';

export class Nav {
	constructor(options) {
		this.options = options;
		this.options = $.extend({}, this.defaults(), this.options);
		this.delegateEvents();
	}

	defaults() {
		return {
			element: '.nav a'
		};
	}

	delegateEvents() {
		var _self = this;
		var $body = $('body');
		var $html = $('html, body');
		$(document).ready(function ($){
			$('#menubutton').click(function() {
				$body.toggleClass('menu--open');
			});
			$(_self.options.element).not('.menu-download a').click(function(e) {
				e.preventDefault();
				var id = $(this).attr('data-anchor');
				$html.animate({ scrollTop: $('[name="' + id + '"]').offset().top}, 'slow');
			}); 
		});
	}
}