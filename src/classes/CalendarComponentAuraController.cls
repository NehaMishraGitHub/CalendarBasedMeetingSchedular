/**
 * Created by Neha on 9/18/2018.
 */

public with sharing class CalendarComponentAuraController {

    @AuraEnabled
    public static List<Event> getEventsWithOwnerId() {
        Id userId = UserInfo.getUserId();
        System.debug('userId: '+userId);

        return [SELECT ActivityDate,ActivityDateTime,DurationInMinutes,EndDateTime,EventSubtype,GroupEventType,Id,IsAllDayEvent,StartDateTime,Subject,Type,WhatId,WhoId FROM Event WHERE OwnerId =:userId AND isDeleted = FALSE ];
    }

    @AuraEnabled
    public static Event saveEvent(String contactId, Map<String, String> eventData) {
        System.debug('eventData: '+eventData);
     	Event event = new Event(
                WhoId = contactId,
                Subject =  eventData.get('title'),
                StartDateTime = Datetime.parse(eventData.get('start')),
                EndDateTime = Datetime.parse(eventData.get('end')),
                IsAllDayEvent = eventData.get('allDay')== 'true'?true:false
        );
        insert event;
        return event;
    }
}