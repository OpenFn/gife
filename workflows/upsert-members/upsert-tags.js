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
      if (state.response.total_created > 0)
        console.log(`Added ${state.response.total_created} members`);
      if (state.response.total_updated > 0)
        console.log(`Updated ${state.response.total_updated} members`);

      if (state.response.error_count > 0)
        state.chunkErrors.push(state.response.errors);
      return state;
    }
  )
);

// Alert admin if response has errors
fn(state => {
  // Check if chunks response has errors
  const chunkErrors = state.chunkErrors.flat();
  if (chunkErrors.length > 0) {
    throw new Error(JSON.stringify(chunkErrors, null, 2));
  }
  return state;
});
