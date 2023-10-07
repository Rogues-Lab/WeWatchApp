CREATE OR REPLACE FUNCTION geo_users(x numeric, y numeric, distance int)
  RETURNS setof users as $$
    select * 
    from users
    where ST_DWithin(
            geom, 
            ST_MakePoint(x, y)::geography,
            distance, 
            true 
      );
$$ language sql;

-- Triggers need to be ROW level, not STATEMENT level
-- CREATE OR REPLACE FUNCTION public.notify_incident()
--  RETURNS trigger
--  LANGUAGE plpgsql
--  SECURITY DEFINER
-- AS $$
-- begin
--     insert into public.notifications(user_id, message, mode, object_type, object_id)
--     select gu.id, new.name, 'create', 'incidents', new.id
--     FROM geo_users(new.longitude, new.latitude, 1000) gu;

--  return new;
-- end;
-- $$

    -- insert into public.notifications(user_id, message, mode, object_type, object_id)
    -- select (gu.id, new.name, 'create', 'incidents',new.id)
    -- FROM public.geo_users(new.longitude, new.latitude, 100000000000) gu;

CREATE OR REPLACE FUNCTION public.notify_incident()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin

    RAISE NOTICE 'New incident created with name %', new.name;
    
    insert into public.notifications(user_id, message, mode, object_type, object_id)
    select gu.id, new.name, 'create', 'incidents', new.id
    FROM geo_users(new.longitude, new.latitude, 1000) gu;

    PERFORM net.http_get('https://app.wewatchapp.com/api/notifier/incident/'||new.id|| '?API_ROUTE_SECRET=dsfersfsdgwrgw5gwer5tedhre5hjf6tjk74ye543655645DGFN5YEHMHK57yge55rye4Y43q4344234tefq4wtserwgewefdfwssrtr'
    );

 return new;
end;
$function$


CREATE TRIGGER incident_insert_trigger
AFTER INSERT ON incidents
FOR EACH ROW
EXECUTE FUNCTION notify_incident();
  