/**
 * Created by Neha on 9/17/2018.
 *
 */
({
    onJSload: function(component, event, helper) {
        let events = component.get("v.events");
        //console.log(events);
        if(!events.length)
        {
           helper.initializeComponent(component);
        }
        //helper.initializeCalendar(component);
    },
    addNewEvent : function(component, event, helper) {
        helper.addNewEvent(component);
    },
    closeEventForm: function(component, event, helper) {
       // component.destroy();
       component.set("v.showEventForm", false);
    },
    saveData: function(component, event, helper) {
        helper.saveEvents(component);
    }
})