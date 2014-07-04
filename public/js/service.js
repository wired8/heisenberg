'use strict';

var resrvo_service = {

    init: function () {

        var self = this;

        var waTable = $('.service-options').WATable({
            debug:true,                 //Prints some debug info to console
            pageSize: 10,                //Initial pagesize
            //transition: 'slide',       //Type of transition when paging (bounce, fade, flip, rotate, scroll, slide).Requires https://github.com/daneden/animate.css.
            //transitionDuration: 0.2,    //Duration of transition in seconds.
            filter: false,               //Show filter fields
            sorting: true,              //Enable sorting
            sortEmptyLast:true,         //Empty values will be shown last
            columnPicker: false,         //Show the columnPicker button
            pageSizes: [],  //Set custom pageSizes. Leave empty array to hide button.
            hidePagerOnEmpty: true,     //Removes the pager if data is empty.
            checkboxes: false,           //Make rows checkable. (Note. You need a column with the 'unique' property)
            checkAllToggle:false,        //Show the check-all toggle
            preFill: false,              //Initially fills the table with empty rows (as many as the pagesize).
            //url: '/someWebservice'    //Url to a webservice if not setting data manually as we do in this example
            //urlData: { report:1 }     //Any data you need to pass to the webservice
            //urlPost: true             //Use POST httpmethod to webservice. Default is GET.
            custom: [
                $('<a href="#">someLink</a>'),
                $('<a href="#">anotherLink</a>')
            ],
            types: {                    //Following are some specific properties related to the data types
                string: {
                    filterTooltip: false,    //What to say in tooltip when hoovering filter fields. Set false to remove.
                    placeHolder: false       //What to say in placeholder filter fields. Set false for empty.
                },
                number: {
                    decimals: 1,   //Sets decimal precision for float types
                    placeHolder: false
                },
                bool: {
                    //filterTooltip: false
                    placeHolder: false
                },
                date: {
                    utc: true,            //Show time as universal time, ie without timezones.
                    //format: 'yy/dd/MM',   //The format. See all possible formats here http://arshaw.com/xdate/#Formatting.
                    datePicker: true      //Requires "Datepicker for Bootstrap" plugin (http://www.eyecon.ro/bootstrap-datepicker).
                }
            },

            tableCreated: function(data) {    //Fires when the table is created / recreated. Use it if you want to manipulate the table in any way.
                console.log('table created'); //data.table holds the html table element.
                console.log(data);            //'this' keyword also holds the html table element.
            },
            rowClicked: function(data) {      //Fires when a row is clicked (Note. You need a column with the 'unique' property).
                console.log('row clicked');   //data.event holds the original jQuery event.
                console.log(data);            //data.row holds the underlying row you supplied.
                //data.column holds the underlying column you supplied.
                //data.checked is true if row is checked.
                //'this' keyword holds the clicked element.
                if ( $(this).hasClass('userId') ) {
                    data.event.preventDefault();
                    alert('You clicked userId: ' + data.row.userId);
                }
            },
            columnClicked: function(data) {    //Fires when a column is clicked
                console.log('column clicked');  //data.event holds the original jQuery event
                console.log(data);              //data.column holds the underlying column you supplied
                //data.descending is true when sorted descending (duh)
            },
            pageChanged: function(data) {      //Fires when manually changing page
                console.log('page changed');    //data.event holds the original jQuery event
                console.log(data);              //data.page holds the new page index
            },
            pageSizeChanged: function(data) {  //Fires when manually changing pagesize
                console.log('pagesize changed');//data.event holds teh original event
                console.log(data);              //data.pageSize holds the new pagesize
            }
        }).data('WATable');

        var data = this.getData();
        waTable.setData(data);

        $('.add_option').on('click', function (e) {

            e.preventDefault();
            var data = waTable.getData();

            data.rows.push({
                name: $('#option_name').val(),
                cost: $('#option_cost').val(),
                image: $('#option_image').val(),
                active: $('#option_active').val() === 'on' ? true : false,
                delete: data.rows.length,
                edit: data.rows.length
            });

            waTable.setData(data, true);

        });

        $('.remove_option').on('click', function (e) {

            e.preventDefault();
            var data = waTable.getData();

          /*  _.each(data, function()) {

            });
*/
        });

    },

    getData: function() {
        var cols = {
            name: {
                index: 1, //The order this column should appear in the table
                type: "string", //The type. Possible are string, number, bool, date(in milliseconds)
               // unique: true,  //This is required if you want checkable rows, or to use the rowClicked callback. Be certain the values are really unique or weird things will happen.

                placeHolder: false
            },
            cost: {
                index: 2,
                type: "number"
            },
            image: {
                index: 3,
                type: "string"
            },
            active: {
                index: 4,
                type: "bool"
            },
            delete: {
                index: 5,
                type: "number",
                format: "<a href='#' id='{0}' class='remove_option'><i class='fa fa-trash-o'></i></a>"
            },
            edit: {
                index: 6,
                type: "number",
                format: "<a href='#' id='{0}' class='edit_option'><i class='fa fa-edit'></i></a>"
            }
        };

        var rows = [];

        rows.push({ name: 'Color', cost: 5, image: '', active: true, delete: 1, edit: 1 });

        var data = {
            cols: cols,
            rows: rows
        };

        return data;
    }
};
