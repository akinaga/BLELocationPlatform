
drop table ble_location;
create table ble_location (
    locationid text,
    recorddate TIMESTAMP,
    ble_id text,
    rssi int4
  );

drop table basestation;
create table basestation (
  locationid text,
  locationname text
);

drop table bletags;
create table bletags (
  ble_id text,
  ble_name text
);

------------------------
select a.locationid, b.locationname, a.recorddate, a.cpu_temp
from ble_location as a
INNER join
  (select locationid,max(r as recorddate from ble_location group by 1) as b
  on (a.locationid=b.locationid and a.recorddate=b.recorddate)
left OUTER join basestation as c on (b.locationid=c.locationid)

------------------------
select distinct a.ble_id, c.ble_name, a.recorddate, b.locationname, a.rssi
from (select ble_id, recorddate, locationid, rssi from ble_location order by recorddate desc limit 1) as a
left outer join basestation as b on (a.locationid=b.locationid)
left outer join bletags as c on (a.ble_id=c.ble_id);

------------------------ (セッションIDの特定）
select ble_id, ble_name, locationid, locationaname, staying_from, staying_by from ble_location as a
left outer join basestation as b on (a.locationid=b.locationid)
left outer join bletags as c on (a.ble_id=c.ble_id)


select ble_id, recorddate, rssi, location_id, session_head, session_end from
  (select *,
  (case when locationid != prev_location then 1 else 0 end) as session_head,
  (case when locationid != next_location then 1 else 0 end) as session_end
  from
    (select ble_id, recorddate, rssi, locationid,
    lag(locationid) over (partition by ble_id order by recorddate) as prev_location,
    lead(locationid) over (partition by ble_id order by recorddate) as next_location
    from ble_location) as a
  ) as a
where session_head=1 or session_end=1;

----------------------- for easy monitor
drop table easy_monitor;
create table easy_monitor (
  locationid text,
  recorddate timestamp,
  localip text,
  globalip text,
  cpu real,
  mem real,
  disk_read real,
  disk_write real,
  net_recv real,
  net_sent real,
  disk_usage real,
  cpu_temp real
);

create index easy_monitor_locationid on easy_monitor(locationid);
create index easy_monitor_localip on easy_monitor(localip);
create index easy_monitor_datetime on easy_monitor(datetime);

drop table metric_list;
create table metric_list (metric text,id text);
insert into metric_list Values ('CPU','cpu');
insert into metric_list Values ('Memory','mem');
insert into metric_list Values ('Disk Read','disk_read');
insert into metric_list Values ('Disk Write','disk_write');
insert into metric_list Values ('NW Recv','net_recv');
insert into metric_list Values ('NW Sent','net_sent');
insert into metric_list Values ('Disk Usage','disk_usage');
insert into metric_list Values ('CPU Temp.','cpu_temp');

drop table span_list;
create table span_list (span text,id int2);
insert into span_list Values ('1 month',1);
insert into span_list Values ('7 days',2);
insert into span_list Values ('1 day',3);
insert into span_list Values ('6 hour',4);
insert into span_list Values ('1 hour',5);

drop table func_list;
create table func_list (func text, id int2);
insert into func_list Values ('avg',1);
insert into func_list Values ('max',2);
insert into func_list Values ('min',3);

drop table gran_list;
create table gran_list (gran text, id int2);
insert into gran_list Values ('day',1);
insert into gran_list Values ('hour',2);
insert into gran_list Values ('minute',3);
insert into gran_list Values ('second',4);



