  
CREATE OR REPLACE FUNCTION public.notify_report()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin

    RAISE NOTICE 'New report created with id %', new.id;


    PERFORM net.http_get('https://app.wewatchapp.com/api/notifier/report/'||new.id|| '?API_ROUTE_SECRET=dsfersfsdgwrgw5gwer5tedhre5hjf6tjk74ye543655645DGFN5YEHMHK57yge55rye4Y43q4344234tefq4wtserwgewefdfwssrtr'
    );

 return new;
end;
$function$


CREATE TRIGGER reports_insert_trigger
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION notify_report();