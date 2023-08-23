// Add or Update members to Mailchimp
fn(state => {
  // Check if we do not have data to sync
  if (state.members.flat().length === 0) return state;
  for (const membersChunk of state.members) {
    return post('/lists/a4e7ea0abc', {
      sync_tags: false,
      update_existing: true,
      email_type: 'html',
      members: membersChunk,
    })(state);
  }
});

// Cleaning up state
fn(state => ({ ...state, response: {} }));
