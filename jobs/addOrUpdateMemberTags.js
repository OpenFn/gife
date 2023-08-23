// Contacts to create
fn(state => {
    
    if(state.contactsToCreate.members.length === 0) {
        return state;
    } else {
        return post('/lists/43fead6cd7',state.ContactsToCreate)(state);
    }
});
// Contacts to update
fn(state => {
    if(state.contactsToUpdate.members.length === 0) {
        return state;
    } else {
        return post('/lists/43fead6cd7',state.contactsToUpdate)(state);
    }
});
