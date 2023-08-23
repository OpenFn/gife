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
  for (const membersBatch of state.members) {
    console.log(membersBatch);
    await post('/batches', {
      operations: membersBatch,
    })(state);
  }
});
