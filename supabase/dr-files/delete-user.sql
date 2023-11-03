create
or replace function removeUser (userId uuid) returns VOID as $$
BEGIN
  UPDATE messages SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id IN (userId);
  UPDATE files SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id IN (userId);
  UPDATE incidents SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id IN (userId);
  UPDATE reports SET completed = true WHERE user_id IN (userId);
  UPDATE reports SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id IN (userId);
  UPDATE chats SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id IN (userId);

  DELETE FROM notifications WHERE user_id IN (userId);
  DELETE FROM chat_members WHERE user_id IN (userId);
  DELETE FROM users WHERE id IN (userId);
  DELETE FROM auth.users WHERE id IN (userId);
END;
$$ language plpgsql;