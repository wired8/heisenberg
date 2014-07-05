'use strict';

var resrvo_service = {

    _waTable: {},

    init: function (service_options) {

        var self = this;

        self._waTable = $('.service-options').WATable({
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

                self.setTableHandlers();

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

        var data = this.getData(service_options);
        self._waTable.setData(data);

        $('.add_option').on('click', function (e) {

            e.preventDefault();
            var data = self._waTable.getData();

            data.rows.push({
                name: $('#option_name').val(),
                cost: $('#option_cost').val(),
                image: $('#option_image').val(),
                active: $('#option_active').val() === 'on' ? true : false,
                delete: data.rows.length+1,
                edit: data.rows.length+1
            });

            self._waTable.setData(data, true);

            $("[name='service_options']").val(JSON.stringify(data.rows));

            $('#option_name').val('');
            $('#option_cost').val('');
            $('#option_image').val('');
            $('#option_active').prop('checked', false);

            self.setTableHandlers();
        });

        self.setTableHandlers();

    },

    setTableHandlers: function() {

        var self = this;

        $('.edit_option').on('click', function (e) {

            e.preventDefault();
            var id = parseInt(this.id, 10);
            var data = self._waTable.getData();
            var row = _.findWhere(data.rows, { edit: id });

            $('#option_name').val(row.name);
            $('#option_cost').val(row.cost);
            $('#option_image').val(row.image);
            $('#option_active').prop('checked', row.active);

        });

        $('.remove_option').on('click', function (e) {

            var id = parseInt(this.id, 10);
            e.preventDefault();
            var data = self._waTable.getData();

            var rows = _.filter(data.rows, function(option){
                return option.delete !== id;
            });

            var indexed_rows = [];

            _.each(rows, function(element, index) {
                indexed_rows.push({
                    name: element.name,
                    cost: element.cost,
                    image: element.image,
                    active: element.active,
                    delete: index,
                    edit: index
                });
            });

            data.rows = indexed_rows;

            self._waTable.setData(data, true);

        });


    },

    getData: function(service_options) {
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
        if (service_options.length > 0) {
            var rows = JSON.parse(service_options);
        }


        var data = {
            cols: cols,
            rows: rows
        };

        return data;
    }
};
