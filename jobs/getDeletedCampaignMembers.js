// Setup lastSyncTime
fn(state => {
  const manualCursor = '2023-08-16T15:30:00.000Z'; // SF timestamp
  console.log(manualCursor, 'manualCursor');

  const lastSyncTime = state.lastRunTime || manualCursor;
  return { ...state, lastSyncTime };
});

// Get deleted campaign members from Salesforce
query(
  state => `
SELECT Name, Email, (SELECT Campaign_Tag_Name__c FROM CampaignMembers
  WHERE Campaign.RecordType.Name = 'Grupos, RTs ou Áreas Temáticas' and  Campaign.IsActive = true)
FROM Contact
WHERE Id in (SELECT Contact__c FROM Deleted_Campaign_Member__c WHERE CreatedDate > ${state.lastSyncTime})
`
);

// Retrieving the Remaining SOQL Query Results If we have more than 2000 records
fn(state => {
  const totalSize = state.references[0]['totalSize'];
  if (totalSize > 2000) {
    for (let offset = 2000; offset < totalSize; offset += 2000) {
      console.log('Querying data from', offset);
      state = query(`
      SELECT Name, Email, (SELECT Campaign_Tag_Name__c FROM CampaignMembers
        WHERE Campaign.RecordType.Name = 'Grupos, RTs ou Áreas Temáticas' and  Campaign.IsActive = true)
      FROM Contact
      WHERE Id in (SELECT Contact__c FROM Deleted_Campaign_Member__c WHERE CreatedDate > ${state.lastSyncTime}) OFFSET ${offset}
      `)(state);
    }
  }

  return state;
});

//Map Salesforce deleted campaign members to prepare for post to mailchimp
fn(state => {
  const deletedCampaignMembers = state.references
    .map(ref => ref.records)
    .flat();

  const mappedMembers = [];

  for (const member of deletedCampaignMembers) {
    const { CampaignMembers, Email } = member;

    if (CampaignMembers) {
      mappedMembers.push({
        email_address: Email,
        tags: CampaignMembers.records.map(r => r.Campaign_Tag_Name__c),
      });
    } else {
      mappedMembers.push({
        email_address: Email,
        tags: [],
      });
    }
  }

  return {
    ...state,
    references: [],
    members: chunk(mappedMembers, 500),
    chunkErrors: [],
  };
});
