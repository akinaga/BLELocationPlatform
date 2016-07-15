#!/usr/bin/python
# -*- coding: utf-8 -*-

import boto.sqs
import pgdb
import time

sqs = boto.sqs.connect_to_region('ap-northeast-1')
q = sqs.get_queue("easy_monitor_ble")

#DB Connection
connector = pgdb.connect(host="127.0.0.1", database="postgres", user="postgres", password="")
cursor = connector.cursor()

while 1:
    msgs = q.get_messages()
    for msg in msgs:
        dat = msg.get_body()
        data = dat.split(",")
        data[0] = "'" + data[0] + "'"       # locationid
        data[1] = "'" + data[1] + "'"       # recorddate
        data[2] = "'" + data[2] + "'"       # localip
        data[3] = "'" + data[3] + "'"       # globalip

        sql = "insert into easy_monitor values (" + ",".join(data) + ");"
        print dat
        # print sql
        cursor.execute(sql)
        connector.commit()
        q.delete_message(msg)
    # time.sleep(1)

cursor.close()
connector.close()
