<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
    <alerts>
        <fullName>Confirmation_Email_for_Prospective_Season_Ticket_Holders</fullName>
        <description>Confirmation Email for Prospective Season Ticket Holders</description>
        <protected>false</protected>
        <recipients>
            <field>Contact_Email__c</field>
            <type>email</type>
        </recipients>
        <senderType>CurrentUser</senderType>
        <template>unfiled$public/New_Meeting_Confirmation</template>
    </alerts>
</Workflow>
