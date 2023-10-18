UPDATE messages SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
UPDATE files SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
UPDATE incidents SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
UPDATE reports SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
DELETE FROM notifications WHERE user_id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
DELETE FROM chat_members WHERE user_id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
DELETE FROM chats WHERE user_id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
DELETE FROM reports WHERE user_id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
DELETE FROM incidents WHERE user_id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
DELETE FROM users WHERE id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
DELETE FROM auth.users WHERE id IN ('c1002aac-8f26-4ecf-a949-0c133e01a4c7');
-- delete from auth.audit_log_entries;
commit;




CREATE OR REPLACE FUNCTION remove_user(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Move messages to a different user (so we don't lose them)
  UPDATE messages SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id = $1;
  UPDATE files SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id = $1;
  UPDATE incidents SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id = $1;
  UPDATE reports SET user_id = 'f0d7d5d9-3b3d-4c3f-8d8c-6d5f9b3d9b6c' WHERE user_id = $1;

  -- Delete related data from other tables
  DELETE FROM notifications WHERE user_id = $1;
  DELETE FROM chat_members WHERE user_id = $1;

  -- Delete user from the 'users' table
  DELETE FROM users WHERE id = $1;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;