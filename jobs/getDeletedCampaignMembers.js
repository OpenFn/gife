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
SELECT Nome_da_Campanha__c, Nome_da_Tag__c, Nome_do_Membro_de_Campanha__c, Email__c
FROM Deleted_Campaign_Member__c
WHERE CreatedDate > ${state.lastSyncTime}
`
);

//Map Salesforce deleted campaign members to prepare for post to mailchimp
// fn(state => {
//     const deletedCampaignMembers = state.references[0]['records'];
//     const mappedMembers = [];

//     for (const member of deletedCampaignMembers) {
//         const mappedMember = {
//             subscriber_hash: member.Email,
//             tags: [
//                 {
//                     name: member.Nome_da_Tag__c,
//                     status: "inactive"
//                 }
//             ],
//             is_syncing: true
//         };
//         mappedMembers.push(mappedMember);
//     }

//     return { ...state, mappedMembers};
// });

// {
//   subscriber_hash: member.Email__c,
//   tags: [
//     {
//       name: member.Nome_da_Tag__c,
//       status: "inactive",
//     },
//   ]
// }
fn(state => {
  const deletedCampaignMembers = state.references[0]['records'];
  const mappedMembers = [];

  for (const member of deletedCampaignMembers) {
    const mappedMember = {
      is_syncing: true,
      subscriber_hash: member.Email__c,
      email_address: member.Email__c,
      status: 'inactive',
      tags: [member.Nome_da_Tag__c],
    };
    mappedMembers.push(mappedMember);
  }

  //const chunkedMappedMembers = chunk(mappedMembers, 500);
  return {
    ...state,
    references: [],
    //mappedMembers: chunkedMappedMembers
    members: chunk(mappedMembers, 500),
  };
});
