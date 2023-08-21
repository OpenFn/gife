// Setup lastSyncTime 
fn(state => {
    const manualCursor = '2023-08-16T15:30:00.000Z'; // SF timestamp
    console.log(manualCursor, 'manualCursor');

    const lastSyncTime = state.lastRunTime || manualCursor;
    return { ...state, lastSyncTime };
});

// Get campaign members
query(state=>`
SELECT Id, Name, FirstName, LastName, Email, CreatedDate,
       Contact.AccountId, Contact.LastModifiedDate, Contact.CreatedDate,
       Campaign.Name, Campaign.Nome_da_Tag__c
FROM CampaignMember
WHERE Campaign.RecordType.Name = 'Grupos, RTs ou Áreas Temáticas'
      AND Campaign.IsActive = true
      AND (Contact.LastModifiedDate > ${state.lastSyncTime} OR CreatedDate > ${state.lastSyncTime})
`);



// Seperate members for each batch 
fn(state => {
    const campaignMembers = state.references[0]['records'];

    console.log(campaignMembers, 'our members')
    // For contacts to create createdDate > state.lastSyncTime
    const contactsToCreate = [];
    const contactsToUpdate = [];
    for (const member of campaignMembers) {
        if (member.CreatedDate === member.Contact.LastModifiedDate) { //update
            contactsToCreate.push(member);
        }
        else {
            contactsToUpdate.push(member);
        }
    }
    return {...state, contactsToUpdate, contactsToCreate}
});
