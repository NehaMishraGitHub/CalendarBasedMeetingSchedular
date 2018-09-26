/**
 * Created by Neha on 9/25/2018.
 */
@IsTest(SeeAllData=false)
public with sharing class CalendarComponentAuraController_Test {
    @testSetup public static void createTestData() {
        List<Contact> contactList = new List<Contact>();
        List<Event> eventList = new List<Event>();
        for(Integer i = 1; i<=10; i++) {
            Contact con = new contact();
            con.FirstName = 'ConFirstName';
            con.LastName = 'ConLastName' + i;
            con.Email = con.FirstName+'_'+con.LastName+'@xyz.com';
        contactList.add(con);
        }
        insert contactList;

        for(Contact con : contactList) {
            Event event = new Event();
            event.Subject = 'Demo Meeting with '+con.FirstName;
            event.StartDateTime = System.now();
            event.EndDateTime = event.StartDateTime.addHours(2);
            event.Contact_Email__c = con.Email;
            eventList.add(event);
        }

        Date nextCalculatedDate = System.today().addMonths(-5);
        Date firstCalculatedDate = System.today().addMonths(-6);

        //Create event with start date less than Today - 5 months
        Event pastEvent = new Event();
        pastEvent.Subject = 'Demo Meeting with '+contactList[0].FirstName;
        pastEvent.StartDateTime = Datetime.newInstance(firstCalculatedDate.year(), firstCalculatedDate.month(), firstCalculatedDate.day());
        pastEvent.EndDateTime = pastEvent.StartDateTime.addHours(2);
        pastEvent.Contact_Email__c = contactList[0].Email;
        eventList.add(pastEvent);

        Event validEvent = new Event();
        validEvent.Subject = 'Valid Demo Meeting';
        validEvent.StartDateTime = Datetime.newInstance(nextCalculatedDate.year(), nextCalculatedDate.month(), nextCalculatedDate.day());
        validEvent.EndDateTime = validEvent.StartDateTime.addHours(2);
        validEvent.Contact_Email__c = contactList[0].Email;
        eventList.add(validEvent);

        insert eventList;

    }

    static testMethod void getEventsWithOwnerId_Test() {
        Test.startTest();
        Integer totalEvents = [SELECT COUNT() FROM Event];
            List<Event> eventList = CalendarComponentAuraController.getEventsWithOwnerId();
        Test.stopTest();
        System.assertEquals(12, totalEvents, 'Total events in the database should be 12.');
        System.assertEquals(11, eventList.size(), 'Query should return only events between last 5 months and next 6 months.');
    }

    static testMethod void saveNewEvent_Test() {
        Contact contact = [SELECt Id, Name, Email FROM Contact LIMIT 1];
        Map<String,String> eventDataStringsByStrings = new Map<String, String>();
        eventDataStringsByStrings.put('id', '');
        eventDataStringsByStrings.put('title', 'Demo Meeting with '+contact.Id);
        eventDataStringsByStrings.put('title', 'Description for Demo Meeting with '+contact.Id);
        eventDataStringsByStrings.put('start', String.valueOf(System.now().format()));
        eventDataStringsByStrings.put('end', String.valueOf(System.now().addHours(2).format()));
        eventDataStringsByStrings.put('contactName', contact.Name);
        eventDataStringsByStrings.put('contactEmail', contact.Email);

        Test.startTest();
            Event newEvent = CalendarComponentAuraController.saveEvent(contact.Id, eventDataStringsByStrings);
        Test.stopTest();
        System.assertEquals(contact.Id, newEvent.WhoId, 'Event should be associated with the correct Contact');

    }

    static testMethod void saveUpdateEvent_Test() {
        Test.startTest();
            Event validEventToBeUpdated = [SELECT Id,WhoId,Subject FROM Event WHERE Subject =: 'Valid Demo Meeting'];
            Map<String,String> eventDataStringsByStrings = new Map<String, String>();
            eventDataStringsByStrings.put('id', String.valueOf(validEventToBeUpdated.WhoId));
            eventDataStringsByStrings.put('title', 'Update Valid Demo Meeting with '+validEventToBeUpdated.WhoId);
            eventDataStringsByStrings.put('description', 'Description for Demo Meeting');
            eventDataStringsByStrings.put('start', String.valueOf(System.now().format()));
            eventDataStringsByStrings.put('end', String.valueOf(System.now().addHours(2).format()));       
        	Event newEvent = CalendarComponentAuraController.saveEvent(validEventToBeUpdated.WhoId, eventDataStringsByStrings);
        Test.stopTest();
        List<Event> updatedEvent = [SELECT Id,Subject FROM Event WHERE Subject =: 'Update Valid Demo Meeting with '+validEventToBeUpdated.WhoId];
        System.assertEquals(1, updatedEvent.size(), 'One event with update Subject found');

    }

}