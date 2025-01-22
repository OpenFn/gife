//Sync contacts and create only active campaign tags
//'/lists/25299978a7 Mailchimp Shreya's Test' 8eec4f86ed Will's Mailchimp Test,
//'/lists/a2ff510317', //will enviroment test 3
//'/lists/43fead6cd7',
each(
  $.members,
  post('/lists/8eec4f86ed', state => {
    const payload = {
      sync_tags: true,
      update_existing: true,
      email_type: 'html',
      members: state.data,
    };
    console.log('Sending payload to Mailchimp', payload);
    return payload;
  })
    .catch((error, state) => {
      console.log(error);
      return state;
    })
    .then(state => {
      console.log(
        'Mailchimp updated_members response',
        state.data.updated_members.length
      );
      console.log(
        'Mailchimp new_members response',
        state.data.new_members.length
      );
      state.chunkErrors ??= [];
      state.chunkErrors.push(state.response.errors);
      return state;
    })
);

// Alert admin if response has errors
fn(state => {
  const { lastSyncTime, lastRunTime } = state;
  // Check if response has errors
  const chunkErrors = state.chunkErrors.flat().filter(Boolean);
  if (chunkErrors.length > 0) {
    throw new Error(JSON.stringify(chunkErrors, null, 2));
  }
  // return state;
  return { lastSyncTime, lastRunTime };
});
