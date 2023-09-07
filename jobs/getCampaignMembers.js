// Setup lastSyncTime
fn(state => {
  const manualCursor = '2023-08-16T15:30:00.000Z';
  console.log(manualCursor, 'manualCursor');

  const lastSyncTime = state.lastRunTime || manualCursor;
  const lastRunTime = new Date().toISOString();
  console.log('time at job start:' + lastRunTime);

  return { ...state, lastSyncTime, lastRunTime };
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
  const membersToCreate = [];
  const membersToUpdate = [];

  for (const member of campaignMembers) {
    const mappedMember = {
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
      //if (member.Contact.LastModifiedDate > state.lastSyncTime) {
      membersToCreate.push({ ...mappedMember, status: 'subscribed' });
    } else {
      membersToUpdate.push(mappedMember);
    }
  }

  let mergeCreateMemberTags = [];
  let mergeUpdateMemberTags = [];

  if (membersToCreate.length > 0) {
    mergeCreateMemberTags = membersToCreate.reduce((result, item) => {
      const existingItem = result.find(
        existing => existing.email_address === item.email_address
      );

      if (existingItem) {
        existingItem.tags = [...new Set([...existingItem.tags, ...item.tags])];
      } else {
        result.push(item);
      }

      return result;
    }, []);
  }

  if (membersToUpdate.length > 0) {
    mergeUpdateMemberTags = membersToUpdate.reduce((result, item) => {
      const existingItem = result.find(
        existing => existing.email_address === item.email_address
      );

      if (existingItem) {
        existingItem.tags = [...new Set([...existingItem.tags, ...item.tags])];
      } else {
        result.push(item);
      }
      return result;
    }, []);
  }

  return {
    ...state,
    references: [],
    members: [
      ...chunk(mergeCreateMemberTags, 500),
      ...chunk(mergeUpdateMemberTags, 500),
    ],
    chunkErrors: [],
  };
});
