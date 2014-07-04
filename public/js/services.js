'use strict';

var resrvo_services = {

    init: function () {
        // New record
        $('button.editor_create').on('click', function (e) {
            e.preventDefault();
            location.href = '/management/service/';
        });

        // Edit record
        $('#services').on('click', 'a.editor_edit', function (e) {
            e.preventDefault();
            var row = $(this).closest('tr'),
                data = oTable._(row),
                id = data[0].DT_RowId;

            location.href = '/management/service/' + id;
        });

        // Delete record
        $('#services').on('click', 'a.editor_delete', function (e) {
            e.preventDefault();
            var row = $(this).closest('tr'),
                data = oTable._(row),
                id = data[0].DT_RowId;

            smoke.confirm("Are you sure you wish to delete this service?", function (e) {
                if (e) {
                    $.post('/management/service/remove', {event_id: id }, function (result) {
                        location.href = location.href;
                    });
                }
            }, { ok: "OK", cancel: "Cancel", reverseButtons: true });
        });


        var oTable = $('#services').dataTable({
            "bProcessing": false,
            "bServerSide": true,
            "sDefaultContent": "",
            "sPaginationType": "bootstrap",
            "sAjaxSource": "/api/services",
            "fnServerData": function (sSource, aoData, fnCallback, oSettings) {
                oSettings.jqXHR = $.ajax({
                    "dataType": 'json',
                    "type": "GET",
                    "url": sSource,
                    "data": aoData,
                    "success": function (result) {
                        if (result.flash && result.flash.info) {
                            $.sticky(result.flash.info, {autoclose: 2000, position: "top-center" });
                        }
                        fnCallback(result);
                    }
                });
            },
            "aoColumns": [
                {
                    "mDataProp": "_id",
                    "bVisible": false
                },
                { "mDataProp": "name" },
                { "mDataProp": "description" },
                { "mDataProp": "duration" },
                {
                    "mDataProp": "active",
                    "bUseRendered": false,
                    "fnRender": function (oObj) {
                        var data = oObj.aData["active"];
                        if (data === true) {
                            return '<input type=\"checkbox\" checked value="' + data + '">';
                        } else {
                            return '<input type=\"checkbox\" value="' + data + '">';
                        }
                    }
                },
                {
                    "mDataProp": "created_at",
                    "sType": "date",
                    "bUseRendered": false,
                    "fnRender": function (oObj) {
                        var javascriptDate = new Date(oObj.aData["created_at"]);
                        return "<div class='date'>" + javascriptDate + "<div>";
                    }
                },
                {
                    "mDataProp": "updated_at",
                    "sType": "date",
                    "bUseRendered": false,
                    "fnRender": function (oObj) {
                        var javascriptDate = new Date(oObj.aData["updated_at"]);
                        return "<div class='date'>" + javascriptDate + "<div>";
                    }
                },
                {
                    "mDataProp": null,
                    "sClass": "center",
                    "sDefaultContent": '<a href="" class="editor_edit">Edit</a>',
                    "bSortable": false,
                    "bSearchable": false
                },
                {
                    "mDataProp": null,
                    "sClass": "center",
                    "sDefaultContent": '<a href="" class="editor_delete">Delete</a>',
                    "bSortable": false,
                    "bSearchable": false
                }
            ],
            "oLanguage": {
                "sLengthMenu": "_MENU_ records per page"
            },
            "fnInitComplete": function () {
                keys.fnSetPosition(0, 0);
            }
        });

        // Initialise KeyTable
        var keys = new KeyTable({
            "table": $('#services')[0],
            "datatable": $('#services').dataTable()
        });

        keys.event.esc(null, null, function () {
        });

        // Bind our action events for triggering Editor
        keys.event.action(0, null, function () {
            showField(editor, keys, '_id');
        });

        keys.event.action(1, null, function () {
            showField(editor, keys, 'name');
        });

        keys.event.action(2, null, function () {
            showField(editor, keys, 'description');
        });

        keys.event.action(3, null, function () {
            showField(editor, keys, 'duration');
        });

        keys.event.action(4, null, function () {
            showField(editor, keys, 'active');
        });

        keys.event.action(5, null, function () {
            showField(editor, keys, 'created_at');
        });

        keys.event.action(6, null, function () {
            showField(editor, keys, 'updated_at');
        });

        keys.event.action(7, null, function () {
            $('a', keys.fnGetCurrentTD()).click();
        });

        keys.event.action(8, null, function () {
            $('a', keys.fnGetCurrentTD()).click();
        });
    }
};

resrvo_services.init();













