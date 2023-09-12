//Sync contacts and create only active campaign tags
each(
  'members[*]',
  post(
    '/lists/a1262d3eab',
    state => ({
      sync_tags: true,
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
  // Check if response has errors
  const chunkErrors = state.chunkErrors.flat();
  if (chunkErrors.length > 0) {
    throw new Error(JSON.stringify(chunkErrors, null, 2));
  }
  return state;
});
