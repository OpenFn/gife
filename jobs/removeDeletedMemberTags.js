//Sync contacts and create only active campaign tags
each(
  'members[*]',
  post('/lists/a4e7ea0abc', state => ({
    sync_tags: true,
    update_existing: true,
    email_type: 'html',
    members: state.data,
  }))
);

// Alert admin if response has errors
fn(state => {
  // Check if response has errors
  const { errors, error_count } = state.response;
  if (error_count > 0) {
    throw new Error(JSON.stringify(errors, null, 2));
  }
  return state;
});
