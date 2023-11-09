// Setup lastSyncTime
fn(state => {
  const manualCursor = '2023-08-16T15:30:00.000Z';
  console.log(manualCursor, 'manualCursor');

  const lastSyncTime = state.lastRunTime || manualCursor;
  const lastRunTime = new Date().toISOString();
  console.log('time at job start:' + lastRunTime);

  return { ...state, lastSyncTime, lastRunTime };
});

bulkQuery(
  state => `
SELECT Id, Name, FirstName, LastName, Email, CreatedDate,
     Contact.AccountId, Contact.LastModifiedDate, Contact.CreatedDate,
     Campaign.Name, Campaign.Nome_da_Tag__c
FROM CampaignMember
WHERE Campaign.RecordType.Name = 'Grupos, RTs ou Áreas Temáticas'
    AND Campaign.IsActive = true
    AND (Contact.LastModifiedDate > '2023-08-16T15:30:00.000Z' OR CreatedDate > '2023-08-16T15:30:00.000Z')
`
);

//Seperate members for each batch
fn(state => {
  const campaignMembers = state.data;
  const membersToCreate = [];
  const membersToUpdate = [];

  console.log(campaignMembers.length, 'campaignMembers');

  for (const member of campaignMembers) {
    const mappedMember = {
      email_address: member.Email,
      full_name: member.Name,
      merge_fields: {
        FNAME: member.FirstName,
        LNAME: member.LastName,
        MMERGE4: member["Contact.AccountId"],
      },
      tags: [member["Campaign.Nome_da_tag__c"]],
    };
    if (member.CreatedDate > state.lastSyncTime) {
      membersToCreate.push({ ...mappedMember, status: 'subscribed' });
    } else {
      membersToUpdate.push(mappedMember);
    }
  }

  console.log(membersToCreate.length, 'membersToCreate before merge tags');
  console.log(membersToUpdate.length, 'membersToUpdate before merge tags');

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

  console.log(
    mergeCreateMemberTags.length,
    'mergeCreateMemberTags after merge tags'
  );

  console.log(
    mergeUpdateMemberTags.length,
    'mergeUpdateMemberTags after merge tags'
  );

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
