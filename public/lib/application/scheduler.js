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

        scheduler.config.lightbox.sections=[
            { name:"customer", height:72, type:"editor_view", map_to:"auto", focus:true},
            { name:"services", map_to:"service", type:"select", options:scheduler.serverList("services"), onchange:updateProviders},
            { name:"providers", map_to:"provider", type:"select", options:scheduler.serverList("providers")},
            { name:"time", height:72, type:"time", map_to:"auto"}
        ];


        scheduler.config.xml_date="%Y-%m-%d %H:%i";
        scheduler.init('resrvo_scheduler',new Date(2014,8,4),"month");

        scheduler.templates.xml_date = function(value){ return new Date(value); };
        scheduler.load("/api/bookings", "json");

        function updateProviders() {
            var self = this;
            var service_id = this.value; //selection from first list
            var providers = $(scheduler.formSection('providers').control);

            $.get('/api/providers/' + service_id, function(providers) {
                scheduler.updateCollection("providers", providers);
                scheduler.showLightbox(scheduler.getState().lightbox_id);
                $(scheduler.formSection('services').control).val(service_id);
            });
        }

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

    }
};
