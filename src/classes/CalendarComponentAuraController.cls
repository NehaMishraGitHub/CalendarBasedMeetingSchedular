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
    public static String saveEvents(Map<Object, Object> events) {
        System.debug(events);
        return null;
    }
}