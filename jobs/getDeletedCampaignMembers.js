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

//Map Salesforce deleted campaign members to prepare for post to mailchimp
fn(state => {
  const deletedCampaignMembers = state.references[0]['records'];
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