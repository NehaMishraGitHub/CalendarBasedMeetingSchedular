/**
 * Created by Neha on 9/17/2018.
 */
({
    initializeComponent : function(component) {
        this.fetchEvents(component);
    },
    fetchEvents : function(component) {
        let userId = $A.get("$SObjectType.CurrentUser.Id");
        let userTimeZone = $A.get("$Locale.timezone");
        let self = this;
        console.log(userTimeZone);
        let action = component.get("c.getEventsWithOwnerId");
        action.setCallback(this, function(actionResult) {
            console.log(actionResult.getReturnValue());
            let formattedEvents = self.transformEventInFCformat(component, actionResult.getReturnValue(),userTimeZone);
            console.log("formattedEvents: ",formattedEvents);
            self.initializeCalendar(component,formattedEvents);
            component.set("v.events",formattedEvents);
        });
        $A.enqueueAction(action);
    },

    initializeCalendar : function(component, formattedEvents) {
        let self = this;
        console.log(jQuery);
        console.log(moment);
        console.log(formattedEvents);
       // console.log($('#calendar').fullCalendar());
        $('#calendar').fullCalendar({
            viewRender: function(view,element){console.log(element,"   =====   ",view);},
            eventRender: function (calev, elt, view) {
                var ntoday = new Date();
                console.log("calev.start: ", calev.start);
                if (calev.start._d.getTime() < ntoday.getTime()) {
                    //elt.addClass("past");
                   // elt.children().addClass("past");
                    elt.css("background-color", "green");
                    elt.css("text-decoration", "line-through");
                }
            },
            themeSystem: 'jquery-ui',
            header: {
                //left: 'prev,next today',
                left: 'today',
                center: 'title',
                right: 'basicDay,basicWeek, month, listMonth'//,basicWeek,basicDay'
            },
            
            timeFormat: 'h:mm A',
            defaultView: 'basicDay',
            editable: true,
            eventLimit: true,

            dayClick: function(date, jsEvent, view) {
                console.log(component);
                //alert('Clicked on: ' + date.format());
                //alert('Current view: ' + view.name);

                // change the day's background color just for fun
               // $(this).css('background-color', 'red');
                component.set("v.selectedDate", date.format());
                console.log(component.get("v.selectedDate"));
                self.openEventForm(component, date.format());

                        },
            events: formattedEvents
        });
    },
    transformEventInFCformat: function(component, events, userTimeZone) {
    	let formattedEvents =[];
        for(let index in events) {
            formattedEvents.push({
                'id':events[index].Id,
                'title':events[index].Subject,
                'start':moment(events[index].StartDateTime).tz(userTimeZone).format(),
                'end':moment(events[index].EndDateTime).tz(userTimeZone).format(),
                'allDay': events[index].IsAllDayEvent
            });
        }
        return formattedEvents;
    },
    openEventForm : function(component) {
        //console.log(component);
        component.set("v.showEventForm",true);
        console.log(component.get("v.showEventForm"));
//        var myEvent = {
//            title:"New Event",
//            allDay: true,
//            start: new Date(),
//            end: new Date()
//        };
//        $('#calendar').fullCalendar( 'renderEvent', myEvent );
    },
    addNewEvent: function(component) {
        let selectedDate = component.get("v.selectedDate");
        console.log("selectedDate: ",selectedDate);
        console.log(component.find("subject").get("v.value"));
        console.log(component.find("start-time").get("v.value"));
        console.log(component.find("end-time").get("v.value"));
        let datetimeA = moment(selectedDate + " " + component.find("start-time").get("v.value"));
        console.log("datetimeA: ",datetimeA.format());
        let startDateTime = moment(selectedDate + " " + component.find("start-time").get("v.value"));
        let endDateTime = moment(selectedDate + " " + component.find("end-time").get("v.value"));

    	let myEvent = {
        	title:component.find("subject").get("v.value"),
			allDay: component.find("all-day-event").get("v.value"),
			start: startDateTime.format(),
			end: endDateTime.format()
		};
        //console.log("Worked till here");
		$('#calendar').fullCalendar( 'renderEvent', myEvent );
		component.set("v.showEventForm",false);
    },
    saveEvent: function(component) {
        console.log(component.get("v.recordId"));
        let selectedDate = component.get("v.selectedDate");
        let startDateTime = moment(selectedDate + " " + component.find("start-time").get("v.value"));
        let endDateTime = moment(selectedDate + " " + component.find("end-time").get("v.value"));
        let myEvent = {
            title:component.find("subject").get("v.value"),
            allDay: component.find("all-day-event").get("v.value"),
            //start: startDateTime.toISOString(),
            start: startDateTime.format("MM/DD/YYYY hh:mm a"),
            end: endDateTime.format("MM/DD/YYYY hh:mm a")
        };
        console.log("myEvent: ",myEvent);
        let action = component.get("c.saveEvent");
        action.setParams({
            contactId: component.get("v.recordId"),
            eventData: myEvent
        })
        action.setCallback(this, function(actionResult) {
            console.log(actionResult.getReturnValue());

            $('#calendar').fullCalendar( 'renderEvent', myEvent );
            component.set("v.showEventForm",false);
        });
        $A.enqueueAction(action);

    },
    saveEvents: function(component) {
        //$('#testPrev').click(function() {
          //$('#calendar').fullCalendar('prev');
        //});

//          $('#testPrev').fullCalendar({
//              viewRender: function(view, element) {
//                  console.log(view);
//                  //Do something
//              }
//          });
//        console.log($('#calendar').fullCalendar('clientEvents'));
//        let action = component.get("c.saveEvents");
//        let eventsData = this.simplifyEventData($('#calendar').fullCalendar('clientEvents'));
//        console.log(eventsData);
//        action.setParams({ events : eventsData});
//        console.log("Culprit is not above");
//        action.setCallback(this, function(actionResult) {
//
//            console.log(actionResult.getReturnValue());
//        });
//        $A.enqueueAction(action);
    },

//    simplifyEventData: function(events) {
//        simplifiedEvents = [];
//        for(let index in events) {
//            let simplifiedEvent = {
//                id: events[index].id,
//                title:events[index].id,
//                allDay: events[index].allDay,
//                start: events[index].start.format(),
//                end: events[index].id
//            }
//        }
//    }

})