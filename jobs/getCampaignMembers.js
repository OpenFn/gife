// Setup lastSyncTime
fn(state => {
  const manualCursor = '2023-08-16T15:30:00.000Z'; // SF timestamp
  console.log(manualCursor, 'manualCursor');

  const lastSyncTime = state.lastRunTime || manualCursor;
  return { ...state, lastSyncTime };
});

// Get campaign members from Salesforce
query(
  state => `
SELECT Id, Name, FirstName, LastName, Email, CreatedDate,
       Contact.AccountId, Contact.LastModifiedDate, Contact.CreatedDate,
       Campaign.Name, Campaign.Nome_da_Tag__c
FROM CampaignMember
WHERE Campaign.RecordType.Name = 'Grupos, RTs ou Áreas Temáticas'
      AND Campaign.IsActive = true
      AND (Contact.LastModifiedDate > ${state.lastSyncTime} OR CreatedDate > ${state.lastSyncTime})
`
);

// Seperate members for each batch
fn(state => {
  const campaignMembers = state.references[0]['records'];

  console.log(campaignMembers, 'our members');
  // For contacts to create createdDate > state.lastSyncTime
  const contactsToCreate = {
    sync_tags: false,
    update_existing: false,
    email_type: 'html',
    members: [],
  };
  const contactsToUpdate = {
    sync_tags: false,
    update_existing: false,
    email_type: 'html',
    members: [],
  };

  for (const member of campaignMembers) {
    const mappedMember = {
      subscriber_hash: member.Email,
      email_address: member.Email,
      full_name: member.fullName,

      merge_fields: {
        FNAME: member.FirstName,
        LNAME: member.LastName,
        MMERGE4: member.AccountId,
      },
      tags: [member.Campaign.Nome_da_tag__c],
    };
    if (member.CreatedDate > state.lastSyncTime) {
      contactsToCreate.members.push({ ...mappedMember, status: 'subscribed' });
    } else {
      contactsToUpdate.members.push(mappedMember);
    }
  }
  return { ...state, references: [], contactsToUpdate, contactsToCreate };
});
