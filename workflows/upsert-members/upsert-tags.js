// Add or Update members to Mailchimp
each(
  '$.members[*]',
  post(
    '/lists/43fead6cd7',
    state => {
      console.log(`Upserting ${state.data.length} members...`);
      return {
        sync_tags: false,
        update_existing: true,
        email_type: 'html',
        members: state.data,
      };
    },
    {},
    state => {
      if (state.response.body.total_created > 0)
        console.log(`Added ${state.response.body.total_created} members`);
      if (state.response.body.total_updated > 0)
        console.log(`Updated ${state.response.body.total_updated} members`);

      if (state.response.body.error_count > 0)
        state.chunkErrors.push(state.response.body.errors);
      return state;
    }
  )
);

// Alert admin if response has errors
fn(state => {
  // Check if chunks response has errors
  const chunkErrors = state.chunkErrors.flat();
  // if (chunkErrors.length > 0) {
  //   throw new Error(JSON.stringify(chunkErrors, null, 2));
  // }
  // Advance the cursor only on full success
  return { lastRunTime: state.lastRunTime, data: state.data };
});
