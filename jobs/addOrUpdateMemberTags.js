// Contacts to create
post('/lists/45782', state=> ({members: state.contactsToCreate}));

// Contacts to update
fn(state => {
    if(state.contactsToUpdate.length === 0) return state
    return post('/lists/1213', state=> ({members: state.contactsToUpdate, }))(state);
})