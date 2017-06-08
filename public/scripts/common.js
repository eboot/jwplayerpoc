$(document).ready(function(){
	$('.thumbnail-video-list').slick({
		slidesToShow: $('.thumbnail-video-list').data('vertical')?2:5,
		vertical : $('.thumbnail-video-list').data('vertical')
	});
});