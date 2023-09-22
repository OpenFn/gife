// Setup lastSyncTime
fn(state => {
  const manualCursor = '2023-08-16T15:30:00.000Z'; // SF timestamp
  console.log(manualCursor, 'manualCursor');

  const lastSyncTime = state.lastRunTime || manualCursor;
  return { ...state, lastSyncTime };
});

//Get Deleted Campaign Member Records in Salesforce since last run
bulkQuery(
  state => `SELECT Contact__r.Id, Contact__r.Name, Email__c, Nome_da_Tag__c
FROM Deleted_Campaign_Member__c
WHERE CreatedDate > ${state.lastSyncTime}`,
  {},
  state => {
    const contactIdsList = state.data
      .map(contact => contact['Contact__r.Id'])
      .filter(id => id)
      .map(id => `'${id}'`)
      .join(', ');
    return { ...state, contactIdsList };
  }
);

//Get corresponding Campaign Member details for Deleted Campaign Members
bulkQuery(
  state => `SELECT Contact.Id, Contact.Name, Contact.Email, Campaign_Tag_Name__c
FROM CampaignMember
WHERE Campaign.RecordType.Name = 'Grupos, RTs ou Áreas Temáticas' AND Campaign.IsActive = true AND Contact.Id IN (${state.contactIdsList})`
);

fn(state => {
  const deletedCampaignMembers = state.data;

  const mappedMember = [];
  let mergeMemberTags = [];

  for (const member of deletedCampaignMembers) {
    const mappedMember = {
      email_address: member["Contact.Email"],
      tags: [member.Campaign_Tag_Name__c],
    };

    if (mappedMember.length > 0) {
      mergeMemberTags = mappedMember.reduce((result, item) => {
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
        ...chunk(mergeMemberTags, 500),
      ],
      chunkErrors: [],
    };
}});

//Map Salesforce deleted campaign members to prepare for post to mailchimp
// fn(state => {
//   const deletedCampaignMembers = state.data;

//   console.log ('deletedCampaignMembers count', deletedCampaignMembers.length);

//   const mappedMembers = [];

//   for (const member of deletedCampaignMembers) {
//     const { CampaignMembers, Email } = member;

//     if (CampaignMembers) {
//       mappedMembers.push({
//         email_address: Email,
//         tags: CampaignMembers.records.map(r => r.Campaign_Tag_Name__c),
//       });
//     } else {
//       mappedMembers.push({
//         email_address: Email,
//         tags: [],
//       });
//     }
//   }

//   console.log(mappedMembers.length, 'Mapped members');

//   return {
//     ...state,
//     references: [],
//     members: chunk(mappedMembers, 500),
//     chunkErrors: [],
//   };
// });
