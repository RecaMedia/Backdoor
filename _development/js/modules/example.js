import $ from 'jquery';

export class Example {
	constructor(options) {
		this.options = options;
		this.options = $.extend({}, this.defaults(), this.options);
		this.additionalSelectors();
		this.delegateEvents();
	}

	defaults() {
		return {
			element: "#example",
		};
	}

	additionalSelectors() {
		this.options.$element = $(this.options.element);
		return this.options.$window = $(window);
	}

	delegateEvents() {
		var _self;
		_self = this;

		let testES6 = "ES6 is working!";
		this.options.$element.html(testES6);
	}
}