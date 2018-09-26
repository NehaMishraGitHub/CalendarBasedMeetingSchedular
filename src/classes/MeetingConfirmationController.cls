/**
 * Created by Neha on 9/23/2018.
 */

public class MeetingConfirmationController {
    public Id eventId {get;set;}
    public String confirmation_status{get;set;}
    public String comment {get;set;}
    public Event event {get;set;}
    public String eventHeaderString {get;set;}

    public meetingConfirmationController() {}

    public PageReference onPageLoad() {
        eventId = System.currentPageReference().getParameters().get('eventId');
        confirmation_status = System.currentPageReference().getParameters().get('status');
        event = getEvent();
        if(confirmation_status == 'Confirmed') {
            return confirmMeeting();
        }
        else if(confirmation_status == 'Rejected') {
            return rejectMeeting();
        }
        else {
            eventHeaderString = 'Not valid';
            return null;
        }
    }
    public Event getEvent() {
        event = [SELECT EndDateTime,Description,Id,IsAllDayEvent,StartDateTime,Subject,Type,WhatId,WhoId,Who.Name,Owner.Name, Owner.Email, Confirmed__c,Rejected_Cancelled__c,Contact_Email__c FROM Event WHERE Id =:eventId AND isDeleted = FALSE ];
//        if(event.Confirmed__c) {
//            eventHeaderString = 'You\'ve accepted the following meeting.';
//        }
//        else if(event.Rejected_Cancelled__c) {
//            eventHeaderString = 'You\'ve rejected the following meeting.';
//        }
//        else {
//            eventHeaderString = 'You\'ve new Meeting Request.';
//        }
        return event;
    }

    public PageReference confirmMeeting() {
        if(event.Confirmed__c || event.Rejected_Cancelled__c) {
            eventHeaderString = 'The link is no longer valid. Please connect with the meeting organizer: '+event.Owner.Email;
        }
        else {
            System.debug('Inside Confirmation');
            event.Confirmed__c = true;
            event.Rejected_Cancelled__c = false;
            update event;
            eventHeaderString = 'Thank you for accepting the meeting.';
        }
        return null;
    }

    public PageReference rejectMeeting() {
        if(event.Confirmed__c || event.Rejected_Cancelled__c) {
            eventHeaderString = 'The link is no longer valid. Please connect with the meeting organizer: '+event.Owner.Email;
        }
        else {
            System.debug('Inside Rejection');
            event.Rejected_Cancelled__c = true;
            event.Confirmed__c = false;
            update event;
            eventHeaderString = 'You\'ve rejected this meeting.';
        }
        return null;
    }

}