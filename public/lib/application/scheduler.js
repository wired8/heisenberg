'use strict';

var resrvo_scheduler = {

    init: function() {
        var self = this;

        scheduler.form_blocks["editor_view"]={
            render:function(sns){
                var html = '<div class="dhx_cal_ltext" style="height:160px;">';
                html += 'First Name:&nbsp;<input type="text" placeholder="First Name" size="25" class="search" id="first_name"><br/>';
                html += 'Last Name:&nbsp;<input type="text" placeholder="Last Name" size="25" class="search" id="last_name"><br/>';
                html += 'Phone:&nbsp;<input type="text" placeholder="Phone" size="25" class="search" id="phone"><br/>';
                html += 'Email:&nbsp;<input type="text" placeholder="Email" size="25" class="search" id="email"><br/>';
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

        var lightbox_sections=[
            { name:"customer", height:72, type:"editor_view", map_to:"auto", focus:true},
            { name:"services", map_to:"service", type:"select", options:scheduler.serverList("services"), onchange:updateProviders},
            { name:"providers", map_to:"provider", type:"select", options:scheduler.serverList("providers")},
            { name:"time", height:72, type:"time", map_to:"auto"}
        ];

        scheduler.locale.labels.unit_tab = "Providers";

        scheduler.createUnitsView({
            name:"unit",
            property:"key",
            list:scheduler.serverList("units"),
            size:20,
            step:1
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

        scheduler.templates.event_class = function(start, end, event) {
            return "my_event";
        };

        scheduler.renderEvent = function(container, ev, width, height, header_content, body_content) {
            var container_width = container.style.width; // e.g. "105px"

            // move section
            var html = "<div class='dhx_event_move my_event_move' style='width: " + container_width + "'></div>";

            // container for event contents
            html+= "<div class='my_event_body'>";
            html += "<span class='event_date'>";
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
        scheduler.load("/api/bookings", "json");

        function updateProviders() {
            var self = this;
            var service_id = this.value; //selection from first list
            var $el = $(scheduler.formSection('providers').control);

            $.get('/api/providers/' + service_id, function(providers) {
                //scheduler.updateCollection("providers", providers);
               // scheduler.showLightbox(scheduler.getState().lightbox_id);
                $el.empty(); // remove old options
                $.each(providers, function(i, provider) {
                    $el.append($("<option></option>")
                        .attr("value", provider.key).text(provider.label));
                });
               // $(scheduler.formSection('services').control).val(service_id);
            });
        }

        scheduler.attachEvent("onBeforeLightbox", function(event_id) {
            scheduler.resetLightbox();
            var ev = scheduler.getEvent(event_id);

            scheduler.config.lightbox.sections = lightbox_sections;

            return true;
        });

        dhtmlxAjax.get("/api/services", function(services){
            scheduler.updateCollection("services", services);
        });

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
