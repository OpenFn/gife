// apiUrl= https://us13.api.mailchimp.com/3.0/lists/{43fead6cd7}
// auth= anystring:${apikey}
// payload= {"members":[],"sync_tags":false,"update_existing":false, email_type: "html"}
// password: ef408eff778772d3739d751a44d7b801-us13
// curl -X POST \
//   'https://${dc}.api.mailchimp.com/3.0/lists/{list_id}?skip_merge_validation=<SOME_BOOLEAN_VALUE>&skip_duplicate_check=<SOME_BOOLEAN_VALUE>' \
//   --user "anystring:${apikey}"' \
//   -d '{"members":[],"sync_tags":false,"update_existing":false}'

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
