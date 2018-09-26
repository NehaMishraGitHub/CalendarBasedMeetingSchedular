/**
 * Created by Neha on 9/17/2018.
 *
 */
({
    recordLoaded: function(component, event, helper) {
        let contact = component.get("v.record");
        component.set("v.contactInContext", contact);
        console.log('contact: ',contact);
        //component.set("v.contactEmailInContext", contact.Name);
    },
    onJSload: function(component, event, helper) {
        let events = component.get("v.events");
        if(!events.length)
        {
           helper.initializeComponent(component);
        }
    },
    closeEventForm: function(component, event, helper) {
       // component.destroy();
       component.set("v.showEventForm", false);
    },
    onSaveClick: function(component, event, helper) {
        component.set('v.waitSpinner', true);
        helper.handleSaveEvent(component);
    },
    closeModal: function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
        $A.get('e.force:refreshView').fire();
    },
    onAllDayEventClick: function(component, event, helper) {
        helper.handleAllDayEvent(component,event);
    },
    onTimeInput: function(component, event, helper) {
        helper.handleTimeInput(component,event);
    },
    onCloseClick: function(component, event, helper) {
        component.set("v.hasError", false);
    }
})