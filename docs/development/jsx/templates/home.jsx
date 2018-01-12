/*
@category   WebApplicationKit
@package    Web Application Starter Kit
@author     Shannon Reca
@copyright  2017 Shannon Reca
@since      04/18/17
*/

import React from 'react';
import $ from 'jquery';

class Home extends React.Component {

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		var _self = this;
		var $body = $('body');
		var $html = $('html, body');
		$(document).ready(function ($){
			$('#menubutton').click(function() {
				$body.toggleClass('menu--open');
			});
			$('.nav a').not('.menu-download a').click(function(e) {
				e.preventDefault();
				var id = $(this).attr('data-anchor');
				$html.animate({ scrollTop: $('[name="' + id + '"]').offset().top}, 'slow');
			}); 
		});
	}

	componentWillUnmount() {
		$('#menubutton').unbind();
		$('.nav a').unbind();
	}

	render() {

		return (
			<div>
				<section className="what-is-backdoor">
					<h2 className="subtitle"><a name="about">About Backdoor</a></h2><img src="/assets/img/languages.svg" className="languages"/>
					<div className="container">
						<p>BKDR, short for Backdoor, is an in-browser code editor for developers. Backdoor was created with the idea of speeding up and simplifying the development process, by having an editor directly on the development server, it allows you to have the flexibility of coding on any device connected to the internet. Backdoor can quickly be deployed with a simple upload and running the built-in install wizard.</p>
					</div>
				</section>
				<section className="features">
					<div className="feature">
						<h2 className="subtitle"><a name="features">Features</a></h2>
					</div>
					<div className="feature">
						<div className="container">
							<div className="feature-title"><i aria-hidden="true" className="fa fa-server"></i>Self-Hosted</div>
							<div className="feature-desc">
								<p>Cloud hosted services may not be for everyone. Backdoor gives you the peace of mind knowing your files are on your own self-hosted server. No need to worry about intellectual property possibly being exposed.</p>
							</div>
						</div>
					</div>
					<div className="feature">
						<div className="container">
							<div className="feature-desc">
								<p>Having all the "bells and whistles" are great for the most part, but this can also be overwhelming. Backdoor UI/UX focused on making sure all the necessary basic functionality was easily &amp; visibly accessible.</p>
							</div>
							<div className="feature-title"><i aria-hidden="true" className="fa fa-pencil"></i>Simplicity</div>
						</div>
					</div>
					<div className="feature">
						<div className="container">
							<div className="feature-title"><i aria-hidden="true" className="fa fa-puzzle-piece"></i>Extensions</div>
							<div className="feature-desc">
								<p>With version two, having a community support system was vitality important. Backdoor now supports extensions, which allows you, as a developer, to help improve Backdoor.</p>
							</div>
						</div>
					</div>
				</section>
				<section className="developers">
					<div className="container">
						<h2 className="subtitle"><a name="developers">Developers Join In</a></h2>
						<div className="developers-content"> <img src="/assets/img/computer_illustration.svg" className="developers-illust-left"/>
							<p>Backdoor's extension API was designed with the idea of opening the doors to creativity beyond the core. Developers can now create tools not only for themselves, but for the community as well. This allows the user base to leverage the need for newer features.</p>
						</div>
						<div className="developers-content">
							<p>Rebuilt from the ground up, JavaScript and PHP are the primary languages Backdoor is built on. These are also the languages for creating extensions, with JavaScript being the primary interface. You can read more about creating extensions at <a href="https://backdoor.gitbooks.io/extensions/content/" target="_blank">Gitbooks</a></p><img src="/assets/img/blueprint_illustration.svg" className="developers-illust-right"/>
						</div>
					</div>
				</section>
			</div>
		)
	}
}

export default Home;