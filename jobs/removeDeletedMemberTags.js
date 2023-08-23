// //Contacts to deactivate
// each(
//     'members[*]',
//     post('/lists/a4e7ea0abc/members/${'subscriber_hash'}/tags', state => ({
//       is_syncing: true,
//       members: state.data[0]
//     }))
//   );

// /lists/a4e7ea0abc/members/${state.members.subscriber_hash}/tags
fn(async state => {
  for (const members of state.members) {
    await post('/lists/a4e7ea0abc', state => ({
      sync_tags: true,
      update_existing: true,
      members: members,
    }))(state).catch(e=> {
      console.log(er)
    });
  }
});
