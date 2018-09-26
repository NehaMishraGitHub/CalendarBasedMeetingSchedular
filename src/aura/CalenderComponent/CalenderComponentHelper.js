/**
 * Created by Neha on 9/17/2018.
 */
({
    initializeComponent : function(component) {
        console.log(component.get("v.recordId"));
        //console.log(component.get("v.record.Name"));
        this.fetchEvents(component);
    },

    userTimeZone : "",
    fetchEvents : function(component) {
        let self = this;
        let userId = $A.get("$SObjectType.CurrentUser.Id");
        self.userTimeZone = $A.get("$Locale.timezone");
        let action = component.get("c.getEventsWithOwnerId");
        action.setCallback(this, function(actionResult) {
            console.log(actionResult.getReturnValue());
            let formattedEvents = self.transformEventInFCformat(component, actionResult.getReturnValue(),self.userTimeZone);
            console.log("formattedEvents: ",formattedEvents);
            self.initializeCalendar(component,formattedEvents);
            $(".fc-prev-button").html("");
            $(".fc-prev-button").html("&nbsp;◄&nbsp;");
            $(".fc-next-button").html("");
            $(".fc-next-button").html("&nbsp;&#x25BA&nbsp;");
            component.set("v.events",formattedEvents);
            component.set('v.waitSpinner', false);
        });
        $A.enqueueAction(action);
    },

    initializeCalendar : function(component, formattedEvents) {
        let self = this;
        $('#calendar').fullCalendar({
            viewRender: function(view,element){
                console.log(element,"   =====   ",view);
                //$('#calendar').fullCalendar( 'renderEvent', self.globalEvent );
            },
            eventRender: function (calev, elt, view) {
                self.colorCodeEvents(calev, elt, view);
            },
            selectable: true,
            themeSystem: 'jquery-ui',
            header: {
                left: 'prev,next',
                center: 'title',
                right: 'agendaWeek,agendaDay,month'
            },
            
            timeFormat: 'h:mm A',
            defaultView: 'agendaDay',
            editable: true,
            eventLimit: true,
            eventClick: function(calEvent, jsEvent, view) {
                component.set("v.selectedDate", calEvent.start.format('YYYY-MM-DD'));
                self.openEventForm(component, calEvent);

            },
            select: function(start, end, jsEvent, view) {
                    if(view.name === "month" && (start.format() >= moment().format('YYYY-MM-DD')))   {
                        component.set("v.selectedDate", start.format());
                        self.openEventForm(component);
                    }

                    if(view.name !== "month" && moment(start.format("MM/DD/YYYY hh:mm:ss a")) >= moment()) {
                        component.set("v.selectedDate", start.format('YYYY-MM-DD'));
                        self.openEventForm(component,null, start, end);

                    }

                    //alert('selected ' + start.format() + ' to ' + end.format());
            },
            events: formattedEvents
        });
    },
    transformEventInFCformat: function(component, events, userTimeZone) {
    	let formattedEvents =[];
        for(let index in events) {
            formattedEvents.push({
                'id':events[index].Id,
                'contactName':events[index].Who?events[index].Who.Name:"",
                'title':events[index].Subject,
                'start':moment(events[index].StartDateTime).tz(userTimeZone).format(),
                'end':moment(events[index].EndDateTime).tz(userTimeZone).format(),
                //'allDay': events[index].IsAllDayEvent,
                'Confirmed': events[index].Confirmed__c,
                'Rejected': events[index].Rejected_Cancelled__c,
                'description': events[index].Description
            });
        }
        return formattedEvents;
    },
    openEventForm : function(component,calEvent, start, end) {

        console.log(calEvent);
        component.set("v.showEventForm",true);
        component.set("v.currentEventContact", component.get("v.simpleRecord.Name"));
        if(start && end) {
            component.find("start-time").set("v.value", start.format("HH:mm:ss"));
            component.find("end-time").set("v.value", end.format("HH:mm:ss"));
        }
        if(calEvent != null) {
            //component.set("v.eventId", calEvent.id);
            component.set("v.eventToBeUpdated", calEvent);
            component.set("v.currentEventContact", calEvent.contactName);
            component.find("subject").set("v.value", calEvent.title);
            component.find("description").set("v.value", calEvent.description);
           // component.find("all-day-event").set("v.checked", calEvent.allDay);
            component.find("start-time").set("v.value", calEvent.start.format("HH:mm:ss"));
            component.find("end-time").set("v.value", calEvent.end.format("HH:mm:ss"));
        }
    },

    saveEvent: function(component,myEvent) {
        let self = this;
        let action = component.get("c.saveEvent");
        action.setParams({
           contactId: component.get("v.recordId"),
           eventData: myEvent
        });
        action.setCallback(this, function(actionResult) {
            let state = actionResult.getState();
            component.set("v.showEventForm",false);
            let resultedEvent = {};
            /*Initializing event object to refer the original event, required for fullcalendar
                     'updateEvent' handler to be passed as an argument*/
            let eventToBeUpdated = component.get("v.eventToBeUpdated");
            if(state === "ERROR") {
               let errors = actionResult.getError();
               component.set('v.message', errors[0].message);
               component.set("v.hasError", true);
            }
            else {
                resultedEvent = self.transformEventInFCformat(component, [actionResult.getReturnValue()], self.userTimeZone)[0];
                if(myEvent.id !== "" && myEvent.id !== null ) {
                    eventToBeUpdated.id = resultedEvent.id;
                    eventToBeUpdated.title = resultedEvent.title;
                    eventToBeUpdated.start = resultedEvent.start;
                    eventToBeUpdated.end = resultedEvent.end;
                    eventToBeUpdated.description = resultedEvent.description;
                    $('#calendar').fullCalendar( 'updateEvent', eventToBeUpdated );
                }
                else {
                    $('#calendar').fullCalendar( 'renderEvent', resultedEvent, true );
                }
            }
        });
        $A.enqueueAction(action);
    },

    handleSaveEvent: function(component) {
        let self = this;
        let selectedDate = component.get("v.selectedDate");
        let startDateTime = moment(selectedDate + " " + component.find("start-time").get("v.value"));
        let endDateTime = moment(selectedDate + " " + component.find("end-time").get("v.value"));
        let eventToBeUpdated = component.get("v.eventToBeUpdated");
        //create new event object to be sent to backend
        let myEvent = {
            contactName: component.get("v.simpleRecord.Name"),
            contactEmail: component.get("v.simpleRecord.Email"),
            id: eventToBeUpdated?eventToBeUpdated.id:"",
            title: component.find("subject").get("v.value"),
            /*TODO: To be used in future, support for all day events
            allDay: component.find("all-day-event").get("v.checked")?"true":"false",*/
            Confirmed: false,
            Rejected: false,
            description: component.find("description").get("v.value"),
            start: startDateTime.format("MM/DD/YYYY hh:mm a"),
            end: endDateTime.format("MM/DD/YYYY hh:mm a")
        };
        const conflictingEvents = self.findConflictingEvent(component, startDateTime,endDateTime, myEvent.id);
        if(conflictingEvents.length > 0) {
            let confirmation = confirm(`You have ${conflictingEvents.length} Conflicting Events. Click OK to save`);
            if (confirmation) {
               self.saveEvent(component,myEvent);
            }
        }
        else {
            self.saveEvent(component,myEvent);
        }
        component.set('v.waitSpinner', false);
    },

    colorCodeEvents: function(calev, elt, view) {
        if(calev.Rejected) {
            elt.css("text-decoration", "line-through");
            elt.css("color", "#ef2310f2");
            elt.css("border-color", "#ef2310f2");
            elt.css("background-color","#edaaa4f2");
        }
        if(calev.Confirmed) {
            elt.css("background-color", "#8fe972");
            elt.css("border-color", "#289504");
            elt.css("color", "#289504");
        }
        if (calev.start.diff(moment()) <0) {
           // console.log("calev.start: ", calev.start);
            elt.css("background-color", "#bfe0f1");
            elt.css("border-color", "#0575b2");
            elt.css("color", "#0575b2");
        }
    },
    handleTimeInput: function(component, event, helper) {
        let stElem = component.find("start-time");
        let etElem = component.find("end-time");
        stElem.setCustomValidity("");
        etElem.setCustomValidity("");
        let startTime = stElem.get("v.value");
        let endTime = etElem.get("v.value");
        if(event.getSource().getLocalId() === "start-time") {
            if(endTime != "" && startTime > endTime) {
                stElem.setCustomValidity("Start Time cannot be greater then End Time");
            }
            stElem.reportValidity();
        }
        else {
           if(startTime != "" && startTime > endTime) {
                etElem.setCustomValidity("End Time cannot be less then start Time");
           }

        }
        stElem.reportValidity();
        etElem.reportValidity();
    },

    findConflictingEvent: function(component, startDateTime, endDateTime, id) {
        if(id !== "") {
           return [];
        }
        else {
            let allEvents = component.get("v.events");
            const result = allEvents.filter(event => (((moment(event.start).isBetween(startDateTime, endDateTime)) || (moment(event.start).isSame(startDateTime))) || ((moment(event.end).isBetween(startDateTime, endDateTime)) || (moment(event.end).isSame(endDateTime)))));
            console.log(result);
            return result;
        }

    }

})