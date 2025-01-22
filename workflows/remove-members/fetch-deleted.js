// To test with manual cursor simply create a new input with lastRunTime as the manual cursor
// cursor($.lastRunTime || '2023-08-16T15:30:00.000Z', { key: 'lastSyncTime' });
// cursor('now', { key: 'lastRunTime', format: c => new Date(c).toISOString() });
fn(state => {
  delete state?.members
  delete state?.references
  const manualCursor = '2023-08-16T15:30:00.000Z'; // SF timestamp
  state.lastSyncTime = state.lastRunTime || manualCursor;
  state.lastRunTime = new Date().toISOString();
  return state;
});

//Get Deleted Campaign Member Records in Salesforce since last run
bulkQuery(
  `SELECT Contact__r.Id, Contact__r.Name, Email__c, Nome_da_Tag__c FROM Deleted_Campaign_Member__c WHERE CreatedDate > ${$.lastSyncTime}`
).then(state => {
  const uniqueContactsMap = new Map();
  state.data.forEach(contact => {
    uniqueContactsMap.set(contact['Contact__r.Id'], contact);
  });

  const uniqueContacts = Array.from(uniqueContactsMap.values());
  state.deletedMembers = uniqueContacts;
  state.contactIdsList = uniqueContacts
    .map(contact => `'${contact['Contact__r.Id']}'`)
    .join(', ');

  console.log('Unique Contact IDs List:', uniqueContacts?.length);
  return state;
});

fnIf(!$.contactIdsList, state => {
  console.log('No contact IDs found. Skipping second bulk query.');
  return state;
});

//Get corresponding Campaign Member details for Deleted Campaign Members
fnIf(
  $.contactIdsList,
  bulkQuery(
    `SELECT Contact.Id, Contact.Name, Contact.Email, Campaign_Tag_Name__c FROM CampaignMember WHERE Campaign.RecordType.Name = 'Grupos, RTs ou Áreas Temáticas' AND Campaign.IsActive = true AND Contact.Id IN (${$.contactIdsList})`
  ).then(state => {
    const campaginMembers = state.data;
    console.log(campaginMembers.length, 'Deleted Campaign Members');
    if (!campaginMembers.length > 0) {
      console.log(
        'No campaing members found for contacts ids: ',
        state.contactIdsList
      );
      return state;
    }

    let mergeMemberTags = [];
    for (const member of campaginMembers) {
      const email = member['Contact.Email'];
      const campaignName = member.Campaign_Tag_Name__c;
      // Find the existing mapped member for this email
      const existingMember = mergeMemberTags.find(
        item => item.email_address === email
      );
      if (existingMember) {
        // If the email already exists, add the campaign name to its tags array
        existingMember.tags.push(campaignName);
      } else {
        // If the email doesn't exist, create a new mapped member
        const newMember = {
          email_address: email,
          tags: [campaignName].map(str => str.replace(/\n/g, '')),
          email_type: 'html',
        };
        mergeMemberTags.push(newMember);
      }
    }
    console.log(mergeMemberTags.length, 'Retrieved mapped members');

    state.members = [...chunk(mergeMemberTags, 500)];
    return state;
  })
);

fnIf(!$.members && $.deletedMembers.length > 0, state => {
  console.log('Query 2 had 0 results mapping using query 1');
  state.members = [...chunk(state.deletedMembers.map(m => ({
    email_address: m['Email__c'],
    tags: [],
    email_type: 'html',
  })), 500)];
  return state;
});
