jQuery(document).ready(function($) {
    console.log('Example Plugin JavaScript loaded!');

    $('.example-plugin-container').on('click', function() {
        $(this).toggleClass('active');
        console.log('Example plugin container clicked!');
    });
});
