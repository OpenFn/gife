//Contacts to deactivate 
fn(state => {
    if (state.mappedMembers.length === 0) {
        return state;
    } else {
        return post('/lists/a4e7ea0abc', state.mappedMembers)(state);
    }
});
