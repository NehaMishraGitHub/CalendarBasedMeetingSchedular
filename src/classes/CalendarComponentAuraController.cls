/**
 * Created by Neha on 9/18/2018.
 */

public with sharing class CalendarComponentAuraController {

    @AuraEnabled
    public static List<Event> getEventsWithOwnerId() {
        Id userId = UserInfo.getUserId();
        Date nextCalculatedDate = System.today().addMonths(6);
        Date firstCalculatedDate = System.today().addMonths(-5);
        Date lastEndDate = Date.newInstance(nextCalculatedDate.year(), nextCalculatedDate.month(), Date.daysInMonth(nextCalculatedDate.year(), nextCalculatedDate.month()));

        Date firstStartDate = Date.newInstance(firstCalculatedDate.year(), firstCalculatedDate.month(), 1);
        return [SELECT EndDateTime,Description,Id,IsAllDayEvent,StartDateTime,Subject,Type,WhatId,WhoId,Who.Name, Confirmed__c,Rejected_Cancelled__c FROM Event WHERE startDateTime >=: firstStartDate AND endDateTime <=:lastEndDate AND OwnerId =:userId AND isDeleted = FALSE ];
    }

    @AuraEnabled
    public static Event saveEvent(String contactId, Map<String, String> eventData) {
        System.debug(eventData);
        try {

            Event event = new Event(
                    WhoId = contactId,
                    Subject = eventData.get('title'),
                    Description = eventData.get('description'),
                    StartDateTime = Datetime.parse(eventData.get('start')),
                    EndDateTime = Datetime.parse(eventData.get('end'))
            );
            if(eventData.get('id') != '') {
                event.Id = eventData.get('id');

            }
            else {
                event.Contact_Name__c = eventData.get('contactName');
                event.Contact_Email__c = eventData.get('contactEmail');
            }

            upsert event;
            return event;
        }catch (Exception exptn) {
            throw new AuraHandledException('Something went wrong. Please contact your Admin with the following info: '+exptn.getMessage());
        }

    }


}