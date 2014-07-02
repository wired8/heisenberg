'use strict';

var resrvo_scheduler = {

    init: function() {
        var self = this;

        scheduler.form_blocks["editor"] = {
            render:function(sns){
                return "<div class='dhx_cal_ltext' style='height:60px;'>Name&nbsp;" +
                       "<input type='text'><br/>Email&nbsp;" +
                       "<input type='text'>";
            },
            set_value:function(node,value,ev){
                node.childNodes[1].value=value||"";
                node.childNodes[4].value=ev.details||"";
            },
            get_value:function(node,ev){
                ev.location = node.childNodes[4].value;
                return node.childNodes[1].value;
            },
            focus:function(node){
                var a=node.childNodes[1]; a.select(); a.focus();
            }
        };


        scheduler.config.lightbox.sections=[
            { name:"description", height:200, map_to:"text", type:"editor", focus:true},
            { name:"time", height:72, type:"time", map_to:"auto"}
        ];

        scheduler.config.xml_date="%Y-%m-%d %H:%i";
        scheduler.init('resrvo_scheduler',new Date(2014,8,4),"month");

        scheduler.templates.xml_date = function(value){ return new Date(value); };
        scheduler.load("/management/schedule", "json");

        var dp = new dataProcessor("/management/schedule");
        dp.init(scheduler);
        dp.setTransactionMode("POST", false);

        dp.attachEvent("onBeforeUpdate",function(id,status, data){
            data["_csrf"] = document.getElementById("_csrf").value;
            return true;
        });

    }
};

resrvo_scheduler.init();