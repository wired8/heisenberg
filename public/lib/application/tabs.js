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
