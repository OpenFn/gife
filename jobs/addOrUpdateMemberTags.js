// Add or Update members to Mailchimp
each(
  'members[*]',
  post('/lists/a4e7ea0abc', state => ({
    sync_tags: false,
    update_existing: true,
    email_type: 'html',
    members: state.data,
  }))
);
