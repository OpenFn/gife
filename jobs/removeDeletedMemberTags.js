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