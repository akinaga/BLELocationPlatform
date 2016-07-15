#!/usr/bin/python
# -*- coding: utf-8 -*-

import boto.sqs
import pgdb
import time

sqs = boto.sqs.connect_to_region('ap-northeast-1')
q = sqs.get_queue("ble_location")

#DB Connection
connector = pgdb.connect(host="127.0.0.1", database="postgres", user="postgres", password="")
cursor = connector.cursor()

while 1:
    msgs = q.get_messages()
    for msg in msgs:
        dat = msg.get_body()
        data = dat.split(",")
        print data
        if len(data) == 4:
            try:
                data[0] = "'" + data[0] + "'"
                data[1] = "'" + data[1] + "'"
                data[2] = "'" + data[2] + "'"
                data[3] = str(int(data[3]))
                # data[4] = str(float(data[4]))
                sql = "insert into ble_location values (" + ",".join(data) + ");"
                # print sql
                cursor.execute(sql)
                connector.commit()
            except:
                print "error"
        q.delete_message(msg)
    # time.sleep(1)

cursor.close()
connector.close()
