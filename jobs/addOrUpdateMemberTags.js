// Contacts to create
fn(state => {
  const { contactsToCreate } = state;
  if (contactsToCreate.members.length === 0) return state;
  return post('/lists/a4e7ea0abc', contactsToCreate)(state);
});

// Contacts to update
fn(state => {
  const { contactsToUpdate } = state;
  if (contactsToUpdate.members.length === 0) return state;
  return post('/lists/a4e7ea0abc', contactsToUpdate)(state);
});
