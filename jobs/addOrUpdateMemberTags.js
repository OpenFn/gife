// Add or Update members to Mailchimp
each(
  'members[*]',
  post(
    '/lists/a1262d3eab',
    state => ({
      sync_tags: false,
      update_existing: true,
      email_type: 'html',
      members: state.data,
    }),
    {},
    state => {
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
