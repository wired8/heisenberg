'use strict';

var resrvo_scheduler = {

    init: function() {
        var self = this;

        scheduler.form_blocks["editor_view"] = {

            render:function(sns){

                var html = '<div style="clear: both; height:160px; overflow-y: scroll;">';

                html += '<div class="dhx_wrap_section" style="border: none;">';
                html += '  <div class="dhx_cal_lsection">';
                html +=     'First Name:';
                html +=   '</div>';
                html +=   '<div class="dhx_cal_ltext">';
                html +=   '<input type="text" placeholder="First Name" size="25" class="search" id="first_name" />';
                html +=   '</div>';
                html += '</div>';

                html += '<div class="dhx_wrap_section" style="border: none;">';
                html += '  <div class="dhx_cal_lsection">';
                html +=     'Last Name:';
                html +=   '</div>';
                html +=   '<div class="dhx_cal_ltext">';
                html +=   '<input type="text" placeholder="Last Name" size="25" class="search" id="last_name" />';
                html +=   '</div>';
                html += '</div>';

                html += '<div class="dhx_wrap_section" style="border: none;">';
                html += '  <div class="dhx_cal_lsection">';
                html +=     'Phone:';
                html +=   '</div>';
                html +=   '<div class="dhx_cal_ltext">';
                html +=   '<input type="text" placeholder="Phone" size="25" class="search" id="phone" />';
                html +=   '</div>';
                html += '</div>';

                html += '<div class="dhx_wrap_section" style="border: none;">';
                html += '  <div class="dhx_cal_lsection">';
                html +=     'Email:';
                html +=   '</div>';
                html +=   '<div class="dhx_cal_ltext">';
                html +=   '<input type="text" placeholder="Email" size="25" class="search" id="email" />';
                html +=   '</div>';
                html += '</div>';

                _.each(scheduler._temp.collections.form.fields, function(field) {
                    var field_class = '';
                    var help_block = '';

                    if (field.field_options) {

                        switch (field.field_options.size) {
                            case 'small':
                                field_class = 'rf-size-small';
                                break;
                            case 'medium':
                                field_class = 'rf-size-medium';
                                break;
                            case 'large':
                                field_class = 'rf-size-large';
                                break;
                        }

                        if (field.field_options.description) {
                            help_block = '<span class="help-block">' + field.field_options.description + '</span>';
                        }
                    }

                    switch (field.field_type) {

                        case 'date':
                            html += '<div class="dhx_wrap_section" style="border: none;">';
                            html += '  <div class="dhx_cal_lsection">';
                            html +=     field.label + '&nbsp;' + (field.required === 'true' ? '<abbr title="required">*</abbr>' : '') + ':';
                            html +=   '</div>';
                            html +=   '<div class="dhx_cal_ltext">';
                            html +=   '  <span class="month">';
                            html +=   '    <input type="text">';
                            html +=   '    <label>MM</label>';
                            html +=   '  </span>';
                            html +=   '  <span class="above-line">/</span>';
                            html +=   '  <span class="day">';
                            html +=   '    <input type="text">';
                            html +=   '    <label>DD</label>';
                            html +=   '  </span>';
                            html +=   '  <span class="above-line">/</span>';
                            html +=   '  <span class="year">';
                            html +=   '    <input type="text">';
                            html +=   '    <label>YYYY</label>';
                            html +=   '  </span>';
                             html +=   '</div>';
                            html += '</div>';
                            break;

                        case 'time':
                            html += '<div class="dhx_wrap_section" style="border: none;">';
                            html += '  <div class="dhx_cal_lsection">';
                            html +=     field.label + '&nbsp;' + (field.required === 'true' ? '<abbr title="required">*</abbr>' : '') + ':';
                            html +=   '</div>';
                            html +=   '<div class="dhx_cal_ltext">';
                            html +=   '  <span class="hours">';
                            html +=   '    <input type="text">';
                            html +=   '    <label>HH</label>';
                            html +=   '  </span>';
                            html +=   '  <span class="above-line">:</span>';
                            html +=   '  <span class="minutes">';
                            html +=   '    <input type="text">';
                            html +=   '    <label>MM</label>';
                            html +=   '  </span>';
                            html +=   '  <span class="above-line">:</span>';
                            html +=   '  <span class="seconds">';
                            html +=   '    <input type="text">';
                            html +=   '    <label>SS</label>';
                            html +=   '  </span>';
                            html +=   '  <span class="am_pm">';
                            html +=   '    <select>';
                            html +=   '      <option>AM</option>';
                            html +=   '      <option>PM</option>';
                            html +=   '    </select>';
                            html +=   '  </span>';
                            html +=   '</div>';
                            html += '</div>';
                            break;

                        case 'email':
                            html += '<div class="dhx_wrap_section" style="border: none;">';
                            html += '  <div class="dhx_cal_lsection">';
                            html +=     field.label + '&nbsp;' + (field.required === 'true' ? '<abbr title="required">*</abbr>' : '') + ':';
                            html +=   '</div>';
                            html +=   '<div class="dhx_cal_ltext">';
                            html +=   '<input type="text" placeholder="@" size="25" class="search" id="' + field.cid +'" />';
                            html +=   '</div>';
                            html += '</div>';
                            break;

                        case 'number':
                            html += '<div class="dhx_wrap_section" style="border: none;">';
                            html += '  <div class="dhx_cal_lsection">';
                            html +=     field.label + '&nbsp;' + (field.required === 'true' ? '<abbr title="required">*</abbr>' : '') + ':';
                            html +=   '</div>';
                            html +=   '<div class="dhx_cal_ltext">';
                            html +=     '<input type="text" placeholder="' + field.field_options.units + '" size="25" class="search" id="' + field.cid +'" />';
                            html +=     '&nbsp;' + field.field_options.units;
                            html +=     help_block;
                            html +=   '</div>';
                            html += '</div>';
                            break;

                        case 'paragraph':
                            html += '<div class="dhx_wrap_section" style="border: none;">';
                            html += '  <div class="dhx_cal_lsection">';
                            html +=     field.label + '&nbsp;' + (field.required === 'true' ? '<abbr title="required">*</abbr>' : '') + ':';
                            html +=   '</div>';
                            html +=   '<div class="dhx_cal_ltext">';
                            html +=   '  <textarea id="' + field.cid + '" class="' + field_class + '"></textarea>';
                            html +=      help_block;
                            html +=   '</div>';
                            html += '</div>';
                            break;

                        case 'text':
                            html += '<div class="dhx_wrap_section" style="border: none;">';
                            html += '  <div class="dhx_cal_lsection">';
                            html +=     field.label + '&nbsp;' + (field.required === 'true' ? '<abbr title="required">*</abbr>' : '') + ':';
                            html +=   '</div>';
                            html +=   '<div class="dhx_cal_ltext">';
                            html +=   '  <input type="text" placeholder="' + field.label + '" class="' + field_class + ' id="' + field.cid +'" />';
                            html +=      help_block;
                            html +=   '</div>';
                            html += '</div>';
                            break;

                        case 'radio':
                            html += '<div class="dhx_wrap_section" style="border: none;">';
                            html += '  <div class="dhx_cal_lsection">';
                            html +=     field.label + '&nbsp;' + (field.required === 'true' ? '<abbr title="required">*</abbr>' : '') + ':';
                            html +=   '</div>';
                            html +=   '<div class="dhx_cal_ltext">';

                            _.each(field.field_options.options, function(radio) {
                                html +=   '<div>';
                                html +=   '  <label class="fb-option">';
                                html +=     radio.checked === 'true' ? '<input type="radio" checked name="' + field.cid + '">' : '<input name="' + field.cid + '" type="radio">';
                                html +=     '&nbsp;' + radio.label;
                                html +=     '</label>';
                                html +=   '</div>';
                            });

                            if (field.field_options.include_other_option) {
                                html +=   '<div class="other_option">';
                                html +=   '  <label class="fb-option">';
                                html +=   '    <input type="radio" name="' + field.cid + '">';
                                html +=   '    Other';
                                html +=   '  </label>';
                                html +=   '  <input type="text">';
                                html +=   '</div>';
                            }

                            html +=      help_block;
                            html +=   '</div>';
                            html += '</div>';
                            break;
                    }
                });



                html += '</div>';



                return html;
            },

            set_value:function(node,value,ev){
                node.childNodes[0].value=value||"";
                // we must loop through all nodes because we use the autocomplete plugin which sometimes adds
                // additional html elements therefore changing the position of the inputs
                $.each(node.childNodes, function(index, item) {
                    if ($(item).attr("id") == "email") {
                        node.childNodes[index].value=ev.email||"";
                    }
                    if ($(item).attr("id") == "first_name") {
                        node.childNodes[index].value=ev.first_name||"";
                    }
                    if ($(item).attr("id") == "last_name") {
                        node.childNodes[index].value=ev.last_name||"";
                    }
                    if ($(item).attr("id") == "phone") {
                        node.childNodes[index].value=ev.phone||"";
                    }
                });
            },

            get_value:function(node,ev){
                // we must loop through all nodes because we use the autocomplete plugin which sometimes adds
                // additional html elements therefore changing the position of the inputs
                $.each(node.childNodes, function(index, item) {
                    if ($(item).attr("id") == "email") {
                        ev.email = node.childNodes[index].value;
                    }
                    if ($(item).attr("id") == "first_name") {
                        ev.first_name = node.childNodes[index].value;
                    }
                    if ($(item).attr("id") == "last_name") {
                        ev.last_name = node.childNodes[index].value;
                    }
                    if ($(item).attr("id") == "phone") {
                        ev.phone = node.childNodes[index].value;
                    }
                });
                return node.childNodes[0].value;
            },

            focus:function(node){
               // var a=node.childNodes[0];
               // a.select();
               // a.focus();
            }
        };


        scheduler.locale.labels.section_customer = "";
        scheduler.locale.labels.section_services = "Services";
        scheduler.locale.labels.section_providers = "Providers";
        scheduler.locale.labels.section_time_slots = "Time Slots";

        var lightbox_sections = [
            { name:"customer", height:160, type:"editor_view", map_to:"auto", focus:true},
            { name:"services", map_to:"service", type:"select", options:scheduler.serverList("services"), onchange:getProviders},
            { name:"providers", map_to:"provider", type:"select", options:scheduler.serverList("providers"), onchange:getTimeSlots},
            { name:"time_slots", map_to:"time_slots", type:"select", options:scheduler.serverList("timeslots"), onchange:setDateTime}
        ];

        scheduler.locale.labels.unit_tab = "Providers";

        scheduler.createUnitsView({
            name:"unit",
            property:"unit_id",
            list:scheduler.serverList("units"),
            skip_incorrect:true
        });

        scheduler.config.collision_limit = 1;
        scheduler.attachEvent("onEventLoading", function(ev) {
            return scheduler.checkCollision(ev);
        });

        // Short events
        //scheduler.config.hour_size_px = 84;
        scheduler.config.separate_short_events = true;
        scheduler.xy.min_event_height = 21; // 30 minutes is the shortest duration to be displayed as is

        var format = scheduler.date.date_to_str("%H:%i");
        var step = 30;

        scheduler.config.first_hour = 7;
        scheduler.config.last_hour = 18;


        scheduler.templates.event_class = function(start, end, event) {
            return "my_event";
        };

        scheduler.renderEvent = function(container, ev, width, height, header_content, body_content) {
            var container_width = container.style.width; // e.g. "105px"

            // move section
            var html = "<div class='dhx_event_move my_event_move' style='width: " + container_width + "'></div>";

            // container for event contents
            html += "<div class='my_event_body'>";
            html += "<span style='display: none' class='event_date'>";
            // two options here: show only start date for short events or start+end for long
            if ((ev.end_date - ev.start_date) / 60000 > 40) { // if event is longer than 40 minutes
                html += scheduler.templates.event_header(ev.start_date, ev.end_date, ev);
                html += "</span><br/>";
            } else {
                html += scheduler.templates.event_date(ev.start_date) + "</span>";
            }
            // displaying event text
            html += "<span>" + scheduler.templates.event_text(ev.start_date, ev.end_date, ev) + "</span>";
            html += "</div>";

            // resize section
            html += "<div class='dhx_event_resize my_event_resize' style='width: " + container_width + "'></div>";

            container.innerHTML = html;
            return true; // required, true - we've created custom form; false - display default one instead
        };

        scheduler.config.xml_date="%Y-%m-%d %H:%i";
        scheduler.init('resrvo_scheduler', new Date(),"day");

        scheduler.templates.xml_date = function(value){ return new Date(value); };

        scheduler.templates.lightbox_header = function(start,end,ev){
            return ev.text;
        };

        var now = new Date(scheduler._min_date).toISOString().slice(0,10).replace(/-/g,"");

        scheduler.load("/api/bookings/" + now + "/", "json");

        // Get providers and available time slots based on selected service
        function getProviders() {
            var service_id = this.value; //selection from first list
            updateProviders(service_id);
        }

        function getTimeSlots() {
            var service_id = $(scheduler.formSection('services').control).val();
            var provider_id = $(scheduler.formSection('providers').control).val();
            var d = new Date(scheduler._min_date);
            var curr_date = d.getDate();
            var curr_month = d.getMonth() + 1;
            var curr_year = d.getFullYear();
            var date = curr_month + '/' + curr_date + '/' + curr_year;
            updateTimeSlots(service_id, provider_id, date);
        }

        function updateProviders(service_id) {
            var $el = $(scheduler.formSection('providers').control);

            $.get('/api/providers/' + service_id, function(providers) {
                $el.empty(); // remove old options
                $.each(providers, function(i, provider) {
                    $el.append($("<option></option>")
                        .attr("value", provider.key).text(provider.label));
                });

                var provider_id = providers[0].key;
                var d = new Date(scheduler._min_date);
                var curr_date = d.getDate();
                var curr_month = d.getMonth() + 1;
                var curr_year = d.getFullYear();
                var date = curr_month + '/' + curr_date + '/' + curr_year;
                updateTimeSlots(service_id, provider_id, date);
            });
        }

        function updateTimeSlots(service_id, provider_id, date) {
            var $el = $(scheduler.formSection('time_slots').control);
            var csrf = $('#_csrf').val();

            $.post('/api/timeslots/', { providerid: provider_id, serviceid: service_id, date: date, _csrf: csrf }, function(result) {
                $el.empty(); // remove old options
                $el.prop('disabled', false);

                if (result.timeslots.length === 0) {
                    $el.append($("<option></option>")
                        .attr("value", 'null').text('None available'));
                    $el.prop('disabled', 'disabled');
                    return;
                }

                $.each(result.timeslots, function(i, time_slot) {
                    $el.append($("<option></option>")
                        .attr("value", time_slot.key).text(time_slot.value));
                });
                setDateTime();
            });
        }

        function setDateTime() {
            var start_time = $(scheduler.formSection('time_slots').control).val();
            var event_id = scheduler.getState().lightbox_id;
            var service_duration = 120;
            var d = new Date(scheduler._min_date);
            var curr_date = d.getDate();
            var curr_month = d.getMonth() + 1;
            var curr_year = d.getFullYear();
            var start_date = new Date(curr_month + '/' + curr_date + '/' + curr_year + ' ' + start_time);
            var end_date = new Date(start_date.getTime() + service_duration*60000);

            scheduler.getEvent(event_id).start_date = start_date;
            scheduler.getEvent(event_id).end_date = end_date;
            scheduler.updateEvent(event_id);
        }


        scheduler.attachEvent("onBeforeLightbox", function(event_id) {
            scheduler.resetLightbox();
            var ev = scheduler.getEvent(event_id);

            scheduler.config.lightbox.sections = lightbox_sections;

            return true;
        });

        scheduler.attachEvent("onLightbox", function(){
            getTimeSlots();
        });

        /*
        dhtmlxAjax.get("/api/services", function(services){
            scheduler.updateCollection("services", services);
        });*/

        var dp = new dataProcessor("/management/schedule/");
        dp.live_updates("/sync");
        dp.init(scheduler);
        dp.setTransactionMode("POST", false);

        dp.attachEvent("onBeforeUpdate",function(id,status, data){
            data["_csrf"] = document.getElementById("_csrf").value;
            return true;
        });

        $('#dhx_minical_icon').on('click', function() {
            if (scheduler.isCalendarVisible()){
                scheduler.destroyCalendar();
            } else {
                scheduler.renderCalendar({
                    position:"dhx_minical_icon",
                    date:scheduler._date,
                    navigation:true,
                    handler:function(date,calendar){
                        scheduler.setCurrentView(date);
                        scheduler.destroyCalendar()
                    }
                });
            }
        });

    }
};
