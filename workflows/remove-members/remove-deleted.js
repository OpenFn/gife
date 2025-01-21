//Sync contacts and create only active campaign tags
//'/lists/25299978a7 Mailchimp Shreya's Test' 8eec4f86ed Will's Mailchimp Test,
//'/lists/a2ff510317', //will enviroment test 3
//'/lists/43fead6cd7',
each(
  $.members,
  post('/lists/8eec4f86ed', state => ({
    sync_tags: true,
    update_existing: true,
    email_type: 'html',
    members: state.data,
  }))
    .catch((error, state) => {
      console.log(error);
      return state;
    })
    .then(state => {
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
  return { lastSyncTime, lastRunTime };
});
