require.config({
    baseUrl: './js',
    paths: {
        'jquery': 'lib/jquery/dist/jquery.min',
        'bootstrap': 'lib/bootstrap/dist/js/bootstrap.min',
        'socketio': 'lib/socket.io/socket.io'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'bootstrap': {
            deps: [
                jquery
            ]
        },
        'socketio': {
            exports: 'io'
        }
    }
});
